import {GitHubFacade} from '../github/facade'
import {CommandHandler} from '../handler/command-handler'
import {Beam} from './beam'
import {Reaction} from '../types/types'
import {SentenceGenerator} from './sentence-generator'

const DEFAULT_REACTION = '+1'
const BEAM_POSITIVE_SENTENCES = 'beam-positive.txt'

export class BeamBuilder {
  private readonly name: string
  private reaction: Reaction = DEFAULT_REACTION
  private readonly gitHubFacade: GitHubFacade
  private readonly handlers: Map<string, CommandHandler>
  private sentenceGenerator: SentenceGenerator

  constructor(name: string, gitHubFacade: GitHubFacade) {
    this.name = name
    this.gitHubFacade = gitHubFacade
    this.handlers = new Map<string, CommandHandler>()
    this.sentenceGenerator = this.createSentenceGenerator()
  }

  private createSentenceGenerator(): SentenceGenerator {
    const actionPath = process.env['GITHUB_ACTION_PATH']
    const filePath =
      actionPath === undefined
        ? BEAM_POSITIVE_SENTENCES
        : `${actionPath}/${BEAM_POSITIVE_SENTENCES}`
    return new SentenceGenerator(filePath)
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
