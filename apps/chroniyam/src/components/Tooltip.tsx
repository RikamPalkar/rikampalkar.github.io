import { useState } from 'react'

type TooltipProps = {
  content: string[]
  children: React.ReactNode
  show?: boolean
  position?: 'center' | 'right' | 'bottom'
}

const Tooltip = ({ content, children, show = false, position = 'center' }: TooltipProps) => {
  const [hover, setHover] = useState(false)
  const shouldShow = show && hover

  return (
    <div className="tooltip-wrapper" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
      {shouldShow && (
        <div className={`tooltip-content tooltip-${position}`}>
          <div className="tooltip-text" role="tooltip">
            {content.map((line, idx) => (
              <div key={`${line}-${idx}`} className="tooltip-line">
                <span className="tooltip-line-text">{line}</span>
                {idx < content.length - 1 && <div className="tooltip-divider" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Tooltip
