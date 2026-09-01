const SkillsSection = () => {
  return (
    <section id="skills" className="about">
      <div className="skills container">
        <div className="section-title">
          <h2>Skills</h2>
        </div>

        <div className="row skills-content">
          <div className="col-lg-4 col-md-6">
            <h4 className="skill-category">Languages and Frameworks</h4>
            <ul className="skill-list">
              <li>C#</li>
              <li>.NET</li>
              <li>ASP.NET</li>
              <li>Entity Framework</li>
              <li>TypeScript</li>
              <li>JavaScript</li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h4 className="skill-category">Databases and APIs</h4>
            <ul className="skill-list">
              <li>MS SQL</li>
              <li>MySQL</li>
              <li>PostgreSQL</li>
              <li>SQLite</li>
              <li>Web API</li>
              <li>Keycloak</li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h4 className="skill-category">DevOps</h4>
            <ul className="skill-list">
              <li>Git</li>
              <li>Docker</li>
              <li>Azure DevOps</li>
              <li>TeamCity</li>
              <li>Perforce / TFS / SVN</li>
              <li>JIRA</li>
            </ul>
          </div>
        </div>

        <div className="row skills-content">
          <div className="col-lg-4 col-md-6">
            <h4 className="skill-category">Cloud and Architecture</h4>
            <ul className="skill-list">
              <li>AWS</li>
              <li>Azure</li>
              <li>Cloud Architecture</li>
              <li>Data Structures and Algorithms</li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h4 className="skill-category">UI</h4>
            <ul className="skill-list">
              <li>React</li>
              <li>WPF</li>
              <li>Blazor</li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h4 className="skill-category">Professional Skills</h4>
            <ul className="skill-list">
              <li>Leadership</li>
              <li>Client Demos</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SkillsSection
