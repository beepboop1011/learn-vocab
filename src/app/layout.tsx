import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Vocab Learning',
    description: 'Learn 2 new words every day',
}

const RootLayout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-100">{children}</body>
        </html>
    )
}

export default RootLayout
