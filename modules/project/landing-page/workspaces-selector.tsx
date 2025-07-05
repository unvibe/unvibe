// import {
//   Project,
// } from '@/server/project/types';
// import clsx from 'clsx';

// function getWorkspaces(project: TypescriptMonorepo) {
//   return [
//     ...Object.entries(project.files.workspaces)
//       .map(([workspaceRoot, scopedWorkspaces]) => {
//         return Object.entries(scopedWorkspaces).map(([scope, files]) => {
//           return {
//             id: `${workspaceRoot}/${scope}`,
//             files,
//           };
//         });
//       })
//       .flat(),
//   ].sort((a, b) => {
//     return b.files.length - a.files.length;
//   });
// }

// export function MonorepoWorkspacesSelector({
//   project,
//   value,
//   onChange,
// }: {
//   project?: Project;
//   value: string[];
//   onChange: (value: string[]) => void;
// }) {
//   if (!project || project.type !== 'multiple') return null;
//   const workspaces = getWorkspaces(project);

//   return (
//     <div className='p-5'>
//       <div className='flex gap-2 flex-wrap text-sm'>
//         {workspaces.map((workspace) => {
//           const isSelected = value.includes(workspace.id);
//           return (
//             <button
//               key={workspace.id}
//               onClick={() => {
//                 if (isSelected) {
//                   onChange(value.filter((id) => id !== workspace.id));
//                 } else {
//                   onChange([...value, workspace.id]);
//                 }
//               }}
//               className={clsx(
//                 'border rounded-full px-2 py-1 flex gap-2 text-start items-center',
//                 isSelected ? 'border-blue-500' : 'border-border'
//               )}
//             >
//               <span
//                 className={clsx(
//                   isSelected ? 'text-blue-500' : 'text-foreground-1'
//                 )}
//               >
//                 {workspace.id}
//               </span>
//               <span className='text-foreground-2 text-xs'>
//                 ({workspace.files.length})
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
