// TODO: 实现翻译i18nTXT
import fsJetpack from 'fs-jetpack';
import path from "path";
import capitalize from 'lodash/capitalize.js';
import stringTranslator from './string.js';

export default async function i18nTXT(originalDocPath:string, options:i18nTranslatorOptions):Promise<string> {
  const originIso639Code = path.basename(originalDocPath, '.txt').split('_').pop() || 'En';
  const translationPath = path.dirname(originalDocPath)+path.basename(originalDocPath).replace(originIso639Code, capitalize(options.to));
  const translateQueue = (fsJetpack.read(translationPath, 'utf8') || '')
    .split('\r\n')
    .map(async (line:string) => {
      const [key, value] = line.split('\t');
      return `${key}\t${await stringTranslator(value, options)}`;
    });
  let translation = '';
  await Promise.all(translateQueue).then(translatedLines => translation = translatedLines.join('\r\n'))
  // fsJetpack.write(translationPath, translation);
  return translation
}