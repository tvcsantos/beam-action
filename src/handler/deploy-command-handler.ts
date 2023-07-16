import {CommandHandler} from './command-handler'

export class DeployCommandHandler implements CommandHandler {
  async handle(): Promise<void> {
    return Promise.resolve(undefined)
  }
}
