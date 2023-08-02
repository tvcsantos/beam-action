import * as core from '@actions/core'
import {isOfTypeReaction, Reaction} from '../types/types'

export interface Inputs {
  botName: string
  botReaction: Reaction
  token: string
  openAIApiKey: string
  aiEnabled: boolean
  stateBranch: string
}

export enum Input {
  BOT_NAME = 'bot-name',
  BOT_REACTION = 'bot-reaction',
  GITHUB_TOKEN = 'token',
  OPEN_AI_API_KEY = 'openai-api-key',
  AI_ENABLED = 'ai-enabled',
  STATE_BRANCH = 'state-branch'
}

export function gatherInputs(): Inputs {
  const botName = getInputBotName()
  const botReaction = getInputBotReaction()
  const token = getInputToken()
  const openAIApiKey = getInputOpenAIApiKey()
  const aiEnabled = getInputAIEnabled()
  const stateBranch = getInputStateBranch()

  if (aiEnabled && !openAIApiKey) {
    throw Error('AI enabled but OpenAI API key is missing!')
  }

  return {botName, botReaction, token, openAIApiKey, aiEnabled, stateBranch}
}

function getInputBotName(): string {
  return core.getInput(Input.BOT_NAME, {required: true})
}

function getInputBotReaction(): Reaction {
  const reaction = core.getInput(Input.BOT_REACTION, {required: true})
  if (isOfTypeReaction(reaction)) return reaction
  throw new Error(`Invalid ${Input.BOT_REACTION} input '${reaction}'`)
}

function getInputToken(): string {
  return core.getInput(Input.GITHUB_TOKEN, {required: true})
}

function getInputAIEnabled(): boolean {
  return core.getBooleanInput(Input.AI_ENABLED)
}

function getInputOpenAIApiKey(): string {
  return core.getInput(Input.OPEN_AI_API_KEY)
}

function getInputStateBranch(): string {
  return core.getInput(Input.STATE_BRANCH)
}
