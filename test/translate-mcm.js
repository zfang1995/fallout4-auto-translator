import mcmTranslator from '../dist/translator/mcm.js';
// await mcmTranslator('playground/config.json', {backupOrigin: true});
// await mcmTranslator('playground/keybinds.json', {backupOrigin: true});

//translate multiple files under a directory
import translate from 'translate'
console.log(await translate("Hello world", "zh"))