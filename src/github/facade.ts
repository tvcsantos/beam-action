import {
  GitHubDeploymentRequest,
  GitHubDispatchEventRequest,
  GitHubElementIdentifier
} from './model'
import {Reaction} from '../types/types'
import * as core from '@actions/core'
import {Octokit} from 'octokit'

export class GitHubFacade {
  private octokit: Octokit

  constructor(octokit: Octokit) {
    this.octokit = octokit
  }

  async getPullRequestHeadRef(
    pullRequest: GitHubElementIdentifier
  ): Promise<string> {
    core.debug(`Getting head ref for pull request ${pullRequest.id}`)
    const {data} = await this.octokit.rest.pulls.get({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pull_number: pullRequest.id
    })
    return data.head.ref
  }

  private async listPullRequestComments(
    pullRequest: GitHubElementIdentifier
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[] /*IssueComment[]*/> {
    core.debug(`Getting comments for pull request ${pullRequest.id}`)
    const {data: comments} = await this.octokit.rest.issues.listComments({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      issue_number: pullRequest.id
    })
    core.debug(
      `Got ${comments.length} comments for pull request ${pullRequest.id}`
    )
    return comments
  }

  async listPullRequestCommentsNotReactedBy(
    pullRequest: GitHubElementIdentifier,
    reactor: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[] /*IssueComment[]*/> {
    const comments = await this.listPullRequestComments(pullRequest)
    const filtered = []
    core.debug(
      `Filtering comments not reacted by ${reactor} on pull request ${pullRequest.id}`
    )
    for (const comment of comments) {
      const reactedByReactor = await this.isCommentReactedBy(
        {owner: pullRequest.owner, repo: pullRequest.repo, id: comment.id},
        reactor
      )
      if (reactedByReactor) {
        core.debug(
          `${reactor} already reacted to comment ${comment.id} on pull request ${pullRequest.id}, skipping...`
        )
        continue
      }
      filtered.push(comment)
    }
    core.debug(
      `Got ${filtered.length} comments on pull request ${pullRequest.id} that were not reacted by ${reactor}`
    )
    return filtered
  }

  async isCommentReactedBy(
    comment: GitHubElementIdentifier,
    reactor: string
  ): Promise<boolean> {
    const {data: reactions} =
      await this.octokit.rest.reactions.listForIssueComment({
        owner: comment.owner,
        repo: comment.repo,
        comment_id: comment.id
      })
    core.debug(`Got ${reactions.length} reactions for comment ${comment.id}`)
    return reactions.some(reaction => reaction.user?.login === reactor)
  }

  async addCommentToPullRequest(
    pullRequest: GitHubElementIdentifier,
    message: string
  ): Promise<void> {
    core.debug(
      `Creating comment on pull request ${JSON.stringify(
        pullRequest
      )}. Message: ${message}`
    )
    await this.octokit.rest.issues.createComment({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      issue_number: pullRequest.id,
      body: message
    })
  }

  async addReactionToComment(
    comment: GitHubElementIdentifier,
    reaction: Reaction
  ): Promise<void> {
    core.debug(`Reacting to comment ${comment.id}`)
    await this.octokit.rest.reactions.createForIssueComment({
      owner: comment.owner,
      repo: comment.repo,
      comment_id: comment.id,
      content: reaction as never
    })
  }

  async deploy(request: GitHubDeploymentRequest): Promise<void> {
    await this.octokit.rest.repos.createDeployment({...request})
  }

  async dispatch(request: GitHubDispatchEventRequest): Promise<void> {
    await this.octokit.rest.repos.createDispatchEvent({...request})
  }

  async app(): Promise<string> {
    const {data} = await this.octokit.rest.apps.getAuthenticated()
    return data.slug ?? data.name.toLowerCase().replace(/ /g, '-')
  }
}
