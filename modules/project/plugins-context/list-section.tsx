export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className='w-[250px] px-4'>
      <h3 className='text-2xl font-semibold'>{title}</h3>
      <p className='text-sm text-foreground-2 py-2'>{description}</p>
    </div>
  );
}

export function Section({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className='grid gap-1'>
      <SectionHeader title={title} description={description} />
      <div className='flex flex-wrap gap-2'>{children}</div>
    </div>
  );
}
