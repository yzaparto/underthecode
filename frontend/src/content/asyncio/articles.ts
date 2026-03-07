export interface AnimationArticle {
  before: {
    intro: string[]
    whyUseful: string[]
    whenToUse: string[]
  }
  after: {
    walkthrough: string[]
    keepInMind: string[]
    pitfalls: string[]
    realWorld: string[]
    relatedPatterns: string[]
  }
}

const sectionMap: Record<string, [keyof AnimationArticle, string]> = {
  'Introduction':              ['before', 'intro'],
  'Why This Matters':          ['before', 'whyUseful'],
  'When to Use This Pattern':  ['before', 'whenToUse'],
  'What Just Happened':        ['after', 'walkthrough'],
  'Keep in Mind':              ['after', 'keepInMind'],
  'Common Pitfalls':           ['after', 'pitfalls'],
  'Where to Incorporate This': ['after', 'realWorld'],
  'Related Patterns':          ['after', 'relatedPatterns'],
}

const bulletSections = new Set([
  'whenToUse', 'keepInMind', 'pitfalls', 'realWorld', 'relatedPatterns',
])

function parseMarkdown(raw: string): AnimationArticle {
  const article: AnimationArticle = {
    before: { intro: [], whyUseful: [], whenToUse: [] },
    after: { walkthrough: [], keepInMind: [], pitfalls: [], realWorld: [], relatedPatterns: [] },
  }

  const sections = raw.split(/^## /m).slice(1)

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

const modules = import.meta.glob<string>('./articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const sorted = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, raw]) => parseMarkdown(raw))

export const articles: AnimationArticle[] = sorted
