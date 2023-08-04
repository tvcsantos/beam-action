export interface GitHubElementIdentifier {
  id: number
  owner: string
  repo: string
}

export interface GitHubDeploymentRequest {
  owner: string
  repo: string
  ref: string
  task?: string
  auto_merge?: boolean
  required_contexts?: string[]
  payload?: {[key: string]: unknown} | string
  environment?: string
  description?: string | null
  transient_environment?: boolean
  production_environment?: boolean
}
