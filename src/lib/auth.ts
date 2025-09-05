// src/lib/auth.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

export const authOptions = {
    providers: [
        GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }: any) {
            try {
                // Check if user exists in database
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email },
                })

                if (existingUser) {
                return true
                }

                // If new user, create a basic user record
                await prisma.user.create({
                    data: {
                        email: user.email,
                        name: user.name || '',
                        // studentNumber and section will be null initially
                        // and filled during member application
                    },
                })

                return true
            } catch (error) {
                console.error('SignIn error:', error)
                return false
            }
        },
        
        async session({ session, token }: any) {
            if (session?.user && token?.sub) {
                session.user.id = token.sub
                
                // Fetch complete user data from database
                const dbUser = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: {
                    id: true,
                    studentNumber: true,
                    section: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                    memberApplication: { 
                        select: { 
                            id: true, 
                            hasAccepted: true, 
                            paymentProof: true,
                            createdAt: true
                        } 
                    },
                    eaApplication: { 
                        select: { 
                            id: true, 
                            hasAccepted: true, 
                            status: true 
                        } 
                    },
                    committeeApplication: { 
                        select: { 
                            id: true, 
                            hasAccepted: true, 
                            status: true 
                        } 
                    }
                }
                })

                if (dbUser) {
                    // Add database ID and user details to session
                    session.user.dbId = dbUser.id
                    session.user.studentNumber = dbUser.studentNumber
                    session.user.section = dbUser.section
                    session.user.name = dbUser.name
                    session.user.createdAt = dbUser.createdAt
                    session.user.updatedAt = dbUser.updatedAt
                    
                    // Add application status information
                    session.user.hasMemberApplication = !!dbUser.memberApplication
                    session.user.memberApplication = dbUser.memberApplication
                    session.user.hasEAApplication = !!dbUser.eaApplication
                    session.user.eaApplication = dbUser.eaApplication
                    session.user.hasCommitteeApplication = !!dbUser.committeeApplication
                    session.user.committeeApplication = dbUser.committeeApplication
                    
                    // Check if user has completed their profile
                    session.user.hasCompletedProfile = !!dbUser.studentNumber && !!dbUser.section
                    
                    // Check application status for routing
                    session.user.applicationStatus = {
                        member: dbUser.memberApplication ? {
                        hasApplication: true,
                        hasPayment: !!dbUser.memberApplication.paymentProof,
                        isAccepted: dbUser.memberApplication.hasAccepted,
                        appliedAt: dbUser.memberApplication.createdAt
                        } : { hasApplication: false },
                        
                        ea: dbUser.eaApplication ? {
                        hasApplication: true,
                        status: dbUser.eaApplication.status,
                        isAccepted: dbUser.eaApplication.hasAccepted,
                        } : { hasApplication: false },
                        
                        committee: dbUser.committeeApplication ? {
                        hasApplication: true,
                        status: dbUser.committeeApplication.status,
                        isAccepted: dbUser.committeeApplication.hasAccepted,
                        } : { hasApplication: false }
                    }
                }
            }
        
            return session
        },
        
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        
        async redirect({ url, baseUrl }: any) {
            // Handle custom redirects based on application status
            if (url.startsWith('/user')) {
                return url
            }
            return baseUrl
        }
    },
    pages: {
        signIn: '/auth/signin',
        // To-do: add error page redirection
        error: '/auth/error',
    },
}

export default NextAuth(authOptions)