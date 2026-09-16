type PlanningSetupProps = {
  onStart: () => void
}

const PlanningSetup = ({ onStart }: PlanningSetupProps) => (
  <div className="planning-setup">
    <div className="planning-setup-card">
      <span className="planning-setup-eyebrow">Your week, made workable</span>
      <h1>Plan my week</h1>
      <p>Tell Chroniyam AI everything on your plate. Type it, speak it, or start with a quick example. It will turn the list into a realistic schedule.</p>
      <div className="planning-setup-points">
        <span>Capture tasks naturally</span>
        <span>Protect time that matters</span>
        <span>Get a complete plan</span>
      </div>
      <button type="button" className="talk-button" onClick={onStart}>Plan my week</button>
      <small>After you share your tasks, we will ask only for the constraints that affect the plan.</small>
    </div>
  </div>
)

export default PlanningSetup
