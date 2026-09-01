const FooterSection = () => (
  <footer id="footer" className="footer">
    <div className="container">
      <div className="footer-content">
        <div className="footer-stats">
          <div className="stat-item">
            <i className="bi bi-instagram" />
            <h4>Instagram</h4>
            <p>1 Million</p>
          </div>
          <div className="stat-item">
            <i className="bi bi-youtube" />
            <h4>YouTube</h4>
            <p>100K</p>
          </div>
          <div className="stat-item">
            <i className="bi bi-book" />
            <h4>Article Reads</h4>
            <p>5 Million</p>
          </div>
        </div>

        <div className="footer-badges">
          <h4 style={{ color: '#18d26e', marginBottom: '15px' }}>Certifications</h4>
          <div className="badge-container" style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://edu.gtf.pt/pluginfile.php/1/tool_certificate/issues/1774859707/7342009267RP.pdf" target="_blank" rel="noreferrer" title="MTF Institute, Lisbon">
              <img src="/assets/img/Diploma logo.png" alt="MTF Institute" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            </a>
            <a href="https://www.virtualbadge.io/certificate-validator?credential=7e927163-052d-4e0f-a213-6b428d46d740" target="_blank" rel="noreferrer" title="Six Sigma Academy, Amsterdam">
              <img src="/assets/img/SixSigma logo.png" alt="Six Sigma Academy" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            </a>
          </div>
        </div>

        <div className="footer-copyright" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
          <p>&copy; {new Date().getFullYear()} Rikam Palkar. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
)

export default FooterSection
