import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
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

    // Get prompts for the company
    const prompts = await prisma.prompt.findMany({
      where: {
        companyId: user.company.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(prompts)

  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as any

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const { promptText, category, priority } = await request.json()

    // Validate required fields
    if (!promptText || !category || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate enum values
    const validCategories = ['PRODUCT', 'SERVICE', 'COMPARISON', 'HOW_TO']
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH']

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority' },
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

    // Create prompt
    const prompt = await prisma.prompt.create({
      data: {
        promptText,
        category,
        priority,
        companyId: user.company.id,
      }
    })

    return NextResponse.json(prompt, { status: 201 })

  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}