import './GoblinAvatar.css'
import { getGoblinMood } from './goblinMood'
import { goblinSprites } from '../../assets/goblin/registry/goblinSprites'

type GoblinAvatarProps = {
    stamina: number
    chaos: number
    hunger: number
    focus: number
    energy?: number
    currentReaction?: string | null
}

function GoblinAvatar(props: GoblinAvatarProps) {
    const mood = getGoblinMood(props)
    const goblinImage = goblinSprites[mood.mood]
    const displayText = props.currentReaction || mood.text

    return (
        <section className={`goblin-avatar ${mood.themeClass}`}>
            <div className="goblin-avatar__speech-bubble">
                {displayText}
            </div>

            <div className="goblin-avatar__scene">
                <img
                    src={goblinImage}
                    alt="Goblin companion"
                    className="goblin-avatar__image"
                    style={{
                        animationDuration: mood.animationSpeed,
                        filter: `drop-shadow(0 0 22px ${mood.glowColor})`,
                    }}
                />
            </div>
        </section>
    )
}

export default GoblinAvatar