import type { QuestType } from '../types/quest'

export const goblinReactions: Record<QuestType, string> = {
    cooking: 'Snack magic detected. The goblin approves.',
    cleaning: 'The chaos piles retreat into the shadows.',
    coding: 'Tiny goblin enters rune-brain mode.',
    crafting: 'A useful trinket has been forged.',
    admin: 'The scrolls have been defeated.',
    selfcare: 'Blanket wisdom has been restored.',
}
