import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Check if competitor exists and belongs to user's company
    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    })

    if (!existingCompetitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Check if another competitor with this name already exists (excluding current one)
    const duplicateCompetitor = await prisma.competitor.findFirst({
      where: {
        name: name,
        companyId: user.company.id,
        id: {
          not: id
        }
      }
    })

    if (duplicateCompetitor) {
      return NextResponse.json(
        { error: 'Another competitor with this name already exists' },
        { status: 400 }
      )
    }

    // Update competitor
    const competitor = await prisma.competitor.update({
      where: { id },
      data: {
        name,
        website: website || null,
      }
    })

    return NextResponse.json(competitor)

  } catch (error) {
    console.error('Error updating competitor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Check if competitor exists and belongs to user's company
    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    })

    if (!existingCompetitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Delete competitor
    await prisma.competitor.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Competitor deleted successfully' })

  } catch (error) {
    console.error('Error deleting competitor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}