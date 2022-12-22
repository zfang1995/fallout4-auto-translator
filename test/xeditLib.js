import jetpack from 'fs-jetpack';
import { wrapper as xelib } from 'xelib';

// INITIALIZATION / SETUP
xelib.Initialize('./node_modules/xelib/XEditLib.dll');
// sets the library to the fallout4 game mode
xelib.SetLanguage('zh')
xelib.SetGameMode(xelib.gmFO4);


// list plugins separated by newlines
const filename = 'AAF_Violate.esp'
xelib.LoadPlugins(filename );
// wait until the loader finishes
let status = 0;
while (status < 2) {
    status = xelib.GetLoaderStatus();
}
// console.log(xelib.GetElements(0,''))
const pluginHandle =xelib.GetElement(0,filename); 

// 



console.log(
    xelib.Name(pluginHandle),
    xelib.LongName(pluginHandle)
)
// 👇打印示例插件内的所有Name字段。
// const recordHandles = xelib.GetRecords(pluginHandle,'');
// for (const handle of recordHandles) {
//     console.log(xelib.GetValue(handle, 'FULL'))
// }
//

// 👇将翻译后的字段信息写入源ESP文件中。
//// 错误示例：
// const pluginInfo = xelib.ElementToObject(pluginHandle);
// xelib.ElementFromObject(0,filename,pluginInfo)
////
//// 正确示例：
const recordHandles = xelib.GetRecords(pluginHandle,'');
for (const handle of recordHandles) {
    console.log(xelib.GetValue(handle, 'FULL'))
}


// jetpack.write(`${filename}.json`,xelib.ElementToObject(xelib.GetElement(0,filename)))
