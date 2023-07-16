import {GitHub} from '@actions/github/lib/utils'
import {GitHubElementIdentifier} from './model'
import {Reaction} from '../types/types'

export class GitHubFacade {
  private octokit: InstanceType<typeof GitHub>

  constructor(octokit: InstanceType<typeof GitHub>) {
    this.octokit = octokit
  }

  private async listPullRequestComments(
    pullRequest: GitHubElementIdentifier
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[] /*IssueComment[]*/> {
    const {data: comments} = await this.octokit.rest.issues.listComments({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      issue_number: pullRequest.id
    })
    return comments
  }

  async listPullRequestCommentsNotReactedBy(
    pullRequest: GitHubElementIdentifier,
    reactor: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[] /*IssueComment[]*/> {
    const comments = await this.listPullRequestComments(pullRequest)
    return comments.filter(async comment => {
      const {data: reactions} =
        await this.octokit.rest.reactions.listForIssueComment({
          owner: pullRequest.owner,
          repo: pullRequest.repo,
          comment_id: comment.id
        })
      return !reactions.some(reaction => reaction.user?.login === reactor)
    })
  }

  async replyToComment(
    comment: GitHubElementIdentifier,
    message: string
  ): Promise<void> {
    await this.octokit.rest.issues.createComment({
      owner: comment.owner,
      repo: comment.repo,
      issue_number: comment.id,
      body: message
    })
  }

  async addReactionToComment(
    comment: GitHubElementIdentifier,
    reaction: Reaction
  ): Promise<void> {
    await this.octokit.rest.reactions.createForIssueComment({
      owner: comment.owner,
      repo: comment.repo,
      comment_id: comment.id,
      content: reaction as never
    })
  }
}
