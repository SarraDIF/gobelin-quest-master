import {useState} from 'react'
import GoblinAvatar from './components/GoblinAvatar/GoblinAvatar'
import type {Quest, QuestType} from './types/quest'
import {questTypes} from './data/questTypes'
import './styles/layout.css'
import './styles/panels.css'
import './styles/animations.css'

function App() {
    const [quests, setQuests] = useState<Quest[]>([
        {
            id: 1,
            title: 'Feed Bernie',
            done: true,
            type: 'cooking',
        },
        {
            id: 2,
            title: 'Bake goblin bread',
            done: false,
            type: 'crafting',
        },
    ])

    const [stats, setStats] = useState({
        stamina: 72,
        chaos: 38,
        hunger: 84,
        focus: 51,
        energy: 0,
    })

    const [questTitle, setQuestTitle] = useState('')
    const [questType, setQuestType] = useState<QuestType>('admin')

    const addQuest = () => {
        if (!questTitle.trim()) return

        const newQuest = {
            id: Date.now(),
            title: questTitle.trim(),
            done: false,
            type: questType,
        }

        setQuests([...quests, newQuest])
        setQuestTitle('')
        setQuestType('admin')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addQuest()
        }
    }

    const toggleQuest = (id: number) => {
        const clickedQuest = quests.find(
            (quest) => quest.id === id
        )

        if (!clickedQuest) return

        const becomingDone = !clickedQuest.done

        setQuests(
            quests.map((quest) =>
                quest.id === id ? {...quest, done: becomingDone} : quest
            )
        )

        if (becomingDone) {
            setStats((prev) => ({
                ...prev,
                stamina: Math.min(prev.stamina + 5, 100),
                focus: Math.min(prev.focus + 3, 100),
                chaos: Math.max(prev.chaos - 4, 0),
                energy: prev.energy + 10,
            }))
        }
    }

    return (
        <>
            <div className="app-container">
                <div className="fireflies-overlay"></div>
            </div>

            <div className="app-content">
                <header className="app-header">
                    <h1 className="app-title">⚔️ Goblin Quest Manager</h1>
                </header>

                <div className="app-main">
                    <div className="avatar-and-stats">
                        <GoblinAvatar {...stats} />

                        <div className="stats-grid">
                            <div className="stat-card animate-stat-card">
                                <span className="stat-card__label">⚡ Stamina</span>
                                <span className="stat-card__value">{stats.stamina}</span>
                            </div>

                            <div className="stat-card animate-stat-card">
                                <span className="stat-card__label">🧠 Focus</span>
                                <span className="stat-card__value">{stats.focus}</span>
                            </div>

                            <div className="stat-card animate-stat-card">
                                <span className="stat-card__label">🍖 Hunger</span>
                                <span className="stat-card__value">{stats.hunger}</span>
                            </div>

                            <div className="stat-card animate-stat-card">
                                <span className="stat-card__label">👹 Chaos</span>
                                <span className="stat-card__value">{stats.chaos}</span>
                            </div>

                            <div className="stat-card animate-stat-card">
                                <span className="stat-card__label">✨ Energy</span>
                                <span className="stat-card__value">{stats.energy}</span>
                            </div>
                        </div>
                    </div>

                    <section className="quests-section">
                        <div className="quests-header">
                            <h2>📜 Quests</h2>
                        </div>

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
                        <button onClick={addQuest} className="btn btn-primary">
                            ➕ Add Quest
                        </button>
                        </div>

                        <div className="quests-list">
                        {quests.length === 0 ? (
                            <div className="empty-state">
                                No quests yet. Add one to begin!
                            </div>
                        ) : (
                            quests.map((quest) => (
                                <div
                                    key={quest.id}
                                    onClick={() => toggleQuest(quest.id)}
                                    className={`parchment-card animate-quest-item ${
                                        quest.done ? 'quest-done' : ''
                                    }`}
                                >
                                    <div className="quest-title">
                      <span className="quest-icon">
                        {quest.done ? '✅' : '⚔️'}
                      </span>
                                        {quest.title}
                                    </div>
                                    <div className="quest-type">
                                        {questTypes[quest.type as QuestType]}
                                    </div>
                                </div>
                            ))
                        )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}

export default App