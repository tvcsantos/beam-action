export interface GitHubElementIdentifier {
  id: number
  owner: string
  repo: string
}

export interface CommentPayload {
  id: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
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

export interface GitHubDispatchEventRequest {
  owner: string
  repo: string
  event_type: string
  client_payload?: {[key: string]: unknown}
}
