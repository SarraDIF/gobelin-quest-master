import cozyIdle from '../characters/female/goblin-female-cozy-idle.png'
import hungry from '../characters/female/goblin-female-hungry.png'
import sleepy from '../characters/female/goblin-female-sleepy.png'
import chaos1 from '../characters/female/goblin-female-chaos-1.png'
import hyperfocus from '../characters/female/goblin-female-hyperfocus.png'

import type { GoblinMood } from '../../../types/goblinMood'

export const goblinSprites: Record<GoblinMood, string> = {
    cozy: cozyIdle,
    hungry: hungry,
    sleepy: sleepy,
    chaos: chaos1,
    hyperfocus: hyperfocus,
    proud: cozyIdle,
}