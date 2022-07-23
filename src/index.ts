
import { Command } from "commander";
const translateCLI = new Command();
translateCLI
  .name('fallout4-auto-translator')
  .description('easily translate multiple fallout4 mods.')
  .version('0.1.0')
  .argument('<mods_dir>', 'mods_dir to translate.')
  .option('--from <source language>')
  .option('--to <target language>')
  .action((mods_dir, options) => {
    translate(mods_dir).then(console.log)
  });
;
translateCLI.parseAsync();
