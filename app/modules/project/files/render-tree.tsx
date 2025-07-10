/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { TiDocument, TiFolder, TiFolderOpen } from 'react-icons/ti';
import { useParams } from '@/lib/next/navigation';
import Link from '@/lib/next/link';
import clsx from 'clsx';

// Tree node type as discriminated union for folders and files
export type FileNode = {
  type: 'file';
  name: string;
  path: string;
};

export type FolderNode = {
  type: 'folder';
  name: string;
  path: string;
  children: Record<string, TreeNode>;
};

export type TreeNode = FileNode | FolderNode;

export function makeTree(flatRelativePaths: string[]): FolderNode {
  const root: FolderNode = {
    type: 'folder',
    name: '.',
    path: '.',
    children: {},
  };
  flatRelativePaths.forEach((path) => {
    const parts = path.split('/');
    let currentLevel: FolderNode = root;
    let currentPath = '';
    parts.forEach((part, index) => {
      currentPath = currentPath ? currentPath + '/' + part : part;
      if (index === parts.length - 1) {
        // file node
        if (!currentLevel.children[part]) {
          currentLevel.children[part] = {
            type: 'file',
            name: part,
            path: currentPath,
          };
        }
      } else {
        if (!currentLevel.children[part]) {
          currentLevel.children[part] = {
            type: 'folder',
            name: part,
            path: currentPath,
            children: {},
          };
        }
        const next = currentLevel.children[part];
        if (next && next.type === 'folder') {
          currentLevel = next;
        }
      }
    });
  });
  return root;
}

function TreeFolder({
  name,
  node,
  level,
  path,
}: {
  name: string;
  node: FolderNode;
  level: number;
  path: string;
}) {
  const [open, setOpen] = useState(level > 1 ? false : true);
  console.log(node);
  return (
    <li className='px-2 border-l border-border-2'>
      <button
        className='flex items-center gap-1 cursor-pointer'
        onClick={() => setOpen(!open)}
        data-path={path}
      >
        {open ? (
          <TiFolderOpen className='w-5 h-5' />
        ) : (
          <TiFolder className='w-5 h-5' />
        )}
        <span className='whitespace-nowrap'>{name}</span>
      </button>
      {open ? <RenderTree tree={node} level={level} parentPath={path} /> : null}
    </li>
  );
}

export type CustomRenderTreeDirProps = {
  name: string;
  node: FolderNode;
  level: number;
  path: string;
  children: React.ReactNode;
};

export type CustomRenderTreeFileProps = {
  node: FileNode;
  name: string;
  level: number;
  path: string;
};

export function CustomRenderTree({
  tree: node,
  level,
  Dir,
  DirFile,
  className = '',
}: {
  tree: TreeNode;
  level: number;
  Dir: React.ComponentType<CustomRenderTreeDirProps>;
  DirFile: React.ComponentType<CustomRenderTreeFileProps>;
  className?: string;
}) {
  if (node.type === 'folder') {
    return (
      <ul className={clsx('text-foreground-1', className)}>
        {Object.values(node.children)
          .sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
          })
          .map((child) => {
            if (child.type === 'file') {
              return (
                <DirFile
                  key={child.path}
                  name={child.name}
                  node={child}
                  level={level + 1}
                  path={child.path}
                />
              );
            } else {
              return (
                <Dir
                  key={child.path}
                  name={child.name}
                  node={child}
                  level={level + 1}
                  path={child.path}
                >
                  <CustomRenderTree
                    tree={child}
                    level={level + 1}
                    Dir={Dir}
                    DirFile={DirFile}
                  />
                </Dir>
              );
            }
          })}
      </ul>
    );
  } else {
    return null;
  }
}
export function RenderTree({
  tree: node,
  level,
  name,
  parentPath = '',
}: {
  tree: TreeNode;
  level: number;
  name?: string;
  parentPath?: string;
}) {
  const projectId = useParams().project_id as string;
  if (!node) return null;
  if (node.type === 'folder') {
    return (
      <ul className='text-foreground-1'>
        {Object.values(node.children)
          .sort((a, b) => {
            // Folders first, then files
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
          })
          .map((child) => {
            if (child.type === 'file') {
              const pathToBase64 = btoa(child.path);
              return (
                <Link
                  href={`/projects/${projectId}/files/${pathToBase64}`}
                  key={child.path}
                >
                  <li
                    className='px-2 flex items-center gap-2 cursor-pointer whitespace-nowrap'
                    data-path={child.path}
                  >
                    <span className='brightness-50'>
                      <TiDocument className='w-5 h-5' />
                    </span>
                    <span>{child.name}</span>
                  </li>
                </Link>
              );
            } else {
              return (
                <TreeFolder
                  key={child.path}
                  name={child.name}
                  node={child}
                  level={level + 1}
                  path={child.path}
                />
              );
            }
          })}
      </ul>
    );
  } else {
    // Should not occur: RenderTree called on a file node
    return null;
  }
}
