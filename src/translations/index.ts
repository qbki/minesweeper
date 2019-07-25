import en from './en';
import ru from './ru';

type Language = 'ru' | 'en';

let _lang: Language = 'en';

function chooseLanguage(lang: Language) {
  _lang = lang;
}
