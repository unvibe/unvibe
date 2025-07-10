export function id(projectPath: string) {
  return btoa(projectPath);
}

export function pathFromId(projectId: string) {
  return atob(projectId);
}
