cli()

import { replace } from './index.js'
import { logError } from './utils.js'
import pc from '@brillout/picocolors'

async function cli() {
  const { oldString, newString } = parseCliArgs()
  await replace(oldString, newString)
}

function parseCliArgs() {
  const cliArgs = process.argv.slice(2)
  console.log(cliArgs)
  if (cliArgs.includes('--help') || cliArgs.includes('-h')) {
    showHelp()
    process.exit(0)
  }
  const [oldString, newString] = cliArgs
  if (!oldString) {
    showHelp()
    logError(`Missing argument ${pc.bold('oldString')}`)
    process.exit(1)
  }
  if (!newString) {
    showHelp()
    logError(`Missing argument ${pc.bold('newString')}`)
    process.exit(1)
  }
  if (cliArgs.length > 2) {
    showHelp()
    logError(`Too many arguments. Expected ${pc.cyan('2')} but got ${pc.cyan(String(cliArgs.length))} instead.`)
    process.exit(1)
  }
  return { oldString, newString }
}

function showHelp() {
  console.log(
    [
      'Usage:',
      `  ${pc.dim('$')} ${pc.bold('replace oldString newString')}                  ${pc.dim('#')} Replace ${pc.cyan('oldString')} with ${pc.cyan('newString')}`,
      `  ${pc.dim('$')} ${pc.bold('replace "old string" "new string"')}            ${pc.dim('#')} Replace ${pc.cyan('old string')} with ${pc.cyan('new string')}`,
      `  ${pc.dim('$')} ${pc.bold('replace "old \\"string\\"" "new \\"string\\""')}    ${pc.dim('#')} Replace ${pc.cyan('old "string"')} with ${pc.cyan('new "string"')}`,
      `  ${pc.dim('$')} ${pc.bold('replace --help')}                               ${pc.dim('#')} show this help`,
    ].join('\n'),
  )
}
