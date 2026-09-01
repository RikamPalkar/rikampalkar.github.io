import { useState } from 'react'

interface ArticleCategory {
  name: string
  articles: Array<{
    title: string
    count: number
    url: string
  }>
  icon: string
  color: string
}

interface Platform {
  name: string
  description: string
  articleCount: string
  url: string
  icon: string
  color: string
  badge?: string
}

const ArticlesSection = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const platforms: Platform[] = [
    {
      name: 'Microsoft',
      description: 'Official Microsoft Most Valuable Professional (MVP) in Developer Technologies.',
      articleCount: 'MVP',
      url: 'https://mvp.microsoft.com/en-US/mvp/profile/b994c0e7-dce5-ed11-8f6d-000d3a560942',
      icon: 'bi-microsoft',
      color: '#00a4ef',
      badge: 'Microsoft MVP'
    },
    {
      name: 'C# Corner',
      description: 'In-depth technical tutorials covering .NET, C#, Blazor, WPF, React, and modern software development practices.',
      articleCount: '191+',
      url: 'https://www.c-sharpcorner.com/members/rikam-palkar',
      icon: 'bi-journal-code',
      color: '#18d26e',
      badge: 'C# Corner MVP'
    },
    {
      name: 'Medium',
      description: 'Thought leadership articles on software engineering, architecture patterns, and technology insights.',
      articleCount: '40+',
      url: 'https://medium.com/@RikamPalkar',
      icon: 'bi-medium',
      color: '#00ab6c',
      badge: 'Verified Author'
    },
    {
      name: 'AWS Community Builder',
      description: 'Cloud computing articles, AWS best practices, and serverless architecture insights.',
      articleCount: 'Featured',
      url: 'https://builder.aws.com/community/@rikam?tab=articles',
      icon: 'bi-cloud-fill',
      color: '#ff9900',
      badge: 'Community Builder'
    },
    {
      name: 'LinkedIn',
      description: 'Professional insights, career development, and quick technical tips for developers.',
      articleCount: 'Active',
      url: 'https://www.linkedin.com/in/rikampalkar/recent-activity/articles/',
      icon: 'bi-linkedin',
      color: '#0077b5',
      badge: 'Top Voice'
    }
  ]

  const categories: ArticleCategory[] = [
    {
      name: 'Core Software Engineering',
      icon: 'bi-code-slash',
      color: '#18d26e',
      articles: [
        { title: 'Agile Development', count: 2, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/agile-development' },
        { title: 'Exception Handling', count: 1, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/exception-handling' },
        { title: 'VS Code', count: 1, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/visual-studio' }
      ]
    },
    {
      name: 'Artificial Intelligence',
      icon: 'bi-robot',
      color: '#9b59b6',
      articles: [
        { title: 'AI for Dummies', count: 5, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/ai' },
        { title: 'Agents for Dummies', count: 1, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/ai-agents' },
        { title: 'AI Chatbot with ChatGPT and Blazor', count: 1, url: 'https://www.c-sharpcorner.com/article/building-ai-chatbot-app-with-chatgpt-api-and-blazor-a-step-by-step-guide/' }
      ]
    },
    {
      name: '.NET Ecosystem',
      icon: 'bi-windows',
      color: '#512bd4',
      articles: [
        { title: 'C#', count: 27, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/csharp-programming' },
        { title: '.NET', count: 2, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/dotnet' },
        { title: 'ASP.NET Core', count: 5, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/aspdotnet-core' },
        { title: 'Entity Framework', count: 1, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/entityframework' },
        { title: 'Algorithms in C#', count: 4, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/algorithms-in-csharp' },
        { title: 'WPF', count: 50, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/All/2020' }
      ]
    },
    {
      name: 'Architecture and Design',
      icon: 'bi-diagram-3',
      color: '#e74c3c',
      articles: [
        { title: 'Design Patterns', count: 7, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/design-patterns-and-practices' },
        { title: 'SOLID Principles', count: 1, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/oop-ood' }
      ]
    },
    {
      name: 'Frontend and UI Engineering',
      icon: 'bi-palette',
      color: '#3498db',
      articles: [
        { title: 'Blazor', count: 41, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/blazor' },
        { title: 'React', count: 23, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/react' },
        { title: 'TypeScript', count: 6, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/typescript' },
        { title: 'JavaScript', count: 7, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/javascript' }
      ]
    },
    {
      name: 'Cloud and DevOps',
      icon: 'bi-cloud',
      color: '#f39c12',
      articles: [
        { title: 'Azure', count: 1, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/azure' },
        { title: 'AWS', count: 1, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/cloud' },
        { title: 'DevOps', count: 4, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/deployment' }
      ]
    },
    {
      name: 'Emerging Technologies',
      icon: 'bi-lightning',
      color: '#1abc9c',
      articles: [
        { title: 'Blockchain', count: 2, url: 'https://www.c-sharpcorner.com/members/rikam-palkar/articles/blockchain' }
      ]
    }
  ]

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName)
  }

  return (
    <section id="articles" className="articles-section">
      <div className="container">
        <div className="section-title">
          <h2>Technical Writing Portfolio</h2>
          <p>
            230+ articles published
          </p>
        </div>

        <div className="platforms-grid">
          {platforms.map((platform, index) => (
            <a
              key={index}
              href={platform.url}
              target="_blank"
              rel="noreferrer"
              className="platform-card"
            >
              {platform.badge && (
                <div className="platform-badge" style={{ background: `linear-gradient(135deg, ${platform.color} 0%, ${platform.color}dd 100%)` }}>
                  <i className="bi bi-patch-check-fill"></i> {platform.badge}
                </div>
              )}
              <div className="platform-icon" style={{ color: platform.color }}>
                <i className={platform.icon}></i>
              </div>
              <h4 className="platform-name">{platform.name}</h4>
              <p className="platform-description">{platform.description}</p>
              <div className="platform-footer">
                <span className="platform-count" style={{ color: platform.color }}>
                  {platform.articleCount} Articles
                </span>
                <i className="bi bi-arrow-right" style={{ color: platform.color }}></i>
              </div>
            </a>
          ))}
        </div>

        <div className="section-subtitle">
          <h3>Browse by Category</h3>
          <p>Explore my C# Corner articles organized by topic</p>
        </div>

        <div className="categories-grid">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className={`category-card ${expandedCategory === category.name ? 'expanded' : ''}`}
            >
              <div 
                className="category-header"
                onClick={() => toggleCategory(category.name)}
              >
                <div className="category-title-group">
                  <i className={`${category.icon} category-icon`} style={{ color: category.color }}></i>
                  <h3>{category.name}</h3>
                </div>
                <div className="category-meta">
                  <span className="category-count" style={{ borderColor: category.color, color: category.color }}>
                    {category.articles.reduce((sum, article) => sum + article.count, 0)} articles
                  </span>
                  <i className={`bi ${expandedCategory === category.name ? 'bi-chevron-up' : 'bi-chevron-down'} expand-icon`}></i>
                </div>
              </div>
              
              {expandedCategory === category.name && (
                <div className="articles-list">
                  {category.articles.map((article, articleIndex) => (
                    <a 
                      key={articleIndex}
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="article-item"
                    >
                      <div className="article-info">
                        <i className="bi bi-journal-code article-icon"></i>
                        <span className="article-title">{article.title}</span>
                      </div>
                      <div className="article-meta">
                        <span className="article-count" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                          {article.count}
                        </span>
                        <i className="bi bi-arrow-up-right"></i>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ArticlesSection
