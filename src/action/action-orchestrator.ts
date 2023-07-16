import {Inputs} from '../input/inputs'
import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'
import {Beam} from './beam'
import {GitHubFacade} from '../github/facade'
import {DeployCommandHandler} from '../handler/deploy-command-handler'
import {GitHubElementIdentifier} from '../github/model'

const UNABLE_TO_GET_PR_INFORMATION = 'Unable to get pull request information.'

export class ActionOrchestrator {
  private inputs?: Inputs

  private getPullRequestInformation(): GitHubElementIdentifier {
    // Get the pull request information
    const {payload} = github.context
    const id = payload.pull_request?.number
    const owner = payload.repository?.owner.login
    const repo = payload.repository?.name

    if (!id || !owner || !repo) {
      throw new Error(UNABLE_TO_GET_PR_INFORMATION)
    }

    return {id, owner, repo}
  }

  private getOctokit(): InstanceType<typeof GitHub> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return github.getOctokit(this.inputs!!.token)
  }

  async execute(inputs: Inputs): Promise<void> {
    this.inputs = inputs

    // Get the GitHub client
    const gitHubFacade = new GitHubFacade(this.getOctokit())

    const pullRequest = this.getPullRequestInformation()

    const beam = Beam.builder(this.inputs.botName, gitHubFacade)
      .withReaction(this.inputs.botReaction)
      .withHandler('deploy', new DeployCommandHandler())
      .build()

    return beam.process(pullRequest)
  }
}
