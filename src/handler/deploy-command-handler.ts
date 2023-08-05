import {CommandHandler} from './command-handler'
import {GitHubFacade} from '../github/facade'
import {GitHubElementIdentifier} from '../github/model'
import * as core from '@actions/core'

export class DeployCommandHandler implements CommandHandler {
  readonly id = 'deploy'
  private readonly gitHubFacade: GitHubFacade
  private readonly pullRequestInformation: GitHubElementIdentifier

  constructor(
    gitHubFacade: GitHubFacade,
    pullRequestInformation: GitHubElementIdentifier
  ) {
    this.gitHubFacade = gitHubFacade
    this.pullRequestInformation = pullRequestInformation
  }

  async handle(args: string[]): Promise<void> {
    const environment = args.length > 0 ? args[0] : undefined
    core.debug(`Deploying to environment: ${environment}`)
    const ref = await this.gitHubFacade.getPullRequestHeadRef(
      this.pullRequestInformation
    )
    await this.gitHubFacade.deploy({
      ref,
      repo: this.pullRequestInformation.repo,
      owner: this.pullRequestInformation.owner,
      environment
    })
  }
}
