import LocalizedContent from 'react-localization';

const content = new LocalizedContent({
  en: require('./content/en.json'),
  es: require('./content/es.json'),
  hi: require('./content/hi.json'),
  it: require('./content/it.json'),
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
