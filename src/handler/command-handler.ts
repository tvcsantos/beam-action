export interface CommandHandler {
  handle(args: string[]): Promise<void>
}
