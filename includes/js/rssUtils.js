// Fonction interne

function formatDateToRFC2822(dateString) {
  const date = new Date(dateString)
  return date.toUTCString()
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '')
}

// Fonction Externe

export function generateRSS(articlesData, baseUrl) {
  const BLOG_CONFIG = {
    title: "Codermug",
    description: "Articles sur l'infrastructure, DevOps et les technologies cloud",
    language: "fr-FR",
    managingEditor: "contact@low-layer.com",
    webMaster: "contact@low-layer.com",
    copyright: "© 2025 Codermug",
    generator: "RSS Generator"
  }

  // Filtrer uniquement les articles featured et les trier par date
  const featuredArticles = Object.entries(articlesData)
    .map(([slug, article]) => ({ slug, ...article }))
    .filter(article => article.featured === true)
    .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate))

  // En-tête RSS
  const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${BLOG_CONFIG.title}</title>
    <description>${BLOG_CONFIG.description}</description>
    <link>${baseUrl}</link>
    <language>${BLOG_CONFIG.language}</language>
    <managingEditor>${BLOG_CONFIG.managingEditor}</managingEditor>
    <webMaster>${BLOG_CONFIG.webMaster}</webMaster>
    <copyright>${BLOG_CONFIG.copyright}</copyright>
    <generator>${BLOG_CONFIG.generator}</generator>
    <lastBuildDate>${formatDateToRFC2822(new Date().toISOString().split('T')[0])}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`

  // Générer les items RSS pour les articles featured
  const rssItems = featuredArticles.map(article => {
    const articleUrl = `${baseUrl}/articles/${article.slug}`
    const imageUrl = article.miniature ? `${baseUrl}/assets/images/${article.miniature}` : ''
    
    // Construire les catégories/tags
    const categories = article.tags ? article.tags.map(tag => `      <category>${tag}</category>`).join('\n') : ''
    
    return `    <item>
      <title><![CDATA[${stripHtml(article.title)}]]></title>
      <description><![CDATA[${article.description}]]></description>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${formatDateToRFC2822(article.creationDate)}</pubDate>
      <author>${BLOG_CONFIG.managingEditor}</author>
${categories}
      ${article.category ? `<category>${article.category}</category>` : ''}
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/png" length="0" />` : ''}
      <source url="${baseUrl}/rss.xml">${BLOG_CONFIG.title}</source>
    </item>`
  }).join('\n')

  // Fermeture RSS
  const rssFooter = `
  </channel>
</rss>`

  return rssHeader + rssItems + rssFooter
}