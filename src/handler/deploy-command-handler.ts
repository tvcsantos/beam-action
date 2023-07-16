import {CommandHandler} from './command-handler'

export class DeployCommandHandler implements CommandHandler {
  readonly id = 'deploy'

  async handle(): Promise<void> {
    return Promise.resolve(undefined)
  }
}
