import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
    maxAge: 10 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.nickname = user.nickname ?? null
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return url
      if (url.startsWith(baseUrl)) return url
      return baseUrl + '/app'
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
}
