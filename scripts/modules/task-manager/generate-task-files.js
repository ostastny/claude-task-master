import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

import { BDDReplacementSystem } from '../../../src/bdd-replacement-system.js';
import { getDebugFlag } from '../config-manager.js';
import { validateAndFixDependencies } from '../dependency-manager.js';
import { formatDependenciesWithStatus } from '../ui.js';
import { log, readJSON } from '../utils.js';

// Constants
const DEFAULT_TAG = 'master';
const FEATURES_DIR = 'features';

// Error Messages
const ERROR_MESSAGES = {
	TASK_FILE_READ_FAILED: 'Could not read or parse tasks file',
	TAG_NOT_FOUND: 'not found or contains no tasks in the data',
	BDD_GENERATION_FAILED: 'Error generating BDD features'
};

// Log Messages
const LOG_MESSAGES = {
	GENERATION_START: (count, tag) =>
		`Preparing to generate ${count} BDD feature files for tag '${tag}'`,
	GENERATION_SUCCESS: (count, tag, dir) =>
		`Successfully generated ${count} BDD feature files for tag '${tag}' in '${dir}'.`
};

/**
 * Generate BDD feature files from tasks.json, replacing legacy task file generation
 *
 * This function has been refactored for Task 109.2 to eliminate all task file generation
 * logic and replace it with BDD feature file generation through the BDD replacement system.
 *
 * @param {string} tasksPath - Path to the tasks.json file
 * @param {string} outputDir - Output directory for feature files (legacy parameter, now used for validation)
 * @param {Object} options - Configuration options
 * @param {Object} [options.mcpLog] - MCP logging interface (when present, enables MCP mode)
 * @param {string} [options.projectRoot] - Project root directory path
 * @param {string} [options.tag] - Tag to process (defaults to 'master')
 * @returns {Object|undefined} Result object in MCP mode with success status, count, and directory; undefined in CLI mode
 * @throws {Error} When task data cannot be loaded, BDD generation fails, or validation fails
 */
async function generateBDDFeatureFiles(tasksPath, outputDir, options = {}) {
	try {
		validateRequiredParameters(tasksPath, outputDir);

		const context = await setupGenerationContext(tasksPath, outputDir, options);
		await validateDependencies(context);
		const bddResult = await executeBDDGeneration(context);
		await validateGenerationResults(outputDir);

		logGenerationSuccess(
			bddResult.files.length,
			context.targetTag,
			bddResult.directory
		);

		return context.isMcpMode ? createMcpResult(bddResult) : undefined;
	} catch (error) {
		handleGenerationError(error, options);
	}
}

/**
 * Validate required parameters for generation
 * @param {string} tasksPath - Path to tasks file
 * @param {string} outputDir - Output directory
 * @throws {Error} When required parameters are missing or invalid
 */
function validateRequiredParameters(tasksPath, outputDir) {
	if (!tasksPath || typeof tasksPath !== 'string') {
		throw new Error('tasksPath is required and must be a string');
	}
	if (!outputDir || typeof outputDir !== 'string') {
		throw new Error('outputDir is required and must be a string');
	}
}

/**
 * Setup generation context with all necessary data
 * @param {string} tasksPath - Path to tasks file
 * @param {string} outputDir - Output directory
 * @param {Object} options - Generation options
 * @returns {Object} Generation context object
 */
async function setupGenerationContext(tasksPath, outputDir, options) {
	const isMcpMode = !!options?.mcpLog;
	const taskData = loadTaskData(tasksPath, options.projectRoot);
	const targetTag = determineTargetTag(options.tag, taskData.tag);
	const tasksForGeneration = extractTasksForTag(taskData, targetTag);

	ensureDirectoryExists(outputDir);
	logGenerationStart(tasksForGeneration.length, targetTag);

	return {
		isMcpMode,
		taskData,
		targetTag,
		tasksForGeneration,
		tasksPath,
		projectRoot: options.projectRoot,
		outputDir
	};
}

/**
 * Validate task dependencies
 * @param {Object} context - Generation context
 */
async function validateDependencies(context) {
	const rawData = context.taskData._rawTaggedData || context.taskData;
	validateAndFixDependencies(
		rawData,
		context.tasksPath,
		context.projectRoot,
		context.targetTag
	);
}

/**
 * Execute BDD feature generation
 * @param {Object} context - Generation context
 * @returns {Object} BDD generation result
 */
async function executeBDDGeneration(context) {
	return await generateBDDFeatures(
		context.tasksForGeneration,
		context.projectRoot
	);
}

/**
 * Validate generation results
 * @param {string} outputDir - Output directory to validate
 */
async function validateGenerationResults(outputDir) {
	await validateNoBDDTaskFiles(outputDir);
}

/**
 * Load and validate task data from file
 * @param {string} tasksPath - Path to the tasks.json file
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Task data object
 */
function loadTaskData(tasksPath, projectRoot) {
	const resolvedData = readJSON(tasksPath, projectRoot);
	if (!resolvedData) {
		throw new Error(`${ERROR_MESSAGES.TASK_FILE_READ_FAILED}: ${tasksPath}`);
	}
	return resolvedData;
}

/**
 * Determine the target tag for task processing
 * @param {string} [optionsTag] - Tag from options
 * @param {string} [dataTag] - Tag from task data
 * @returns {string} Target tag to use
 */
function determineTargetTag(optionsTag, dataTag) {
	return optionsTag || dataTag || DEFAULT_TAG;
}

/**
 * Extract tasks for a specific tag from task data
 * @param {Object} taskData - Task data object containing tasks and optional tagged data
 * @param {string} targetTag - Tag to extract tasks for
 * @returns {Array} Tasks for the specified tag
 * @throws {Error} When target tag is not found or has no tasks
 */
function extractTasksForTag(taskData, targetTag) {
	const rawData = taskData._rawTaggedData || taskData;

	// Try tagged data first
	if (rawData[targetTag]?.tasks) {
		return rawData[targetTag].tasks;
	}

	// Fall back to main tasks array
	if (taskData.tasks) {
		return taskData.tasks;
	}

	throw new Error(`Tag '${targetTag}' ${ERROR_MESSAGES.TAG_NOT_FOUND}.`);
}

/**
 * Ensure output directory exists
 * @param {string} outputDir - Output directory path
 */
function ensureDirectoryExists(outputDir) {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
}

/**
 * Log generation start message
 * @param {number} taskCount - Number of tasks to generate
 * @param {string} targetTag - Target tag name
 */
function logGenerationStart(taskCount, targetTag) {
	log('info', LOG_MESSAGES.GENERATION_START(taskCount, targetTag));
}

/**
 * Log generation success message
 * @param {number} fileCount - Number of files generated
 * @param {string} targetTag - Target tag name
 * @param {string} outputDir - Output directory
 */
function logGenerationSuccess(fileCount, targetTag, outputDir) {
	log(
		'success',
		LOG_MESSAGES.GENERATION_SUCCESS(fileCount, targetTag, outputDir)
	);
}

/**
 * Generate BDD features from task requirements
 * @param {Array} tasks - Tasks to convert to BDD features
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<Object>} BDD generation result with directory information
 */
async function generateBDDFeatures(tasks, projectRoot) {
	const bddSystem = new BDDReplacementSystem();
	const bddOutputDir = resolveBDDOutputDirectory(projectRoot);
	const requirements = transformTasksToRequirements(tasks);

	const result = await bddSystem.generateBDDFromRequirements(
		requirements,
		bddOutputDir
	);
	return { ...result, directory: bddOutputDir };
}

/**
 * Resolve the BDD output directory path
 * @param {string} projectRoot - Project root directory
 * @returns {string} Absolute path to BDD output directory
 */
function resolveBDDOutputDirectory(projectRoot) {
	return path.resolve(projectRoot || process.cwd(), FEATURES_DIR);
}

/**
 * Transform tasks into requirements format for BDD generation
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Array of requirement objects suitable for BDD generation
 */
function transformTasksToRequirements(tasks) {
	return tasks.map((task) => ({
		title: task.title,
		description: task.description,
		details: task.details,
		subtasks: task.subtasks || []
	}));
}

/**
 * Validate that no BDD task files are generated
 * @param {string} outputDir - Output directory to validate
 */
async function validateNoBDDTaskFiles(outputDir) {
	const bddSystem = new BDDReplacementSystem();
	await bddSystem.validateNoBDDTaskFiles(outputDir);
}

/**
 * Create MCP result object
 * @param {Object} bddResult - BDD generation result
 * @returns {Object} MCP result object
 */
function createMcpResult(bddResult) {
	return {
		success: true,
		count: bddResult.files.length,
		directory: bddResult.directory
	};
}

/**
 * Handle generation errors with appropriate logging and exit behavior
 * @param {Error} error - Error object to handle
 * @param {Object} options - Options object containing mcpLog for mode detection
 * @throws {Error} In MCP mode, re-throws the error; in CLI mode, exits process
 */
function handleGenerationError(error, options) {
	const errorMessage = `${ERROR_MESSAGES.BDD_GENERATION_FAILED}: ${error.message}`;
	log('error', errorMessage);

	if (isCliMode(options)) {
		logCliError(errorMessage, error);
		process.exit(1);
	} else {
		throw error;
	}
}

/**
 * Log errors in CLI mode with appropriate formatting
 * @param {string} errorMessage - Formatted error message
 * @param {Error} error - Original error object for debug output
 */
function logCliError(errorMessage, error) {
	console.error(chalk.red(errorMessage));
	if (getDebugFlag()) {
		console.error(error);
	}
}

/**
 * Check if running in CLI mode (not MCP mode)
 * @param {Object} options - Options object
 * @returns {boolean} True if in CLI mode, false if in MCP mode
 */
function isCliMode(options) {
	return !options?.mcpLog;
}

export default generateBDDFeatureFiles;
