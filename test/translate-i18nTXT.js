import i18nTXTTranslator from '../dist/translator/i18nTXT.js';

i18nTranslator('..\\playground\\mods\\AAF Violate\\Interface\\Translations\\AAF_Violate_En.TXT', {from:'en',to:'cn'})
  .then(function(result){
    console.log(result);
  })