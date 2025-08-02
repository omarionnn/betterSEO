import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { checkPromptWithAI } from '@/lib/ai-monitoring'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get prompt with company info
    const prompt = await prisma.prompt.findFirst({
      where: {
        id: params.id,
        companyId: user.company.id,
        isActive: true
      },
      include: {
        company: {
          include: {
            competitors: true
          }
        }
      }
    })

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found or inactive' }, { status: 404 })
    }

    // Check prompt with AI
    const result = await checkPromptWithAI(prompt, prompt.company)

    // Save result to database
    await prisma.monitorResult.create({
      data: {
        promptId: prompt.id,
        platform: 'ChatGPT',
        brandMentioned: result.brandMentioned,
        responseText: result.responseText,
        competitorsMentioned: result.competitorsMentioned.join(','),
      }
    })

    return NextResponse.json({
      message: 'Prompt checked successfully',
      result
    })

  } catch (error) {
    console.error('Error checking prompt:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}