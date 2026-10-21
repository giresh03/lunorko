import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				glow: 'hsl(var(--primary-glow))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'fade-in': {
  				'0%': { opacity: '0', transform: 'translateY(12px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			'scale-in': {
  				'0%': { opacity: '0', transform: 'scale(0.96)' },
  				'100%': { opacity: '1', transform: 'scale(1)' }
  			},
  			'glow-pulse': {
  				'0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0.45)' },
  				'50%': { boxShadow: '0 0 28px 4px hsl(var(--primary) / 0.35)' }
  			},
  			shimmer: {
  				'0%': { backgroundPosition: '200% 0' },
  				'100%': { backgroundPosition: '-200% 0' }
  			},
  			'border-flow': {
  				'0%, 100%': { backgroundPosition: '0% 50%' },
  				'50%': { backgroundPosition: '100% 50%' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
  			'scale-in': 'scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
  			'glow-pulse': 'glow-pulse 2.6s ease-in-out infinite',
  			shimmer: 'shimmer 2.5s linear infinite',
  			'border-flow': 'border-flow 4s ease infinite'
  		},
  		boxShadow: {
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)',
  			glow: '0 0 40px -8px hsl(var(--primary) / 0.5)'
  		},
		fontFamily: {
			sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			display: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			serif: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
		}
  	}
  },

  plugins: [require("tailwindcss-animate")],
} satisfies Config;
