interface Project {
  title: string
  description: string
  image: string
  technologies: string[]
  liveLink?: string
  codeLink?: string
  featured?: boolean
  highlights?: string[]
}

const ProjectsSection = () => {
  const projects: Project[] = [
    {
      title: 'Tic-Tac-Toe AI',
      description: 'Challenge an unbeatable AI powered by the Minimax algorithm. A fun implementation of game theory and artificial intelligence in action.',
      image: '/assets/img/tictactoe-icon.svg',
      technologies: ['React', 'TypeScript', 'Minimax Algorithm', 'Game Theory'],
      liveLink: '/tictactoe',
      featured: true,
      highlights: [
        'Unbeatable AI using Minimax algorithm',
        'Clean, intuitive game interface',
        'Real-time move evaluation',
        'Educational demonstration of AI concepts'
      ],
      codeLink: 'https://github.com/RikamPalkar/rikampalkar.github.io/tree/main/apps/tictactoe'
    },
    {
      title: 'ChroNiyam',
      description: 'Master time management using the proven Eisenhower Matrix framework. Organize tasks by priority, allocate time effectively, and prevent burnout.',
      image: '/assets/img/chroniyam-logo.svg',
      technologies: ['React', 'TypeScript', 'Vite', 'CSS'],
      liveLink: 'https://rikampalkar.github.io/ChroNiyam/',
      featured: true,
      highlights: [
        'Organize tasks by priority',
        'Allocate time effectively',
        'Prevent burnout by balancing work and life',
        'Track hours across your schedule'
      ],
      codeLink: 'https://github.com/RikamPalkar/rikampalkar.github.io/tree/main/apps/chroniyam'
    }
  ]

  return (
    <section id="services" className="services projects-section">
      <div className="container">
        <div className="section-title">
          <h2>Personal Projects</h2>
          <p>Innovative Side Projects</p>
        </div>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className={`project-card ${project.featured ? 'featured' : ''}`}>
              {project.featured && (
                <div className="featured-badge">
                  <i className="bi bi-star-fill"></i>
                  Featured
                </div>
              )}
              
              <div className="project-content">
                <div className="project-header-inline">
                  <div className="project-icon">
                    <img src={project.image} alt={project.title} />
                  </div>
                  <h3 className="project-title">{project.title}</h3>
                  <div className="project-links">
                    {project.liveLink && (
                      <a href={project.liveLink} target="_blank" rel="noreferrer" className="project-link-inline">
                        <i className="bi bi-arrow-up-right-circle"></i>
                        Live Demo
                      </a>
                    )}
                    {project.codeLink && (
                      <a href={project.codeLink} target="_blank" rel="noreferrer" className="project-link-inline">
                        <i className="bi bi-github"></i>
                        Code
                      </a>
                    )}
                  </div>
                </div>

                <p className="project-description">{project.description}</p>

                {project.highlights && (
                  <div className="project-highlights">
                    {project.highlights.map((highlight, idx) => (
                      <div key={idx} className="highlight-item">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="project-tech">
                  {project.technologies.map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProjectsSection


