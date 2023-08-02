import {randomInt} from 'crypto'
import {SentenceGenerator} from './sentence-generator'
import {MessagesResponse} from '../messages-response'
import {SentenceFactory} from '../factory/sentence-factory'

export class RandomSentenceGenerator implements SentenceGenerator {
  private sentenceFactory: SentenceFactory
  private messagesResponse!: MessagesResponse

  constructor(sentenceFactory: SentenceFactory) {
    this.sentenceFactory = sentenceFactory
  }

  private async getSentences(): Promise<MessagesResponse> {
    if (this.messagesResponse === undefined) {
      this.messagesResponse = await this.sentenceFactory.create()
    }
    return this.messagesResponse
  }

  async next(): Promise<string> {
    const messagesResponse = await this.getSentences()
    const sentences = messagesResponse.messages
    const index = randomInt(0, sentences.length)
    return sentences[index]
  }
}
