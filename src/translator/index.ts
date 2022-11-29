import mcmTranslator from "./mcm.js";
import espTranslator from "./esp.js";
import i18nTXTTranslator from './i18nTXT.js';
import fsJetpack from "fs-jetpack";
import pLimit from "p-limit";
import lodash from 'lodash';
import path from 'path';
import ExDict from '../exDict.js';
import { wrapper as xelib } from 'xelib';
const limit_a = pLimit(1);
const _i18nTXTTranslator = lodash.partial(limit_a, i18nTXTTranslator);
const _mcmTranslator = lodash.partial(limit_a, mcmTranslator);
const _espTranslator = lodash.partial(limit_a, espTranslator);
const pathSlice = function (filePath:string, start?:number, end?:number) {
  return path.normalize(filePath).split(path.sep).slice(start, end).join(path.sep) 
}



const fallout4AutoTranslator = async function fallout4Translator(options:modTranslatorOptions) {

  // 预处理输入的参数
  options = {
    ...options,
    outputDir: options.outputDir || `${options.modsDir || process.cwd()}/[${options.to}] translations - autoTranslator appData`,
    translationLanguage: options.to,
    sourceLanguage: options.from
  };
  const translateQueue: Promise<any>[] = [];

  // Initialize xelib
  xelib.Initialize('./node_modules/xelib/XEditLib.dll');
  xelib.SetGameMode(xelib.gmFO4);
  if (options.gamePath) xelib.SetGamePath(options.gamePath);
  xelib.SetLanguage(options.translationLanguage)

  // 处理fileList
  const fileList = (options.fileList ? fsJetpack.read(options.fileList) || "" : "").split('\r\n');
  for (const filePath of fileList) {
    let outputPath = '';
    const fileExtension = path.extname(filePath).toLocaleLowerCase();
    let translating: Promise<any> = Promise.resolve('');
    if (fileExtension === '.txt' &&  path.basename(filePath).split('_').pop()?.toLowerCase().slice(0,-4) === options.sourceLanguage) {
      outputPath = path.resolve(options.outputDir, `${pathSlice(filePath, -3)}`);
      translating = _i18nTXTTranslator(filePath, options)
    } else if (fileExtension === '.json') {
      outputPath = path.resolve(options.outputDir, `${pathSlice(filePath, -4)}`);
      translating = _mcmTranslator(filePath, options as mcmTranslatorOptions)
    } else if (fileExtension === '.esp') {
  // TODO: translate ESP configs
      translating = _espTranslator(filePath,options as espTranslatorOptions)
    }
    translateQueue.push(translating?.then(translation => outputPath ? fsJetpack.write(outputPath, translation) : undefined));
  }

  // 处理modsDir
  if (options.modsDir) {
    const modsPaths = fsJetpack.list(options.modsDir)?.map(modDirname => path.resolve(options.modsDir as string, modDirname)) || [];
    for (const modDir of modsPaths) {
      const modName = path.basename(modDir);
      const modFiles = fsJetpack.list(modDir) || [];
      // 跳过已翻译的模组。
      if (modName.endsWith('autoTranslator appData')) continue;
      //// options = {...options, exTransLib:  new ExDict(modDir, options)}
      // 逐个检测模组内的每个文件，然后将需要翻译的内容提交到等待翻译的队列中。
      for (const fileName of modFiles) {
        const filePath = path.resolve(modDir, fileName);
        const fileExtension = path.extname(filePath).toLocaleLowerCase();
        if (fileExtension === '.esp') {
          // TODO: translate ESP configs
          translateQueue.push(_espTranslator(fileName,options as espTranslatorOptions))
        } else if (fileName.toLowerCase() === 'mcm') {
          const configJsonPath = path.resolve((options.outputDir, `MCM/Config/${modName}/config.json`));
          const keybindsJsonPath = path.resolve((options.outputDir, `MCM/Config/${modName}/keybinds.json`));
          // translate MCM configs
          if (fsJetpack.exists(configJsonPath)) {
            translateQueue.push(_mcmTranslator(configJsonPath, options as mcmTranslatorOptions).then(translation => fsJetpack.write(configJsonPath, translation)));
            translateQueue.push(_mcmTranslator(keybindsJsonPath, options as mcmTranslatorOptions).then(translation => fsJetpack.write(keybindsJsonPath, translation)));
          }
          // translate i18nTXT
        } else if (fileName.toLowerCase() === 'interface' && fsJetpack.exists(path.resolve(filePath, 'Translations'))) {
          const outputPath = path.resolve(options.outputDir, `interface/Translations/${modName}_${options.translationLanguage}.txt`);
          translateQueue.push(_i18nTXTTranslator(path.resolve(filePath, `interface/Translations/${modName}_${options.sourceLanguage}.txt`), options).then(translation => fsJetpack.write(outputPath, translation)));
        }
      }
    }
  }

  // final step: wait for all translations to finish.
  await Promise.all(translateQueue);
  return 'done.'
};
export default fallout4AutoTranslator;