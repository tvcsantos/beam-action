import {randomInt} from 'crypto'
import fs from 'fs/promises'

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
    return sentences[index]
  }

  private async readSentences(path: string): Promise<string[]> {
    //const s = await fs.readFile(path, 'utf-8')
    const file = await fs.open(path)
    const responses: string[] = []
    for await (const line of file.readLines()) {
      responses.push(line)
    }
    return responses
  }
}
