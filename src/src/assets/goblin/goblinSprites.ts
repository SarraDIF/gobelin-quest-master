import cozyIdle from '../../../assets/goblin/base/female/goblin-female-cozy-idle.png'
import hungry from '../../../assets/goblin/base/female/goblin-female-hungry.png'
import sleepy from '../../../assets/goblin/base/female/goblin-female-sleepy.png'
import chaos1 from '../../../assets/goblin/base/female/goblin-female-chaos-1.png'
import hyperfocus from '../../../assets/goblin/base/female/goblin-female-hyperfocus.png'

import type { GoblinMood } from '../../../types/goblinMood'

export const goblinSprites: Record<GoblinMood, string> = {
    cozy: cozyIdle,
    hungry: hungry,
    sleepy: sleepy,
    chaos: chaos1,
    hyperfocus: hyperfocus,
    proud: cozyIdle,
}