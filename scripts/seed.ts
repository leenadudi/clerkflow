import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

import { seedDatabase } from '../lib/db/seed'

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
