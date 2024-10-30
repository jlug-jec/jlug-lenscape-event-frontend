import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Leaderboard page',
  description: 'Leaderboard page for Lenscape 2024',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
      
        {children}
        <Footer/>
        </body>
    
    </html>
  )
}
