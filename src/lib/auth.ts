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
                        role: 'user', // Add default role
                    },
                })

                return true
            } catch (error) {
                console.error('SignIn error:', error)
                return false
            }
        },
        
        async jwt({ token, user }: any) {
            // Always fetch the latest user data from database to get current role
            if (token?.email) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email },
                        select: { 
                            id: true, 
                            role: true,
                            name: true 
                        }
                    })
                    
                    if (dbUser) {
                        token.role = dbUser.role
                        token.dbId = dbUser.id
                        token.name = dbUser.name
                    } else {
                        console.log('No database user found for:', token.email);
                    }
                } catch (error) {
                    console.error('JWT callback database error:', error)
                }
            }
            
            return token
        },
        
        async session({ session, token }: any) {
            if (session?.user && token?.sub) {
                session.user.id = token.sub
                session.user.role = token.role // Get role from token
                session.user.dbId = token.dbId
                
                // Fetch complete user data from database
                const dbUser = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: {
                    id: true,
                    studentNumber: true,
                    section: true,
                    name: true,
                    role: true,
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
                    },
                    ebProfile: {
                        select: {
                            position: true,
                            committees: true,
                            isActive: true
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
                    session.user.role = dbUser.role
                    session.user.createdAt = dbUser.createdAt
                    session.user.updatedAt = dbUser.updatedAt
                    session.user.ebProfile = dbUser.ebProfile
                    
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
        
        async redirect({ url, baseUrl }: any) {
            if (url.startsWith('/user')) {
                return url;
            }
            
            if (url.startsWith('/admin')) {
                return url;
            }
            return baseUrl;
        }
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
}

export default NextAuth(authOptions)