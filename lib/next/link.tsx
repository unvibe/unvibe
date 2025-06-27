import { Link as ReactRouterLink } from 'react-router';

export function Link({
  href,
  children,
  passHref = true,
  legacyBehavior = false,
  ...props
}: React.ComponentProps<'a'> & {
  href: string;
  passHref?: boolean;
  legacyBehavior?: boolean;
}) {
  return (
    <ReactRouterLink to={href} {...props}>
      {children}
    </ReactRouterLink>
  );
}

export default Link;
