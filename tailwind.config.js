tailwind.config = {
    theme: {
        extend: {
            colors: {
                'brand-dark': '#020617',
                'brand-accent': '#06b6d4',
                'brand-purple': '#8b5cf6',
            },
            fontFamily: {
                tech: ['Orbitron', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        }
    }
}
