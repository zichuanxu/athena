import { useTranslation } from 'react-i18next';
import Header from "../components/Header";
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";

// Main Homepage Component
function Homepage({ onNavigate, onSettingsClick }) {
  const { t } = useTranslation('homepage');

  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="12" r="2.5"></circle>
          <circle cx="18" cy="12" r="2.5"></circle>
          <circle cx="12" cy="6" r="2.5"></circle>
          <circle cx="12" cy="18" r="2.5"></circle>
          <path d="M7.5 10.5l3-3"></path>
          <path d="M13.5 7.5l3 3"></path>
          <path d="M7.5 13.5l3 3"></path>
          <path d="M13.5 16.5l3-3"></path>
        </svg>
      ),
      title: t('ask_ai_title'),
      description: t('ask_ai_description'),
      onClick: () => onNavigate("chatbot"),
      primary: true
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <path d="M11 8a3 3 0 0 0-3 3"></path>
          <path d="M8 11a3 3 0 0 0 3 3"></path>
        </svg>
      ),
      title: t('graph_query_title'),
      description: t('graph_query_description'),
      onClick: () => onNavigate("graph"),
      primary: false
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <circle cx="20" cy="6" r="3"></circle>
          <circle cx="20" cy="18" r="3"></circle>
          <circle cx="4" cy="12" r="3"></circle>
          <line x1="12" y1="12" x2="4" y2="12"></line>
          <line x1="12" y1="12" x2="20" y2="6"></line>
          <line x1="12" y1="12" x2="20" y2="18"></line>
        </svg>
      ),
      title: t('graph_exploration_title'),
      description: t('graph_exploration_description'),
      onClick: () => onNavigate("explore"),
      primary: false
    }
  ];

  return (
    <div className="homepage">
      <Header onSettingsClick={onSettingsClick} />

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">
                {t('title')}
              </h1>
              <p className="hero-subtitle">
                {t('subtitle')}
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-item-number">10K+ </span>
                  <span className="stat-item-label">{t('questions_answered')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-item-number">24/7 </span>
                  <span className="stat-item-label">{t('ai_support')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="features-container">
            <div className="section-header">
              <h2 className="section-title">{t('choose_learning_path')}</h2>
              <p className="section-subtitle">
                {t('select_tool_prompt')}
              </p>
            </div>
            <div className="features-grid">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  onClick={feature.onClick}
                  primary={feature.primary}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Homepage;