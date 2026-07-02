import { questRewards } from '../data/questRewards'
import type { QuestType } from '../types/quest'
import type { Stats } from '../types/stats'

const clampStat = (value: number) => {
    return Math.max(0, Math.min(100, value))
}

export const applyQuestReward = (
    currentStats: Stats,
    questType: QuestType
): Stats => {
    const reward = questRewards[questType]

    return {
        ...currentStats,
        stamina:
            reward.stamina !== undefined
                ? clampStat(currentStats.stamina + reward.stamina)
                : currentStats.stamina,
        focus:
            reward.focus !== undefined
                ? clampStat(currentStats.focus + reward.focus)
                : currentStats.focus,
        chaos:
            reward.chaos !== undefined
                ? clampStat(currentStats.chaos + reward.chaos)
                : currentStats.chaos,
        hunger:
            reward.hunger !== undefined
                ? clampStat(currentStats.hunger + reward.hunger)
                : currentStats.hunger,
        energy:
            reward.energy !== undefined
                ? currentStats.energy + reward.energy
                : currentStats.energy,
    }
}