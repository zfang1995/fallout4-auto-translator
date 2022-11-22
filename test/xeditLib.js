import { wrapper as xelib } from 'xelib';

// INITIALIZATION / SETUP
xelib.Initialize('./node_modules/xelib/XEditLib.dll');
// sets the library to the fallout4 game mode
xelib.SetGameMode(xelib.gmFO4);
// list plugins separated by newlines
xelib.LoadPlugins('Skyrim.esm\nUpdate.esm');
// wait until the loader finishes
let status = 0;
while (status < 2) {
    status = xelib.GetLoaderStatus();
}
