interface Credential {
  name: string
  url: string
  icon?: string
  color: string
  category: 'mvp' | 'community' | 'platform' | 'company' | 'creator' | 'stats' | 'certification'
  imageSrc?: string
}

const CredentialsSection = () => {
  const credentials: Credential[] = [
    // MVP & Recognition
    {
      name: 'Microsoft MVP',
      url: 'https://mvp.microsoft.com/en-US/mvp/profile/b994c0e7-dce5-ed11-8f6d-000d3a560942',
      icon: 'bi-microsoft',
      color: '#00a4ef',
      category: 'mvp'
    },
    {
      name: 'C# Corner MVP',
      url: 'https://www.c-sharpcorner.com/members/rikam-palkar',
      icon: 'bi-trophy-fill',
      color: '#18d26e',
      category: 'mvp'
    },
    // Community Builder Programs
    {
      name: 'AWS Community Builder',
      url: 'https://builder.aws.com/community/@rikam',
      icon: 'bi-cloud-fill',
      color: '#ff9900',
      category: 'community'
    },
    {
      name: 'AWS Solutions Architect',
      url: 'https://www.credly.com/users/rikam-palkar',
      icon: 'bi-award',
      color: '#ff9900',
      category: 'platform'
    },
    // Publishing Platforms
    {
      name: 'Verified Author',
      url: 'https://medium.com/@RikamPalkar',
      icon: 'bi-medium',
      color: '#00ab6c',
      category: 'platform'
    },
    {
      name: 'LinkedIn Top Voice',
      url: 'https://www.linkedin.com/in/rikampalkar/',
      icon: 'bi-linkedin',
      color: '#0077b5',
      category: 'platform'
    },
    {
      name: 'Starstruck',
      url: 'https://github.com/RikamPalkar/DSA-Simplified',
      icon: 'bi-github',
      color: '#ffffff',
      category: 'platform'
    },
    {
      name: 'ISROSET - Research Paper',
      url: 'https://www.isroset.org/pub_paper/IJSRCSE/8-IJSRCSE-0939.pdf',
      icon: 'bi-file-earmark-text',
      color: '#8e44ad',
      category: 'platform'
    },
    {
      name: 'Amazon - Published Book',
      url: 'https://www.amazon.in/dp/B0CBCKB32W?ref_=cm_sw_r_cp_ud_dp_1XGFMN7DHGSTBV3K8C49',
      icon: 'bi-book',
      color: '#ff9900',
      category: 'company'
    },
    // Stats
    {
      name: 'Instagram\n1 Million',
      url: 'https://www.instagram.com/dsa_simplified/?hl=en',
      icon: 'bi-instagram',
      color: '#e4405f',
      category: 'stats'
    },
    {
      name: 'YouTube\n100K',
      url: 'https://www.youtube.com/channel/UCqJ-tIcAuRqcuA0OZ1A3EVw',
      icon: 'bi-youtube',
      color: '#ff0000',
      category: 'stats'
    },
    {
      name: 'Article Reads\n5 Million',
      url: 'https://medium.com/@RikamPalkar',
      icon: 'bi-file-earmark-text',
      color: '#18d26e',
      category: 'stats'
    },
    // Certifications
    {
      name: 'Leadership',
      url: 'https://edu.gtf.pt/pluginfile.php/1/tool_certificate/issues/1774859707/7342009267RP.pdf',
      color: '#18d26e',
      category: 'certification',
      imageSrc: '/assets/img/Diploma logo.png?v=2'
    },
    {
      name: 'Six Sigma Green Belt',
      url: 'https://www.virtualbadge.io/certificate-validator?credential=7e927163-052d-4e0f-a213-6b428d46d740',
      color: '#18d26e',
      category: 'certification',
      imageSrc: '/assets/img/SixSigma logo.png'
    }
  ]

  return (
    <section id="credentials" className="credentials-section">
      <div className="container">
        <div className="section-title">
          <h2>Recognition & Community</h2>
        </div>

        <div className="credentials-grid">
          {credentials.map((credential, index) => (
            <a
              key={index}
              href={credential.url}
              target="_blank"
              rel="noreferrer"
              className={`credential-item ${credential.category}`}
              title={credential.name}
            >
              {credential.imageSrc ? (
                <div className="credential-icon" style={{ color: credential.color }}>
                  <img src={credential.imageSrc} alt={credential.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                </div>
              ) : (
                <div className="credential-icon" style={{ color: credential.color }}>
                  <i className={credential.icon}></i>
                </div>
              )}
              <span className="credential-name">
                {credential.name.includes('\n') ? (
                  credential.name.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))
                ) : (
                  credential.name
                )}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CredentialsSection
