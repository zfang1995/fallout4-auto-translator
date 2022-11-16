import fsJetpack from'fs-jetpack';
import path from 'path';
import traverse from "traverse";
const translateQueue:Promise<any>[] = [];
const keyWords : any[] = ['pageDisplayName', 'text', 'help', 'desc'];
import {default as stringTranslator, isTranslated} from './string.js';


const mcmTranslator = async function mcmTranslator(mcmConfigPath:string, options: mcmTranslatorOptions): Promise<string> {
  // 读取mcmConfig
  const fileContent = fsJetpack.read(mcmConfigPath);
  if (fileContent === undefined) {
    throw new Error(`given path -- "${mcmConfigPath}" does not exist.`)
  } else {
    const mcmConfig:JSON = JSON.parse(fileContent);
    // 翻译并替换mcmConfig中应该被翻译的字符串。
    traverse(mcmConfig).forEach(function (val){
      if (
        (this.key && keyWords.includes(this.key)) 
        // || (this.parent?.key === 'options' && this.parent.parent?.key === 'valueOptions' )
        // ↑ valueOptions 的值通常都是1~2个词的短句，翻译工具很难凭借如此少量的信息给出准确的翻译，所以这里不翻译 valueOptions。
      ) {
        let text:string = val;
        let translating = new Promise((resolve) => {
          resolve(stringTranslator(text, options));
        }).then(translatedText => this.update(translatedText));
        translateQueue.push(translating);
      }
    })
    await Promise.all(translateQueue);
    // ------
    // if (options.overwriteOrigin) {
    //   fsJetpack.write(mcmConfigPath, JSON.stringify(mcmConfig));
    // } else {
    //   fsJetpack.write(path.resolve(options.outputDir, path.relative(mod_dir,mcmConfigPath)), JSON.stringify(mcmConfig))
    // }
    // ------
    return JSON.stringify(mcmConfig)
  }
}

export default mcmTranslator;
