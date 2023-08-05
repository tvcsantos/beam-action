const GITHUB_ACTION_PATH_VARIABLE = 'GITHUB_ACTION_PATH'

export function getGitHubActionPath(): string | undefined {
  return process.env[GITHUB_ACTION_PATH_VARIABLE]
}

export function getFolderForBranch(branch: string): string {
  return `.${branch}`
}

export function getBotUsernameFromApp(app: string): string {
  return `${app}[bot]`
}
