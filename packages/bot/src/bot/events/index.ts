import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
export { Event } from '../bot'

export default async function RegisterFileEvents(): Promise<void> {
  await Promise.all(
    readdirSync(__dirname)
      .filter(path => path.endsWith('.ts') && !path.startsWith('index'))
      .map(async path => {
        try {
          readFileSync(join(__dirname, path))
          return await import('./' + path)
        } catch (e) {
          if (e.code === 'EISDIR') {
            return new Promise(resolve => resolve(null))
          }
          return new Promise(resolve => resolve(null))
        }
      })
  )
}
