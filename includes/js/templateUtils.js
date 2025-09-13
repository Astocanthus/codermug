import { readFileSync } from 'fs'
import path from 'path'

const projectRoot = process.cwd()

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('fr-FR', options)
}

export function loadArticlesData() {
  try {
    const data = readFileSync('./public/assets/data/articles.json', 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Erreur lors du chargement du fichier JSON:', error)
    return {}
  }
}

export function loadArticleContent(filenameWithoutExt) {
  const contentPath = path.join(projectRoot, 'content', filenameWithoutExt + '.html')
  try {
    return readFileSync(contentPath, 'utf8')
  } catch (err) {
    console.error('Erreur lecture fichier:', contentPath, err)
    return '<p>Contenu non disponible</p>'
  }
}

export function loadPartial(partialName) {
  try {
    const partialPath = `/app/includes/html/${partialName}.html`
    const content = readFileSync(partialPath, 'utf8')
    return content
  } catch (error) {
    console.error(`Erreur lors du chargement du partial ${partialName}:`, error.message)
    return `<!-- Partial ${partialName} non trouvé -->`
  }
}

// Fonction pour charger tous les articles
export function loadAllArticles() {
  const articles = loadArticlesData();
  const allArticles = Object.entries(articles)
    .sort((a, b) => new Date(b[1].creationDate) - new Date(a[1].creationDate));
  
  return allArticles.map(([slug, article]) => 
    renderArticleCard(slug, article)
  ).join('');
}

// Fonction pour charger les articles récents
export function loadRecentArticles(limit = 3) {
  const articles = loadArticlesData();
  const recentArticles = Object.entries(articles)
    .filter(([slug, article]) => article.featured === true)
    .sort((a, b) => new Date(b[1].creationDate) - new Date(a[1].creationDate))
    .slice(0, limit);
  
  return recentArticles.map(([slug, article]) => 
    renderArticleCard(slug, article)
  ).join('');
}

export function renderArticleCard(slug, article) {
  return `
    <div class="col-12 col-md-6 col-lg-4 col-xl-4 col-xxl-3 article-items mb-1">
        <article class="card article-card mx-auto h-100" data-title="${article.title.toLowerCase()}" data-category="${article.category || ''}">
            <img src="assets/images/${article.miniature || 'placeholder.png'}" class="card-img-top object-fit-contain" alt="${article.title}">
            
            <div class="card-body d-flex flex-column">
                <h2 class="h5 mb-2 text-decoration-none text-dark">
                    ${article.title}
                </h2>

                <div class="article-meta small text-muted mb-2">
                    ${article.category ? `<span class="badge bg-secondary me-1">${article.category}</span>` : ``}
                    <time datetime="${article.creationDate}">${formatDate(article.creationDate)}</time>
                </div>

                <p class="article-excerpt flex-grow-1 mb-3">${article.description}</p>

                ${article.featured ? 
                  `<a href="articles/${slug}" class="btn btn-outline-primary mt-auto">Lire la suite →</a>` :
                  `<button class="btn btn-primary mt-auto" disabled>Article à venir</button>`
                }
            </div>
        </article>
    </div>
  `;
}

export function normalizeForId(str) {
  return str
    .replace(/[^\p{L}\p{N}\s\(\)=\-]/gu, '')
    // Supprimer le contenu entre parenthèses
    .replace(/\([^)]*\)/g, '')
    // Supprimer les signes égal
    .replace(/=/g, '')
    // Nettoyer et formater
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    // Garder les lettres (avec accents), chiffres et tirets
    .replace(/[^\p{L}\p{N}\-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeForNav(str) {
  return str
    .replace(/[^\p{L}\p{N}\s\(\)=\-+':]/gu, '')
    // Supprimer le contenu entre parenthèses
    .replace(/\([^)]*\)/g, '')
    // Supprimer les signes égal
    .replace(/=/g, '')
    // Nettoyer les espaces
    .replace(/\s+/g, ' ')
    .trim();
}