import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: 'M9Vends Kiosk',
  description: 'M9Vends customer-facing vending kiosk',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#0d1a2e',
              color: '#ffffff',
              border: '1px solid #1e3a5f',
              fontSize: '16px',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
