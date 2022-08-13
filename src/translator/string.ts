import translate from "translate";
translate.from = 'english',translate.to = 'chinese';
// TODO: 给translate的 node fetch error，增加retry机制。
import partial from 'lodash/partial.js';
import pLimit from "p-limit";
const pLimitedTranslate = partial(pLimit(8), (a:string,b?:stringTranslatorOptions) => translate(a,b));
const translateQueue:Promise<any>[] = [];
import chardet from "chardet";
const isTranslated = (text: string, targetLanguage: string): boolean => {
  const  analyzeReport = chardet.analyse(Buffer.from(text));
  return analyzeReport.reduce((acc:boolean, curr:any, curIndex) => {
    return acc || ((curr.lang === targetLanguage) && ((curIndex < 2) || (analyzeReport[0].name === "UTF-8")));
  }, false)
};



const stringTranslator = partial(pLimit(16), function (text:string, options?:stringTranslatorOptions) {
  let translating: Promise<string>;
  if (text) {
    if (options && (options.forceTranslate || isTranslated(text, options.to))) {
      translating = Promise.resolve(text);
    } else if (options && options.exTransLib && text.startsWith('$')) {
      translating = Promise.resolve(options.exTransLib.dict[options.to]?.[text])
    } else {
      let matched = text.match(/(?<=\>)([^<].*[^>])(?=\<)/);
      let htmlTextContent = matched ? matched[0] : '';
      translating = htmlTextContent ? pLimitedTranslate(htmlTextContent, options).then(translatedText => text.replace(htmlTextContent, translatedText)) : pLimitedTranslate(text, options);
    }
  } else {
    translating = Promise.resolve(text); // return the original text to avoid error
  }
  translateQueue.push(translating);
  return translating
});
export default stringTranslator;
export {translateQueue, isTranslated};