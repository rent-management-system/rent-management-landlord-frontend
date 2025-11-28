import { useLanguage } from "../contexts/LanguageContext";
import heroimg from "../assets/hero-imag.png";

const FrontPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="front md:h-screen mt-24 md:mt-0 flex flex-col-reverse md:flex-row">
      <div className="front-child1">
        <p className="text-lg md:text-xl lg:text-4xl pl-8">
          {t('your_ai_rent_management_system')} <span className="bate">{t('bate_exclamation')}</span>
        </p>
        <button className="order">
          <a href="#properties">{t('Add Properties')}</a>
        </button>
        <button className="view">
          <a href="#properties">{t('view_properties')}</a>
        </button>
      </div>

      <div className="front-child2">
        <img className="car car1 lg:max-w-[900px]" src={heroimg} alt="RentAI hero" />
        <img className="car car2" src={heroimg} alt="RentAI hero" />
      </div>
    </div>
  );
};

export default FrontPage;