const ResumeSection = () => (
  <section id="resume" className="resume">
    <div className="container">
      <div className="section-title">
        <h2>Resume</h2>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <h3 className="resume-title">Summary</h3>
          <div className="resume-item pb-0">
            <p>
                Software Engineer with 7+ years of experience building enterprise-grade web and desktop applications across diverse technologies and domains. Full-stack developer experienced in designing scalable microservices and event-driven applications deployed across AWS and Azure environments.
            </p>
            <p>
                Delivered high-quality solutions with strong ownership, technical depth, and consistent results while collaborating and leading global teams throughout India, the US, Europe, and Canada.
            </p>
            <p>
                Recognized as a Microsoft MVP and AWS Certified Solutions Architect, awarded by Microsoft, C# Corner, and GitHub.
            </p>
          </div>

          <h3 className="resume-title" style={{marginTop: '30px'}}>Education</h3>
          <div className="resume-item">
            <h4>Executive Diploma in Leadership and Management</h4>
            <h5><span className="company-name">Institute of Management, Technology and Finance (GTFI Instituto), Lisbon, Portugal</span> <span className="date-range">Sep 2025 - Mar 2026</span></h5>
            <p>
              <a
                href="https://edu.gtf.pt/pluginfile.php/1/tool_certificate/issues/1774859707/7342009267RP.pdf"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#18d26e', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                Verify Certificate
              </a>
            </p>
          </div>

          <div className="resume-item">
            <h4>Certified Lean Six Sigma Green Belt</h4>
            <h5><span className="company-name">SSAA (Six Sigma Academy Amsterdam), Amsterdam, Netherlands</span> <span className="date-range">Apr 2026</span></h5>
            <p>
              <a
                href="https://www.virtualbadge.io/certificate-validator?credential=7e927163-052d-4e0f-a213-6b428d46d740"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#18d26e', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                Verify Certificate
              </a>
            </p>
          </div>

          <div className="resume-item">
            <h4><a href="https://vjti.ac.in/master-of-computer-applications/" target="_blank" rel="noreferrer" style={{ color: '#18d26e', textDecoration: 'none' }}>Master of Computer Applications</a></h4>
            <h5><span className="company-name"><a href="https://vjti.ac.in" target="_blank" rel="noreferrer" style={{ color: '#18d26e', textDecoration: 'none' }}>VJTI</a>, Mumbai</span> <span className="date-range">2015 - 2018</span></h5>
          </div>

          <div className="resume-item">
            <h4>BSc (IT)</h4>
            <h5><span className="company-name">Mumbai University</span> <span className="date-range">2010 - 2013</span></h5>
          </div>

          <h3 className="resume-title" style={{marginTop: '30px'}}>Skills</h3>
          <div className="skills-showcase">
            <div className="skill-category">
              <div className="skill-category-header">
                <i className="bi bi-code-slash"></i>
                <h4>Languages & Frameworks</h4>
              </div>
              <div className="skill-tags">
                <span className="skill-tag csharp">C#</span>
                <span className="skill-tag dotnet">.NET</span>
                <span className="skill-tag dotnet">ASP.NET</span>
                <span className="skill-tag dotnet">Entity Framework</span>
                <span className="skill-tag typescript">TypeScript</span>
                <span className="skill-tag javascript">JS</span>
              </div>
            </div>

            <div className="skill-category">
              <div className="skill-category-header">
                <i className="bi bi-database"></i>
                <h4>Databases & APIs</h4>
              </div>
              <div className="skill-tags">
                <span className="skill-tag database">MS SQL</span>
                <span className="skill-tag database">MySQL</span>
                <span className="skill-tag database">PostgreSQL</span>
                <span className="skill-tag database">SQLite</span>
                <span className="skill-tag api">Web API</span>
                <span className="skill-tag api">Keycloak</span>
              </div>
            </div>

            <div className="skill-category">
              <div className="skill-category-header">
                <i className="bi bi-gear-fill"></i>
                <h4>DevOps</h4>
              </div>
              <div className="skill-tags">
                <span className="skill-tag devops">Git</span>
                <span className="skill-tag devops">Docker</span>
                <span className="skill-tag devops">Azure DevOps</span>
                <span className="skill-tag devops">TeamCity</span>
                <span className="skill-tag devops">Perforce</span>
                <span className="skill-tag devops">JIRA</span>
              </div>
            </div>

            <div className="skill-category">
              <div className="skill-category-header">
                <i className="bi bi-cloud-fill"></i>
                <h4>Cloud & Architecture</h4>
              </div>
              <div className="skill-tags">
                <span className="skill-tag aws">AWS</span>
                <span className="skill-tag azure">Azure</span>
                <span className="skill-tag cloud">Cloud Architecture</span>
                <span className="skill-tag algo">Data Structures</span>
                <span className="skill-tag algo">Algorithms</span>
              </div>
            </div>

            <div className="skill-category">
              <div className="skill-category-header">
                <i className="bi bi-palette-fill"></i>
                <h4>UI Frameworks</h4>
              </div>
              <div className="skill-tags">
                <span className="skill-tag react">React</span>
                <span className="skill-tag wpf">WPF</span>
                <span className="skill-tag blazor">Blazor</span>
              </div>
            </div>

            <div className="skill-category">
              <div className="skill-category-header">
                <i className="bi bi-people-fill"></i>
                <h4>Professional</h4>
              </div>
              <div className="skill-tags">
                <span className="skill-tag professional">Leadership</span>
                <span className="skill-tag professional">Client Demos</span>
                <span className="skill-tag professional">Team Collaboration</span>
              </div>
            </div>
          </div>

        </div>

        <div className="col-lg-6">
          <h3 className="resume-title">Professional Experience</h3>
          <div className="resume-item">
            <h4><span className="company-name">Weatherford</span> <span className="separator">·</span> <span className="job-title">Sr. SDE II Team Lead</span> <span className="separator">·</span> <span className="date-range">Apr 2021 - Present</span></h4>
            
            <div className="project-section">
              <div className="project-header">
                <span className="project-name">StrataCore</span>
              </div>
              <div className="project-subtitle"><i className="bi bi-robot"></i> Context Aware RAG AI</div>
              <p>
                Architected and built a highly scalable application, StrataCore, a Generative AI platform powered by LLM and RAG on AWS using Bedrock and SageMaker. Developed the frontend in React and TypeScript deployed on S3 and the backend in .NET deployed on EKS, with secure authentication via Keycloak and Cognito.
              </p>
              <p>
                Designed and implemented CI/CD pipelines in Azure DevOps and built event-driven workflows using AWS Lambda and SQS, reducing inter-service latency by 30%.
              </p>
              
              <div className="project-skills">
              <div className="skill-badges">
                <span className="skill-badge">AWS</span>
                <span className="skill-badge">Cloud Architecture</span>
                <span className="skill-badge">React</span>
                <span className="skill-badge">TypeScript</span>
                <span className="skill-badge">C#</span>
                <span className="skill-badge">.NET</span>
                <span className="skill-badge">MS SQL</span>
                <span className="skill-badge">ASP.NET</span>
                <span className="skill-badge">Keycloak</span>
                <span className="skill-badge">Azure DevOps</span>
                <span className="skill-badge">Git</span>
                <span className="skill-badge">JIRA</span>
              </div>
              </div>
            </div>

            <div className="project-section">
              <div className="project-header">
                <span className="project-name">CygNet</span> <a href="https://www.weatherford.com/documents/brochure/products-and-services/software/cygnet-scada-platform/" target="_blank" rel="noreferrer" className="project-link"><i className="bi bi-box-arrow-up-right"></i></a>
              </div>
              <div className="project-subtitle"><i className="bi bi-download"></i> 460,000+ Wells</div>
              <p>
                Developed and maintained CygNet, a real time platform for collecting and distributing operational data across oil and gas assets. Built features as a full stack developer for the Canvas desktop app and Thin Web Client, and supported client demos.
              </p>
              <p>
                Led distributed teams across India, the United States, Canada, and Europe. Modernized the platform by migrating WPF components to React and breaking monoliths into AWS microservices, improving scalability and resilience.
              </p>
              
              <div className="project-skills">
              <div className="skill-badges">
                <span className="skill-badge">C#</span>
                <span className="skill-badge">.NET</span>
                <span className="skill-badge">React</span>
                <span className="skill-badge">WPF</span>
                <span className="skill-badge">Blazor</span>
                <span className="skill-badge">Azure DevOps</span>
                <span className="skill-badge">PostgreSQL</span>
                <span className="skill-badge">Git</span>
                <span className="skill-badge">JIRA</span>
                <span className="skill-badge">Perforce</span>
                <span className="skill-badge">Leadership</span>
              </div>
              </div>
            </div>
          </div>

          <div className="resume-item">
            <h4><span className="company-name">Datamatics</span> <span className="separator">·</span> <span className="job-title">Software Engineer</span> <span className="separator">·</span> <span className="date-range">Oct 2019 - Apr 2021</span></h4>
            
            <div className="project-section">
              <div className="project-header">
                <span className="project-name">Mumbai and Lucknow Metro</span> <a href="https://mmrcl.com/en" target="_blank" rel="noreferrer" className="project-link"><i className="bi bi-box-arrow-up-right"></i></a> <a href="https://www.datamatics.com/hubfs/Case%20study%202023/Mumbai-Metro-Lines-2A%2C-2B-&-7-get-Automated-Fare-Collection-System-for-Enhanced-Accessibility-to-Commuters-1.pdf" target="_blank" rel="noreferrer" className="project-link"><i className="bi bi-box-arrow-up-right"></i></a> <a href="https://www.datamatics.com/hubfs/Updated%20Brochures%202024/Datamatics-AFC-Solution-for-Lucknow-Metro.pdf" target="_blank" rel="noreferrer" className="project-link"><i className="bi bi-box-arrow-up-right"></i></a>
              </div>
              <p>
                Designed and developed WPF desktop applications for metro ticketing systems and kiosks, improving ticket booking speed by 40%. Delivered a paper QR based contactless ticketing solution during COVID and built fare gate libraries that processed tickets in 8 to 10 seconds per passenger, reducing peak hour wait times.
              </p>
              
              <div className="project-skills">
              <div className="skill-badges">
                <span className="skill-badge">C#</span>
                <span className="skill-badge">.NET</span>
                <span className="skill-badge">WPF</span>
                <span className="skill-badge">Entity Framework</span>
                <span className="skill-badge">REST</span>
                <span className="skill-badge">SVN</span>
                <span className="skill-badge">MQTT</span>
              </div>
              </div>
            </div>
          </div>

          <div className="resume-item">
            <h4><span className="company-name">Pi Technologies</span> <span className="separator">·</span> <span className="job-title">Software Developer</span> <span className="separator">·</span> <span className="date-range">Jul 2018 - Sep 2019</span></h4>
            
            <div className="project-section">
              <div className="project-header">
                <span className="project-name">ShipSure</span> <a href="https://shipsure.com/" target="_blank" rel="noreferrer" className="project-link"><i className="bi bi-box-arrow-up-right"></i></a>
              </div>
              <p>
                Developed a crew management application for seafarers. Built a reusable UI framework using Telerik controls, standardizing components across projects and reducing UI development time by 50%.
              </p>
              
              <div className="project-skills">
              <div className="skill-badges">
                <span className="skill-badge">WPF</span>
                <span className="skill-badge">WCF</span>
                <span className="skill-badge">C#</span>
                <span className="skill-badge">.NET</span>
                <span className="skill-badge">TFS</span>
              </div>
              </div>
            </div>
          </div>

          <div className="resume-item">
            <h4><span className="company-name">Texas Instruments</span> <span className="separator">·</span> <span className="job-title">Intern</span> <span className="separator">·</span> <span className="date-range">Jan 2018 - Jun 2018</span></h4>
            
            <div className="project-section">
              <div className="project-header">
                <span className="project-name">Vulnerability Dashboard</span>
              </div>
              <p>
                Developed a vulnerability tracking portal and security dashboards, improving visibility into vulnerabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default ResumeSection

