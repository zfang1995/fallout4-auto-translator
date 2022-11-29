import translate from "translate";
import promiseRetry from "promise-retry";
import { OperationOptions as retryOptions } from "retry"

const makeFnRetryable = function (Fn:Function, retryOptions:retryOptions) {
  return function (...args:any[]) {
    return promiseRetry((retry,attemptNumber) => {
      return Fn(...args).catch(retry)
    }, retryOptions)
  }
}
// TODO: 给translate的 node fetch error，增加retry机制。
// 在短时间内多次调用translate，可能会导致翻译服务器拒绝服务，触发node fetch error，
// 我想在这种情况下，增加retry机制，以避免翻译失败。
const retryableTranslate = function (text:string, options?:translateOptions) {
  return promiseRetry((retry,attemptNumber) => {
    return translate(text, options).catch(retry)
  }, {retries: 5, minTimeout:2000})
};


import partial from 'lodash/partial.js';
import pLimit from "p-limit";
const pLimitedTranslate = partial(pLimit(8), (a:string,b?:stringTranslatorOptions) => retryableTranslate(a,b));
const translateQueue:Promise<any>[] = [];
import chardet from "chardet";
const isTranslated = (text: string, targetLanguage: string): boolean => {
  const  analyzeReport = chardet.analyse(Buffer.from(text));
  return analyzeReport.reduce((acc:boolean, curr:any, curIndex) => {
    return acc || ((curr.lang === targetLanguage) && ((curIndex < 2) || (analyzeReport[0].name === "UTF-8")));
  }, false)
};



const stringTranslator = partial(pLimit(16), function (text:string, options:stringTranslatorOptions) {
  let translating: Promise<string>;
  if (text) {
    if (options && (options.skipTranslatedString && isTranslated(text, options.to))) {
      translating = Promise.resolve(text);
    } else if (options && options.exTransLib && text.startsWith('$')) {
      translating = Promise.resolve(options.exTransLib.dict[options.to]?.[text])
        .then(translated => options.bilingual ? options.exTransLib.dict[options.from][text]+'    '+translated : translated)
    } else {
      let matched = text.match(/(?<=\>)([^<].*[^>])(?=\<)/);
      let htmlTextContent = matched ? matched[0] : '';
      translating = htmlTextContent ? pLimitedTranslate(htmlTextContent, options)
        .then(translatedText => text.replace(htmlTextContent, translatedText)) : pLimitedTranslate(text, options)
        .then(translated => options.bilingual ? text+'    '+translated : translated);
    }
  } else {
    translating = Promise.resolve(text); // return the original text to avoid error
  }
  translateQueue.push(translating);
  return translating
});
export default stringTranslator;
export {translateQueue, isTranslated};