import { Suspense } from 'react';

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
        </Suspense>
        </body>
    
    </html>
  )
}
