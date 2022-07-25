import childprocess from 'child_process';

const everythingCLI = function everythingCLI(query:string) {
  return childprocess.execSync(
    `es.exe ${query}`, 
    {windowsHide: false, maxBuffer: 2048 * 2048, encoding : 'utf8'}
  );
}

export default everythingCLI;