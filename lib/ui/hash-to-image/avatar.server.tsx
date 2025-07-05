import type { AvatarProps } from './config';
import { DEFAULT_CONFIG } from './config';
import { getMetaData } from './lib';
import { sha1 } from '@/lib/core/hash/sha1';
import { Renderer } from './renderer-svg';

export async function Avatar({
  username,
  size = DEFAULT_CONFIG.size,
  className,
  background = DEFAULT_CONFIG.background,
}: AvatarProps) {
  const hash = await sha1(username);
  const data = getMetaData(hash);

  return (
    <Renderer
      size={size}
      grid={data?.grid}
      className={className}
      background={background}
      fillCell={data?.rgb.css}
    />
  );
}
