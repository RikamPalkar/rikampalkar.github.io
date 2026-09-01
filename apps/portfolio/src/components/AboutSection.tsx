const AboutSection = () => {
  return (
  <section id="about" className="about">
    <div className="about-me container">
      <div className="section-title">
        <h2>About me</h2>
      </div>

      <div className="row">
        <div className="col-lg-4" data-aos="fade-right">
          <img src="/assets/img/me.png" className="img-fluid" alt="" />
        </div>
        <div className="col-lg-8 pt-4 pt-lg-0 content" data-aos="fade-left">
          <h3>SOFTWARE ENGINEER | ARCHITECT</h3>
          <div className="row">
            <div className="col-lg-12">
              <ul>
                <li>
                  <i className="bi bi-chevron-right" /> <strong>My books:</strong>{' '}
                  <span>
                    <a href="https://amzn.eu/d/bJZtOPK" target="_blank" rel="noreferrer">
                      Blazor Simplified
                    </a>
                    , <a
                      href="https://www.c-sharpcorner.com/ebooks/wpf-simplified-build-windows-apps-using-csharp-and-xaml"
                      target="_blank"
                      rel="noreferrer"
                    >
                      WPF Simplified
                    </a>
                  </span>
                </li>
                <li>
                  <i className="bi bi-chevron-right" /> <strong>Research paper:</strong>{' '}
                  <span>
                    <a
                      href="https://www.isroset.org/pub_paper/IJSRCSE/8-IJSRCSE-0939.pdf"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Vulnerability Management in Complex Networks
                    </a>
                  </span>
                </li>
                <li>
                  <i className="bi bi-chevron-right" /> <strong>Award:</strong>{' '}
                  <span>
                    <a
                      href="https://mvp.microsoft.com/en-US/mvp/profile/b5021ca6-c3e6-4e38-bf50-8a4e1520ebc1"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Microsoft Most Valuable Professional
                    </a>
                    , <a
                      href="https://www.c-sharpcorner.com/members/rikam-palkar"
                      target="_blank"
                      rel="noreferrer"
                    >
                      C#Corner Most Valuable Professional
                    </a>
                  </span>
                </li>
                <li>
                  <i className="bi bi-chevron-right" /> <strong>Certificate:</strong>{' '}
                  <span>
                    <a
                      href="https://www.credly.com/badges/84ea6f8d-a763-4d37-8a7c-92b43ff97958"
                      target="_blank"
                      rel="noreferrer"
                    >
                      AWS Solutions Architect
                    </a>
                  </span>
                </li>
                <li>
                  <i className="bi bi-chevron-right" /> <strong>Medium:</strong>{' '}
                  <span>
                    <a href="https://medium.com/@RikamPalkar" target="_blank" rel="noreferrer">
                      Verified Author
                    </a>
                  </span>
                </li>
                <li>
                  <i className="bi bi-chevron-right" /> <strong>Linkedin:</strong>{' '}
                  <span>
                    <a
                      href="https://www.linkedin.com/in/rikampalkar/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Top Voice
                    </a>
                  </span>
                </li>
                <li>
                  <i className="bi bi-chevron-right" /> <strong>College:</strong> <span><a href="https://vjti.ac.in" target="_blank" rel="noreferrer" style={{ color: '#18d26e' }}>VJTI</a></span>
                </li>
                <li>
                  <i className="bi bi-chevron-right" /> <strong>Education:</strong>
                  <ul className="education-list">
                    <li>
                      <a href="https://vjti.ac.in/master-of-computer-applications/" target="_blank" rel="noreferrer" style={{ color: '#18d26e' }}>
                        Master of Computer Applications (MCA)
                      </a>
                    </li>
                    <li style={{ color: '#18d26e' }}>Bachelor of Science in Information Technology (BSc IT)</li>
                    <li>
                      <a
                        href="https://edu.gtf.pt/pluginfile.php/1/tool_certificate/issues/1774859707/7342009267RP.pdf"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#18d26e' }}
                      >
                        Executive Diploma in Leadership and Management, Lisbon, Portugal
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.virtualbadge.io/certificate-validator?credential=7e927163-052d-4e0f-a213-6b428d46d740"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#18d26e' }}
                      >
                        Certified Lean Six Sigma Green Belt, Amsterdam, Netherlands
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)}

export default AboutSection

