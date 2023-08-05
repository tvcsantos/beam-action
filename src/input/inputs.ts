import * as core from '@actions/core'
import {isOfTypeReaction, Reaction} from '../types/types'

export interface Inputs {
  botName: string
  botReaction: Reaction
  openAIApiKey: string
  aiEnabled: boolean
  stateBranch: string
  appId: string
  appPrivateKey: string
  appInstallationId: number
}

export enum Input {
  BOT_NAME = 'bot-name',
  BOT_REACTION = 'bot-reaction',
  GITHUB_TOKEN = 'token',
  OPEN_AI_API_KEY = 'openai-api-key',
  AI_ENABLED = 'ai-enabled',
  STATE_BRANCH = 'state-branch',
  APP_ID = 'app-id',
  APP_PRIVATE_KEY = 'app-private-key',
  APP_INSTALLATION_ID = 'app-installation-id'
}

export function gatherInputs(): Inputs {
  const botName = getInputBotName()
  const botReaction = getInputBotReaction()
  const openAIApiKey = getInputOpenAIApiKey()
  const aiEnabled = getInputAIEnabled()
  const stateBranch = getInputStateBranch()
  const appId = getInputAppId()
  const appPrivateKey = getInputAppPrivateKey()
  const appInstallationId = getInputAppInstallationId()

  if (aiEnabled && !openAIApiKey) {
    throw Error('AI enabled but OpenAI API key is missing!')
  }

  return {
    botName,
    botReaction,
    openAIApiKey,
    aiEnabled,
    stateBranch,
    appId,
    appPrivateKey,
    appInstallationId
  }
}

function getInputBotName(): string {
  return core.getInput(Input.BOT_NAME, {required: true})
}

function getInputBotReaction(): Reaction {
  const reaction = core.getInput(Input.BOT_REACTION, {required: true})
  if (isOfTypeReaction(reaction)) return reaction
  throw new Error(`Invalid ${Input.BOT_REACTION} input '${reaction}'`)
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

function getInputAppId(): string {
  return core.getInput(Input.APP_ID, {required: true})
}

function getInputAppPrivateKey(): string {
  return core.getInput(Input.APP_PRIVATE_KEY, {required: true})
}

function getInputAppInstallationId(): number {
  return parseInt(core.getInput(Input.APP_INSTALLATION_ID, {required: true}))
}
