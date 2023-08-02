import {AIPositiveSentenceFactory} from './ai-positive-sentence-factory'
import {OfflineSentenceFactory} from './offline-sentence-factory'
import {Inputs} from '../../../input/inputs'
import {MessagesResponse} from '../messages-response'
import {getFolderForBranch, getGitHubActionPath} from '../../../utils/utils'
import {SentenceFactory} from './sentence-factory'
import {PersistedSentenceFactory} from './persisted-sentence-factory'

const BEAM_POSITIVE_SENTENCES = 'beam-positive.txt'

export class BeamSentenceFactory implements SentenceFactory {
  private readonly delegate: SentenceFactory

  constructor(inputs: Inputs) {
    this.delegate = new PersistedSentenceFactory(
      this.getSentencesPathForBranch(inputs.stateBranch),
      this.getSentenceFactory(inputs)
    )
  }

  private getSentencesPathForBranch(branch: string): string {
    return `${getFolderForBranch(branch)}/${BEAM_POSITIVE_SENTENCES}`
  }

  private getOfflineSentencesPath(): string {
    const gitHubActionPath = getGitHubActionPath()
    return gitHubActionPath
      ? `${gitHubActionPath}/${BEAM_POSITIVE_SENTENCES}`
      : BEAM_POSITIVE_SENTENCES
  }

  private getSentenceFactory(inputs: Inputs): SentenceFactory {
    if (inputs.aiEnabled) {
      return new AIPositiveSentenceFactory(inputs.openAIApiKey)
    }
    return new OfflineSentenceFactory(this.getOfflineSentencesPath())
  }

  async create(): Promise<MessagesResponse> {
    return this.delegate.create()
  }
}
