import OpenAI from 'openai'
import { tavily } from '@tavily/core'

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
  sources?: string[]
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
})

export async function checkPromptWithAI(
  prompt: Prompt,
  company: Company
): Promise<MonitoringResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  if (!process.env.TAVILY_API_KEY) {
    console.warn('Tavily API key not configured, falling back to basic AI check')
  }

  try {
    let context = ''
    let sources: string[] = []

    // 1. Get Live Web Context if Tavily is configured
    if (process.env.TAVILY_API_KEY) {
      try {
        const searchResponse = await tvly.search(prompt.promptText, {
          searchDepth: "advanced",
          maxResults: 5
        })

        context = searchResponse.results
          .map(r => `Source: ${r.url}\nContent: ${r.content}`)
          .join("\n\n")

        sources = searchResponse.results.map(r => r.url)
      } catch (searchError) {
        console.error('Error fetching search results from Tavily:', searchError)
        // Fallback to basic AI check if search fails
      }
    }

    // 2. Get AI response (using live context if available)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: context
            ? `You are an AI search assistant. Use the following web search results to answer the user request. Be objective and mention relevant brands. \n\nContext:\n${context}`
            : `You are an AI assistant. Answer the user request objectively based on your training data.`
        },
        {
          role: 'user',
          content: prompt.promptText
        }
      ],
      max_tokens: 1000,
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
      sources
    }

  } catch (error) {
    console.error('Error in AI monitoring flow:', error)
    throw new Error('Failed to check prompt with AI')
  }
}

export async function generateSuggestedPrompts(
  company: Company
): Promise<Array<{ text: string; category: string }>> {
  if (!process.env.OPENAI_API_KEY || !process.env.TAVILY_API_KEY) {
    throw new Error('API keys not configured')
  }

  try {
    // 1. Research the brand first using Tavily to understand its core offerings
    const researchQuery = `What does the company ${company.name} do? Website: ${company.website || 'unknown'}. What products or services do they provide?`
    const researchResults = await tvly.search(researchQuery, {
      searchDepth: "advanced",
      maxResults: 3
    })

    const brandContext = researchResults.results
      .map(r => r.content)
      .join("\n\n")

    // 2. Generate consumer-intent prompts based on that research
    const systemPrompt = `You are a betterSEO Strategist. 
I am providing you with live research about a company called "${company.name}".

YOUR GOAL:
Generate 8 queries that a POTENTIAL CUSTOMER would ask an AI (like ChatGPT or Perplexity) when they are looking for a solution that this company provides.

CRITICAL RULES:
- DO NOT generate prompts that include the brand name "${company.name}".
- The prompts should be "Generic High-Intent" queries (e.g., "What is the best laptop for video editing?" instead of "Tell me about Apple Laptops").
- Focus on the PROBLEM the company solves, not the company itself.
- Ensure the prompts are highly competitive.

RESEARCH DATA BLOB:
${brandContext}

CATEGORIES:
- PRODUCT: Need a specific item.
- SERVICE: Need a professional task done.
- COMPARISON: Looking for top options in a category.
- HOW_TO: Solving a specific problem.

Return exactly 8 prompts in a JSON array format: {"prompts": [{"text": "...", "category": "..."}]}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate 8 unbranded consumer-intent prompts for a company in this space.` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    })

    const content = completion.choices[0]?.message?.content || '{}'
    const result = JSON.parse(content)
    const prompts = result.prompts || result.suggestions || Object.values(result)[0] || []

    return prompts.map((p: { text?: string; promptText?: string; category?: string }) => ({
      text: p.text || p.promptText || '',
      category: (p.category || 'PRODUCT').toUpperCase()
    }))

  } catch (error) {
    console.error('Error in research-driven generation:', error)
    throw new Error('Failed to generate research-driven suggestions')
  }
}

/**
 * NEW: Generates an SEO "Recovery Roadmap" if a brand doesn't show up in results
 */
export async function generateRecoveryRoadmap(
  result: { responseText: string; promptText: string },
  company: Company
): Promise<string> {
  const systemPrompt = `You are a Senior SEO Content Strategist. 
A brand called "${company.name}" (${company.website || 'unknown'}) did NOT show up in an AI's response to the following user query:
"${result.promptText}"

The AI's actual response was:
"${result.responseText}"

YOUR MISSION:
Analyze the AI's response to see which competitors were mentioned and WHY.
Then, provide a 3-step actionable roadmap for ${company.name} to modify their website or content strategy so that they become a cited source for this query in the future.

Focus on:
1. Identifying the "Knowledge Gap" (What info is the AI looking for that ${company.name} lacks?)
2. Technical Content Fixes (Which pages need to be created or updated?)
3. Authority Signals (Where should they be mentioned to be trusted for this topic?)

Keep it concise, professional, and highly actionable.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'system', content: systemPrompt }],
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content || 'Unable to generate roadmap at this time.'
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