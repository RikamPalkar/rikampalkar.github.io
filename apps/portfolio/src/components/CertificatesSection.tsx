import { useState, type SyntheticEvent } from 'react'

interface Certificate {
  name: string
  path: string
  verificationUrl?: string
}

interface Category {
  name: string
  icon: string
  certificates: Certificate[]
}

const CERT_PLACEHOLDER_PATH = '/assets/certificates/placeholder-certificate.svg'

const CertificatesSection = () => {
  const [currentIndex, setCurrentIndex] = useState<{ [key: number]: number }>({})
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxCategory, setLightboxCategory] = useState<number | null>(null)

  const categories: Category[] = [
    {
      name: 'Cloud',
      icon: 'bi-cloud-fill',
      certificates: [
        {
          name: 'AWS Solution Architect',
          path: '/assets/certificates/cloud/AWS Solution Architect.png',
          verificationUrl: 'https://www.credly.com/badges/84ea6f8d-a763-4d37-8a7c-92b43ff97958'
        },
        { name: 'Ultimate AWS Certified Solutions Architect Associate 2025', path: '/assets/certificates/cloud/Ultimate AWS Certified Solutions Architect Associate.jpg' },
        { name: 'Introduction to AWS', path: '/assets/certificates/cloud/Introduction to AWS.jpg' }
      ]
    },
    {
      name: 'Leadership',
      icon: 'bi-people-fill',
      certificates: [
        {
          name: 'Executive Diploma in Leadership and Management',
          path: '/assets/certificates/leadership/EXECUTIVE DIPLOMA.jpg',
          verificationUrl: 'https://edu.gtf.pt/pluginfile.php/1/tool_certificate/issues/1774859707/7342009267RP.pdf'
        },
        { name: 'LEP I', path: '/assets/certificates/leadership/LEP I.jpg' },
        { name: 'LEP II', path: '/assets/certificates/leadership/LEP II.jpg' },
        { name: 'Foundations to Communication Mastery', path: '/assets/certificates/leadership/Foundations to Communication Mastery.jpg' },
        { name: 'Leadership: Practical Leadership Skills', path: '/assets/certificates/leadership/Leadership- Practical Leadership Skills.jpg' },
        { name: 'Critical Thinking Strategies', path: '/assets/certificates/leadership/Critical Thinking Strategies For Better Decisions.jpg' },
        { name: 'LTI', path: '/assets/certificates/leadership/LTI.jpg' }
      ]
    },
    {
      name: 'Six Sigma',
      icon: 'bi-award-fill',
      certificates: [
        {
          name: 'Certified Lean Six Sigma Green Belt',
          path: '/assets/certificates/six-sigma/Six Sigma Green Belt.jpg',
          verificationUrl: 'https://www.virtualbadge.io/certificate-validator?credential=7e927163-052d-4e0f-a213-6b428d46d740'
        }
      ]
    },
    {
      name: 'AI & Blockchain',
      icon: 'bi-cpu-fill',
      certificates: [
        { name: 'Azure Fundamentals', path: '/assets/certificates/ai-blockchain/Achievements - Azure fundamental _ Microsoft.jpg' },
        { name: 'Certificate in AI Business Leadership', path: '/assets/certificates/ai-blockchain/Certificate in Al Business Leadership.jpg' },
        { name: 'Cursor: Complete AI-Powered Software Development Workflow', path: '/assets/certificates/ai-blockchain/Cursor- Complete Al- Powered Software Development Workflow.jpg' },
        { name: 'Blockchain Beyond the Basics', path: '/assets/certificates/ai-blockchain/Blockchain Beyond the Basics.jpg' },
        { name: 'Blockchain Basics', path: '/assets/certificates/ai-blockchain/Blockchain basics.png' }
      ]
    },
    {
      name: 'Programming',
      icon: 'bi-code-slash',
      certificates: [
        { name: 'C# Algorithms', path: '/assets/certificates/programming/C-sharp Algorithms.png' },
        { name: 'Applied Data Structures', path: '/assets/certificates/programming/Applied Data Structures.jpg' },
        { name: 'Best Practices for Developers', path: '/assets/certificates/programming/Best Practices for Developers.jpg' },
        { name: 'Complete Guide to Unit Testing', path: '/assets/certificates/programming/Complete Guide to Unit Testing in .NET Core (NUnit & XUnit).jpg' }
      ]
    },
    {
      name: 'MVP',
      icon: 'bi-trophy-fill',
      certificates: [
        {
          name: 'MVP 2024',
          path: '/assets/certificates/mvp/MVP 2024.jpg',
          verificationUrl: 'https://www.credly.com/users/rikam-palkar/badges#credly'
        },
        {
          name: 'MVP 2025',
          path: '/assets/certificates/mvp/MVP 2025.jpg',
          verificationUrl: 'https://www.credly.com/users/rikam-palkar/badges#credly'
        }
      ]
    },
    {
      name: 'UI',
      icon: 'bi-palette-fill',
      certificates: [
        { name: 'Introduction to Blazor', path: '/assets/certificates/ui/Introduction to Blazor.png' },
        { name: 'Build Real World App with .NET MAUI', path: '/assets/certificates/ui/Build Real World App with .NET MAUI.jpg' },
        { name: '.NET MAUI', path: '/assets/certificates/ui/NET MAUI.jpg' }
      ]
    },
    {
      name: 'Scrum',
      icon: 'bi-kanban-fill',
      certificates: [
        { name: 'Cert Prep Scrum Master', path: '/assets/certificates/scrum/Cert Prep Scrum Master.jpg' },
        { name: 'Scrum Essentials and Fundamentals', path: '/assets/certificates/scrum/Scrum Essentials and Scrum Fundamentals.jpg' },
        { name: 'Scrum Master Certification 2025', path: '/assets/certificates/scrum/Scrum Master Certification 2025 + Agile Scrum Certification.jpg' },
        { name: 'Scrum Master', path: '/assets/certificates/scrum/Scrum Master.jpg' },
        { name: 'Scrum Essentials', path: '/assets/certificates/scrum/Scrum essentials.jpg' }
      ]
    },
    {
      name: 'DevOps',
      icon: 'bi-gear-fill',
      certificates: [
        { name: 'Docker for .NET Developers', path: '/assets/certificates/devops/Docker for .Net Developers.jpg' }
      ]
    }
  ]

  const totalCertificates = categories.reduce((acc, cat) => acc + cat.certificates.length, 0)

  const getCurrentCertificate = (categoryIndex: number) => {
    const index = currentIndex[categoryIndex] || 0
    return categories[categoryIndex].certificates[index]
  }

  const navigateCertificate = (categoryIndex: number, direction: 'prev' | 'next') => {
    const category = categories[categoryIndex]
    const currentIdx = currentIndex[categoryIndex] || 0
    let newIndex = direction === 'next' ? currentIdx + 1 : currentIdx - 1
    
    if (newIndex < 0) newIndex = category.certificates.length - 1
    if (newIndex >= category.certificates.length) newIndex = 0
    
    setCurrentIndex({ ...currentIndex, [categoryIndex]: newIndex })
  }

  const openLightbox = (categoryIndex: number) => {
    setLightboxCategory(categoryIndex)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxCategory(null)
  }

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    if (!image.src.includes(CERT_PLACEHOLDER_PATH)) {
      image.src = CERT_PLACEHOLDER_PATH
    }
  }

  return (
    <section id="certificates" className="certificates">
      <div className="container">
        <div className="section-title">
          <h2>Certifications</h2>
          <p>Professional Achievements</p>
        </div>

        <div className="certificates-summary">
          <div className="summary-card">
            <div className="summary-icon">
              <i className="bi bi-star-fill"></i>
            </div>
            <div className="summary-content">
              <h3>2024 - 2025</h3>
              <p>Microsoft MVP</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <i className="bi bi-trophy-fill"></i>
            </div>
            <div className="summary-content">
              <h3>Certified</h3>
              <p>Leadership & AWS Solutions Architect</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <i className="bi bi-patch-check-fill"></i>
            </div>
            <div className="summary-content">
              <h3>{totalCertificates}</h3>
              <p>Certificates</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <i className="bi bi-collection-fill"></i>
            </div>
            <div className="summary-content">
              <h3>{categories.length}</h3>
              <p>Categories</p>
            </div>
          </div>
        </div>

        <div className="certificates-grid">
          {categories.map((category, categoryIndex) => {
            const cert = getCurrentCertificate(categoryIndex)
            const hasMultiple = category.certificates.length > 1

            return (
              <div key={categoryIndex} className={`certificate-card cert-category-${categoryIndex}`}>
                <div className="certificate-header">
                  <div className="cert-icon-wrapper">
                    <i className={`bi ${category.icon}`}></i>
                  </div>
                  <div className="cert-title-wrapper">
                    <h3>{category.name}</h3>
                    <span className="cert-count">
                      <i className="bi bi-stack"></i> {category.certificates.length} {category.certificates.length === 1 ? 'certificate' : 'certificates'}
                    </span>
                  </div>
                </div>

                <div className="certificate-preview" onClick={() => openLightbox(categoryIndex)}>
                  <img src={cert.path} alt={cert.name} onError={handleImageError} />
                  <div className="certificate-overlay">
                    <i className="bi bi-zoom-in"></i>
                    <span className="overlay-text">View Certificate</span>
                  </div>
                </div>

                {hasMultiple && (
                  <div className="certificate-navigation">
                    <button 
                      className="nav-btn prev" 
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateCertificate(categoryIndex, 'prev')
                      }}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <span className="nav-indicator">
                      {(currentIndex[categoryIndex] || 0) + 1} / {category.certificates.length}
                    </span>
                    <button 
                      className="nav-btn next" 
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateCertificate(categoryIndex, 'next')
                      }}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {lightboxOpen && lightboxCategory !== null && (
          <div className="certificate-lightbox" onClick={closeLightbox}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={closeLightbox}>
                <i className="bi bi-x-lg"></i>
              </button>

              {categories[lightboxCategory].certificates.length > 1 && (
                <>
                  <button 
                    className="lightbox-nav prev" 
                    onClick={() => navigateCertificate(lightboxCategory, 'prev')}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button 
                    className="lightbox-nav next" 
                    onClick={() => navigateCertificate(lightboxCategory, 'next')}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </>
              )}

              <div className="lightbox-certificate">
                <img 
                  src={getCurrentCertificate(lightboxCategory).path} 
                  alt={getCurrentCertificate(lightboxCategory).name} 
                  onError={handleImageError}
                />
              </div>

              <div className="lightbox-info">
                <h4>{getCurrentCertificate(lightboxCategory).name}</h4>
                {getCurrentCertificate(lightboxCategory).verificationUrl && (
                  <a
                    href={getCurrentCertificate(lightboxCategory).verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#18d26e', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                    Verify Certificate
                  </a>
                )}
                {categories[lightboxCategory].certificates.length > 1 && (
                  <span className="lightbox-indicator">
                    {(currentIndex[lightboxCategory] || 0) + 1} / {categories[lightboxCategory].certificates.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CertificatesSection
