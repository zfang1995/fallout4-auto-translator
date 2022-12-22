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
// 在短时间内多次调用translate，可能会导致翻译服务器拒绝服务，触发node fetch error，
// 为了应对这种情况下，我在每次翻译失败后增加了重试机制。
const retryableTranslate = function (sourceText:string, options?:translateOptions) {
  return promiseRetry((retry,attemptNumber) => {
    return translate(sourceText, options).catch(retry)
  }, {retries: 4, minTimeout:5000})
};


import partial from 'lodash/partial.js';
import pLimit from "p-limit";
const pLimitedTranslate = partial(pLimit(8), (a:string,b?:stringTranslatorOptions) => retryableTranslate(a,b));
const translateQueue:Promise<any>[] = [];
import chardet from "chardet";
const isTranslated = (sourceText: string, targetLanguage: string): boolean => {
  const  analyzeReport = chardet.analyse(Buffer.from(sourceText));
  return analyzeReport.reduce((acc:boolean, curr:any, curIndex) => {
    return acc || ((curr.lang === targetLanguage) && ((curIndex < 2) || (analyzeReport[0].name === "UTF-8")));
  }, false)
};



const stringTranslator = partial(pLimit(16), function (sourceText:string, options:stringTranslatorOptions) {
  let translating: string | Promise<string>;
  if (sourceText) {
    if (options && (options.skipTranslatedString && isTranslated(sourceText, options.to))) {
      translating = Promise.resolve(sourceText);
    } else {
      translating =  options.exDict.getTranslation(sourceText) 
        || pLimitedTranslate(sourceText, options)
          .then(translatedText => options.bilingual ? sourceText+'    '+translatedText : translatedText)
          .then(translatedText => {
            // options.exDict.addTranslation(sourceText, translatedText)
            return translatedText
          })
      ;
    }
  } else {
    translating = Promise.resolve(sourceText); // return sourceText to avoid error
  }
  translateQueue.push(translating as Promise<string>);
  return translating
});
export default stringTranslator;
export {translateQueue, isTranslated};