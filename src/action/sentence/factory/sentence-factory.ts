import {MessagesResponse} from '../messages-response'

export interface SentenceFactory {
  create(): Promise<MessagesResponse>
}
