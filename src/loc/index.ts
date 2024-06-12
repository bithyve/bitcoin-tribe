import LocalizedContent from 'react-localization';

const content = new LocalizedContent({
  en: require('./content/en.json'),
  es: require('./content/es.json'),
});

const setAppLanguage = async language => {
  try {
    if (language) {
      content.setLanguage(language);
    }
  } catch (error) {
    console.log(error);
  }
};

//setAppLanguage('es');

export default content;

export { setAppLanguage };
