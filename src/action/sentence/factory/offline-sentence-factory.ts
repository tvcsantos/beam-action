import fs from 'fs/promises'
import * as core from '@actions/core'
import {MessagesResponse} from '../messages-response'
import {SentenceFactory} from './sentence-factory'

const NEW_LINE_REGEX = /\n/

export class OfflineSentenceFactory implements SentenceFactory {
  private readonly path: string

  constructor(path: string) {
    this.path = path
  }

  async create(): Promise<MessagesResponse> {
    const content = await fs.readFile(this.path, 'utf-8')
    const lines = content.split(NEW_LINE_REGEX)
    core.debug(`Read ${lines.length} sentences`)
    return {messages: lines}
  }
}
