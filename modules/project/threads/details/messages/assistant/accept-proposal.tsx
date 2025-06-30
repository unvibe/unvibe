import { MdOutlineDownloading, MdOutlinePlayArrow } from 'react-icons/md';
import { useAssistantMessageContext } from './assistant-message-context';
import { useStructuredOutputContext } from './structured-output/context';
import { useAPIMutation } from '@/server/api/client';
import { useParams } from 'react-router';

export function AcceptProposal() {
  // get if there are any errors in any of the selected files
  const messageContext = useAssistantMessageContext();
  const structuredOutputContext = useStructuredOutputContext();
  const replaced = structuredOutputContext.data.replace_files || [];
  const edited = structuredOutputContext.data.edit_files || [];
  const deleted = structuredOutputContext.data.delete_files || [];
  const scripts = structuredOutputContext.data.shell_scripts || [];

  const hasNoFilesAndNoScripts =
    replaced.length === 0 &&
    edited.length === 0 &&
    deleted.length === 0 &&
    scripts.length === 0;

  const metadata = messageContext.message.metadata;
  const hasIssues = metadata
    ? Object.values(metadata.diagnostics).some((record) =>
        Object.values(record).some((ds) => ds.some((m) => !!m.type))
      )
    : false;

  const { mutate: applyProposal } = useAPIMutation(
    'POST /projects/accept-proposal'
  );
  const projectId = useParams().project_id as string;

  return (
    <div className='flex items-center justify-end pt-4 pb-2 gap-4'>
      {hasNoFilesAndNoScripts ? (
        <button className='font-mono text-sm p-1 px-3 bg-sky-800 text-sky-50 rounded-lg flex items-center gap-2'>
          <span>
            <MdOutlinePlayArrow className='w-5 h-5' />
          </span>
          <span>continue</span>
        </button>
      ) : (
        <>
          {!hasIssues && (
            <button
              className='font-mono text-sm p-1 px-3 bg-emerald-800 text-emerald-50 rounded-lg flex items-center gap-2'
              onClick={() => {
                applyProposal(
                  {
                    projectDirname: projectId,
                    source: 'projects',
                    proposal: {
                      messageId: messageContext.message.id,
                      ...structuredOutputContext.data,
                    },
                  },
                  {
                    onSuccess(data) {
                      console.log('Proposal accepted successfully', data);
                    },
                    onError(error) {
                      console.error('Error accepting proposal', error);
                    },
                  }
                );
              }}
            >
              <span>
                <MdOutlineDownloading className='w-5 h-5' />
              </span>
              <span>Accept</span>
            </button>
          )}
          {hasIssues && (
            <button className='font-mono text-sm p-1 px-3 bg-amber-800 text-amber-50 rounded-lg flex items-center gap-2'>
              <span>
                <MdOutlineDownloading className='w-5 h-5' />
              </span>
              <span>Accept anyway</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
