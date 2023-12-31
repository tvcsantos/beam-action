import {Inputs} from '../input/inputs'
import * as github from '@actions/github'
import * as core from '@actions/core'
import {Beam} from './beam'
import {DeployCommandHandler} from '../handler/deploy-command-handler'
import {CommentPayload, GitHubElementIdentifier} from '../github/model'
import {simpleGit} from 'simple-git'
import {State} from '../state/state'
import {BeamSentenceFactory} from './sentence/factory/beam-sentence-factory'
import {RandomSentenceGenerator} from './sentence/generator/random-sentence-generator'
import {GitHubFacade} from '../github/facade'
import {App, Octokit} from 'octokit'
import fetch from 'node-fetch'
import {getBotUsernameFromApp} from '../utils/utils'

const UNABLE_TO_GET_PR_INFORMATION = 'Unable to get pull request information.'
const UNABLE_TO_GET_COMMENT_PAYLOAD = 'Unable to get comment payload.'

export class ActionOrchestrator {
  private inputs?: Inputs

  private getPullRequestInformation(): GitHubElementIdentifier {
    // Get the pull request information
    const {payload} = github.context
    core.debug(JSON.stringify(payload))
    const id = payload.issue?.number
    const owner = payload.repository?.owner.login
    const repo = payload.repository?.name

    core.debug(`PR - id: ${id}, owner: ${owner}, repo: ${repo}`)

    if (!id || !owner || !repo) {
      throw new Error(UNABLE_TO_GET_PR_INFORMATION)
    }

    return {id, owner, repo}
  }

  private getCommentPayload(): CommentPayload {
    const {payload} = github.context
    const comment = payload.comment
    if (!comment) {
      throw new Error(UNABLE_TO_GET_COMMENT_PAYLOAD)
    }
    return comment
  }

  private async getOctokit(): Promise<Octokit> {
    const app = new App({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      appId: this.inputs!!.appId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      privateKey: this.inputs!!.appPrivateKey,
      Octokit: Octokit.defaults({
        request: {
          fetch
        }
      })
    })
    return app.getInstallationOctokit(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.inputs!!.appInstallationId
    )
  }

  async execute(inputs: Inputs): Promise<void> {
    this.inputs = inputs

    // Get the GitHub client
    const gitHubFacade = new GitHubFacade(await this.getOctokit())

    const app = await gitHubFacade.app()

    core.debug(`beam running app: ${app}`)

    if (github.context.actor === getBotUsernameFromApp(app)) {
      core.debug("It's a me, Mario! It's a self call I will return earlier")
      return Promise.resolve(undefined)
    }

    const pullRequest = this.getPullRequestInformation()
    const comment = this.getCommentPayload()

    const state = new State(simpleGit(), this.inputs.stateBranch, app)

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
      .withHandler(new DeployCommandHandler(gitHubFacade, pullRequest))
      .build()

    await beam.process(pullRequest, comment)

    await state.persist()
  }
}
