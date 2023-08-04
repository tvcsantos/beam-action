import {Inputs} from '../input/inputs'
import * as github from '@actions/github'
import * as core from '@actions/core'
import {GitHub} from '@actions/github/lib/utils'
import {Beam} from './beam'
import {DeployCommandHandler} from '../handler/deploy-command-handler'
import {GitHubElementIdentifier} from '../github/model'
import {simpleGit} from 'simple-git'
import {State} from '../state/state'
import {BeamSentenceFactory} from './sentence/factory/beam-sentence-factory'
import {RandomSentenceGenerator} from './sentence/generator/random-sentence-generator'
import {GitHubFacade} from '../github/facade'

const UNABLE_TO_GET_PR_INFORMATION = 'Unable to get pull request information.'

export class ActionOrchestrator {
  private inputs?: Inputs

  private getPullRequestInformation(): GitHubElementIdentifier {
    // Get the pull request information
    const {payload} = github.context
    const id = payload.issue?.number
    const owner = payload.repository?.owner.login
    const repo = payload.repository?.name

    core.debug(`PR - id: ${id}, owner: ${owner}, repo: ${repo}`)

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

    const state = new State(simpleGit(), this.inputs.stateBranch)

    await state.hydrate()

    const sentenceGenerator = new RandomSentenceGenerator(
      new BeamSentenceFactory(inputs)
    )

    const beam = Beam.builder(
      this.inputs.botName,
      gitHubFacade,
      sentenceGenerator
    )
      .withReaction(this.inputs.botReaction)
      .withHandler(new DeployCommandHandler(gitHubFacade, github.context))
      .build()

    await beam.process(pullRequest)

    await state.persist()
  }
}
