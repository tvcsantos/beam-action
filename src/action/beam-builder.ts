import {GitHubFacade} from '../github/facade'
import {CommandHandler} from '../handler/command-handler'
import {Beam} from './beam'
import {Reaction} from '../types/types'

const DEFAULT_REACTION = '+1'

export class BeamBuilder {
  private readonly name: string
  private reaction: Reaction = DEFAULT_REACTION
  private readonly gitHubFacade: GitHubFacade
  private readonly handlers: Map<string, CommandHandler>

  constructor(name: string, gitHubFacade: GitHubFacade) {
    this.name = name
    this.gitHubFacade = gitHubFacade
    this.handlers = new Map<string, CommandHandler>()
  }

  withReaction(reaction: Reaction): BeamBuilder {
    this.reaction = reaction
    return this
  }

  withHandler(command: string, handler: CommandHandler): BeamBuilder {
    this.handlers.set(command, handler)
    return this
  }

  build(): Beam {
    return new Beam(this.name, this.reaction, this.gitHubFacade, this.handlers)
  }
}
