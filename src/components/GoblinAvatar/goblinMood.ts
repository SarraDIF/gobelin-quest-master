import type { GoblinMoodConfig } from '../../types/goblinMood'

type GoblinStats = {
    stamina: number
    chaos: number
    hunger: number
    focus: number
}

export function getGoblinMood(stats: GoblinStats): GoblinMoodConfig {
    if (stats.chaos > 70) {
        return {
            mood: 'chaos',
            text: 'The goblin is overwhelmed by mysterious piles.',
            glowColor: 'rgba(255, 80, 120, 0.38)',
            animationSpeed: '0.9s',
            themeClass: 'goblin-avatar--chaos',
        }
    }

    if (stats.hunger > 70) {
        return {
            mood: 'hungry',
            text: 'The goblin dreams of sandwiches.',
            glowColor: 'rgba(255, 180, 80, 0.42)',
            animationSpeed: '2.2s',
            themeClass: 'goblin-avatar--hungry',
        }
    }

    if (stats.stamina < 30) {
        return {
            mood: 'sleepy',
            text: 'Blanket burrito mode required.',
            glowColor: 'rgba(180, 180, 180, 0.25)',
            animationSpeed: '4s',
            themeClass: 'goblin-avatar--sleepy',
        }
    }

    if (stats.focus > 70) {
        return {
            mood: 'hyperfocus',
            text: 'The goblin is entering hyperfocus.',
            glowColor: 'rgba(120, 180, 255, 0.4)',
            animationSpeed: '1.8s',
            themeClass: 'goblin-avatar--hyperfocus',
        }
    }

    return {
        mood: 'cozy',
        text: 'The goblin is alive and mildly productive.',
        glowColor: 'rgba(120, 255, 160, 0.3)',
        animationSpeed: '2.6s',
        themeClass: 'goblin-avatar--cozy',
    }
}