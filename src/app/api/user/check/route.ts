import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/src/lib/prisma'
import { authOptions } from '@/src/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ exists: false }, { status: 200 })
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        return NextResponse.json({ exists: !!user })
    } catch (error) {
        console.error('Error checking user:', error)
        return NextResponse.json({ exists: false }, { status: 200 })
    }
}