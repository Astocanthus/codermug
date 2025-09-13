// Utilitaires globaux
const BlogUtils = {
    
    // Cache pour les données
    cache: {
        articles: null
    },

    // Initialisation commune à toutes les pages
    async init() {
        this.updateActiveNav();
    },

    // Mettre à jour la navigation active
    updateActiveNav() {
        const currentPage = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if ((currentPage === '/' || currentPage === '/index.html') && (href === '/' || href === 'index.html')) {
                link.classList.add('active');
            } else if (currentPage.includes(href) && href !== '/') {
                link.classList.add('active');
            }
        });
    },

    // Charger l'index des articles
    async loadArticlesIndex() {
        if (!this.cache.articles) {
            try {
                const response = await fetch('assets/data/articles.json');
                this.cache.articles = await response.json();
            } catch (error) {
                console.error('Erreur lors du chargement des articles:', error);
                return {};
            }
        }
        return this.cache.articles;
    },

    // Initialiser la recherche
    initSearch(searchInputId, articlesContainerId) {
        const searchInput = document.getElementById(searchInputId);
        const articlesContainer = document.getElementById(articlesContainerId);
        const noResults = document.getElementById('no-results');

        if (!searchInput || !articlesContainer) return;

        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            // On sélectionne les wrappers (.col-*)
            const wrappers = articlesContainer.querySelectorAll('.article-items');
            let visibleCount = 0;

            wrappers.forEach(wrapper => {
                const article = wrapper.querySelector('.card'); // ou article
                const title = article?.dataset.title || '';
                const isVisible = title.includes(searchTerm);

                wrapper.style.display = isVisible ? '' : 'none';
                if (isVisible) visibleCount++;
            });

            if (noResults) {
                noResults.style.display = visibleCount === 0 && searchTerm ? 'block' : 'none';
            }
        });
    },

    // Charger les filtres de catégories
    async loadCategoryFilters(containerId, articlesContainerId) {
        const articles = await this.loadArticlesIndex();
        const categories = [...new Set(Object.values(articles)
            .map(article => article.category)
            .filter(cat => cat))];

        const container = document.getElementById(containerId);
        if (!container || categories.length === 0) return;

        // Bouton "Toutes"
        let filtersHTML = `<button class="filter-btn pb-1 active" data-category="all">Toutes</button>`;
        
        // Boutons de catégories
        categories.forEach(category => {
            filtersHTML += `<button class="filter-btn pb-1" data-category="${category}">${category}</button>`;
        });

        container.innerHTML = filtersHTML;

        // Ajouter les événements de filtrage
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                // Mettre à jour les boutons actifs
                container.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                // Filtrer les articles
                this.filterArticlesByCategory(e.target.dataset.category, articlesContainerId);
            }
        });
    },

    // Filtrer les articles par catégorie
    filterArticlesByCategory(category, articlesContainerId) {
        const articlesContainer = document.getElementById(articlesContainerId);
        const wrappers = articlesContainer.querySelectorAll('.article-items');
        const noResults = document.getElementById('no-results');
        let visibleCount = 0;

        wrappers.forEach(wrapper => {
            const article = wrapper.querySelector('.card');
            const articleCategory = article?.dataset.category || '';
            const isVisible = category === 'all' || articleCategory === category;

            wrapper.style.display = isVisible ? '' : 'none';
            if (isVisible) visibleCount++;
        });

        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    },

    // Fonction utilitaire pour copier du texte
    copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return Promise.resolve();
        }
    },

    // Fonction de partage
    share(title, url) {
        if (navigator.share) {
            navigator.share({ title, url }).catch(console.error);
        } else {
            this.copyToClipboard(url).then(() => {
                alert('URL copiée dans le presse-papiers !');
            });
        }
    }
};

// Initialisation automatique au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    BlogUtils.init();
});

// Gestion Burger
document.addEventListener('DOMContentLoaded', () => {
    const toggler = document.querySelector('.navbar-toggler');
    const collapse = document.getElementById('navbarNav');

    toggler.addEventListener('click', () => {
        toggler.classList.toggle('opened');
    });

    collapse.addEventListener('hidden.bs.collapse', () => {
        toggler.classList.remove('opened');
    });

    collapse.addEventListener('shown.bs.collapse', () => {
        toggler.classList.add('opened');
    });
});

