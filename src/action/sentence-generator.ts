import {randomInt} from 'crypto'
import fs from 'fs/promises'
import * as core from '@actions/core'

const NEW_LINE_REGEX = /\n/

export class SentenceGenerator {
  private readonly path: string
  private sentences!: string[]

  constructor(path: string) {
    this.path = path
  }

  private async getSentences(): Promise<string[]> {
    if (this.sentences === undefined) {
      this.sentences = await this.readSentences(this.path)
    }
    return this.sentences
  }

  async next(): Promise<string> {
    const sentences = await this.getSentences()
    const index = randomInt(0, sentences.length)
    core.debug(`Next index:${index}, length:${sentences.length}`)
    return sentences[index]
  }

  private async readSentences(path: string): Promise<string[]> {
    const content = await fs.readFile(path, 'utf-8')
    return content.split(NEW_LINE_REGEX)
  }
}
