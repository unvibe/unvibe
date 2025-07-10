// ThreadInputBox.tsx
import { useState, useRef, useEffect, ChangeEvent, ReactNode } from 'react';
import { Spinner } from '@/lib/ui/spinner';
import { Alert } from '@/lib/ui/alert';
import { AutogrowTextarea } from '@/lib/ui';
import { HiPlay } from 'react-icons/hi2';
import { LuImagePlus } from 'react-icons/lu';
import { FiGlobe } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';
import { useAPIMutation } from '@/server/api/client';
import clsx from 'clsx';

// X icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 16 16'
      fill='none'
      className={className || 'w-4 h-4'}
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M4 4L12 12M12 4L4 12'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  );
}

function PrimarySendButton({
  isPending,
  onClick,
  disabled,
  icon,
}: {
  isPending: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className={
        'bg-background-2 text-foreground rounded-xl p-2.5 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150 ' +
        (disabled
          ? 'cursor-default'
          : 'cursor-pointer hover:bg-background-2 hover:shadow-md')
      }
    >
      {isPending ? (
        <Spinner className='w-4 h-4' />
      ) : (
        (icon ?? <HiPlay className='w-4 h-4' />)
      )}
    </button>
  );
}

export interface ThreadInputBoxProps {
  prompt?: string;
  setPrompt?: (p: string) => void;
  placeholder?: string;
  children?: ReactNode;
  isPending: boolean;
  onSubmit?: (args: {
    prompt: string;
    images: string[];
    search_enabled: boolean;
    clearAttachments: () => void;
  }) => void;
  disableInput?: boolean;
  inputImage?: boolean;
  inputSearchFlag?: boolean;
}

function makeImageKey(file: File) {
  const rawId = `${Date.now()}-${Math.random().toString(16).slice(2)}-${file.name}`;
  return `uploads/thread-images/${rawId}`;
}
const CDN_URL = import.meta.env.VITE_AWS_CDN_URL;

