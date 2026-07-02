import './GoblinAvatar.css'
import goblinImage from '../../assets/goblin/base/goblin-cozy.png'
import { getGoblinMood } from './goblinMood'

type GoblinAvatarProps = {
    stamina: number
    chaos: number
    hunger: number
    focus: number
}

function GoblinAvatar(props: GoblinAvatarProps) {
    const mood = getGoblinMood(props)

    return (
        <section className={`goblin-avatar ${mood.themeClass}`}>
            <div className="goblin-avatar__speech-bubble">
                {mood.text}
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