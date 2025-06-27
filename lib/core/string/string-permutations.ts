export const stringPermutations = (str: string): string | string[] => {
  // recursion base case
  if (str.length < 2) return str;

  // accumlated permutations will be pushed here
  const result = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    // avoid repeating permutations
    if (str.indexOf(char) != i) continue;

    const remainingChars = str.slice(0, i) + str.slice(i + 1, str.length);

    const permutations = stringPermutations(remainingChars);

    for (let j = 0; j < permutations.length; j++) {
      result.push(char + permutations[j]);
    }
  }

  return result;
};
