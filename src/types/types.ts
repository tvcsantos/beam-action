const reactions: readonly string[] = [
  '+1',
  '-1',
  'laugh',
  'confused',
  'heart',
  'hooray',
  'rocket',
  'eyes'
] as const

export type Reaction = (typeof reactions)[number]

export function isOfTypeReaction(value: string): value is Reaction {
  return reactions.includes(value)
}
