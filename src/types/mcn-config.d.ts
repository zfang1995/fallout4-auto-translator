/**
 * Compute utility which makes resulting types easier to read
 * with IntelliSense by expanding them fully, instead of leaving
 * object properties with cryptic type names.
 */
type C<A extends any> = {[K in keyof A]: A[K]} & {};

type T0 = C<{ numLines: number; type: string; }>; // config.json:root.content[0]
type T1 = C<T0[]>; // config.json:root.content
type T2 = C<{ align: string; text: string; type: string; }>; // config.json:root.pages[0].content[0]
type T3 = C<T2[]>; // config.json:root.pages[0].content
type T4 = C<{ content: T3; pageDisplayName: string; }>; // config.json:root.pages[0]
type T5 = C<T4[]>; // config.json:root.pages
type T6 = C<string[]>; // config.json:root.pluginRequirements
type T7 = C<{ content: T1; displayName: string; minMcmVersion: number; modName: string; pages: T5; pluginRequirements: T6; }>; // config.json:root
declare type mcmConfig = C<T7>