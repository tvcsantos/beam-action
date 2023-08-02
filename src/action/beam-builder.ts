import {GitHubFacade} from '../github/facade'
import {CommandHandler} from '../handler/command-handler'
import {Beam} from './beam'
import {Reaction} from '../types/types'
import {SentenceGenerator} from './sentence/generator/sentence-generator'

const DEFAULT_REACTION = '+1'

export class BeamBuilder {
  private readonly name: string
  private reaction: Reaction = DEFAULT_REACTION
  private readonly gitHubFacade: GitHubFacade
  private readonly handlers: Map<string, CommandHandler>
  private sentenceGenerator: SentenceGenerator

  constructor(
    name: string,
    gitHubFacade: GitHubFacade,
    sentenceGenerator: SentenceGenerator
  ) {
    this.name = name
    this.gitHubFacade = gitHubFacade
    this.handlers = new Map<string, CommandHandler>()
    this.sentenceGenerator = sentenceGenerator
  }

  withReaction(reaction: Reaction): BeamBuilder {
    this.reaction = reaction
    return this
  }

  withHandler(handler: CommandHandler): BeamBuilder {
    this.handlers.set(handler.id, handler)
    return this
  }

  build(): Beam {
    return new Beam(
      this.name,
      this.reaction,
      this.gitHubFacade,
      this.sentenceGenerator,
      this.handlers
    )
  }
}
