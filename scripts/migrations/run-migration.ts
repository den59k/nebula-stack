import { init } from './init'
import { updateMeilisearch } from './updateMeilisearch'

const migrations: Record<string, () => any> = {
  init,
  meil: updateMeilisearch
}

const run = () => {

  const command = process.argv[2]
  
  if (command in migrations) {
    migrations[command]()
  } else {
    console.info(`Unknown command ${command}. Available: ${Object.keys(migrations).join(", ")}`)
  }

}

run()