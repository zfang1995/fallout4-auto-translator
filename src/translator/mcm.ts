import fsJetpack from'fs-jetpack';
import path from 'path';
import traverse from "traverse";
const translateQueue:Promise<any>[] = [];
const keyWords : any[] = ['pageDisplayName', 'text', 'help', 'desc'];
import {default as stringTranslator, isTranslated} from './string.js';

class ExternalTranslationLibrary {
  // create translations dictionary.
  dict: any;
  originTranslations: string;
  translationsPath: string[] | undefined;
  targetTranslations: string;
  constructor(translationsDir:string, {from:originLanguage = 'en', to:targetLanguage}:mcmTranslatorOptions) {
    this.dict = {[originLanguage]:{},[targetLanguage]:{}};
    // 从现有的文件中读取原本和译本。
    this.originTranslations = '';
    this.targetTranslations = '';
    let mayTranslated = false;
    const translationsPath = fsJetpack.list(translationsDir)?.map(file => path.join(translationsDir, file));
    translationsPath && translationsPath.forEach(filePath => {
      const iso639Code = path.basename(filePath.toLowerCase(), '.txt').split('_').pop();
      if (iso639Code === originLanguage) {
        this.originTranslations = fsJetpack.read(filePath, 'utf8') || '';
      } else if (iso639Code === targetLanguage) {
        this.dict[targetLanguage]['%filePath%'] = filePath;
        this.targetTranslations = fsJetpack.read(filePath, 'utf8') || '';
        mayTranslated =(!!this.targetTranslations) && (this.targetTranslations !== this.originTranslations);
      }      
    });
    // 如果没有原本，则报错
    if (this.originTranslations === '') throw new Error('origin translation not found.');
    // 如果现成的译本也许可用，则先用该译本构建词典，再用机器翻译原本来校正、重构该词典。
    if (mayTranslated) {
      this.targetTranslations.split('\r\n')
      .map((line:string) => line.split('\t'))
      .forEach(([key, value]:string[]) => {
        this.dict[targetLanguage][key] = value;
      });
    }
    this.originTranslations?.split('\r\n')
    .map(line => line.split('\t'))
    .forEach(([key, value]) => {
      this.dict[targetLanguage][key] = (mayTranslated && isTranslated(this.dict[targetLanguage][key], targetLanguage)) ? this.dict[targetLanguage][key] : stringTranslator(value, {from:originLanguage,to:targetLanguage});
    });
  }

  async updateDict (key:string, value:Promise<string>, iso639Code:string) {
    if (!this.dict[iso639Code]) {
      throw new Error(`${iso639Code} does not exists in dict.`);
    } else {
      this.dict[iso639Code][key] = await value;
    }
  }

  saveDict (file:string) {
    throw new Error("Method not implemented.");
  }

  exportTranslations () {
    for (const iso639Code in this.dict) {
      const translations = this.dict[iso639Code];
      let fileContent = '';
      for (const key in translations) {
        const translation = translations[key];
        fileContent += `${key}\t${translation}\r\n`;
      }
      fsJetpack.write(this.dict[iso639Code]['%filePath%'], fileContent);
    }
  }
}

const mcmTranslator = async function mcmTranslator(mcmConfigPath:string, options: mcmTranslatorOptions) {
  const fileContent = fsJetpack.read(mcmConfigPath);
  if (fileContent === undefined) {
    console.error(`given path -- "${mcmConfigPath}" does not exist.`)
  } else {
    const mcmConfig:JSON = JSON.parse(fileContent);
    const mod_dir = path.resolve(mcmConfigPath, '..\\..\\..\\..\\');
    const i18nTransDir = path.resolve(mod_dir,'Interface\\Translations');
    let useI18n = fsJetpack.exists(i18nTransDir) ? true :false ;
    let _options: stringTranslatorOptions;
    if (useI18n) {_options = Object.assign({exTransLib: new ExternalTranslationLibrary(i18nTransDir, options)}, options);}
    traverse(mcmConfig).forEach(function (val){
      if (
        (this.key && keyWords.includes(this.key)) 
        // || (this.parent?.key === 'options' && this.parent.parent?.key === 'valueOptions' )
        // ↑ valueOptions 的值通常都是1~2个词的短句，翻译工具很难凭借如此少量的信息给出准确的翻译，所以这里不翻译 valueOptions。
      ) {
        let text:string = val;
        let translating = new Promise((resolve) => {
          resolve(stringTranslator(text, _options));
        }).then(translatedText => this.update(translatedText));
        translateQueue.push(translating);
      }
    })
    await Promise.all(translateQueue);
    // TODO: save translatedContent to outputDir.
    if (options.overwriteOrigin) {
      fsJetpack.write(mcmConfigPath, JSON.stringify(mcmConfig));
    } else {
      fsJetpack.write(path.resolve(options.outputDir, path.relative(mod_dir,mcmConfigPath)), JSON.stringify(mcmConfig))
    }
  }
}

export default mcmTranslator;
