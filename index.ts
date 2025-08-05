// Public API
export { replace }
export { getFiles }

import { shell } from '@brillout/shell'
import pc from '@brillout/picocolors'
import { readFileSync, writeFileSync } from 'node:fs'
import { colorRed } from './utils'

async function replace(oldString: string, newString: string) {
  if (await hasRepoChanges()) {
    console.log(colorRed('❌ Commit all changes before running this command.'))
    return
  }

  const files = await getFiles()
  console.log(
    `➡️  Replacing ${pc.cyan(oldString)} to ${pc.cyan(newString)} in ${pc.bold(String(files.length))} files...`,
  )
  files.forEach((file) => {
    replaceAll(file, oldString, newString)
  })

  if (await hasRepoChanges()) {
    await shell('git add -A')
    await shell(`git commit -m 'minor refactor: rename ${oldString} => ${newString}'`)
    console.log(pc.green(pc.bold('✅ Done.')))
  } else {
    console.log(pc.blue(pc.bold(`➡️  No changes.`)))
  }
}

function replaceAll(file: string, oldString: string, newString: string) {
  const fileContent = readFileSync(file, 'utf8')
  if (
    [
      //
      `import { replace } from '@brillout/replace'`,
      `import { replace } from "@brillout/replace"`,
    ].some((i) => fileContent.includes(i))
  ) {
    console.log(`Skipped ${file}`)
    return
  }
  const fileContentMod = fileContent.replaceAll(oldString, newString)
  if (fileContent !== fileContentMod) {
    console.log(`Modified ${file}`)
    writeFileSync(file, fileContentMod)
  }
}

async function getFiles() {
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
