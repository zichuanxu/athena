import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation('homepage');

  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{t('brand_name')}</h3>
            <p>{t('footer.description')}</p>
          </div>
          <div className="footer-section">
            <h4>{t('footer.features.title')}</h4>
            <ul>
              <li>{t('footer.features.item1')}</li>
              <li>{t('footer.features.item2')}</li>
              <li>{t('footer.features.item3')}</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>{t('footer.support.title')}</h4>
            <ul>
              <li>{t('footer.support.item1')}</li>
              <li>{t('footer.support.item2')}</li>
              <li>{t('footer.support.item3')}</li>
              <li>{t('footer.support.item4')}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;