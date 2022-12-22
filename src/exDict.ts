// ---
// extend dictionary for compare translation.
// ---
import fsJetpack from 'fs-jetpack';
import path from 'path';
import {espParser, translatableKeyWords} from './translator/esp.js'
import {default as stringTranslator, isTranslated} from './translator/string.js';
import traverse from 'traverse';

export default class ExternalTranslationLibrary {
  readonly dict: any;
  readonly translatorOptions:appCliOptions;
  constructor(options:appCliOptions) {
    this.dict = {};
    this.translatorOptions = options;

    // 从用户指定的词典文件构建全局可用的基础词典。
    const dictFilePath = options.exDict;
    const exDictStatus = dictFilePath ? fsJetpack.exists(dictFilePath) : false;
    if (exDictStatus==='file') {
      const dictExtname = path.extname(dictFilePath as string).toLocaleLowerCase();
      if (dictExtname==='.esp') {
        // 从已翻译的ESP文件构建词典。
        const pluginInfo = espParser(dictFilePath);
        const exTranslLibCtx = this;
        traverse(pluginInfo).forEach(function (val){
          if (this.key && translatableKeyWords.includes(this.key)) {
            const editorID = this.parent?.node["EDID - Editor ID"];
            exTranslLibCtx.addTranslation(editorID, val)
          }
        });
      } else if (dictExtname==='.json') {
        const dict = fsJetpack.read(dictFilePath as string, "json");
        for (const key in dict) {
          this.addTranslation(key, dict[key])
        }
      }
    } 
  }

  addTranslation (text:string, translation: string) {
    if (this.dict[text]) {
      return false
    } else {
      this.dict[text] = translation
      return true
    }
  }
  getTranslation (query:string):string|undefined {
    return this.dict[query]
  }

  getTranslationAsync (key:string):Promise<string> {
    return new Promise((resolve,reject) => {
      const translation = this.getTranslation(key);
      translation ?  resolve(translation) : reject(translation);
    })
  }

  merge (...otherExDicts:ExternalTranslationLibrary[]) {
    const otherDicts = otherExDicts.map(exDict => exDict.dict);
    return Object.assign(this.dict, ...otherDicts)
  }

  saveDict (filePath?:string) {
    const {outputDir, from: sourceLanguage, to: translationLanguage} = this.translatorOptions;
    return fsJetpack.write(filePath || `${outputDir}/${sourceLanguage}2${translationLanguage}.exDict.json`, this.dict)
  }

}