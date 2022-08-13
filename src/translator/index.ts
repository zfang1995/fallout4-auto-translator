import mcmTranslator from "./mcm.js";
import espTranslator from "./esp.js";
import everythingCLI from "../everything-cli.js";
import fsJetpack from "fs-jetpack";
import pLimit from "p-limit";
import lodash from 'lodash';
const limit_a = pLimit(1);
const _mcmTranslator = lodash.partial(limit_a, mcmTranslator);
const _espTranslator = lodash.partial(limit_a, espTranslator);

const fallout4AutoTranslator = async function fallout4Translator(options:modTranslatorOptions) {
  // 预处理输入的参数
  const _options = {
    ...options,
    outputDir: options.outputDir || `${options.modsDir}/translated`,
    fileList: (options.fileList ? fsJetpack.read(options.fileList) : "")
      +'\r\n'+
      (options.modsDir ? everythingCLI(`^<${options.modsDir} MCM/ config^|keybinds ext:json^>^|^<${options.modsDir} ext:esp^>`) : '')
  };
  const translateQueue: Promise<any>[] = [];
  const fileListArray = _options.fileList.split('\r\n');
  // translate MCM configs
  const mcmList = fileListArray.filter(file => file.endsWith('.json'));
  mcmList.forEach(line => translateQueue.push(_mcmTranslator(line, _options)));
  // TODO: translate ESP configs
  // const espList = fileListArray.filter(file => file.endsWith('.esp'));
  // espList.forEach(line => translateQueue.push(_espTranslator(line, options)));
  

  // final step: wait for all translations to finish.
  await Promise.all(translateQueue);
};
export default fallout4AutoTranslator;