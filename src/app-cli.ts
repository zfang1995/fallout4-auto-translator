import { Command } from "commander";
import translator from "./translator/index.js";


const translatorCLI = new Command();
translatorCLI
  .name('fallout4-auto-translator')
  .description('translate multiple fallout4 mods in seconds.')
  .version('1.0.0')
  .option('--bilingual', 'provide bilingual translation.', false)
  .option('--fileList <path>', 'provide a file list to translate.')
  .option('--from <source language>', 'source language',  'en')
  .option("--gameDir <path>", "specify game path")
  .option('--modsDir <path>', 'modsDir to translate.')
  .option('--overwriteOrigin', 'overwrite the original files instead of make copy.', false)
  .option('--skipTranslatedString', 'detect And Skip Translated String', false)
  .option('--to <translation language>', 'translation language', 'zh')
  .action((options) => {
    console.log("translating...");
    translator(options).then(response => {
      console.log(response);
    })
  });
;
translatorCLI.parseAsync();
