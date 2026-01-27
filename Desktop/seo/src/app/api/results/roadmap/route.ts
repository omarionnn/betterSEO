import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateRecoveryRoadmap } from '@/lib/ai-monitoring'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions as any) as any

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { resultId } = await request.json()
        console.log('Roadmap request received for resultId:', resultId)

        if (!resultId) {
            return NextResponse.json({ error: 'Result ID is required' }, { status: 400 })
        }

        // Get the monitoring result
        const result = await prisma.monitorResult.findUnique({
            where: { id: resultId },
            include: {
                prompt: {
                    include: {
                        company: {
                            include: {
                                competitors: true
                            }
                        }
                    }
                }
            }
        })

        if (!result) {
            return NextResponse.json({ error: 'Result not found' }, { status: 404 })
        }

        // Security check
        if (result.prompt.company.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Generate the SEO recovery roadmap
        const roadmap = await generateRecoveryRoadmap(
            {
                responseText: result.responseText,
                promptText: result.prompt.promptText
            },
            result.prompt.company
        )

        return NextResponse.json({ roadmap })

    } catch (error) {
        console.error('Error generating recovery roadmap:', error)
        return NextResponse.json(
            { error: 'Failed to generate roadmap' },
            { status: 500 }
        )
    }
}
