import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		fontFamily: {
  			josefin: ['var(--font-josefin)'], // 👈 ADD THIS
		},

  		colors: {
  			//background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				'50': '#fcfcfc',
  				'100': '#f1f1f2',
  				'200': '#e0e0e2',
  				'300': '#c7c7cc',
  				'400': '#a8a8af',
  				'500': '#82828b',
  				'600': '#57575f',
  				'700': '#27272a',
  				'800': '#111113',
  				'900': '#040405',
  				'950': '#000000',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
				'50':  '#f2f8ff',  // very pale ice blue
				'100': '#dbeaff',  // faint sky
				'200': '#b7d4ff',  // soft sky
				'300': '#8bbaff',  // light Sonic blue
				'400': '#5599ff',  // bright electric blue
				'500': '#1f77ff',  // strong saturated blue (pre-Sonic)
				'600': '#0f6ad8',  // Sonic’s main body blue
				'700': '#0c4fab',  // darker accents
				'800': '#093b7d',  // deep blue shadow
				'900': '#06264e',  // very dark navy
				'950': '#04162c',  // almost black with blue tint
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
			tertiary: {
				'50':  '#fffbec',   // soft pale yellow
				'100': '#fff6cc',   // gentle lemon tint
				'200': '#ffeb99',   // light sunshine
				'300': '#ffdd55',   // bright cartoon yellow
				'400': '#ffcc22',   // classic ring gold
				'500': '#ffbb00',   // bright, saturated yellow-gold
				'600': '#f2a600',   // deeper gold
				'700': '#cc8500',   // golden amber
				'800': '#995f00',   // rich brown-gold shadow
				'900': '#663d00',   // dark golden brown
				'950': '#331e00',   // near-black gold shadow

				DEFAULT: 'hsl(var(--tertiary))',
				foreground: 'hsl(var(--tertiary-foreground))',
			},
			background: {
				'50':  '#f4f5fa',   // very light indigo-grey
				'100': '#e6e8f2',   // soft foggy indigo
				'200': '#c8cce2',   // muted light indigo
				'300': '#a3a7c9',   // dusty lilac-indigo
				'400': '#7175a0',   // greyed violet-indigo
				'500': '#4a4d73',   // soft indigo charcoal
				'600': '#2f3250',   // dark indigo steel
				'700': '#1f2039',   // deep indigo shadow
				'800': '#14162d',   // indigo-black (main background)
				'900': '#0f1025',   // deeper indigo-black
				'950': '#0a0b1a',   // almost black with blue-violet tint

			DEFAULT: '#14162d',
			foreground: '#ffffff',
			},


  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
