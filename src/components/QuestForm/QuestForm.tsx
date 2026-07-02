import type { QuestType } from '../../types/quest'
import { questTypes } from '../../data/questTypes'

interface QuestFormProps {
    questTitle: string
    questType: QuestType
    setQuestTitle: (title: string) => void
    setQuestType: (type: QuestType) => void
    onAddQuest: () => void
}

export default function QuestForm({
    questTitle,
    questType,
    setQuestTitle,
    setQuestType,
    onAddQuest,
}: QuestFormProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onAddQuest()
        }
    }

    return (
        <div className="quest-form">
            <input
                type="text"
                placeholder="Quest title..."
                value={questTitle}
                onChange={(e) => setQuestTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="quest-input"
            />
            <select
                value={questType}
                onChange={(e) => setQuestType(e.target.value as QuestType)}
                className="quest-select"
            >
                {Object.entries(questTypes).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>
            <button onClick={onAddQuest} className="btn btn-primary">
                ➕ Add Quest
            </button>
        </div>
    )
}
