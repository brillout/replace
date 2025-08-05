export { logError }
export { colorRed }

import pc from '@brillout/picocolors'

function logError(msg: string) {
  console.log(colorRed(msg))
}
function colorRed(msg: string) {
  return pc.red(pc.bold(msg))
}
