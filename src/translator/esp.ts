import jetpack from 'fs-jetpack';
import path from 'path';
import traverse from 'traverse';
import { wrapper as xelib } from 'xelib';
import stringTranslator from './string.js';
// 以下是ESP文件中可被翻译的字段名：
export const translatableKeyWords = [
  "FULL - Name",
  "SHRT - Short Name",
  "NAM1 - Response Text",
  "RNAM - Prompt",
  "NNAM - Display Text",
  "ITXT - Item Text",
  "UNAM - Display Text",
  "TTGP - Name",
  "ATTX - Activate Text Override",
  "DESC - Description",
  "CNAM - Log Entry"
];
const translateQueue:(Promise<string> | string)[] = [];

export const espParser = function espParser(fileName:string, keyWords?:  string[]) {
    // list plugins separated by newlines
    xelib.LoadPlugins(fileName);
    // wait until the loader finishes
    let status = 0;
    while (status < 2) {
        status = xelib.GetLoaderStatus();
    }
    // 将目标ESP文件内的字段信息转为JSON格式。
    const pluginHandle = xelib.GetElement(0, fileName);
    if (pluginHandle === 0) throw new Error(`can not find plugin -- ${fileName}`);
    console.log('plugin loaded correctly')
    const pluginInfo = xelib.ElementToObject(pluginHandle);
    return pluginInfo
}

export default async function espTranslator (fileName:string, options:espTranslatorOptions) {
  const pluginInfo = espParser(fileName);
  const {exDict} = options;
  // 翻译ESP文件内的关键字段。
  traverse(pluginInfo).forEach(function (val){
    if (
      (this.key && translatableKeyWords.includes(this.key)) 
    ) {
      const editorID = this.parent?.node["EDID - Editor ID"];
      let translating = exDict.getTranslation(editorID) || stringTranslator(val, options)
        .then(translatedText => {
          this.update(translatedText);
          return translatedText
        })
      ;
      translateQueue.push(translating);
    }
  })
  await Promise.all(translateQueue);
  // TODO: 将翻译后的字段信息写入源ESP文件的副本中，并保存。
  xelib.ElementFromObject(0,fileName,pluginInfo);
}