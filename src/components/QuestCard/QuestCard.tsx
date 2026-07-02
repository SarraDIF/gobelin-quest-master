import type { Quest, QuestType } from '../../types/quest'
import { questTypes } from '../../data/questTypes'

interface QuestCardProps {
    quest: Quest
    onToggle: (id: number) => void
    onDelete: (id: number) => void
}

export default function QuestCard({ quest, onToggle, onDelete }: QuestCardProps) {
    return (
        <div
            onClick={() => onToggle(quest.id)}
            className={`parchment-card animate-quest-item ${quest.done ? 'quest-done' : ''}`}
        >
            <div className="quest-title">
                <span className="quest-icon">{quest.done ? '✅' : '⚔️'}</span>
                {quest.title}
            </div>
            <div className="quest-type">
                {questTypes[quest.type as QuestType]}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(quest.id)
                }}
                className="quest-delete"
                aria-label="Delete quest"
            >
                ✕
            </button>
        </div>
    )
}
