import { runShellCommand } from './lib/run-shell-command';

export async function getCurrentUsername(): Promise<string | null> {
  try {
    const output = await runShellCommand('gh api user --jq .login');
    return output.trim();
  } catch {
    return null;
  }
}

export async function getOrgs(): Promise<string[]> {
  try {
    const output = await runShellCommand("gh api user/orgs --jq '.[].login'");
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function getReposForOwner(owner: string): Promise<string[]> {
  try {
    const output = await runShellCommand(
      `gh repo list ${owner} --json name --jq '.[].name'`
    );
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function listRemote(): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  const username = await getCurrentUsername();
  if (username) {
    result[username] = await getReposForOwner(username);
  }
  const orgs = await getOrgs();
  for (const org of orgs) {
    result[org] = await getReposForOwner(org);
  }
  return result;
}

export async function importRemoteProject(url: string): Promise<boolean> {
  // Placeholder for actual import logic
  return !!url;
}
