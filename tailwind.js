tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#020617',
                    card: '#0f172a',
                    accent: '#06b6d4',
                    blue: '#3b82f6',
                }
            },
            fontFamily: {
                orbitron: ['Orbitron', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        }
    }
}