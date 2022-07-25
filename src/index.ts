
import { Command } from "commander";
import everythingCLI from "./everything-cli.js";
import mcmTranslator from "./translator/mcm.js";
import espTranslator from "./translator/esp.js";
import pLimit from "p-limit";
import lodash from 'lodash';
import fsJetpack from "fs-jetpack";
const limit_a = pLimit(1);
const _mcmTranslator = lodash.partial(limit_a, mcmTranslator);
const _espTranslator = lodash.partial(limit_a, espTranslator);
const translator = async function fallout4Translator(fileList:string, options:translatorOptions = {}) {
  const translateQueue: Promise<any>[] = [];
  const fileListArray = fileList.split('\r\n');
  // translate MCM configs
  const mcmList = fileListArray.filter(file => file.endsWith('.json'));
  mcmList.forEach(line => translateQueue.push(_mcmTranslator(line, options)));
  // translate ESP configs
  const espList = fileListArray.filter(file => file.endsWith('.esp'));
  espList.forEach(line => translateQueue.push(_espTranslator(line, options)));
  

  // final step: wait for all translations to finish.
  await Promise.all(translateQueue);
};
const translatorCLI = new Command();
translatorCLI
  .name('fallout4-auto-translator')
  .description('easily translate multiple fallout4 mods.')
  .version('0.1.0')
  .option('--from <source language>')
  .option('--to <target language>')
  .option('--mods_dir <path>', 'mods_dir to translate.')
  .option('--withBackup', 'backup the original files.')
  .option('--fileList <path>', 'provide a file list to translate.')
  .action((options) => {
    const {mods_dir, fileList} = options;
    const _fileList:string = 
      (fileList ? fsJetpack.read(fileList) : "")
      +'\r\n'+
      (mods_dir ? everythingCLI(`^<${mods_dir} MCM/ config^|keybinds ext:json^>^|^<${mods_dir} ext:esp^>`) : '')
    ;
    translator(_fileList, options).then(response => {
      console.log(response);
      console.log('done.');
    })
  });
;
translatorCLI.parseAsync();
