import OpenAI from 'openai'

interface Prompt {
  id: string
  promptText: string
  category: string
  priority: string
}

interface Company {
  id: string
  name: string
  website?: string | null
  industry?: string | null
  competitors: Array<{
    id: string
    name: string
    website?: string | null
  }>
}

interface MonitoringResult {
  brandMentioned: boolean
  responseText: string
  competitorsMentioned: string[]
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function checkPromptWithAI(
  prompt: Prompt,
  company: Company
): Promise<MonitoringResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    // Get AI response to the prompt
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt.promptText
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Analyze the response for brand mentions
    const brandMentioned = detectBrandMention(responseText, company)

    // Analyze for competitor mentions
    const competitorsMentioned = detectCompetitorMentions(responseText, company.competitors)

    return {
      brandMentioned,
      responseText,
      competitorsMentioned,
    }

  } catch (error) {
    console.error('Error calling OpenAI:', error)
    throw new Error('Failed to check prompt with AI')
  }
}

function detectBrandMention(responseText: string, company: Company): boolean {
  const text = responseText.toLowerCase()
  const companyName = company.name.toLowerCase()
  
  // Check for exact company name match
  if (text.includes(companyName)) {
    return true
  }

  // Check for website mention (without protocol)
  if (company.website) {
    const website = company.website.replace(/^https?:\/\//, '').toLowerCase()
    if (text.includes(website)) {
      return true
    }
  }

  return false
}

function detectCompetitorMentions(
  responseText: string, 
  competitors: Array<{ name: string; website?: string | null }>
): string[] {
  const text = responseText.toLowerCase()
  const mentionedCompetitors: string[] = []

  for (const competitor of competitors) {
    const competitorName = competitor.name.toLowerCase()
    
    // Check for exact competitor name match
    if (text.includes(competitorName)) {
      mentionedCompetitors.push(competitor.name)
      continue
    }

    // Check for competitor website mention
    if (competitor.website) {
      const website = competitor.website.replace(/^https?:\/\//, '').toLowerCase()
      if (text.includes(website)) {
        mentionedCompetitors.push(competitor.name)
      }
    }
  }

  return mentionedCompetitors
}