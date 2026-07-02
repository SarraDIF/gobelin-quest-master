export type QuestType =
    | 'cleaning'
    | 'cooking'
    | 'coding'
    | 'admin'
    | 'selfcare'
    | 'crafting'

export type Quest = {
    id: number
    title: string
    done: boolean
    type: QuestType
}