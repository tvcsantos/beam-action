import * as core from '@actions/core'
import {BeamBuilder} from './beam-builder'
import {GitHubFacade} from '../github/facade'
import {CommandHandler} from '../handler/command-handler'
import {CommentPayload, GitHubElementIdentifier} from '../github/model'
import {Reaction} from '../types/types'
import {SentenceGenerator} from './sentence/generator/sentence-generator'
import {getBotUsernameFromApp} from '../utils/utils'

const COULD_NOT_PROCESS_COMMAND = (command: string): string =>
  `Could not process command ${command}`
const UNKNOWN_COMMAND = (command: string): string =>
  `Unknown command: ${command}`

export class Beam {
  private readonly name: string
  private readonly reaction: Reaction
  private readonly gitHubFacade: GitHubFacade
  private readonly commandRegex: RegExp
  private readonly handlers: ReadonlyMap<string, CommandHandler>
  private readonly sentenceGenerator: SentenceGenerator

  constructor(
    name: string,
    reaction: Reaction,
    gitHubFacade: GitHubFacade,
    sentenceGenerator: SentenceGenerator,
    handlers: ReadonlyMap<string, CommandHandler>
  ) {
    this.name = name
    this.reaction = reaction
    this.gitHubFacade = gitHubFacade
    this.commandRegex = new RegExp(`/${this.name}\\s+(\\w+)\\s*(.*)`)
    this.handlers = handlers
    this.sentenceGenerator = sentenceGenerator
  }

  async process(
    pullRequest: GitHubElementIdentifier,
    comment: CommentPayload
  ): Promise<void> {
    const app = await this.gitHubFacade.app()
    const botUser = getBotUsernameFromApp(app)

    const commentMetadata: GitHubElementIdentifier = {
      id: comment.id,
      owner: pullRequest.owner,
      repo: pullRequest.repo
    }

    const reactedByBotUser = await this.gitHubFacade.isCommentReactedBy(
      commentMetadata,
      botUser
    )

    if (reactedByBotUser) {
      core.debug(
        `${reactedByBotUser} already reacted to comment ${comment.id} on pull request ${pullRequest.id}, skipping...`
      )
      return Promise.resolve(undefined)
    }

    if (comment.user.login === botUser) {
      core.debug('Processing a self comment, skipping...')
      return Promise.resolve(undefined)
    }

    const match = comment.body?.match(this.commandRegex)

    if (match) {
      core.debug(`Matched comment ${comment.id}`)

      const command = match[1]
      const args: string[] = match[2]
        .split(/\s+/)
        .map((x: string) => x.trim())
        .filter((x: string) => !!x)

      core.debug(
        `Command: ${command}, Arguments size: ${args.length}, Arguments: ${args}`
      )

      const handler = this.handlers.get(command)

      let handledComment = await this.sentenceGenerator.next()

      if (handler === undefined) {
        core.warning(UNKNOWN_COMMAND(command))
        handledComment = COULD_NOT_PROCESS_COMMAND(command)
      }

      // Lock command comment by reacting
      await this.gitHubFacade.addReactionToComment(
        commentMetadata,
        this.reaction
      )

      core.debug(`Reacted to comment ${comment.id}`)

      handler?.handle(args)

      core.debug(`Command handler executed for comment ${comment.id}`)

      await this.gitHubFacade.addCommentToPullRequest(
        pullRequest,
        handledComment
      )

      core.debug(`Replied with comment to pull request ${pullRequest.id}`)
    }
  }

  static builder(
    name: string,
    gitHubFacade: GitHubFacade,
    sentenceGenerator: SentenceGenerator
  ): BeamBuilder {
    return new BeamBuilder(name, gitHubFacade, sentenceGenerator)
  }
}
