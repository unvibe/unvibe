import type { AvatarProps } from './config';
import { BaseAvatar } from './base-avatar';
import { RendererLine } from './renderer-line';

export function Avatar(props: AvatarProps) {
  return <BaseAvatar {...props} Renderer={RendererLine} />;
}
