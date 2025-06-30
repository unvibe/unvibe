export function parseContext(
  context: { key: string; preview_string: string }[]
) {
  return context.map((item) => {
    const [type, source_id, key] = item.key.split('/');
    return {
      _key: item.key,
      type,
      source_id,
      key,
      description: item.preview_string,
    };
  });
}
