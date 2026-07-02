import { useState } from 'react'
import GoblinAvatar from './GoblinAvatar'

function App() {
    const [quests, setQuests] = useState([
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
  })

    type QuestType = 'cleaning' | 'cooking' | 'coding' | 'admin' | 'selfcare' | 'crafting'

    const questTypes: Record<QuestType, string> = {
        cleaning: '🧺 Cleaning',
        cooking: '🍳 Cooking',
        coding: '💻 Coding',
        admin: '📜 Admin',
        selfcare: '🌿 Self-care',
        crafting: '🛠️ Crafting',
    }

    const addQuest = () => {
        const title = prompt('New goblin quest:')
        if (!title) return

        const type = prompt(
            'Quest type: cleaning, cooking, coding, admin, selfcare, crafting'
        ) as QuestType

        const newQuest = {
            id: Date.now(),
            title,
            done: false,
            type: questTypes[type] ? type : 'admin',
        }

        setQuests([...quests, newQuest])
    }

  const toggleQuest = (id: number) => {
    const clickedQuest = quests.find(
        (quest) => quest.id === id
    )

    if (!clickedQuest) return

    const becomingDone = !clickedQuest.done

    setQuests(
        quests.map((quest) =>
            quest.id === id ? { ...quest, done: becomingDone } : quest
        )
    )

    if (becomingDone) {
      setStats((prev) => ({
        ...prev,
        stamina: Math.min(prev.stamina + 5, 100),
        focus: Math.min(prev.focus + 3, 100),
        chaos: Math.max(prev.chaos - 4, 0),
      }))
    }
  }

  const statCardStyle = {
    background: '#2a2a2a',
    padding: '1rem',
    borderRadius: '12px',
    textAlign: 'center' as const,
  }

  return (
      <div
          style={{
            minHeight: '100vh',
            background: '#1a1a1a',
            color: '#f3e9dc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '5rem',
            fontFamily: 'system-ui',
          }}
      >
        <h1 style={{ fontSize: '3rem' }}>
          ⚔️ Goblin Quest Manager
        </h1>

        <p>
            <GoblinAvatar {...stats} />
        </p>

        <div
            style={{
              marginTop: '2rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              width: '400px',
            }}
        >
          <div style={statCardStyle}>
            ⚡ Stamina: {stats.stamina}
          </div>

          <div style={statCardStyle}>
            🧠 Focus: {stats.focus}
          </div>

          <div style={statCardStyle}>
            🍖 Hunger: {stats.hunger}
          </div>

          <div style={statCardStyle}>
            👹 Chaos: {stats.chaos}
          </div>
        </div>
        <button
            onClick={addQuest}
            style={{
              marginTop: '1rem',
              padding: '1rem 2rem',
              borderRadius: '12px',
              border: 'none',
              background: '#7c5c36',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
        >
          ➕ Add Quest
        </button>

        <div
            style={{
              marginTop: '3rem',
              width: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
        >
          {quests.map((quest) => (
              <div
                  key={quest.id}
                  onClick={() => toggleQuest(quest.id)}
                  style={{
                    background: '#2a2a2a',
                    padding: '1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: quest.done
                        ? '2px solid #4ade80'
                        : '2px solid transparent',
                    opacity: quest.done ? 0.6 : 1,
                  }}
              >
                  {quest.done ? '✅' : '⚔️'} {quest.title}
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem' }}>
                      {questTypes[quest.type as QuestType]}
                  </div>
              </div>
          ))}
        </div>
      </div>
  )
}

export default App