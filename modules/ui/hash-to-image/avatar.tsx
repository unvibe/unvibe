import { Renderer } from './renderer-svg';
import type { AvatarProps } from './config';
import { BaseAvatar } from './base-avatar';

export function Avatar(props: AvatarProps) {
  return <BaseAvatar {...props} Renderer={Renderer} />;
}
