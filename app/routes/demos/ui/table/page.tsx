import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/ui/table';

export default function TableDemo() {
  return (
    <div className='min-h-screen container mx-auto py-10 px-6'>
      <h1 className='text-3xl font-semibold mb-6'>📋 Table Demo</h1>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>🎯 Responsive Design</TableCell>
              <TableCell>
                App adapts to any screen size, from phones to big monitors.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>🦾 Accessibility</TableCell>
              <TableCell>
                Components are keyboard- and screen reader-friendly.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>⚡ Fast Interactions</TableCell>
              <TableCell>
                UI updates instantly — try clicking and dragging above!
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
