/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-primary': '#3FBBC0',
                'brand-secondary': '#FF7F82',
                'brand-accent': '#FCEDA5',
                'bg-neutral': '#F9F9F6',
                'bg-card': '#FFFFFF',
                'text-dark': '#2D3142',
                'text-light': '#7E859B',
                'success-green': '#7ED321',
            },
            fontFamily: {
                heading: ['Nunito', 'sans-serif'],
                body: ['Open Sans', 'sans-serif'],
            },
            borderRadius: {
                'std': '20px',
                'soft': '50px',
            },
            boxShadow: {
                'soft': '0px 8px 24px rgba(45, 49, 66, 0.08)',
                'hover': '0px 12px 32px rgba(45, 49, 66, 0.12)',
            }
        },
    },
    plugins: [],
}
