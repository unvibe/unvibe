export interface AvatarProps {
  username: string;
  size?: number;
  className?: string;
  background?: string;
}

export interface RendererProps {
  size: number;
  grid?: number[][];
  className?: string;
  background?: string;
  fillCell?: string;
}

export const DEFAULT_CONFIG: Required<
  Omit<AvatarProps, 'username' | 'className'>
> = {
  size: 50,
  background: '#fff',
};
