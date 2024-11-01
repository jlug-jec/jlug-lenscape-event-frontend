import { Footer } from '@/components/footer';
import { Suspense } from 'react';
import "../../app/globals.css";
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'Onboarding page',
  description: 'Onboarding page for Lenscape 2024',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
      <Suspense fallback={<div>Loading...</div>}>
        {children}
        <Footer/>
        </Suspense>
        </body>
    
    </html>
  )
}
