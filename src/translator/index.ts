import mcmTranslator from "./mcm.js";
import espTranslator from "./esp.js";
import i18nTXTTranslator from './i18nTXT.js';
import everythingCLI from "../everything-cli.js";
import fsJetpack from "fs-jetpack";
import pLimit from "p-limit";
import lodash from 'lodash';
import path from 'path';
const limit_a = pLimit(1);
const _i18nTXTTranslator = lodash.partial(limit_a, i18nTXTTranslator);
const _mcmTranslator = lodash.partial(limit_a, mcmTranslator);
const _espTranslator = lodash.partial(limit_a, espTranslator);
const pathSlice = function (filePath:string, start?:number, end?:number) {
  return path.normalize(filePath).split(path.sep).slice(start, end).join(path.sep) 
}

const fallout4AutoTranslator = async function fallout4Translator(options:modTranslatorOptions) {
  // 预处理输入的参数
  const _options = {
    ...options,
    outputDir: options.outputDir || options.modsDir || process.cwd()+'/translated'
  };
  const translateQueue: Promise<any>[] = [];
  const fileList = (
    (options.fileList ? fsJetpack.read(options.fileList) : "")
    +'\r\n'+
    (options.modsDir ? everythingCLI(`${options.modsDir} ^<MCM/ config^|keybinds ext:json^>^|^<ext:esp^>^|^<Translations/ *en.txt^>`) : '')
  ).split('\r\n');
  for (const filePath of fileList) {
    let outputPath = '';
    const fileExtension = path.extname(filePath).toLocaleLowerCase();
    let translating: Promise<any> = Promise.resolve('');
    if (fileExtension === '.txt' &&  path.basename(filePath).split('_').pop()?.toLowerCase().slice(0,-4) === options.from) {
      outputPath = path.resolve(_options.outputDir, `[${_options.to}] ${pathSlice(filePath, -4)}`);
      translating = _i18nTXTTranslator(filePath, _options)
    } else if (fileExtension === '.json') {
      outputPath = path.resolve(_options.outputDir, `[${_options.to}] ${pathSlice(filePath, -5)}`);
      translating = _mcmTranslator(filePath, _options)
    } else if (fileExtension === '.esp') {
  // TODO: translate ESP configs

    }
    translateQueue.push(translating?.then(translation => outputPath ? fsJetpack.write(outputPath, translation) : undefined));
  }


  // final step: wait for all translations to finish.
  await Promise.all(translateQueue);
  return 'done.'
};
export default fallout4AutoTranslator;