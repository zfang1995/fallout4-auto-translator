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
  const {mods_dir, fileList} = options;
  const _fileList:string = 
    (fileList ? fsJetpack.read(fileList) : "")
    +'\r\n'+
    (mods_dir ? everythingCLI(`^<${mods_dir} MCM/ config^|keybinds ext:json^>^|^<${mods_dir} ext:esp^>`) : '')
  ;
  const translateQueue: Promise<any>[] = [];
  const fileListArray = _fileList.split('\r\n');
  // translate MCM configs
  const mcmList = fileListArray.filter(file => file.endsWith('.json'));
  mcmList.forEach(line => translateQueue.push(_mcmTranslator(line, options)));
  // translate ESP configs
  // const espList = fileListArray.filter(file => file.endsWith('.esp'));
  // espList.forEach(line => translateQueue.push(_espTranslator(line, options)));
  

  // final step: wait for all translations to finish.
  await Promise.all(translateQueue);
};
export default fallout4AutoTranslator;