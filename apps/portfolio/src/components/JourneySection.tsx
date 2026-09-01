import { useEffect, useState, type CSSProperties } from 'react'

const journeyTimeline = [
  {
    title: 'SSC',
    date: 'March 2008',
    icon: 'bi bi-book',
    kind: 'Education',
    note: 'School foundation milestone',
    x: 9,
    y: 66,
    placement: 'top'
  },
  {
    title: 'HSC',
    date: 'February 2010',
    icon: 'bi bi-mortarboard',
    kind: 'Education',
    note: 'Higher secondary education',
    x: 18,
    y: 40,
    placement: 'bottom'
  },
  {
    title: 'BSc. (IT)',
    date: 'April 2013',
    icon: 'bi bi-mortarboard-fill',
    kind: 'Education',
    note: 'Undergraduate degree in IT',
    x: 31,
    y: 69,
    placement: 'top'
  },
  {
    title: 'MCA',
    date: 'July 2018',
    icon: 'bi bi-award',
    kind: 'Education',
    note: 'Master of Computer Applications',
    x: 43,
    y: 45,
    placement: 'bottom'
  },
  {
    title: 'Texas Instruments',
    date: 'Jun 2018',
    icon: 'bi bi-briefcase',
    kind: 'Internship',
    note: 'Security dashboard and analytics',
    x: 57,
    y: 64,
    placement: 'top'
  },
  {
    title: 'Pi Technologies',
    date: 'Jul 2018 - Sep 2019',
    icon: 'bi bi-briefcase-fill',
    kind: 'Experience',
    note: 'Desktop products and UI frameworking',
    x: 69,
    y: 35,
    placement: 'bottom'
  },
  {
    title: 'Datamatics',
    date: 'Oct 2019 - Apr 2021',
    icon: 'bi bi-briefcase-fill',
    kind: 'Experience',
    note: 'Metro automation and fare systems',
    x: 82,
    y: 68,
    placement: 'top'
  },
  {
    title: 'Weatherford',
    date: 'Apr 2021 - Present',
    icon: 'bi bi-briefcase-fill',
    kind: 'Experience',
    note: 'Team lead, cloud-native products',
    x: 97,
    y: 42,
    placement: 'top'
  }
]

const CARD_HOLD_MS = 2400
const TRAVEL_MS = 900

const JourneySection = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [travelerPoint, setTravelerPoint] = useState({ x: journeyTimeline[0].x, y: journeyTimeline[0].y })
  const [isTraveling, setIsTraveling] = useState(false)

  useEffect(() => {
    const nextIndex = (activeIndex + 1) % journeyTimeline.length

    const startMoveTimer = window.setTimeout(() => {
      setIsTraveling(true)
      setTravelerPoint({ x: journeyTimeline[nextIndex].x, y: journeyTimeline[nextIndex].y })
    }, CARD_HOLD_MS)

    const revealNextTimer = window.setTimeout(() => {
      setActiveIndex(nextIndex)
      setIsTraveling(false)
    }, CARD_HOLD_MS + TRAVEL_MS)

    return () => {
      window.clearTimeout(startMoveTimer)
      window.clearTimeout(revealNextTimer)
    }
  }, [activeIndex])

  return (
    <section id="journey" className="journey">
      <div className="container">
        <div className="section-title">
          <h2>Journey</h2>
        </div>

        <div className="journey-track" role="list" aria-label="Career and education journey timeline">
          <svg className="journey-line" viewBox="0 0 1000 320" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 210 C100 80 155 280 250 150 C350 40 405 280 500 160 C600 40 655 280 750 150 C850 40 905 250 1000 110" />
          </svg>

          <div
            className={`journey-traveler ${isTraveling ? 'moving' : ''}`}
            aria-hidden="true"
            style={{ '--traveler-x': `${travelerPoint.x}%`, '--traveler-y': `${travelerPoint.y}%` } as CSSProperties}
          >
            <span className="journey-traveler-dot"></span>
          </div>

          {journeyTimeline.map((item, index) => (
            <article
              className={`journey-point ${item.placement} ${index === activeIndex ? 'active' : ''}`}
              role="listitem"
              key={`${item.title}-${item.date}`}
              style={{ '--point-x': `${item.x}%`, '--point-y': `${item.y}%` } as CSSProperties}
              aria-current={index === activeIndex ? 'step' : undefined}
            >
              <div className="journey-node" aria-hidden="true">
                <div className="journey-icon">
                  <i className={item.icon}></i>
                </div>
              </div>

              <div className="journey-card">
                <span className="journey-kind">{item.kind}</span>
                <h3 className="journey-title">{item.title}</h3>
                <span className="journey-date">{item.date}</span>
                <p className="journey-note">{item.note}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default JourneySection
