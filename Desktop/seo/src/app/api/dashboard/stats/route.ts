import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { MonitorResult } from '@prisma/client'

export async function GET() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            where: { email: (session as any).user.email },
            include: {
                company: {
                    include: {
                        prompts: {
                            include: {
                                monitorResults: true
                            }
                        },
                        competitors: true
                    }
                }
            }
        })

        if (!user || !user.company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }

        const company = user.company
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allResults: MonitorResult[] = company.prompts.flatMap((p: any) => p.monitorResults)

        const totalPrompts = company.prompts.length
        const brandMentions = allResults.filter((r: MonitorResult) => r.brandMentioned).length
        const mentionRate = allResults.length > 0
            ? Math.round((brandMentions / allResults.length) * 100)
            : 0

        const lastCheck = allResults.length > 0
            ? allResults.reduce((latest: MonitorResult, current: MonitorResult) =>
                new Date(current.checkedAt) > new Date(latest.checkedAt) ? current : latest
            ).checkedAt
            : null

        const totalCompetitors = company.competitors.length
        const totalChecks = allResults.length

        // Competitor Impact analysis
        const compCounts: Record<string, number> = {}
        allResults.forEach(r => {
            if (r.competitorsMentioned) {
                const names = r.competitorsMentioned.split(',').map(n => n.trim())
                names.forEach(name => {
                    if (name) compCounts[name] = (compCounts[name] || 0) + 1
                })
            }
        })
        const competitorImpact = Object.entries(compCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)

        // Mentions Trend (Last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - i)
            return d.toISOString().split('T')[0]
        }).reverse()

        const mentionTrend = last7Days.map(date => {
            const dayResults = allResults.filter(r => r.checkedAt.toISOString().split('T')[0] === date)
            const mentioned = dayResults.filter(r => r.brandMentioned).length
            return {
                date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
                rate: dayResults.length > 0 ? Math.round((mentioned / dayResults.length) * 100) : 0
            }
        })

        // Recent performance delta (today vs yesterday)
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const todayResults = allResults.filter(r => r.checkedAt.toISOString().split('T')[0] === today)
        const yesterdayResults = allResults.filter(r => r.checkedAt.toISOString().split('T')[0] === yesterdayStr)

        const todayRate = todayResults.length > 0 ? (todayResults.filter(r => r.brandMentioned).length / todayResults.length) : 0
        const yesterdayRate = yesterdayResults.length > 0 ? (yesterdayResults.filter(r => r.brandMentioned).length / yesterdayResults.length) : 0
        const performanceDelta = Math.round((todayRate - yesterdayRate) * 100)

        // Setup steps calculation
        const setupSteps = [
            { id: 'add-prompt', completed: totalPrompts > 0 },
            { id: 'run-check', completed: totalChecks > 0 },
            { id: 'track-competitors', completed: totalCompetitors > 0 }
        ]

        return NextResponse.json({
            totalPrompts,
            mentionRate,
            lastCheck,
            totalCompetitors,
            totalChecks,
            competitorImpact,
            mentionTrend,
            performanceDelta,
            setupSteps
        })
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
