export async function copyToClipboard(text: string) {
  // check support for clipboard api
  if ('clipboard' in navigator) {
    await navigator.clipboard.writeText(text);
  } else {
    throw new Error('Clipboard API not available');
  }
}
