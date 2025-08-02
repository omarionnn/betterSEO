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

    // Get competitors for the company with mention statistics
    const competitors = await prisma.competitor.findMany({
      where: {
        companyId: user.company.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get mention counts for each competitor
    const competitorsWithStats = await Promise.all(
      competitors.map(async (competitor) => {
        // Count mentions across all monitoring results
        const mentionCount = await prisma.monitorResult.count({
          where: {
            competitorsMentioned: {
              contains: competitor.name
            },
            prompt: {
              companyId: user.company!.id
            }
          }
        })

        // Get last mention date
        const lastMention = await prisma.monitorResult.findFirst({
          where: {
            competitorsMentioned: {
              contains: competitor.name
            },
            prompt: {
              companyId: user.company!.id
            }
          },
          orderBy: {
            checkedAt: 'desc'
          }
        })

        return {
          ...competitor,
          mentionCount,
          lastMentioned: lastMention?.checkedAt
        }
      })
    )

    return NextResponse.json(competitorsWithStats)

  } catch (error) {
    console.error('Error fetching competitors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { name, website } = await request.json()

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Competitor name is required' },
        { status: 400 }
      )
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if competitor already exists for this company
    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        name: name,
        companyId: user.company.id
      }
    })

    if (existingCompetitor) {
      return NextResponse.json(
        { error: 'Competitor with this name already exists' },
        { status: 400 }
      )
    }

    // Create competitor
    const competitor = await prisma.competitor.create({
      data: {
        name,
        website: website || null,
        companyId: user.company.id,
      }
    })

    return NextResponse.json(competitor, { status: 201 })

  } catch (error) {
    console.error('Error creating competitor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}