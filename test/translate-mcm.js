import mcmTranslator from '../dist/translator/mcm.js';
await mcmTranslator('playground/config.json', {withBackup: true});
// await mcmTranslator('playground/keybinds.json', {withBackup: true});

//translate multiple files under a directory
