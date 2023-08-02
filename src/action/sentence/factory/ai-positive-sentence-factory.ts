import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionResponse,
  OpenAIApi
} from 'openai'
import * as core from '@actions/core'
import {MessagesResponse} from '../messages-response'
import {SentenceFactory} from './sentence-factory'

const MESSAGE_PROMPT =
  'Create a random list of at least 40 messages that answer with a positive accept style to a asked command. 10 of them as a normal person. 10 impersonating a pirate. 10 impersonating Yoda from Star Wars. And 10 impersonating Gandalf from Lord of the rings. Answer in JSON format with an attribute "messages" that contains a list with each element corresponding to a message. Place all messages under "messages".'

export class AIPositiveSentenceFactory implements SentenceFactory {
  private readonly openai: OpenAIApi

  constructor(apiKey: string) {
    const configuration = new Configuration({
      apiKey
    })
    this.openai = new OpenAIApi(configuration)
  }

  private async makeOpenAiRequest(): Promise<CreateChatCompletionResponse> {
    try {
      const requestMessage: ChatCompletionRequestMessage = {
        role: 'user',
        content: MESSAGE_PROMPT
      }
      const completion = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [requestMessage]
      })
      return completion.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response) {
        core.error(error.response.status)
        core.error(error.response.data)
      }
      throw error
    }
  }

  async create(): Promise<MessagesResponse> {
    const response = await this.makeOpenAiRequest()
    const responseMessage = response.choices[0].message
    if (!responseMessage || !responseMessage.content) {
      throw new Error('Empty response obtained from OpenAI')
    }
    core.info(responseMessage.content)
    const jsonContent = JSON.parse(responseMessage.content)
    return jsonContent as MessagesResponse
  }
}
