import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    nickname?: string | null
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      nickname?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
