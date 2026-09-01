import { useState } from 'react'

type GuideModalProps = {
  isOpen: boolean
  onClose: () => void
}

const GuideModal = ({ isOpen, onClose }: GuideModalProps) => {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const steps = [
    {
      title: 'Prioritize. Focus. Achieve',
      content: (
        <>
          <div className="guide-name-intro">
            <div className="name-explanation">
              <h3 className="brand-name">Chro<span className="hindi-text">नियम</span></h3>
              <div className="name-breakdown">
                <div className="name-part">
                  <strong>Chro</strong>
                  <span className="name-meaning">God of Time (Greek: Chronos)</span>
                </div>
                <div className="name-plus">+</div>
                <div className="name-part">
                  <strong>नियमः (niyamaḥ)</strong>
                  <span className="name-meaning">Discipline (Sanskrit)</span>
                </div>
              </div>
            </div>
            <p className="name-tagline"><strong>= Master Time Through Discipline</strong></p>
          </div>
          <div className="guide-highlight">
            <p>ChroNiyam represents the perfect balance between time management principles and disciplined execution.</p>
          </div>
        </>
      )
    },
    {
      title: 'Welcome to ChroNiyam',
      content: (
        <>
          <p><strong>ChroNiyam</strong> helps you master time management using the proven <strong>Eisenhower Matrix</strong> framework.</p>
          <p>Prioritize tasks based on urgency and importance, focusing your energy on what truly matters.</p>
          <div className="guide-highlight">
            <p><strong>Why ChroNiyam?</strong></p>
            <div className="guide-checklist">
              <div>✓ Organize tasks by priority</div>
              <div>✓ Allocate time effectively</div>
              <div>✓ Prevent burnout by balancing work and life</div>
              <div>✓ Track hours across your schedule</div>
            </div>
          </div>
        </>
      )
    },
    {
      title: 'Understanding the 4 Quadrants',
      content: (
        <>
          <p>The Eisenhower Matrix divides tasks into four categories:</p>
          <div className="quadrant-guide">
            <div className="guide-quadrant q1">
              <h4>Q1: Urgent & Important</h4>
              <p><strong>Do First</strong> - Crises, deadlines, emergencies</p>
              <p className="guide-tip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Minimize time here to reduce stress
              </p>
            </div>
            <div className="guide-quadrant q2">
              <h4>Q2: Important & Not Urgent</h4>
              <p><strong>Schedule</strong> - Planning, learning, relationships</p>
              <p className="guide-tip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Focus most of your time here
              </p>
            </div>
            <div className="guide-quadrant q3">
              <h4>Q3: Urgent & Not Important</h4>
              <p><strong>Delegate</strong> - Interruptions, some calls/emails</p>
              <p className="guide-tip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delegate if possible
              </p>
            </div>
            <div className="guide-quadrant q4">
              <h4>Q4: Not Urgent & Not Important</h4>
              <p><strong>Eliminate</strong> - Time wasters, distractions</p>
              <p className="guide-tip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Limit or remove these
              </p>
            </div>
          </div>
        </>
      )
    },
    {
      title: 'Getting Started: 3 Simple Steps',
      content: (
        <>
          <div className="guide-steps">
            <div className="guide-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Plan Your Time Window</h4>
                <p>Click the <strong>lightning bolt icon</strong> to set your planning period (week/month/custom) and daily working hours.</p>
                <p className="step-detail">Example: Plan for 1 week with 8 hours/day = 56 total hours</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Add Your Tasks</h4>
                <p>Click the <strong>+ icon</strong> to create tasks. Each task needs:</p>
                <ul>
                  <li>Title and quadrant (where it belongs)</li>
                  <li>Start and due dates</li>
                  <li>Estimated hours to complete</li>
                </ul>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>View & Adjust</h4>
                <p>Click the <strong>calendar icon</strong> to see your daily schedule and make adjustments as needed.</p>
                <p className="step-detail">The app prevents overbooking and helps you allocate time realistically.</p>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      title: 'Key Features',
      content: (
        <>
          <div className="guide-features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4>Smart Time Allocation</h4>
                <p>Automatically prevents you from overcommitting hours beyond your daily capacity.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h4>Calendar View</h4>
                <p>Visualize your schedule day-by-day with color-coded tasks by quadrant.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3v3m0 12v3M3 12h3m12 0h3M6.34 6.34l2.12 2.12m7.07 7.07l2.12 2.12M6.34 17.66l2.12-2.12m7.07-7.07l2.12-2.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <h4>Balance Mode</h4>
                <p>Toggle balance view to analyze task distribution and ensure Q2 (Important) gets priority.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
              <div>
                <h4>Help Mode</h4>
                <p>Enable tooltips throughout the app for contextual guidance on any feature.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 2v4M7 2v4M3 8h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4>Recurring Tasks</h4>
                <p>Mark tasks as recurring to allocate time for them every day in your date range.</p>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      title: 'Best Practices',
      content: (
        <>
          <div className="guide-tips">
            <div className="tip-card tip-success">
              <h4>✓ Do This</h4>
              <ul>
                <li>Spend 60-70% of your time in Q2 (Important & Not Urgent)</li>
                <li>Review and adjust your plan weekly</li>
                <li>Be realistic with time estimates</li>
                <li>Schedule breaks and personal time</li>
                <li>Use recurring tasks for daily habits</li>
              </ul>
            </div>
            <div className="tip-card tip-warning">
              <h4>✗ Avoid This</h4>
              <ul>
                <li>Overloading Q1 with too many urgent tasks</li>
                <li>Ignoring Q2 tasks until they become urgent</li>
                <li>Underestimating task duration</li>
                <li>Planning more hours than you have available</li>
                <li>Neglecting work-life balance</li>
              </ul>
            </div>
          </div>
          <div className="guide-final">
            <p><strong>Remember:</strong> ChroNiyam is a tool to help you work smarter, not harder. Focus on what's truly important, and let the app handle the rest.</p>
          </div>
        </>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{currentStepData.title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close guide">
            ✕
          </button>
        </div>

        <div className="guide-content">
          {currentStepData.content}
        </div>

        <div className="guide-navigation">
          <div className="guide-dots">
            {steps.map((_, index) => (
              <button
                key={index}
                className={`guide-dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
          <div className="guide-buttons">
            {!isFirstStep && (
              <button
                type="button"
                className="btn secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </button>
            )}
            {!isLastStep ? (
              <button
                type="button"
                className="btn primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn primary"
                onClick={onClose}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuideModal
