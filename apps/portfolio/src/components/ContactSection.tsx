const ContactSection = () => (
  <section id="contact" className="contact">
    <div className="container">
      <div className="section-title">
        <h2>Contact</h2>
        <p>Contact Me</p>
      </div>

      <div className="row mt-2">
        <div className="col-md-6 d-flex align-items-stretch">
          <div className="info-box">
            <i className="bx bx-map" />
            <h3>My Address</h3>
            <p>Mumbai, India</p>
          </div>
        </div>

        <div className="col-md-6 mt-4 mt-md-0 d-flex align-items-stretch">
          <div className="info-box">
            <i className="bx bi-person-check" />
            <h3>Connect with me</h3>
            <div className="social-links">
              <a href="https://www.linkedin.com/in/rikampalkar/" className="linkedin">
                <i className="bi bi-linkedin" />
              </a>
              <a href="https://twitter.com/rikam_cz" className="twitter">
                <i className="bi bi-twitter" />
              </a>
              <a href="https://www.instagram.com/dsa_simplified/?hl=en" className="instagram">
                <i className="bi bi-instagram" />
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-6 mt-4 d-flex align-items-stretch">
          <div className="info-box">
            <i className="bx bx-envelope" />
            <h3>Email Me</h3>
            <p>rikampalkar@gmail.com</p>
          </div>
        </div>
        <div className="col-md-6 mt-4 d-flex align-items-stretch">
          <div className="info-box">
            <i className="bx bi-robot" />
            <h3>Let's code together</h3>
            <div className="social-links">
              <a href="https://leetcode.com/Rikam/" className="code-square">
                <i className="bi bi-code-square" />
              </a>
              <a href="https://github.com/RikamPalkar" className="github">
                <i className="bi bi-github" />
              </a>
              <a href="https://medium.com/@RikamPalkar" className="medium">
                <i className="bi bi-medium" />
              </a>
              <a href="https://www.c-sharpcorner.com/members/rikam-palkar/" className="journal-text">
                <i className="bi bi-journal-text" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default ContactSection

