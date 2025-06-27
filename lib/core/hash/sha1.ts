const crypto = globalThis.crypto;

export async function sha1(username: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(username);

  // Compute the SHA-1 hash of the data
  const buffer = await crypto.subtle.digest('SHA-1', data);

  // Convert the hash to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(buffer));
  const hexString = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hexString;
}
