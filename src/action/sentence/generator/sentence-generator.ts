export interface SentenceGenerator {
  next(): Promise<string>
}
