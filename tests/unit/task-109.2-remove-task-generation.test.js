/**
 * Unit tests for Task 109.2: Remove Task File Generation Logic
 * Tests that verify all task file generation code is removed or disabled
 * to prevent conflicts with the new BDD system
 */
import { jest } from '@jest/globals';

// Mock file system operations
jest.unstable_mockModule('fs', () => ({
	default: {
		existsSync: jest.fn(),
		readdirSync: jest.fn(),
		writeFileSync: jest.fn(),
		mkdirSync: jest.fn(),
		unlinkSync: jest.fn()
	},
	existsSync: jest.fn(),
	readdirSync: jest.fn(),
	writeFileSync: jest.fn(),
	mkdirSync: jest.fn(),
	unlinkSync: jest.fn()
}));

// Mock path operations
jest.unstable_mockModule('path', () => ({
	default: {
		join: jest.fn((...parts) => parts.join('/')),
		resolve: jest.fn((...parts) => parts.join('/'))
	},
	join: jest.fn((...parts) => parts.join('/')),
	resolve: jest.fn((...parts) => parts.join('/'))
}));

// Mock the BDD replacement system
jest.unstable_mockModule('../../src/bdd-replacement-system.js', () => ({
	BDDReplacementSystem: jest.fn().mockImplementation(() => ({
		generateBDDFromRequirements: jest.fn(),
		validateNoBDDTaskFiles: jest.fn()
	}))
}));

// Mock utils
jest.unstable_mockModule('../../scripts/modules/utils.js', () => ({
	readJSON: jest.fn(),
	writeJSON: jest.fn(),
	log: jest.fn()
}));

// Mock dependencies
jest.unstable_mockModule('../../scripts/modules/ui.js', () => ({
	formatDependenciesWithStatus: jest.fn()
}));

jest.unstable_mockModule('../../scripts/modules/dependency-manager.js', () => ({
	validateAndFixDependencies: jest.fn()
}));

jest.unstable_mockModule('../../scripts/modules/config-manager.js', () => ({
	getDebugFlag: jest.fn(() => false)
}));

// Import the mocked modules
const fs = (await import('fs')).default;
const path = (await import('path')).default;
const { BDDReplacementSystem } = await import(
	'../../src/bdd-replacement-system.js'
);
const { readJSON, log } = await import('../../scripts/modules/utils.js');
const { validateAndFixDependencies } = await import(
	'../../scripts/modules/dependency-manager.js'
);

// Import the module under test
const { default: generateTaskFiles } = await import(
	'../../scripts/modules/task-manager/generate-task-files.js'
);

