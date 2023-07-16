import * as core from '@actions/core'
import {isOfTypeReaction, Reaction} from '../types/types'

export interface Inputs {
  botName: string
  botReaction: Reaction
  token: string
}

export enum Input {
  BOT_NAME = 'bot-name',
  BOT_REACTION = 'bot-reaction',
  GITHUB_TOKEN = 'token'
}

export function gatherInputs(): Inputs {
  const botName = getInputBotName()
  const botReaction = getInputBotReaction()
  const token = getInputToken()
  return {botName, botReaction, token}
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
