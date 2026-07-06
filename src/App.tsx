import { useState, useEffect } from 'react'
import GoblinAvatar from './components/GoblinAvatar/GoblinAvatar'
import StatsPanel from './components/StatsPanel/StatsPanel'
import QuestForm from './components/QuestForm/QuestForm'
import QuestCard from './components/QuestCard/QuestCard'
import type { Quest, QuestType } from './types/quest'
import type { Stats } from './types/stats'
import { useLocalStorage } from './hooks/useLocalStorage'
import { applyQuestReward } from './utils/applyQuestRewards'
import { goblinReactions } from './data/goblinReactions'
import './styles/layout.css'
import './styles/panels.css'
import './styles/animations.css'

const defaultQuests: Quest[] = [
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
]

const defaultStats: Stats = {
    stamina: 72,
    chaos: 38,
    hunger: 84,
    focus: 51,
    energy: 0,
}

function App() {
    const [quests, setQuests] = useLocalStorage<Quest[]>('goblin-quests', defaultQuests)
    const [stats, setStats] = useLocalStorage<Stats>('goblin-stats', defaultStats)

    const [questTitle, setQuestTitle] = useState('')
    const [questType, setQuestType] = useState<QuestType>('admin')
    const [currentReaction, setCurrentReaction] = useState<string | null>(null)

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

    const toggleQuest = (id: number) => {
        const clickedQuest = quests.find((quest) => quest.id === id)

        if (!clickedQuest) return

        const becomingDone = !clickedQuest.done

        setQuests(
            quests.map((quest) =>
                quest.id === id ? { ...quest, done: becomingDone } : quest
            )
        )

        if (becomingDone) {
            setStats((prev: Stats) => applyQuestReward(prev, clickedQuest.type))
            setCurrentReaction(goblinReactions[clickedQuest.type as QuestType])
        }
    }

    const deleteQuest = (id: number) => {
        setQuests(quests.filter((quest) => quest.id !== id))
    }

    useEffect(() => {
        if (currentReaction) {
            const timer = setTimeout(() => {
                setCurrentReaction(null)
            }, 4000)
            return () => clearTimeout(timer)
        }
    }, [currentReaction])

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
                        <GoblinAvatar {...stats} currentReaction={currentReaction} />
                        <StatsPanel stats={stats} />
                    </div>

                    <section className="quests-section">
                        <div className="quests-header">
                            <h2>📜 Quests</h2>
                        </div>

                        <QuestForm
                            questTitle={questTitle}
                            questType={questType}
                            setQuestTitle={setQuestTitle}
                            setQuestType={setQuestType}
                            onAddQuest={addQuest}
                        />

                        <div className="quests-list">
                            {quests.length === 0 ? (
                                <div className="empty-state">
                                    No quests yet. Add one to begin!
                                </div>
                            ) : (
                                quests.map((quest) => (
                                    <QuestCard
                                        key={quest.id}
                                        quest={quest}
                                        onToggle={toggleQuest}
                                        onDelete={deleteQuest}
                                    />
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