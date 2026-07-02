import type { Stats } from '../../types/stats'

interface StatsPanelProps {
    stats: Stats
}

export default function StatsPanel({ stats }: StatsPanelProps) {
    return (
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
    )
}
