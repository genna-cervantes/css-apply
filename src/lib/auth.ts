import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ session, token }: any) {
        if (session?.user && token?.sub) {
            session.user.id = token.sub
        }
            return session
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id
            }
            return token
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
}

export default NextAuth(authOptions)