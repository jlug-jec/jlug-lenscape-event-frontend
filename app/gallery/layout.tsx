import { Footer } from '@/components/footer';
import "../../app/globals.css"
import { Header } from '@/components/homePageHeader';

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
        <Header/>
        {children}
        <Footer/>
        </body>
    
    </html>
  )
}
