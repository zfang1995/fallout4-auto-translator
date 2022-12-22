// ---
// extend dictionary for compare translation.
// ---
import fsJetpack from 'fs-jetpack';
import path from 'path';
import {default as stringTranslator, isTranslated} from './translator/string.js';

// TODO:提供两个模组对照翻译的功能。
export default class ExternalTranslationLibrary {
  // create translations dictionary.
  dict: any;
  originalDocs: string;
  translationsPath: string[] | undefined;
  targetTranslations: string;
  constructor(modPath:string, {from = 'en', to}:translateOptions) {
    const sourceLanguage = from, translationLanguage = to;
    const translationsDir = `${modPath}\\Interface\\Translations`;
    this.dict = {[from]:{},[translationLanguage]:{}};
    // 从现有的文件中读取原本和译本。
    this.originalDocs = '';
    this.targetTranslations = '';
    let mayTranslated = false;
    const translationsPath = fsJetpack.list(translationsDir)?.map(file => path.join(translationsDir, file));
    translationsPath && translationsPath.forEach(filePath => {
      const iso639Code = path.basename(filePath.toLowerCase(), '.txt').split('_').pop();
      if (iso639Code === sourceLanguage) {
        this.originalDocs = fsJetpack.read(filePath, 'utf8') || '';
      } else if (iso639Code === translationLanguage) {
        this.dict[translationLanguage]['%filePath%'] = filePath;
        this.targetTranslations = fsJetpack.read(filePath, 'utf8') || '';
        mayTranslated =(!!this.targetTranslations) && (this.targetTranslations !== this.originalDocs);
      }      
    });
    // 如果没有原本，则报错
    if (this.originalDocs === '') throw new Error('origin translation not found.');
    // 如果现成的译本也许可用，则先用该译本构建词典，再用机器翻译原本来校正、重构该词典。
    if (mayTranslated) {
      this.targetTranslations.split('\r\n')
      .map((line:string) => line.split('\t'))
      .forEach(([key, value]:string[]) => {
        this.dict[translationLanguage][key] = value;
      });
    }
    this.originalDocs?.split('\r\n')
    .map(line => line.split('\t'))
    .forEach(([key, value]) => {
      this.dict[sourceLanguage][key] = value;
      this.dict[translationLanguage][key] = (mayTranslated && isTranslated(this.dict[translationLanguage][key], translationLanguage)) ? this.dict[translationLanguage][key] : stringTranslator(value, {from,to});
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