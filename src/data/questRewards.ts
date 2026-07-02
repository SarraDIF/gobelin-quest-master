import type { QuestType } from '../types/quest'
import type { Stats } from '../types/stats'

export type StatReward = Partial<Stats>

export const questRewards: Record<QuestType, StatReward> = {
    cooking: {
        hunger: -8,
        energy: 5,
    },
    crafting: {
        focus: 6,
        energy: 4,
    },
    cleaning: {
        chaos: -10,
        stamina: 3,
    },
    admin: {
        focus: 4,
        chaos: -2,
    },
    selfcare: {
        stamina: 8,
        energy: 6,
    },
    coding: {
        focus: 7,
        energy: 5,
    },
}
