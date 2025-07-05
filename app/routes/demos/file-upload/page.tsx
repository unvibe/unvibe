import React, { useState, useRef } from 'react';
import { Button } from '@/lib/ui/button';
import { Alert } from '@/lib/ui/alert';
import { PixelArchiveIcon } from '@/lib/ui/pixel-icons';
import { useAPIMutation } from '@/server/api/client';

interface UploadedFile {
  key: string;
  url: string;
}

function isImageType(type: string) {
  return type.startsWith('image/');
}

export default function FileUploadDemo() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingProgress, setUploadingProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const requestSignedUploadURLsMutation = useAPIMutation(
    'POST /upload/request-signed-upload-urls'
  );
  const getDownloadUrlMutation = useAPIMutation('GET /upload/download-url');
  const deleteFileMutation = useAPIMutation('POST /upload/delete-file');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      setError(null);
      setSuccess(null);
    }
  };

  // Drag & Drop
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
      setError(null);
      setSuccess(null);
    }
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  // Helper: ensure unique keys for files even on rapid uploads
  const makeFileKey = (file: File, i: number) =>
    `uploads/${Date.now()}_${i}_${file.name}`;

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('No files selected for upload.');
      return;
    }
    setError(null);
    setSuccess(null);
    setUploadingProgress(0);

    try {
      // Prepare file metadata
      const filesMetadata = selectedFiles.map((file, i) => ({
        key: makeFileKey(file, i),
        contentType: file.type || 'application/octet-stream',
      }));

      // Request signed URLs
      const signedUrlsData = await requestSignedUploadURLsMutation.mutateAsync({
        files: filesMetadata,
      });
      if (!signedUrlsData || !Array.isArray(signedUrlsData.signedUploadURLs)) {
        throw new Error('Invalid signed upload URLs response');
      }

      // Upload files to signed URLs
      let uploadedCount = 0;
      await Promise.all(
        signedUrlsData.signedUploadURLs.map((url: string, i: number) =>
          fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': filesMetadata[i].contentType },
            body: selectedFiles[i],
          }).then((res) => {
            if (!res.ok)
              throw new Error(
                `Upload failed for file ${selectedFiles[i].name}`
              );
            uploadedCount++;
            setUploadingProgress(
              Math.round((uploadedCount / selectedFiles.length) * 100)
            );
          })
        )
      );

      // Get download URLs for each file
      const downloadedFiles: UploadedFile[] = [];
      for (const fileMeta of filesMetadata) {
        const downloadData = await getDownloadUrlMutation.mutateAsync({
          key: fileMeta.key,
        });
        if (!downloadData || !downloadData.downloadUrl) {
          throw new Error(`Failed to get download URL for ${fileMeta.key}`);
        }
        downloadedFiles.push({
          key: fileMeta.key,
          url: downloadData.downloadUrl,
        });
      }

      setUploadedFiles((prev) => [...prev, ...downloadedFiles]);
      setSelectedFiles([]);
      setSuccess(`${downloadedFiles.length} file(s) uploaded successfully!`);
      setUploadingProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadingProgress(0);
    }
  };

  const deleteFile = async (key: string) => {
    setError(null);
    setSuccess(null);
    try {
      await deleteFileMutation.mutateAsync({ key });
      setUploadedFiles((files) => files.filter((f) => f.key !== key));
      setSuccess('File deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const isUploading =
    requestSignedUploadURLsMutation.status === 'pending' ||
    uploadingProgress > 0;
  const isDeleting = deleteFileMutation.status === 'pending';

  // For previewing selected files before upload (esp. images)
  const selectedPreviews = selectedFiles.map((file) => {
    if (isImageType(file.type)) {
      return {
        type: 'image',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      };
    }
    return {
      type: 'file',
      name: file.name,
      size: file.size,
    };
  });

  return (
    <div className='p-16'>
      <div className='max-w-xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg'>
        <h1 className='text-2xl font-bold mb-2 flex items-center gap-2'>
          <PixelArchiveIcon size={28} /> File Upload Demo
        </h1>
        <p className='mb-4 text-neutral-600 dark:text-neutral-300'>
          Upload files to your cloud storage. Preview, download, and delete.
        </p>
        {error && (
          <Alert variant='error' className='mb-4'>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant='success' className='mb-4'>
            {success}
          </Alert>
        )}
        {/* Drag & Drop area */}
        <div
          className={`mb-6 flex flex-col gap-2 border-2 transition-all border-dashed rounded-xl px-6 py-10 relative cursor-pointer ${
            dragActive
              ? 'border-primary-500 bg-blue-50 dark:bg-neutral-700/50'
              : 'border-neutral-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800'
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          aria-label='File Upload Dropzone'
          tabIndex={0}
        >
          <input
            id='file-upload-input'
            ref={fileInputRef}
            type='file'
            multiple
            onChange={onFileChange}
            className='hidden'
          />
          <div className='flex flex-col items-center space-y-2'>
            <div className='text-4xl'>📂</div>
            <div className='font-semibold text-lg'>
              Drag & drop files here, or{' '}
              <span className='text-primary underline'>browse</span>
            </div>
            <div className='text-xs text-neutral-500'>
              Supported: images, pdf, docs, etc.
            </div>
          </div>
          {dragActive && (
            <div className='absolute inset-0 rounded-xl pointer-events-none border-4 border-blue-400/60 animate-pulse' />
          )}
        </div>

        {/* Preview selected files (before upload) */}
        {selectedFiles.length > 0 && (
          <div className='mb-4 bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700'>
            <h3 className='font-semibold mb-2'>Selected Files</h3>
            <ul className='flex gap-4 overflow-x-auto'>
              {selectedPreviews.map((file, i) => (
                <li
                  key={file.name + i}
                  className='flex flex-col items-center min-w-24 max-w-28'
                >
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className='rounded-lg shadow border w-20 h-20 object-cover object-center mb-2'
                      loading='lazy'
                    />
                  ) : (
                    <div className='w-20 h-20 flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-2'>
                      <span className='text-3xl'>📄</span>
                    </div>
                  )}
                  <span
                    className='truncate text-xs max-w-[80px]'
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <span className='text-[10px] text-gray-400'>
                    {file.size} bytes
                  </span>
                </li>
              ))}
            </ul>
            <Button
              className='mt-4 w-full'
              variant='primary'
              onClick={uploadFiles}
              isLoading={isUploading}
              disabled={isUploading || isDeleting}
            >
              {isUploading ? (
                <>
                  Uploading...{' '}
                  {uploadingProgress > 0 && (
                    <span className='ml-2'>{uploadingProgress}%</span>
                  )}
                </>
              ) : (
                'Upload Files'
              )}
            </Button>
          </div>
        )}

        {/* Uploaded files, with images preview */}
        {uploadedFiles.length > 0 && (
          <div className='mt-8'>
            <h3 className='font-semibold mb-4'>Uploaded Files</h3>
            <ul className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {uploadedFiles.map(({ key, url }) => {
                const lower = key.toLowerCase();
                const isImage =
                  lower.endsWith('.jpg') ||
                  lower.endsWith('.jpeg') ||
                  lower.endsWith('.png') ||
                  lower.endsWith('.gif') ||
                  lower.endsWith('.webp') ||
                  lower.endsWith('.svg');
                return (
                  <li
                    key={key}
                    className='flex items-center gap-4 bg-gray-50 dark:bg-neutral-800 rounded-xl p-3 shadow border border-neutral-200 dark:border-neutral-700'
                  >
                    {isImage ? (
                      <a href={url} target='_blank' rel='noopener noreferrer'>
                        <img
                          src={url}
                          alt={key.split('/').slice(-1)[0]}
                          className='w-16 h-16 rounded-lg object-cover object-center border shadow'
                          loading='lazy'
                        />
                      </a>
                    ) : (
                      <div className='w-16 h-16 flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 rounded-lg'>
                        <span className='text-3xl'>📄</span>
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <a
                        href={url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 dark:text-blue-300 font-medium truncate max-w-xs block'
                      >
                        {key.split('/').slice(-1)[0]}
                      </a>
                      <span
                        className='block text-xs text-gray-400 truncate'
                        title={key}
                      >
                        {key}
                      </span>
                    </div>
                    <Button
                      variant='danger'
                      className='ml-4'
                      isLoading={isDeleting}
                      onClick={() => deleteFile(key)}
                      disabled={isDeleting || isUploading}
                    >
                      Delete
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
