import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        // Add admin validation here - you'll need to implement your own admin check logic
        // REF: add session validation
        
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        
        let applications
        if (type === 'ea') {
            applications = await prisma.eAApplication.findMany({
                include: { user: true }
        })
        } else if (type === 'committee') {
            applications = await prisma.committeeApplication.findMany({
                include: { user: true }
        })
        } else if (type === 'member') {
            applications = await prisma.memberApplication.findMany({
                include: { user: true }
        })
        } else {
            return NextResponse.json({ error: 'Invalid application type' }, { status: 400 })
        }
        
        return NextResponse.json(applications)
    } catch (error) {
        console.error('Error fetching applications:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}