import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// @ts-expect-error NextAuth v4 compatibility
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }