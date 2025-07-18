import path from 'path'
import fs from 'fs'
import chalk from 'chalk'

import { log, readJSON } from '../utils.js'
import { formatDependenciesWithStatus } from '../ui.js'
import { validateAndFixDependencies } from '../dependency-manager.js'
import { getDebugFlag } from '../config-manager.js'
import { BDDReplacementSystem } from '../../../src/bdd-replacement-system.js'

/**
 * Generate BDD feature files from tasks.json instead of task files
 * @param {string} tasksPath - Path to the tasks.json file
 * @param {string} outputDir - Output directory for feature files
 * @param {Object} options - Additional options (mcpLog for MCP mode, projectRoot, tag)
 * @returns {Object|undefined} Result object in MCP mode, undefined in CLI mode
 */
async function generateTaskFiles (tasksPath, outputDir, options = {}) {
  try {
    const isMcpMode = !!options?.mcpLog

    // 1. Read the raw data structure, ensuring we have all tags.
    const resolvedData = readJSON(tasksPath, options.projectRoot)
    if (!resolvedData) {
      throw new Error(`Could not read or parse tasks file: ${tasksPath}`)
    }
    const rawData = resolvedData._rawTaggedData || resolvedData

    // 2. Determine the target tag we need to generate files for.
    const targetTag = options.tag || resolvedData.tag || 'master'
    const tagData = rawData[targetTag]

    if (!tagData || !tagData.tasks) {
      throw new Error(
				`Tag '${targetTag}' not found or has no tasks in the data.`
      )
    }
    const tasksForGeneration = tagData.tasks

    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    log(
      'info',
			`Preparing to generate ${tasksForGeneration.length} BDD feature files for tag '${targetTag}'`
    )

    // 3. Validate dependencies using the FULL, raw data structure to prevent data loss.
    validateAndFixDependencies(
      rawData, // Pass the entire object with all tags
      tasksPath,
      options.projectRoot,
      targetTag // Provide the current tag context for the operation
    )

    // Generate BDD feature files instead of task files
    const bddSystem = new BDDReplacementSystem()
    const bddOutputDir = path.resolve(options.projectRoot || process.cwd(), 'features')

    // Convert tasks to requirements format
    const requirements = tasksForGeneration.map(task => ({
      title: task.title,
      description: task.description,
      details: task.details,
      subtasks: task.subtasks || []
    }))

    // Generate BDD features
    const bddResult = await bddSystem.generateBDDFromRequirements(requirements, bddOutputDir)

    // Validate no task files are generated
    await bddSystem.validateNoBDDTaskFiles(outputDir)

    log(
      'success',
			`Successfully generated ${bddResult.files.length} BDD feature files for tag '${targetTag}' in '${bddOutputDir}'.`
    )

    if (isMcpMode) {
      return {
        success: true,
        count: bddResult.files.length,
        directory: bddOutputDir
      }
    }
  } catch (error) {
    log('error', `Error generating BDD features: ${error.message}`)
    if (!options?.mcpLog) {
      console.error(chalk.red(`Error generating BDD features: ${error.message}`))
      if (getDebugFlag()) {
        console.error(error)
      }
      process.exit(1)
    } else {
      throw error
    }
  }
}

export default generateTaskFiles
