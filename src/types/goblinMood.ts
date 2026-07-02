export type GoblinMood =
    | 'cozy'
    | 'hungry'
    | 'sleepy'
    | 'chaos'
    | 'hyperfocus'
    | 'proud'

export type GoblinMoodConfig = {
    mood: GoblinMood
    text: string
    glowColor: string
    animationSpeed: string
    themeClass: string
}