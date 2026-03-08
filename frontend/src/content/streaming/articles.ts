export interface StreamingArticle {
  before: {
    concept: string[]
    intro: string[]
    whyUseful: string[]
  }
  after: {
    walkthrough: string[]
    relatedPatterns: string[]
    whenToUse: string[]
    whenToAvoid: string[]
    inProduction: string[]
  }
}

const sectionMap: Record<string, [keyof StreamingArticle, string]> = {
  'The Concept':               ['before', 'concept'],
  'Introduction':              ['before', 'intro'],
  'Why This Matters':          ['before', 'whyUseful'],
  'What Just Happened':        ['after', 'walkthrough'],
  'Related Patterns':          ['after', 'relatedPatterns'],
  'When to Use':               ['after', 'whenToUse'],
  'When to Avoid':             ['after', 'whenToAvoid'],
  'In Production':             ['after', 'inProduction'],
}

const bulletSections = new Set([
  'relatedPatterns', 'whenToUse', 'whenToAvoid',
])

function parseMarkdown(content: string): StreamingArticle {
  const article: StreamingArticle = {
    before: { concept: [], intro: [], whyUseful: [] },
    after: { walkthrough: [], relatedPatterns: [], whenToUse: [], whenToAvoid: [], inProduction: [] },
  }

  const sections = content.split(/^#{1,2} /m).slice(1)

  for (const section of sections) {
    const newlineIdx = section.indexOf('\n')
    const heading = section.slice(0, newlineIdx).trim()
    const body = section.slice(newlineIdx + 1).trim()
    const mapping = sectionMap[heading]
    if (!mapping) continue

    const [group, field] = mapping
    const target = article[group] as Record<string, string[]>

    if (bulletSections.has(field)) {
      target[field] = body
        .split('\n')
        .filter(line => line.startsWith('- '))
        .map(line => line.slice(2).trim())
    } else {
      target[field] = body
        .split(/\n\n+/)
        .map(p => p.replace(/\n/g, ' ').trim())
        .filter(Boolean)
    }
  }

  return article
}

const modules = import.meta.glob('./articles/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

const sorted = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, content]) => parseMarkdown(content))

export const streamingArticles: StreamingArticle[] = sorted
