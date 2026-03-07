export interface StreamingArticle {
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

function parseMarkdownSection(content: string, heading: string): string[] {
  const regex = new RegExp(`# ${heading}\\n([\\s\\S]*?)(?=\\n# |$)`, 'i')
  const match = content.match(regex)
  if (!match) return []
  
  return match[1]
    .trim()
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
}

function parseMarkdown(content: string): StreamingArticle {
  return {
    before: {
      intro: parseMarkdownSection(content, 'Introduction'),
      whyUseful: parseMarkdownSection(content, 'Why This Matters'),
      whenToUse: parseMarkdownSection(content, 'When to Use This Pattern')
        .flatMap(p => p.startsWith('- ') ? p.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2)) : [p]),
    },
    after: {
      walkthrough: parseMarkdownSection(content, 'What Just Happened'),
      keepInMind: parseMarkdownSection(content, 'Keep in Mind')
        .flatMap(p => p.startsWith('- ') ? p.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2)) : [p]),
      pitfalls: parseMarkdownSection(content, 'Common Pitfalls')
        .flatMap(p => p.startsWith('- ') ? p.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2)) : [p]),
      realWorld: parseMarkdownSection(content, 'Where to Incorporate This')
        .flatMap(p => p.startsWith('- ') ? p.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2)) : [p]),
      relatedPatterns: parseMarkdownSection(content, 'Related Patterns')
        .flatMap(p => p.startsWith('- ') ? p.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2)) : [p]),
    },
  }
}

const modules = import.meta.glob('./articles/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

const sorted = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, content]) => parseMarkdown(content))

export const streamingArticles: StreamingArticle[] = sorted
