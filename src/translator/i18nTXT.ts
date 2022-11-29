// TODO: 实现翻译i18nTXT
import fsJetpack from 'fs-jetpack';
import stringTranslator from './string.js';

export default async function i18nTXT(originalDocPath:string, options:i18nTranslatorOptions):Promise<string> {
  let translation = '';
  // const translationPath = path.dirname(originalDocPath)+path.basename(originalDocPath).replace(capitalize(originIso639Code), capitalize(options.translationLanguage));
  const translateQueue = (fsJetpack.read(originalDocPath, 'utf8') || '')
    .split('\r\n')
    .map(async (line:string) => {
      const [key, value] = line.split('\t');
      return `${key}\t${await stringTranslator(value, options)}`;
    });
  await Promise.all(translateQueue).then(translatedLines => translation = translatedLines.join('\r\n'))
  return translation
}