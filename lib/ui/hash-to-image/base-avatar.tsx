import { useState, useEffect, useMemo, ReactElement } from 'react';
import { getMetaData } from './lib';
import type { AvatarProps, RendererProps } from './config';
import { DEFAULT_CONFIG } from './config';
import { noop } from '@/lib/core/noop';
import { sha1 } from '@/lib/core/hash/sha1';

export function BaseAvatar({
  username,
  size = DEFAULT_CONFIG.size,
  className,
  background = DEFAULT_CONFIG.background,
  Renderer,
}: AvatarProps & { Renderer: (props: RendererProps) => ReactElement }) {
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    sha1(username).then(setHash).catch(noop);
  }, [username]);

  const data = useMemo(() => getMetaData(hash), [hash]);

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
