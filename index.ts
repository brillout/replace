import { shell } from '@brillout/shell'
import pc from '@brillout/picocolors'
import assert from 'node:assert'
import { readFileSync, writeFileSync } from 'node:fs'

main()

async function main() {
  const cliArgs = parseCliArgs()
  await apply(cliArgs)
}

async function apply(cliArgs: CliArgs) {
  const { oldString, newString } = cliArgs

  if (await hasRepoChanges()) {
    console.log(colorRed('❌ Commit all changes before running this command.'))
    return
  }

  const files = await getGitFiles()
  console.log(
    `➡️  Replacing ${pc.cyan(oldString)} to ${pc.cyan(newString)} in ${pc.bold(String(files.length))} files...`,
  )
  files.forEach((file) => {
    replaceAll(file, cliArgs)
  })

  if (await hasRepoChanges()) {
    await shell('git add -A')
    await shell(`git commit -m 'minor refactor: rename ${oldString} => ${newString}'`)
    console.log(pc.green(pc.bold('✅ Done.')))
  } else {
    console.log(pc.blue(pc.bold(`➡️  No changes.`)))
  }
}

function replaceAll(file: string, cliArgs: CliArgs) {
  const { oldString, newString } = cliArgs
  const fileContent = readFileSync(file, 'utf8')
  const fileContentMod = fileContent.replaceAll(oldString, newString)
  if (fileContent !== fileContentMod) {
    console.log(`Modified ${file}`)
    writeFileSync(file, fileContentMod)
  }
}

async function getGitFiles() {
  // Preserve UTF-8 file paths.
  // https://github.com/vikejs/vike/issues/1658
  // https://stackoverflow.com/questions/22827239/how-to-make-git-properly-display-utf-8-encoded-pathnames-in-the-console-window/22828826#22828826
  // https://stackoverflow.com/questions/15884180/how-do-i-override-git-configuration-options-by-command-line-parameters/15884261#15884261
  const preserveUTF8 = '-c core.quotepath=off'
  const res = await shell(`git ${preserveUTF8} ls-files`)
  const files = res.stdout.split('\n').filter(Boolean)
  if (files.length === 0) {
    throw new Error(colorRed('No files found'))
  }
  return files
}

async function hasRepoChanges() {
  const res = await shell('git status --porcelain')
  return res.stdout.trim().length > 0
}

type CliArgs = ReturnType<typeof parseCliArgs>
function parseCliArgs() {
  const cliArgs = process.argv.slice(2)
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

function logError(msg: string) {
  console.log(colorRed(msg))
}
function colorRed(msg: string) {
  return pc.red(pc.bold(msg))
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
