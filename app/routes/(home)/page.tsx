import { redirect } from 'react-router';

export async function loader() {
  return redirect('/home/projects');
}

export async function clientLoader() {
  return redirect('/home/projects');
}

export default function HomePage() {
  return null;
}
