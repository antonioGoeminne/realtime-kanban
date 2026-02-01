import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { prisma } from "@/lib/prisma/prisma"


export const metadata: Metadata = {
  title: 'Kanban Board - Real-Time Collaboration',
  description: 'A collaborative Kanban board with drag-and-drop, real-time updates, and presence indicators',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}



async function Test() {
  // const boards = await prisma.board.findMany({
  //   select: {
  //     id: true,
  //     name: true,
  //     columns: {
  //       select: {
  //         id: true,
  //         name: true,
  //         cards: {
  //           select: {
  //             id: true,
  //             title: true,
  //             position: true
  //           },
  //           orderBy: {
  //             position: 'asc'
  //           }
  //         }
  //       },
  //       orderBy: {
  //         position: 'asc'
  //       }
  //     }
  //   }
  // });
  // console.log('boards', JSON.stringify(boards))
  return (
    <></>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Test />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
