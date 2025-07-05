import type { PolyMorphicProps } from '../_internal/polyMorphic';
import type { ElementType } from 'react';
import clsx from 'clsx';

export interface TextProps {
  center?: boolean;
  left?: boolean;
  right?: boolean;
  bold?: boolean;
  semiBold?: boolean;
  light?: boolean;
  thin?: boolean;
  italic?: boolean;
  underline?: boolean;
  lineThrough?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
  truncate?: boolean;
  mono?: boolean;
}

const propsToClassName = (
  center?: boolean,
  left?: boolean,
  right?: boolean,
  bold?: boolean,
  semiBold?: boolean,
  light?: boolean,
  thin?: boolean,
  italic?: boolean,
  underline?: boolean,
  lineThrough?: boolean,
  uppercase?: boolean,
  lowercase?: boolean,
  capitalize?: boolean,
  truncate?: boolean,
  mono?: boolean
) =>
  clsx(
    center && 'text-center',
    left && 'text-left',
    right && 'text-right',
    bold && 'font-bold',
    semiBold && 'font-semibold',
    light && 'font-light',
    thin && 'font-thin',
    italic && 'italic',
    underline && 'underline',
    lineThrough && 'line-through',
    uppercase && 'uppercase',
    lowercase && 'lowercase',
    capitalize && 'capitalize',
    truncate && 'truncate',
    mono && 'font-mono'
  );

const sizes = {
  h1: 'text-4xl',
  h2: 'text-3xl',
  h3: 'text-2xl',
  h4: 'text-xl',
  h5: 'text-lg',
  h6: 'text-base',
  p: 'text-base',
  a: 'text-base text-foreground',
};

const defaultElement = 'div';

type TextComponentProps<E extends ElementType = typeof defaultElement> =
  PolyMorphicProps<E> & TextProps;

function Text<E extends ElementType = typeof defaultElement>({
  as,
  center,
  left,
  right,
  bold,
  semiBold,
  light,
  thin,
  italic,
  underline = as === 'a' ? true : undefined,
  lineThrough,
  uppercase,
  lowercase,
  capitalize,
  truncate,
  mono,
  ...reactComponentProps
}: TextComponentProps<E>) {
  const Component = (as || defaultElement) as 'h1';
  const size = sizes[Component as keyof typeof sizes];
  return (
    <Component
      {...reactComponentProps}
      className={clsx(
        reactComponentProps.className,
        size,
        propsToClassName(
          center,
          left,
          right,
          bold,
          semiBold,
          light,
          thin,
          italic,
          underline,
          lineThrough,
          uppercase,
          lowercase,
          capitalize,
          truncate,
          mono
        )
      )}
    />
  );
}

export const text = {
  h1: function H1(props: TextComponentProps<'h1'>) {
    return <Text as='h1' {...props} />;
  },
  h2: function H2(props: TextComponentProps<'h2'>) {
    return <Text as='h2' {...props} />;
  },
  h3: function H3(props: TextComponentProps<'h3'>) {
    return <Text as='h3' {...props} />;
  },
  h4: function H4(props: TextComponentProps<'h4'>) {
    return <Text as='h4' {...props} />;
  },
  h5: function H5(props: TextComponentProps<'h5'>) {
    return <Text as='h5' {...props} />;
  },
  h6: function H6(props: TextComponentProps<'h6'>) {
    return <Text as='h6' {...props} />;
  },
  p: function P(props: TextComponentProps<'p'>) {
    return <Text as='p' {...props} />;
  },
  a: function A(props: TextComponentProps<'a'>) {
    return <Text as='a' {...props} />;
  },
  span: function A(props: TextComponentProps<'a'>) {
    return <Text as='span' {...props} />;
  },
};
