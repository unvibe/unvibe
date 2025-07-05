import type {
  ComponentPropsWithoutRef,
  ElementType,
  PropsWithChildren,
} from 'react';

type WithAs<E extends ElementType> = PropsWithChildren<
  ComponentPropsWithoutRef<E> & {
    as?: E;
  }
>;

export type PolyMorphicProps<
  E extends ElementType,
  Props = object,
> = WithAs<E> & Props;
