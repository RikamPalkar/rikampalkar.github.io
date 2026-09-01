import { useState } from 'react'

const Header = () => {
  const [mobileNavActive, setMobileNavActive] = useState(false)

  const toggleMobileNav = () => {
    setMobileNavActive(!mobileNavActive)
  }

  return (
  <header id="header">
    <div className="container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <a href="#header">Rikam Palkar</a>
        <a 
          href="https://medium.com/@RikamPalkar" 
          target="_blank" 
          rel="noreferrer"
          title="Verified Book Author"
          style={{ 
            color: '#18d26e', 
            fontSize: '32px', 
            lineHeight: '1',
            transition: 'color 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            marginTop: '8px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#149ddd'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#18d26e'}
        >
          <i className="bi bi-patch-check-fill" />
        </a>
      </h1>
      <h2 className="hero-badge-line">
        Microsoft MVP
      </h2>
      <h2 className="hero-badge-line">
        AWS Solutions Architect
      </h2>
      <h2 className="hero-badge-line">
        Award Winning &amp; Verified Author
      </h2>
      <h2 className="hero-badge-line">
        2 Books & 200+ Articles Published
      </h2>

      <nav id="navbar" className={`navbar${mobileNavActive ? ' navbar-mobile' : ''}`}>
        <ul>
          <li>
            <a className="nav-link active" href="#header" onClick={() => setMobileNavActive(false)}>
              Home
            </a>
          </li>
          <li>
            <a className="nav-link" href="#about" onClick={() => setMobileNavActive(false)}>
              About
            </a>
          </li>
          <li>
            <a className="nav-link" href="#resume" onClick={() => setMobileNavActive(false)}>
              Resume
            </a>
          </li>
          <li>
            <a className="nav-link" href="#journey" onClick={() => setMobileNavActive(false)}>
              Journey
            </a>
          </li>
          <li>
            <a className="nav-link" href="#certificates" onClick={() => setMobileNavActive(false)}>
              Certificates
            </a>
          </li>
          <li>
            <a className="nav-link" href="#github" onClick={() => setMobileNavActive(false)}>
              GitHub
            </a>
          </li>
          <li>
            <a className="nav-link" href="#services" onClick={() => setMobileNavActive(false)}>
              Projects
            </a>
          </li>
          <li>
            <a className="nav-link" href="#contact" onClick={() => setMobileNavActive(false)}>
              Contact
            </a>
          </li>
        </ul>
        <i className="bi bi-list mobile-nav-toggle" onClick={toggleMobileNav} />
      </nav>

      <div className="social-links">
        <a href="https://amzn.eu/d/bJZtOPK" className="book" target="_blank" rel="noreferrer">
          <i className="bi bi-book" />
        </a>
        <a href="/tictactoe" className="controller" target="_blank" rel="noreferrer">
          <i className="bi bi-controller" />
        </a>
        <a href="https://github.com/RikamPalkar" className="github" target="_blank" rel="noreferrer">
          <i className="bi bi-github" />
        </a>
        <a href="https://leetcode.com/Rikam/" className="code-square" target="_blank" rel="noreferrer">
          <i className="bi bi-code-square" />
        </a>
        <a href="https://medium.com/@RikamPalkar" className="medium" target="_blank" rel="noreferrer">
          <i className="bi bi-medium" />
        </a>
      </div>

      <div className="social-links">
        <a
          href="https://www.linkedin.com/in/rikampalkar/"
          className="linkedin"
          target="_blank"
          rel="noreferrer"
        >
          <i className="bi bi-linkedin" />
        </a>
        <a
          href="https://www.c-sharpcorner.com/members/rikam-palkar"
          className="journal-text"
          target="_blank"
          rel="noreferrer"
        >
          <i className="bi bi-journal-text" />
        </a>
        <a
          href="https://www.instagram.com/dsa_simplified/?hl=en"
          className="instagram"
          target="_blank"
          rel="noreferrer"
        >
          <i className="bi bi-instagram" />
        </a>
        <a
          href="https://www.youtube.com/channel/UCqJ-tIcAuRqcuA0OZ1A3EVw"
          className="youtube"
          target="_blank"
          rel="noreferrer"
        >
          <i className="bi bi-youtube" />
        </a>
        <a href="https://twitter.com/rikam_cz" className="twitter" target="_blank" rel="noreferrer">
          <i className="bi bi-twitter" />
        </a>
      </div>

      <p className="credly-link">
        <a
          href="https://www.credly.com/users/rikam-palkar/badges#credly"
          target="_blank"
          rel="noreferrer"
        >
          <span>View my certifications on Credly</span>
        </a>
      </p>

      <p className="credly-link" style={{ marginTop: '10px' }}>
        <a
          href="https://rikampalkar.github.io/ChroNiyam/"
          target="_blank"
          rel="noreferrer"
        >
          <span>ChroNiyam - Master your time</span>
        </a>
      </p>

      <div className="mobile-badge-icons" style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <a className="badge-tooltip" data-tooltip="Microsoft MVP" href="https://mvp.microsoft.com/en-US/mvp/profile/b5021ca6-c3e6-4e38-bf50-8a4e1520ebc1" target="_blank" rel="noreferrer" title="Microsoft MVP">
          <img src="/assets/img/MVP.png" alt="Microsoft MVP" style={{ width: '55px', height: '55px' }} />
        </a>
        <a className="badge-tooltip" data-tooltip="AWS Solutions Architect" href="https://www.credly.com/badges/84ea6f8d-a763-4d37-8a7c-92b43ff97958" target="_blank" rel="noreferrer" title="AWS Solutions Architect">
          <img src="/assets/img/AWS.png" alt="AWS Solutions Architect" style={{ width: '55px', height: '55px' }} />
        </a>
        <a className="badge-tooltip" data-tooltip="MTF Institute, Lisbon, Portugal" href="https://edu.gtf.pt/pluginfile.php/1/tool_certificate/issues/1774859707/7342009267RP.pdf" target="_blank" rel="noreferrer" title="MTF Institute, Lisbon, Portugal">
          <img src="/assets/img/Diploma logo.png?v=2" alt="MTF Institute" style={{ width: '55px', height: '55px' }} />
        </a>
        <a className="badge-tooltip" data-tooltip="Six Sigma Academy Amsterdam, Netherlands" href="https://www.virtualbadge.io/certificate-validator?credential=7e927163-052d-4e0f-a213-6b428d46d740" target="_blank" rel="noreferrer" title="Six Sigma Academy Amsterdam, Netherlands">
          <img src="/assets/img/SixSigma logo.png" alt="Six Sigma Green Belt" style={{ width: '55px', height: '55px' }} />
        </a>
      </div>
    </div>
  </header>
  )
}

export default Header

