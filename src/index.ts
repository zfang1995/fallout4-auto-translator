import { Command } from "commander";
import translator from "./translator/index.js";


const translatorCLI = new Command();
translatorCLI
  .name('fallout4-auto-translator')
  .description('translate multiple fallout4 mods in seconds.')
  .version('0.1.0')
  .option('--from <source language>', 'source language',  'en')
  .option('--to <target language>', 'target language', 'zh')
  .option('--mods_dir <path>', 'mods_dir to translate.')
  .option('--backupOrigin', 'backup the original files.', true)
  .option('--fileList <path>', 'provide a file list to translate.')
  .action((options) => {
    console.log("translating...");
    translator(options).then(response => {
      console.log(response);
      console.log('done.');
    })
  });
;
translatorCLI.parseAsync();
