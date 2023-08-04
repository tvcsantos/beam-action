import {CommandHandler} from './command-handler'
import {GitHubFacade} from '../github/facade'
import {Context} from '@actions/github/lib/context'

export class DeployCommandHandler implements CommandHandler {
  readonly id = 'deploy'
  private readonly gitHubFacade: GitHubFacade
  private readonly context: Context

  constructor(gitHubFacade: GitHubFacade, context: Context) {
    this.gitHubFacade = gitHubFacade
    this.context = context
  }

  async handle(args: string[]): Promise<void> {
    const environment = args.length > 0 ? args[1] : undefined
    const {repo, ref} = this.context
    await this.gitHubFacade.deploy({
      ref,
      repo: repo.repo,
      owner: repo.owner,
      environment
    })
  }
}
