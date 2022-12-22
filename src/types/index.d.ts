declare module 'translate' {
  interface translate {
    (text: string, options?: object): Promise<string>;
    to: string //the string of the language to translate to. It can be in any of the two ISO 639 (1 or 2) or the full name in English like Spanish. Defaults to en.
    from: string //the string of the language to translate to. It can be in any of the two ISO 639 (1 or 2) or the full name in English like Spanish. Also defaults to en.
    cache: number //a Number with the milliseconds that each translation should be cached. Leave it undefined to cache it indefinitely (until a server/browser restart).
    engine: 'google' |'yandex' |'libre' | 'deepl'  //a String containing the name of the engine to use for translation. Right now it defaults to google. Read more in the engine section.
    key: string //the API Key for the engine of your choice. Read more in the engine section.
    url: string //only available for those engines that you can install on your own server (like Libretranslate), allows you to specify a custom endpoint for the translations. See this issue for more info.
  }
  let q : translate;
  export default q
}

declare interface translateOptions {
  from: string = 'en';
  to: string = 'zh';
  cache?: number;
  engine?: 'google' |'yandex' |'libre' | 'deepl' ;
  key?: string;
  url?: string;
  bilingual?: boolean = false;
  exTransLib?: any;
}

declare interface translator {
  (options?: translateOptions): Promise<string>;
}

declare interface appCliOptions extends translateOptions {
  readonly from: string;
  readonly to: string;
  readonly overwriteOrigin?: boolean = false;
  readonly outputDir: string;
  readonly fileList?: string;
  readonly modName: string;
  readonly modPath: string;
  readonly modsDir?: string;
  readonly gamePath?: string;
  readonly skipTranslatedString?: boolean = false;
  readonly exDict: string
}

type ExDict = import('../exDict').default;
declare interface modTranslatorOptions extends appCliOptions {
  readonly sourceLanguage: appCliOptions.from;
  readonly translationLanguage: appCliOptions.to;
  readonly exDict: ExDict
}

declare interface i18nTranslatorOptions extends modTranslatorOptions {
  
}

declare interface mcmTranslatorOptions extends modTranslatorOptions {

}

declare interface espTranslatorOptions extends modTranslatorOptions {

}

declare interface stringTranslatorOptions extends modTranslatorOptions {

}