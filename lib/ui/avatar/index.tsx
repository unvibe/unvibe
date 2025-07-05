// Avatar component (Next.js Image for optimization, fallback initials, SSR-safe) with theme-aware styles
import React from 'react';
import clsx from 'clsx';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string; // for initials fallback
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name = '',
  size = 40,
  className,
}) => {
  const initials = name
    ? name
        .split(' ')
        .filter((n) => n)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full bg-background-1 text-foreground border border-border font-semibold overflow-hidden dark:bg-background-2 dark:text-foreground dark:border-border-1',
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={alt || name || 'Avatar'}
      role='img'
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          width={size}
          height={size}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      ) : (
        initials
      )}
    </span>
  );
};
