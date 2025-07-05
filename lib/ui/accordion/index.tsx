import * as React from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import clsx from 'clsx';
import { HiChevronDown as ChevronDownIcon } from 'react-icons/hi';

interface AccordionItem {
  value: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

interface TriggerProps extends React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger> {
  children: React.ReactNode;
  className?: string;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ children, className, ...props }, ref) => (
    <RadixAccordion.Header className="AccordionHeader">
      <RadixAccordion.Trigger
        className={clsx(
          'p-4 text-left w-full flex justify-between items-center border-b border-border hover:bg-gray-100 dark:hover:bg-gray-800',
          className
        )}
        {...props}
        ref={ref}
      >
        {children}
        <ChevronDownIcon className="ml-2" aria-hidden />
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  )
);
AccordionTrigger.displayName = 'AccordionTrigger';

interface ContentProps extends React.ComponentPropsWithoutRef<typeof RadixAccordion.Content> {
  children: React.ReactNode;
  className?: string;
}

const AccordionContent = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ children, className, ...props }, ref) => (
    <RadixAccordion.Content
      className={clsx('p-4 text-foreground bg-background-1 dark:bg-background-2', className)}
      {...props}
      ref={ref}
    >
      {children}
    </RadixAccordion.Content>
  )
);
AccordionContent.displayName = 'AccordionContent';

export function Accordion({ items }: AccordionProps) {
  return (
    <RadixAccordion.Root className="border border-border rounded-xl" type="single" collapsible>
      {items.map((item) => (
        <RadixAccordion.Item key={item.value} value={item.value} className="AccordionItem">
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
