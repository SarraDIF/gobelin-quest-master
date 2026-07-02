type GoblinAvatarProps = {
    stamina: number
    chaos: number
    hunger: number
    focus: number
}

function GoblinAvatar({
                          stamina,
                          chaos,
                          hunger,
                          focus,
                      }: GoblinAvatarProps) {
    let moodText =
        'The goblin is alive and mildly productive.'

    if (chaos > 70) {
        moodText =
            'The goblin is surrounded by mysterious piles.'
    } else if (hunger > 70) {
        moodText =
            'The goblin dreams of sandwiches.'
    } else if (stamina < 30) {
        moodText =
            'The goblin requires blanket burrito mode.'
    } else if (focus > 70) {
        moodText =
            'The goblin is entering hyperfocus.'
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '2rem',
                marginBottom: '2rem',
            }}
        >
            <div
                style={{
                    width: '220px',
                    height: '220px',
                    borderRadius: '999px',
                    background:
                        'radial-gradient(circle, #6dbf73 0%, #2e5c3a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    animation: 'float 3s ease-in-out infinite',
                    boxShadow:
                        '0 0 40px rgba(80, 200, 120, 0.3)',
                }}
            >
                <div
                    style={{
                        fontSize: '5rem',
                    }}
                >
                    👹
                </div>

                <div
                    style={{
                        position: 'absolute',
                        top: '-70px',
                        background: '#f3e9dc',
                        color: '#1a1a1a',
                        padding: '1rem',
                        borderRadius: '16px',
                        maxWidth: '240px',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                    }}
                >
                    {moodText}
                </div>
            </div>

            <style>
                {`
          @keyframes float {
            0% {
              transform: translateY(0px);
            }

            50% {
              transform: translateY(-8px);
            }

            100% {
              transform: translateY(0px);
            }
          }
        `}
            </style>
        </div>
    )
}

export default GoblinAvatar