export function ThreadInputBox({
  prompt: controlledPrompt,
  setPrompt: setControlledPrompt,
  placeholder = '',
  children,
  isPending,
  onSubmit,
  disableInput,
  inputImage = false,
  inputSearchFlag = false,
}: ThreadInputBoxProps) {
  const [prompt, setPrompt] = useState(controlledPrompt || '');
  useEffect(() => {
    if (controlledPrompt !== undefined) setPrompt(controlledPrompt);
  }, [controlledPrompt]);

  const [isSearchMode, setIsSearchMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<
    { key: string; url: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingProgress, setUploadingProgress] = useState(0);

  // Use API Mutations for upload URLs (react-query)
  const requestSignedUploadURLs = useAPIMutation(
    'POST /upload/request-signed-upload-urls'
  );
  const deleteUploadedFiles = useAPIMutation('POST /upload/delete-file');

  // Upload selected image files to S3 via backend's signed URLs
  const uploadImagesToS3 = async (
    files: File[]
  ): Promise<{ key: string; url: string }[]> => {
    const keyed = files.map((file) => ({
      file,
      key: makeImageKey(file),
      contentType: file.type,
    }));
    // Get presigned URLs using the mutation
    const resp = await requestSignedUploadURLs.mutateAsync({
      files: keyed.map((f) => ({ key: f.key, contentType: f.contentType })),
    });
    const { signedUploadURLs } = resp ?? {};
    if (
      !Array.isArray(signedUploadURLs) ||
      signedUploadURLs.length !== keyed.length
    )
      throw new Error('Failed to get sufficient upload URLs');
    // PUT each file direct to S3
    for (let i = 0; i < keyed.length; i++) {
      const f = keyed[i];
      const uploadUrl = signedUploadURLs[i];
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: f.file,
        headers: {
          'Content-Type': f.contentType,
        },
      });
      if (!res.ok) throw new Error(`Failed to upload file: ${f.file.name}`);
      setUploadingProgress(Math.round(((i + 1) / keyed.length) * 100));
    }
    return keyed.map((f) => ({ key: f.key, url: `${CDN_URL}/${f.key}` }));
  };

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setOptimizing(true);
    setError(null);
    try {
      const addition = Array.from(files).filter(
        (f, idx, arr) =>
          f.type.startsWith('image/') &&
          arr.findIndex((g) => g.name === f.name && g.size === f.size) === idx
      );
      // Optimize/compress
      const optimized: File[] = await Promise.all(
        addition.map((file) =>
          imageCompression(file, {
            maxWidthOrHeight: 1600,
            maxSizeMB: 0.5,
            useWebWorker: true,
            initialQuality: 0.8,
            fileType: 'image/jpeg',
          })
        )
      );

      setUploading(true);
      setUploadingProgress(0);
      // Upload to S3 via backend
      const remoteFiles = await uploadImagesToS3(optimized);
      setUploadedFiles((prev) => [...prev, ...remoteFiles]);
    } catch (error) {
      console.error('Image upload failed', error);
      setError(
        'Image upload failed: ' +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setOptimizing(false);
      setUploading(false);
      setUploadingProgress(0);
    }
  }
  const removeUploadedFile = (idx: number) => {
    const file = uploadedFiles[idx];
    if (!file) return;
    // Delete from S3 via backend
    deleteUploadedFiles
      .mutateAsync({
        key: file.key,
      })
      .then(() => {
        setUploadedFiles((files) => files.filter((_, i) => i !== idx));
      });
  };
  function handleSubmit() {
    if (isPending || uploading || optimizing || !prompt.trim()) return;
    onSubmit?.({
      prompt,
      images: uploadedFiles.map((f) => f.url),
      search_enabled: isSearchMode,
      clearAttachments: () => setUploadedFiles([]),
    });
    setPrompt('');
    setControlledPrompt?.('');
    setUploadedFiles([]);
  }
  return (
    <div className='italic font-mono text-foreground-2 relative'>
      <div className='bg-background-1 rounded-3xl pb-12 focus-within:ring-2 border-2 border-border-2'>
        <AutogrowTextarea
          value={prompt}
          onKeyDown={(e) => {
            // submit on (mac:cmd/other:ctrl) + enter
            if (
              (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ||
              (e.key === 'NumpadEnter' && (e.metaKey || e.ctrlKey))
            ) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          onChange={(e) => {
            setPrompt(e.target.value);
            setControlledPrompt?.(e.target.value);
          }}
          disabled={disableInput || isPending}
          placeholder={placeholder}
          className='w-full h-full resize-none text-sm disabled:opacity-50 p-4 pb-0 focus:outline-none'
        />
        {error && (
          <Alert variant='error' className='my-2'>
            {error}
          </Alert>
        )}
        {uploadedFiles.length > 0 && (
          <div className='my-2 rounded-xl'>
            <ul className='flex gap-2 overflow-x-auto p-2'>
              {uploadedFiles.map((file, i) => (
                <li
                  key={file.key}
                  className='relative flex flex-col items-center pt-1'
                >
                  <a href={file.url} target='_blank' rel='noopener noreferrer'>
                    <img
                      src={file.url}
                      alt={file.key.split('/').slice(-1)[0]}
                      className='rounded-2xl shadow ring-1 w-20 h-20 object-cover mb-1'
                      loading='lazy'
                    />
                  </a>
                  <button
                    className='absolute top-2 right-1 z-10 hover:text-red-500 transition rounded-full focus:outline-none cursor-pointer p-1 bg-foreground text-background-1 ring-2 ring-background-1'
                    style={{ transform: 'translate(40%, -40%)' }}
                    onClick={() => removeUploadedFile(i)}
                    type='button'
                    aria-label='Remove image'
                  >
                    <XIcon className='w-4 h-4' />
                  </button>
                </li>
              ))}
            </ul>
            {(optimizing || uploading) && (
              <div className='mt-2 text-xs text-blue-600'>
                {optimizing
                  ? 'Optimizing Images...'
                  : `Uploading... ${uploadingProgress}%`}
              </div>
            )}
          </div>
        )}
        {/* Two groups: left for children, right for buttons (search, upload, submit) */}
        <div className='absolute bottom-3 left-3 right-3 flex items-center justify-between'>
          <div className='flex items-center min-h-[40px]'>
            {/* Left: children (leave empty flex if none) */}
            {children ? (
              <div className='flex items-center gap-2'>{children}</div>
            ) : (
              <div className='flex items-center' style={{ minWidth: 0 }}></div>
            )}
          </div>
          <div className='flex items-center gap-1'>
            {/* Right: search, upload images, submit button */}
            {inputSearchFlag && (
              <button
                type='button'
                onClick={() => setIsSearchMode((m) => !m)}
                className={clsx(
                  'rounded-xl p-2.5 transition-colors duration-150',
                  'cursor-pointer disabled:cursor-default',
                  isSearchMode
                    ? clsx(
                        'bg-blue-600 text-background-1 border-blue-500 hover:bg-blue-600',
                        'dark:bg-blue-900 dark:text-blue-500 dark:border-blue-900 dark:hover:bg-blue-900'
                      )
                    : 'bg-background-2 text-foreground border-border-2 hover:bg-background-2'
                )}
                disabled={disableInput || isPending}
              >
                <FiGlobe className='w-4 h-4' />
              </button>
            )}
            {inputImage && (
              <>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='bg-background-2 text-foreground rounded-xl p-2.5 transition-colors duration-150 cursor-pointer disabled:cursor-default'
                  aria-label='Add images'
                  disabled={disableInput || isPending}
                >
                  <LuImagePlus className='w-4 h-4' />
                </button>
                <input
                  type='file'
                  accept='image/*'
                  multiple
                  ref={fileInputRef}
                  className='hidden'
                  onChange={handleFileChange}
                />
              </>
            )}
            <PrimarySendButton
              isPending={isPending}
              onClick={handleSubmit}
              disabled={disableInput || isPending || !prompt.trim()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
