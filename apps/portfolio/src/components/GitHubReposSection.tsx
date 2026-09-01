interface GitHubRepo {
  title: string
  description: string
  tags: string[]
  link: string
  featured?: boolean
  githubBadge?: string
}

const GitHubReposSection = () => {
  const repos: GitHubRepo[] = [
    {
      title: 'LeetCode 75 Solutions',
      description: 'Complete solutions to the LeetCode 75 Study Plan covering 75 handpicked problems across 23 DSA topics, organized by problem number.',
      tags: ['LeetCode', 'DSA', 'Algorithms', 'C#'],
      link: 'https://github.com/RikamPalkar/leetcode-75',
      featured: true
    },
    {
      title: 'Agents for Dummies',
      description: 'A practical guide to building AI agents from scratch. Learn the fundamentals of autonomous agents with hands-on examples and clear explanations.',
      tags: ['AI', 'Agents', 'Machine Learning', 'Python'],
      link: 'https://github.com/RikamPalkar/agents-for-dummies',
      featured: true
    },
    {
      title: 'DSA Simplified',
      description: 'Master Data Structures and Algorithms with clear explanations and practical implementations. Focus on problem-solving skills that transcend any framework or language.',
      tags: ['DSA', 'Algorithms', 'Problem Solving', 'C#'],
      link: 'https://github.com/RikamPalkar/DSA-Simplified',
      featured: true,
      githubBadge: 'Starstruck'
    },
    {
      title: 'GraphQL Full-Stack Application',
      description: 'Learn GraphQL by building a production-ready full-stack application with React and .NET from scratch.',
      tags: ['GraphQL', 'React', '.NET', 'TypeScript'],
      link: 'https://github.com/RikamPalkar/graphql-dotnet-react-from-zero-to-production'
    },
    {
      title: 'Vertical Slice Architecture & CQRS',
      description: 'Master modern architectural patterns with a complete implementation of Vertical Slice Architecture and CQRS in .NET.',
      tags: ['.NET', 'CQRS', 'Architecture', 'Clean Code'],
      link: 'https://github.com/RikamPalkar/vertical-cqrs-architecture-dotnet'
    },
    {
      title: 'RedisCore',
      description: 'A lightweight, high-performance Redis-compatible server implementation built from scratch in C# and .NET 8.',
      tags: ['C#', '.NET 8', 'Redis', 'Performance'],
      link: 'https://github.com/RikamPalkar/RedisCore'
    },
    {
      title: 'Blazor Simplified',
      description: 'Official companion repository for "Blazor Simplified" book. Contains comprehensive code examples, snippets, and practical resources for learning Blazor.',
      tags: ['Blazor', 'C#', '.NET', 'Book'],
      link: 'https://github.com/RikamPalkar/Blazor-Simplified'
    },
    {
      title: 'C# Best Practices',
      description: 'Hands-on examples demonstrating C# best practices and coding standards. Includes comprehensive code snippets with detailed explanations.',
      tags: ['C#', 'Best Practices', 'Clean Code', 'Standards'],
      link: 'https://github.com/RikamPalkar/CSharp_Best_Practices'
    },
    {
      title: 'COVID-19 Tracker - WPF Edition',
      description: 'An attractive WPF application for tracking COVID-19 statistics. Built for educational purposes to demonstrate modern UI patterns in desktop development.',
      tags: ['WPF', 'UI/UX', 'C#', 'API Integration'],
      link: 'https://github.com/RikamPalkar/Covid-19-Tracker-in-WPF'
    },
    {
      title: 'REST APIs with WPF & Entity Framework',
      description: 'Build robust desktop applications with WPF while integrating REST APIs and Entity Framework for data management.',
      tags: ['WPF', 'REST API', 'Entity Framework', 'C#'],
      link: 'https://github.com/RikamPalkar/REST-APIs-with-WPF-and-Entity-Framework'
    }
  ]

  return (
    <section id="github" className="github-repos">
      <div className="container">
        <div className="section-title">
          <h2>Open Source Projects</h2>
          <p>Explore my GitHub repos</p>
        </div>

        <div className="repos-grid">
          {repos.map((repo, index) => (
            <div 
              key={index} 
              className={`repo-card ${repo.featured ? 'featured' : ''}`}
            >
              {repo.featured && (
                <div className="featured-badge">
                  <i className="bi bi-star-fill"></i> Featured
                </div>
              )}
              {repo.githubBadge && (
                <div className="github-achievement-badge">
                  <i className="bi bi-emoji-heart-eyes-fill"></i> {repo.githubBadge}
                </div>
              )}
              <div className="repo-header">
                <i className="bi bi-github repo-icon"></i>
                <h3>{repo.title}</h3>
              </div>
              <p className="repo-description">{repo.description}</p>
              <div className="repo-tags">
                {repo.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="repo-tag">{tag}</span>
                ))}
              </div>
              <a 
                href={repo.link} 
                target="_blank" 
                rel="noreferrer" 
                className="repo-link"
              >
                <i className="bi bi-box-arrow-up-right"></i> View on GitHub
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GitHubReposSection
