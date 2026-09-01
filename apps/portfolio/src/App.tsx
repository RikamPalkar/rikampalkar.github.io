import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import AboutSection from './components/AboutSection'
import ResumeSection from './components/ResumeSection'
import JourneySection from './components/JourneySection'
import CertificatesSection from './components/CertificatesSection'
import GitHubReposSection from './components/GitHubReposSection'
import ArticlesSection from './components/ArticlesSection'
import ProjectsSection from './components/ProjectsSection'
import ContactSection from './components/ContactSection'
import CredentialsSection from './components/CredentialsSection'
import Alankrita from './components/Alankrita'

function App() {
  return (
    <>
      <Header />
      <main id="main">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <AboutSection />
                <ProjectsSection />
                <GitHubReposSection />
                <ArticlesSection />
                <CertificatesSection />
                <ResumeSection />
                <JourneySection />
                <ContactSection />
                <CredentialsSection />
              </>
            }
          />
          <Route path="/Alankrita" element={<Alankrita />} />
        </Routes>
      </main>
    </>
  )
}

export default App
