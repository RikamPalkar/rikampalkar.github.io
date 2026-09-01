interface BalanceValidatorProps {
  taskCounts: {
    q1: number
    q2: number
    q3: number
    q4: number
  }
  totalTasks: number
}

const HEALTHY_BENCHMARKS = {
  q1: { min: 15, max: 25 },
  q2: { min: 50, max: 65 },
  q3: { min: 5, max: 15 },
  q4: { min: 5, max: 15 },
}

const BalanceValidator = ({ taskCounts, totalTasks }: BalanceValidatorProps) => {
  if (totalTasks === 0) {
    return null
  }

  const percentages = {
    q1: Math.round((taskCounts.q1 / totalTasks) * 100),
    q2: Math.round((taskCounts.q2 / totalTasks) * 100),
    q3: Math.round((taskCounts.q3 / totalTasks) * 100),
    q4: Math.round((taskCounts.q4 / totalTasks) * 100),
  }

  const issues: string[] = []
  const warnings: string[] = []

  // Check Q1 (Urgent & Important)
  if (percentages.q1 < HEALTHY_BENCHMARKS.q1.min) {
    warnings.push(`Q1 is below target (${percentages.q1}% < ${HEALTHY_BENCHMARKS.q1.min}%)`)
  } else if (percentages.q1 > HEALTHY_BENCHMARKS.q1.max) {
    issues.push(`Q1 is too high (${percentages.q1}% > ${HEALTHY_BENCHMARKS.q1.max}%) - Too reactive!`)
  }

  // Check Q2 (Important & Not Urgent) - Most critical
  if (percentages.q2 < HEALTHY_BENCHMARKS.q2.min) {
    issues.push(`Q2 is too low (${percentages.q2}% < ${HEALTHY_BENCHMARKS.q2.min}%) - Focus on strategic work!`)
  } else if (percentages.q2 > HEALTHY_BENCHMARKS.q2.max) {
    warnings.push(`Q2 is above target (${percentages.q2}% > ${HEALTHY_BENCHMARKS.q2.max}%)`)
  }

  // Check if Q2 is the majority
  const isQ2Majority =
    percentages.q2 > percentages.q1 &&
    percentages.q2 > percentages.q3 &&
    percentages.q2 > percentages.q4

  if (!isQ2Majority && totalTasks >= 4) {
    issues.push('Q2 should be your largest quadrant for optimal productivity')
  }

  // Check Q3 (Urgent & Not Important)
  if (percentages.q3 > HEALTHY_BENCHMARKS.q3.max) {
    issues.push(`Q3 is too high (${percentages.q3}% > ${HEALTHY_BENCHMARKS.q3.max}%) - Too many distractions!`)
  }

  // Check Q4 (Not Urgent & Not Important)
  if (percentages.q4 > HEALTHY_BENCHMARKS.q4.max) {
    issues.push(`Q4 is too high (${percentages.q4}% > ${HEALTHY_BENCHMARKS.q4.max}%) - Eliminate time wasters!`)
  }

  // Check if all quadrants are within healthy ranges
  const isBalanced = issues.length === 0

  return (
    <div className={`balance-validator ${isBalanced ? 'balanced' : 'unbalanced'}`}>
      <div className="balance-bar">
        {percentages.q1 > 0 && (
          <div className="balance-segment q1" style={{ width: `${percentages.q1}%` }}>
            {percentages.q1 >= 8 && `${percentages.q1}%`}
          </div>
        )}
        {percentages.q2 > 0 && (
          <div className="balance-segment q2" style={{ width: `${percentages.q2}%` }}>
            {percentages.q2 >= 8 && `${percentages.q2}%`}
          </div>
        )}
        {percentages.q3 > 0 && (
          <div className="balance-segment q3" style={{ width: `${percentages.q3}%` }}>
            {percentages.q3 >= 8 && `${percentages.q3}%`}
          </div>
        )}
        {percentages.q4 > 0 && (
          <div className="balance-segment q4" style={{ width: `${percentages.q4}%` }}>
            {percentages.q4 >= 8 && `${percentages.q4}%`}
          </div>
        )}
      </div>
      {isBalanced ? (
        <div className="balance-success">✓ Well-balanced task distribution!</div>
      ) : (
        <div className="balance-messages">
          {issues.length > 0 && (
            <div className="balance-issues">
              {issues.map((issue, i) => (
                <span key={i} className="balance-issue">
                  {issue}
                </span>
              ))}
            </div>
          )}
          {warnings.length > 0 && (
            <div className="balance-warnings">
              {warnings.map((warning, i) => (
                <span key={i} className="balance-warning">
                  {warning}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BalanceValidator
