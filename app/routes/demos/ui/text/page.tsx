import { text } from '@/lib/ui/text';

export default function TextDemo() {
  return (
    <div className='min-h-screen container mx-auto py-10 px-6'>
      <h1 className='text-3xl font-semibold mb-6'>📝 Text Components Demo</h1>
      <div className='space-y-2'>
        <text.h1>Heading 1</text.h1>
        <text.h2>Heading 2</text.h2>
        <text.h3>Heading 3</text.h3>
        <text.h4>Heading 4</text.h4>
        <text.h5>Heading 5</text.h5>
        <text.h6>Heading 6</text.h6>
        <text.p>
          Paragraph text example showcasing the font size and style.
        </text.p>
      </div>
    </div>
  );
}
