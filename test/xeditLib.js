import jetpack from 'fs-jetpack';
import { wrapper as xelib } from 'xelib';

// INITIALIZATION / SETUP
xelib.Initialize('./node_modules/xelib/XEditLib.dll');
// sets the library to the fallout4 game mode
xelib.SetLanguage('zh')
xelib.SetGameMode(xelib.gmFO4);


// list plugins separated by newlines
const filePath = 'OutcastsAndRemnants.esp'
xelib.LoadPlugins(filePath );
// wait until the loader finishes
let status = 0;
while (status < 2) {
    status = xelib.GetLoaderStatus();
}

console.log(xelib.GetElements(0,''))
console.log(xelib.GetElement(0, filePath))
// jetpack.write('OutcastsAndRemnants.json',xelib.ElementToObject(xelib.GetElement(0,'OutcastsAndRemnants.esp')))


  