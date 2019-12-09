import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'

const stat = promisify(fs.stat)

export const readFile = promisify(fs.readFile)
export const writeFile = promisify(fs.writeFile)
export const appendFile = promisify(fs.appendFile)
export const unlink = promisify(fs.unlink)

export const isDirectory = async dir => {
    try {
        const stats = await stat(dir)
        return stats.isDirectory()
    } catch (err) {
        return false
    }
}

const execAsync = promisify(exec)

export const countFileLines = async (filepath) => {
    const { stdout } = await execAsync(`wc -l < ${filepath}`)
    const count = Number(stdout.trim())

    return count
}
