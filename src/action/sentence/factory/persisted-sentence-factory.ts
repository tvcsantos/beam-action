import {MessagesResponse} from '../messages-response'
import fs from 'fs/promises'
import {SentenceFactory} from './sentence-factory'

export class PersistedSentenceFactory implements SentenceFactory {
  private readonly path: string
  private readonly sentenceFactory: SentenceFactory

  constructor(path: string, sentenceFactory: SentenceFactory) {
    this.path = path
    this.sentenceFactory = sentenceFactory
  }

  private async hydrate(): Promise<MessagesResponse | null> {
    let data: string
    try {
      data = await fs.readFile(this.path, {encoding: 'utf-8'})
    } catch (e) {
      return Promise.resolve(null)
    }
    return JSON.parse(data) as MessagesResponse
  }

  private async persist(messagesResponse: MessagesResponse): Promise<void> {
    await fs.writeFile(this.path, JSON.stringify(messagesResponse))
  }

  async create(): Promise<MessagesResponse> {
    const response = await this.hydrate()
    if (response != null) return response
    const freshResponse = await this.sentenceFactory.create()
    await this.persist(freshResponse)
    return freshResponse
  }
}
