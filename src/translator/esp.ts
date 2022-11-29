import jetpack from 'fs-jetpack';
import path from 'path';
import traverse from 'traverse';
import { wrapper as xelib } from 'xelib';
import stringTranslator from './string.js';
// 以下是ESP文件中可被翻译的字段名：
const keyWords = [
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
const translateQueue:Promise<any>[] = [];

export default async function espTranslator (fileName:string, options:espTranslatorOptions) {
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
  console.log('found!')
  const pluginInfo = xelib.ElementToObject(pluginHandle);
  // 翻译ESP文件内的关键字段。
  traverse(pluginInfo).forEach(function (val){
    if (
      (this.key && keyWords.includes(this.key)) 
    ) {
      let translating = new Promise((resolve) => {
        resolve(stringTranslator(val, options));
      }).then(translatedText => this.update(translatedText));
      translateQueue.push(translating);
    }
  })
  await Promise.all(translateQueue);
  // 将翻译后的字段信息写入源ESP文件中，覆盖源字段
  xelib.ElementFromObject(0,fileName,pluginInfo);
  // 保存修改后的ESP文件
}