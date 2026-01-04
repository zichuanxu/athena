
function FeatureCard({ icon, title, description, onClick, primary = false }) {
  return (
    <div className={`feature-card ${primary ? 'primary' : ''}`} onClick={onClick}>
      <div className="feature-icon">
        {icon}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      <div className="feature-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export default FeatureCard;