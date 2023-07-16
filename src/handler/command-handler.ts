export interface CommandHandler {
  readonly id: string

  handle(args: string[]): Promise<void>
}
