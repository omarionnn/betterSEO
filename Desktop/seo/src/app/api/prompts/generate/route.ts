import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateSuggestedPrompts } from '@/lib/ai-monitoring'

export async function POST() {
    try {
        const session = await getServerSession(authOptions as any) as any

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Get user's company and competitors
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                company: {
                    include: {
                        competitors: true
                    }
                }
            }
        })

        if (!user?.company) {
            return NextResponse.json({ error: 'Company profile not set up yet' }, { status: 404 })
        }

        // Generate suggestions
        const suggestions = await generateSuggestedPrompts(user.company)

        return NextResponse.json(suggestions)

    } catch (error) {
        console.error('Error generating prompt suggestions:', error)
        return NextResponse.json(
            { error: 'Failed to generate suggestions' },
            { status: 500 }
        )
    }
}
