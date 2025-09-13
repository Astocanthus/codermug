import express from 'express'
import * as cheerio from 'cheerio'
import https from 'https' 
import fs  from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadArticlesData, loadArticleContent, loadRecentArticles, loadAllArticles, normalizeForNav, normalizeForId } from './includes/js/templateUtils.js'
import { generateRSS } from './includes/js/rssUtils.js'
import { getSlogan } from './includes/js/sloganUtils.js'

const app = express()
const PORT = 3000
const HTTPS_PORT = 3443
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static('public'))
app.set('views', path.join(__dirname, 'templates'))
app.set('view engine', 'ejs')
app.use((_, res, next) => {
  const random = getSlogan();
  res.locals.sloganTitle = random.title;
  res.locals.sloganSubtitle = random.subtitle;
  next();
})

// Route principale - charge index.html
app.get('/', (req, res) => {
  const recentArticles = loadRecentArticles(4)

  res.render('index', { recentArticles }, (err, html) => {
    if (err) {
      console.error('Erreur rendu template index:', err)
      return res.status(404).send('Template index.ejs non trouvé ou erreur de rendu')
    }
    res.send(html)
  })
})

app.get('/articles', (req, res) => {
  const allArticles = loadAllArticles()

  res.render('articles', { allArticles }, (err, html) => {
    if (err) {
      console.error('Erreur rendu template articles:', err)
      return res.status(404).send('Template articles.ejs non trouvé ou erreur de rendu')
    }
    res.send(html)
  })
})

// Route dynamique pour les articles
app.get('/articles/:articleName', async (req, res) => {
  const articlesData = loadArticlesData()
  const articleName = req.params.articleName
  const article = articlesData[articleName]

  if (!article) {
    return res.status(404).send('Article non trouvé')
  }

  const rawHtml = loadArticleContent(articleName)
  const $ = cheerio.load(rawHtml)
  const headings = []

  $('h2, h5').each((i, elem) => {
    const $el = $(elem)
    // 🔥 Sauter les titres marqués avec data-no-menu
    if ($el.attr('data-no-menu') !== undefined) return

    // Générer l'ID basé sur le contenu du titre
    let id = $el.attr('id')
    
    if (!id) {
      const titleText = $el.text().trim()
      id = normalizeForId(titleText) // Utiliser votre fonction de nettoyage
    }

    // Trouver la section parente et lui attribuer l'ID
    const $parentSection = $el.closest('section')
    if ($parentSection.length > 0) {
      $parentSection.attr('id', id)
      // Optionnel : retirer l'ID du titre si il en avait un
      $el.removeAttr('id')
    } else {
      // Fallback : si pas de section parente, garder l'ID sur le titre
      $el.attr('id', id)
    }

    headings.push({
      tag: elem.tagName,
      id,
      text: normalizeForNav($el.text().trim())
    })
  })

  // Construction de la structure du menu
  const menuItems = []
  let currentH2 = null
  headings.forEach(h => {
    if (h.tag === 'h2') {
      currentH2 = { title: h.text, id: h.id, children: [] }
      menuItems.push(currentH2)
    } else if (h.tag === 'h5' && currentH2) {
      currentH2.children.push({ title: h.text, id: h.id })
    }
  })

  article.content = $.html()
  article.articleName = articleName

  res.render('article-template', { article, menuItems })
})

app.get('/rss.xml', (req, res) => {
  try {
    // Charger les données depuis votre fichier JSON
    const articlesPath = path.join(__dirname, 'public', 'assets', 'data', 'articles.json')
    const articlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf8'))
    
    // Générer le RSS
    const baseUrl = `https://${req.get('host')}`
    const rssContent = generateRSS(articlesData, baseUrl)
    
    // Headers appropriés
    res.set({
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(rssContent);
  } catch (error) {
    console.error('Erreur génération RSS:', error);
    res.status(500).send('Erreur lors de la génération du flux RSS')
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`)
})

const sslOptions = {
  key: fs.readFileSync('/app/ssl/key.pem'),
  cert: fs.readFileSync('/app/ssl/cert.pem'),
  ca: fs.readFileSync('/app/ssl/ca.pem'),
}

https.createServer(sslOptions, app).listen(HTTPS_PORT, () =>
  console.log(`🔒 HTTPS serveur lancé sur https://localhost:${HTTPS_PORT}`)
)