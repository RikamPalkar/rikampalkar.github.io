import { useEffect, useState } from 'react'

type HelpCarouselProps = {
  onClose: () => void
}

const slides = [
  {
    eyebrow: 'The idea',
    title: 'Chroniyam AI',
    content: (
      <>
        <p className="help-lead">Prioritize. Focus. Achieve.</p>
        <p><strong>Chronos</strong> points to time, while <strong>niyama</strong> means disciplined practice. Together, the name reflects a simple promise: turn available time into deliberate progress.</p>
        <div className="help-equation"><span>Time awareness</span><b>+</b><span>Disciplined action</span><b>=</b><strong>Progress</strong></div>
      </>
    ),
  },
  {
    eyebrow: 'How it works',
    title: 'Talk it through, then make it concrete',
    content: (
      <>
        <p>Describe what is on your plate in everyday language. Chroniyam AI turns the conversation into tasks, estimates missing details, and places each task in your live plan.</p>
        <div className="help-steps">
          <div><span>01</span><strong>Describe</strong><small>Share tasks, deadlines, and constraints.</small></div>
          <div><span>02</span><strong>Clarify</strong><small>Confirm duration and when work should start.</small></div>
          <div><span>03</span><strong>Adjust</strong><small>Edit the plan until it fits real capacity.</small></div>
        </div>
      </>
    ),
  },
  {
    eyebrow: 'The live plan',
    title: 'Four lanes for better decisions',
    content: (
      <>
        <p>The plan uses the Eisenhower Matrix to separate urgency from importance. It helps protect space for meaningful work instead of letting every request become an emergency.</p>
        <div className="help-quadrants">
          <div><b>Do First</b><span>Urgent and important</span></div>
          <div><b>Schedule</b><span>Important, not urgent</span></div>
          <div><b>Delegate</b><span>Urgent, not important</span></div>
          <div><b>Eliminate</b><span>Neither urgent nor important</span></div>
        </div>
      </>
    ),
  },
  {
    eyebrow: 'A sustainable rhythm',
    title: 'Plan for the person doing the work',
    content: (
      <>
        <p>Chroniyam AI checks the hours you have available, protects sleep, and flags conflicts before they quietly become overload.</p>
        <ul className="help-list">
          <li>Leave room for breaks, transitions, and personal time.</li>
          <li>Give most attention to important work before it becomes urgent.</li>
          <li>Use realistic estimates and revise them as you learn.</li>
          <li>Review the board regularly instead of treating it as permanent.</li>
        </ul>
      </>
    ),
  },
]

const HelpCarousel = ({ onClose }: HelpCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slide = slides[currentSlide]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') setCurrentSlide((current) => (current + 1) % slides.length)
      if (event.key === 'ArrowLeft') setCurrentSlide((current) => (current - 1 + slides.length) % slides.length)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="help-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-dialog-title">
        <button type="button" className="help-close" onClick={onClose} aria-label="Close help">×</button>
        <div className="help-dialog-header">
          <span className="help-eyebrow">{slide.eyebrow}</span>
          <span className="help-counter">{currentSlide + 1} / {slides.length}</span>
        </div>
        <h2 id="help-dialog-title">{slide.title}</h2>
        <div className="help-content" key={currentSlide}>{slide.content}</div>
        <div className="help-footer">
          <div className="help-dots" aria-label="Help slides">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={index === currentSlide ? 'active' : ''}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Show help slide ${index + 1}`}
              />
            ))}
          </div>
          <div className="help-navigation">
            <button type="button" onClick={() => setCurrentSlide((current) => (current - 1 + slides.length) % slides.length)} disabled={currentSlide === 0}>Back</button>
            <button type="button" className="help-next" onClick={() => currentSlide === slides.length - 1 ? onClose() : setCurrentSlide((current) => current + 1)}>
              {currentSlide === slides.length - 1 ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HelpCarousel