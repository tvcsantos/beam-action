import * as core from '@actions/core'
import {BeamBuilder} from './beam-builder'
import {GitHubFacade} from '../github/facade'
import {CommandHandler} from '../handler/command-handler'
import {GitHubElementIdentifier} from '../github/model'
import {Reaction} from '../types/types'

const BOT_USER = 'github-actions[bot]'
const DEFAULT_BAD_REACTION = '-1'
const SUCCESS_HANDLE_COMMAND_MESSAGE = 'Command handled successfully!'
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

  constructor(
    name: string,
    reaction: Reaction,
    gitHubFacade: GitHubFacade,
    handlers: ReadonlyMap<string, CommandHandler>
  ) {
    this.name = name
    this.reaction = reaction
    this.gitHubFacade = gitHubFacade
    this.commandRegex = new RegExp(`(?:@)?${this.name}\\s+(\\w+)\\s*(.*)`)
    this.handlers = handlers
  }

  async process(pullRequest: GitHubElementIdentifier): Promise<void> {
    const comments =
      await this.gitHubFacade.listPullRequestCommentsNotReactedBy(
        pullRequest,
        BOT_USER
      )

    // Check each filtered comment for the specified pattern
    for (const comment of comments) {
      const commentMetadata: GitHubElementIdentifier = {
        id: comment.id,
        owner: pullRequest.owner,
        repo: pullRequest.repo
      }
      const match = comment.body?.match(this.commandRegex)

      if (match) {
        const command = match[1]
        const args = match[2].split(/\s+/)

        const handler = this.handlers.get(command)

        let reaction = this.reaction
        let handledComment = SUCCESS_HANDLE_COMMAND_MESSAGE

        if (handler === undefined) {
          core.warning(UNKNOWN_COMMAND(command))
          reaction = DEFAULT_BAD_REACTION
          handledComment = COULD_NOT_PROCESS_COMMAND(command)
        }

        // Lock command comment by reacting
        await this.gitHubFacade.addReactionToComment(commentMetadata, reaction)

        handler?.handle(args)

        await this.gitHubFacade.replyToComment(commentMetadata, handledComment)
      }
    }
  }

  static builder(name: string, gitHubFacade: GitHubFacade): BeamBuilder {
    return new BeamBuilder(name, gitHubFacade)
  }
}
