import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any) as any

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get monitor results for the company's prompts
    const results = await prisma.monitorResult.findMany({
      where: {
        prompt: {
          companyId: user.company.id
        }
      },
      include: {
        prompt: {
          select: {
            id: true,
            promptText: true,
            category: true,
            priority: true
          }
        }
      },
      orderBy: {
        checkedAt: 'desc'
      }
    })

    // Transform the results to include parsed competitors and sources
    const transformedResults = results.map(result => ({
      ...result,
      competitorsMentioned: result.competitorsMentioned
        ? result.competitorsMentioned.split(',').filter(c => c.trim())
        : [],
      sources: (result as any).sources
        ? (result as any).sources.split(',').filter((s: string) => s.trim())
        : []
    }))

    return NextResponse.json(transformedResults)

  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}