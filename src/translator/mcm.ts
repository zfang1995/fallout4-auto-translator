import translate from "translate";
translate.from = 'en',translate.to = 'chinese';
import fsJetpack from'fs-jetpack';
import lodash from 'lodash';
import pLimit from "p-limit";
import traverse from "traverse";


const translateQueue:Promise<any>[] = [];
const keyWords : any[] = ['pageDisplayName', 'text', 'help', 'desc'];
let _translate = function _translate(text:string) {
  if (text) {
    let matched = text.match(/(?<=\>)([^<].*[^>])(?=\<)/);
    let htmlTextContent = matched ? matched[0] : '';
    return htmlTextContent ? translate(htmlTextContent).then(translatedText => text.replace(htmlTextContent, translatedText)) : translate(text);
  } else {
    return Promise.resolve(text); // return the original text to avoid error
  }
}
let __translate = lodash.partial(pLimit(8), _translate);


let mcmTranslator = async function mcmTranslator(mcmConfigPath:string, options: mcmTranslatorOptions = {}) {
  const fileContent = fsJetpack.read(mcmConfigPath);
  if (fileContent === undefined) {
    console.error(`given path -- "${mcmConfigPath}" does not exist.`)
  } else {
    let mcmConfig:JSON = JSON.parse(fileContent);
    traverse(mcmConfig).forEach(function (val){
      if (this.key && keyWords.includes(this.key)) {
        let translation = __translate(val).then(translatedText => this.update(translatedText) );
        translateQueue.push(translation);
      }
    })
    await Promise.all(translateQueue);
    let translatedContent = JSON.stringify(mcmConfig);
    if (options.withBackup) {
      fsJetpack.write(mcmConfigPath+'.backup', fileContent)
    }
    fsJetpack.write(mcmConfigPath, translatedContent)
  }
}

export default mcmTranslator;