describe('Task 109.2: Remove Task File Generation Logic', () => {
	let mockBDDSystem;

	beforeEach(() => {
		jest.clearAllMocks();

		// Set up BDD system mock
		mockBDDSystem = {
			generateBDDFromRequirements: jest.fn(),
			validateNoBDDTaskFiles: jest.fn()
		};
		BDDReplacementSystem.mockImplementation(() => mockBDDSystem);

		// Default mock setup
		fs.existsSync.mockReturnValue(true);
		fs.readdirSync.mockReturnValue([]);
		readJSON.mockReturnValue({
			tasks: [
				{
					id: 1,
					title: 'Test Task',
					description: 'Test Description',
					details: 'Test Details',
					subtasks: []
				}
			],
			tag: 'master',
			_rawTaggedData: {
				master: {
					tasks: [
						{
							id: 1,
							title: 'Test Task',
							description: 'Test Description',
							details: 'Test Details',
							subtasks: []
						}
					]
				}
			}
		});

		mockBDDSystem.generateBDDFromRequirements.mockResolvedValue({
			success: true,
			files: ['test.feature'],
			summary: { totalFiles: 1, successfulFiles: 1, failedFiles: 0 }
		});

		mockBDDSystem.validateNoBDDTaskFiles.mockResolvedValue({
			success: true,
			taskFilesFound: false,
			taskFiles: []
		});
	});

	describe('Task File Generation Removal', () => {
		test('should NOT generate individual task markdown files', async () => {
			// This test should FAIL until task file generation is removed
			await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			// Verify no task .md files are written
			const taskMarkdownCalls = fs.writeFileSync.mock.calls.filter(
				(call) => call[0].includes('task_') && call[0].endsWith('.md')
			);
			expect(taskMarkdownCalls).toHaveLength(0);
		});

		test('should NOT generate individual task text files', async () => {
			// This test should FAIL until task file generation is removed
			await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			// Verify no task .txt files are written
			const taskTextCalls = fs.writeFileSync.mock.calls.filter(
				(call) => call[0].includes('task_') && call[0].endsWith('.txt')
			);
			expect(taskTextCalls).toHaveLength(0);
		});

		test('should NOT generate tasks.json file', async () => {
			// This test should FAIL until task file generation is removed
			await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			// Verify tasks.json is not written
			const tasksJsonCalls = fs.writeFileSync.mock.calls.filter((call) =>
				call[0].includes('tasks.json')
			);
			expect(tasksJsonCalls).toHaveLength(0);
		});

		test('should NOT use task file templates', async () => {
			// This test should FAIL until task template usage is removed
			await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			// Verify no template-based file content is generated
			const templateCalls = fs.writeFileSync.mock.calls.filter(
				(call) =>
					typeof call[1] === 'string' &&
					(call[1].includes('## Task ID:') ||
						call[1].includes('## Title:') ||
						call[1].includes('## Description:') ||
						call[1].includes('## Dependencies:') ||
						call[1].includes('## Status:'))
			);
			expect(templateCalls).toHaveLength(0);
		});

		test('should NOT perform task-specific file I/O operations', async () => {
			// This test should FAIL until task file I/O is removed
			await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			// Verify no task file creation patterns
			const taskFileCalls = fs.writeFileSync.mock.calls.filter((call) =>
				call[0].match(/task[-_]\d+\.(md|txt|json)$/)
			);
			expect(taskFileCalls).toHaveLength(0);
		});
	});

	describe('BDD System Integration', () => {
		test('should ONLY generate BDD feature files', async () => {
			// This test should FAIL until BDD system is properly integrated
			await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			// Verify BDD system is called
			expect(mockBDDSystem.generateBDDFromRequirements).toHaveBeenCalled();

			// Verify validation is called
			expect(mockBDDSystem.validateNoBDDTaskFiles).toHaveBeenCalled();
		});

		test('should validate no task files are generated', async () => {
			// This test should FAIL until proper validation is implemented
			await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			// Verify validation method is called with correct parameters
			expect(mockBDDSystem.validateNoBDDTaskFiles).toHaveBeenCalledWith(
				'tasks'
			);
		});

		test('should pass requirements to BDD system in correct format', async () => {
			// This test should FAIL until proper requirement formatting is implemented
			await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			// Verify BDD system receives properly formatted requirements
			expect(mockBDDSystem.generateBDDFromRequirements).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						title: expect.any(String),
						description: expect.any(String),
						details: expect.any(String),
						subtasks: expect.any(Array)
					})
				]),
				expect.stringContaining('features')
			);
		});
	});

	describe('Legacy Code Removal', () => {
		test('should NOT contain task file generation logic paths', async () => {
			// This test should FAIL until legacy code paths are removed
			const moduleSource = await import(
				'../../scripts/modules/task-manager/generate-task-files.js'
			);
			const sourceCode = moduleSource.default.toString();

			// Check for removed patterns
			expect(sourceCode).not.toMatch(/writeFileSync.*task_\d+\.(md|txt)/);
			expect(sourceCode).not.toMatch(/generateTaskFile/);
			expect(sourceCode).not.toMatch(/createTaskFile/);
			expect(sourceCode).not.toMatch(/task.*template/);
		});

		test('should NOT contain task markdown generation patterns', async () => {
			// This test should FAIL until markdown generation is removed
			const moduleSource = await import(
				'../../scripts/modules/task-manager/generate-task-files.js'
			);
			const sourceCode = moduleSource.default.toString();

			// Check for removed markdown patterns
			expect(sourceCode).not.toMatch(/## Task ID:/);
			expect(sourceCode).not.toMatch(/## Title:/);
			expect(sourceCode).not.toMatch(/## Description:/);
			expect(sourceCode).not.toMatch(/## Dependencies:/);
			expect(sourceCode).not.toMatch(/## Status:/);
		});

		test('should NOT contain task file naming patterns', async () => {
			// This test should FAIL until file naming patterns are removed
			const moduleSource = await import(
				'../../scripts/modules/task-manager/generate-task-files.js'
			);
			const sourceCode = moduleSource.default.toString();

			// Check for removed naming patterns
			expect(sourceCode).not.toMatch(/task_\d{3}\./);
			expect(sourceCode).not.toMatch(/task-\d+\./);
			expect(sourceCode).not.toMatch(/\.padStart\(3, '0'\)/);
		});
	});

	describe('Error Handling', () => {
		test('should handle BDD system failures gracefully', async () => {
			// This test should FAIL until proper error handling is implemented
			mockBDDSystem.generateBDDFromRequirements.mockRejectedValue(
				new Error('BDD generation failed')
			);

			await expect(
				generateTaskFiles('tasks/tasks.json', 'tasks', {
					mcpLog: { info: jest.fn() },
					projectRoot: '/test/project'
				})
			).rejects.toThrow('BDD generation failed');
		});

		test('should handle validation failures appropriately', async () => {
			// This test should FAIL until proper validation error handling is implemented
			mockBDDSystem.validateNoBDDTaskFiles.mockRejectedValue(
				new Error('Validation failed')
			);

			await expect(
				generateTaskFiles('tasks/tasks.json', 'tasks', {
					mcpLog: { info: jest.fn() },
					projectRoot: '/test/project'
				})
			).rejects.toThrow('Validation failed');
		});
	});

	describe('Configuration Compatibility', () => {
		test('should maintain compatibility with existing options', async () => {
			// This test should FAIL until options compatibility is maintained
			const options = {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project',
				tag: 'feature-branch'
			};

			await generateTaskFiles('tasks/tasks.json', 'tasks', options);

			// Verify options are properly handled
			expect(readJSON).toHaveBeenCalledWith(
				'tasks/tasks.json',
				'/test/project'
			);
		});

		test('should handle tagged task data correctly', async () => {
			// This test should FAIL until tagged data handling is correct
			const taggedData = {
				'feature-branch': {
					tasks: [
						{
							id: 1,
							title: 'Tagged Task',
							description: 'Tagged Description',
							details: 'Tagged Details',
							subtasks: []
						}
					]
				}
			};

			readJSON.mockReturnValue({
				tasks: taggedData['feature-branch'].tasks,
				tag: 'feature-branch',
				_rawTaggedData: taggedData
			});

			await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project',
				tag: 'feature-branch'
			});

			// Verify tagged data is processed correctly
			expect(mockBDDSystem.generateBDDFromRequirements).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						title: 'Tagged Task',
						description: 'Tagged Description'
					})
				]),
				expect.any(String)
			);
		});
	});

	describe('Return Value Compliance', () => {
		test('should return correct result structure in MCP mode', async () => {
			// This test should FAIL until return structure is correct
			const result = await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			expect(result).toEqual({
				success: true,
				count: 1,
				directory: expect.stringContaining('features')
			});
		});

		test('should return undefined in CLI mode', async () => {
			// This test should FAIL until return behavior is correct
			const result = await generateTaskFiles('tasks/tasks.json', 'tasks', {
				projectRoot: '/test/project'
			});

			expect(result).toBeUndefined();
		});
	});

	describe('Edge Cases and Error Conditions', () => {
		test('should handle missing task data file gracefully', async () => {
			readJSON.mockReturnValue(null);

			await expect(
				generateTaskFiles('nonexistent.json', 'tasks', {
					mcpLog: { info: jest.fn() },
					projectRoot: '/test/project'
				})
			).rejects.toThrow('Could not read or parse tasks file');
		});

		test('should handle missing tag data gracefully', async () => {
			readJSON.mockReturnValue({
				tasks: undefined,
				tag: 'nonexistent-tag',
				_rawTaggedData: {
					master: { tasks: [] }
				}
			});

			await expect(
				generateTaskFiles('tasks/tasks.json', 'tasks', {
					mcpLog: { info: jest.fn() },
					projectRoot: '/test/project',
					tag: 'nonexistent-tag'
				})
			).rejects.toThrow('not found or contains no tasks');
		});

		test('should handle task data without _rawTaggedData', async () => {
			readJSON.mockReturnValue({
				tasks: [
					{
						id: 1,
						title: 'Simple Task',
						description: 'Simple Description',
						details: 'Simple Details',
						subtasks: []
					}
				],
				tag: 'master'
			});

			const result = await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			expect(result).toEqual({
				success: true,
				count: 1,
				directory: expect.stringContaining('features')
			});
		});

		test('should handle BDD system validation errors', async () => {
			mockBDDSystem.validateNoBDDTaskFiles.mockRejectedValue(
				new Error('Task files still exist')
			);

			await expect(
				generateTaskFiles('tasks/tasks.json', 'tasks', {
					mcpLog: { info: jest.fn() },
					projectRoot: '/test/project'
				})
			).rejects.toThrow('Task files still exist');
		});

		test('should handle dependency validation properly', async () => {
			validateAndFixDependencies.mockImplementation(() => {
				// Mock successful dependency validation
			});

			const result = await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			expect(validateAndFixDependencies).toHaveBeenCalled();
			expect(result.success).toBe(true);
		});

		test('should handle missing projectRoot gracefully', async () => {
			const result = await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() }
				// No projectRoot provided
			});

			expect(result).toEqual({
				success: true,
				count: 1,
				directory: expect.stringContaining('features')
			});
		});

		test('should handle directory creation when output directory does not exist', async () => {
			fs.existsSync.mockReturnValue(false);
			fs.mkdirSync.mockImplementation(() => {}); // Mock directory creation

			const result = await generateTaskFiles('tasks/tasks.json', 'tasks', {
				mcpLog: { info: jest.fn() },
				projectRoot: '/test/project'
			});

			expect(fs.mkdirSync).toHaveBeenCalledWith('tasks', { recursive: true });
			expect(result.success).toBe(true);
		});

		test('should handle debug mode error logging in CLI mode', async () => {
			const mockGetDebugFlag = (
				await import('../../scripts/modules/config-manager.js')
			).getDebugFlag;
			mockGetDebugFlag.mockReturnValue(true);

			const mockConsoleError = jest
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			const mockProcessExit = jest
				.spyOn(process, 'exit')
				.mockImplementation(() => {});

			mockBDDSystem.generateBDDFromRequirements.mockRejectedValue(
				new Error('Debug mode error')
			);

			await generateTaskFiles('tasks/tasks.json', 'tasks', {
				projectRoot: '/test/project'
				// No mcpLog means CLI mode
			});

			expect(mockConsoleError).toHaveBeenCalledWith(
				expect.stringContaining('Debug mode error')
			);
			expect(mockProcessExit).toHaveBeenCalledWith(1);

			mockConsoleError.mockRestore();
			mockProcessExit.mockRestore();
		});

		test('should handle CLI mode without debug', async () => {
			const mockGetDebugFlag = (
				await import('../../scripts/modules/config-manager.js')
			).getDebugFlag;
			mockGetDebugFlag.mockReturnValue(false);

			const mockConsoleError = jest
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			const mockProcessExit = jest
				.spyOn(process, 'exit')
				.mockImplementation(() => {});

			mockBDDSystem.generateBDDFromRequirements.mockRejectedValue(
				new Error('CLI mode error')
			);

			await generateTaskFiles('tasks/tasks.json', 'tasks', {
				projectRoot: '/test/project'
				// No mcpLog means CLI mode
			});

			expect(mockConsoleError).toHaveBeenCalledWith(
				expect.stringContaining('CLI mode error')
			);
			expect(mockConsoleError).not.toHaveBeenCalledWith(expect.any(Error));
			expect(mockProcessExit).toHaveBeenCalledWith(1);

			mockConsoleError.mockRestore();
			mockProcessExit.mockRestore();
		});
	});
});
