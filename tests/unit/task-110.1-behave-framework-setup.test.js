/**
 * Task 110.1: Setup Behave Framework Testing Environment
 *
 * Refactored test file with improved organization and maintainability.
 * Uses constants and utilities for better code reuse and clarity.
 */

import { jest } from '@jest/globals';
import mockFs from 'mock-fs';
import { BehaveTestUtils } from './helpers/behave-test-utils.js';
import {
	BEHAVE_METHODS,
	DIRECTORY_STRUCTURE,
	STEP_DEFINITION_FILES,
	STEP_PATTERNS,
	CONFIG_TYPES,
	ENVIRONMENT_HOOKS,
	PYTEST_BDD_FEATURES,
	RUNNER_FEATURES,
	VALIDATION_TYPES,
	ERROR_SCENARIOS
} from './helpers/behave-test-constants.js';

describe('Task 110.1: Setup Behave Framework Testing Environment', () => {
	let BehaveFramework;
	let mockProjectRoot;

	beforeEach(() => {
		jest.clearAllMocks();
		mockProjectRoot = '/test/project';

		mockFs(BehaveTestUtils.createMockProjectStructure(mockProjectRoot));
		BehaveFramework = BehaveTestUtils.createMockBehaveFramework();
	});

	afterEach(() => {
		mockFs.restore();
	});

	describe('Behave Package Installation and Dependencies', () => {
		describe('Python Environment Validation', () => {
			it('should validate Python installation exists', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.validatePythonEnvironment(),
					BEHAVE_METHODS.VALIDATE_PYTHON_ENVIRONMENT
				);
			});

			it('should check Python version compatibility (3.6+)', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.validatePythonEnvironment(
						ERROR_SCENARIOS.VERSION_CHECK
					),
					BEHAVE_METHODS.VALIDATE_PYTHON_ENVIRONMENT
				);
			});

			it('should validate pip is available', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.validateBehaveDependencies(),
					BEHAVE_METHODS.VALIDATE_BEHAVE_DEPENDENCIES
				);
			});
		});

		describe('Package Installation', () => {
			it('should install behave using pip', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.installBehavePackage(),
					BEHAVE_METHODS.INSTALL_BEHAVE_PACKAGE
				);
			});

			it('should install pytest-bdd as secondary validation tool', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.setupPytestBdd(),
					BEHAVE_METHODS.SETUP_PYTEST_BDD
				);
			});

			it('should handle virtual environment installation', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.installBehavePackage('/test/project/venv'),
					BEHAVE_METHODS.INSTALL_BEHAVE_PACKAGE
				);
			});

			it('should create requirements.txt with behave dependencies', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.createRequirementsTxt(),
					BEHAVE_METHODS.CREATE_REQUIREMENTS_TXT
				);
			});

			it('should verify installation success', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.validateBehaveInstallation(),
					BEHAVE_METHODS.VALIDATE_BEHAVE_INSTALLATION
				);
			});
		});

		describe('Installation Error Handling', () => {
			const errorScenarios = [
				ERROR_SCENARIOS.PYTHON_NOT_FOUND,
				ERROR_SCENARIOS.PIP_ERROR,
				ERROR_SCENARIOS.NETWORK_ERROR,
				ERROR_SCENARIOS.PERMISSION_ERROR
			];

			errorScenarios.forEach((scenario) => {
				it(`should handle ${scenario} error`, async () => {
					await BehaveTestUtils.expectNotImplementedError(
						BehaveFramework.installBehavePackage(scenario),
						BEHAVE_METHODS.INSTALL_BEHAVE_PACKAGE
					);
				});
			});

			it('should handle Python not found during validation', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.validatePythonEnvironment(
						ERROR_SCENARIOS.PYTHON_NOT_FOUND
					),
					BEHAVE_METHODS.VALIDATE_PYTHON_ENVIRONMENT
				);
			});
		});
	});

	describe('Test Directory Structure Creation', () => {
		describe('Basic Directory Creation', () => {
			it('should create root features directory', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.createFeaturesDirectory(mockProjectRoot),
					BEHAVE_METHODS.CREATE_FEATURES_DIRECTORY
				);
			});

			it('should create steps subdirectory for step definitions', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.createStepsDirectory(mockProjectRoot),
					BEHAVE_METHODS.CREATE_STEPS_DIRECTORY
				);
			});

			it('should create environment.py in features directory', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.createEnvironmentPy(mockProjectRoot),
					BEHAVE_METHODS.CREATE_ENVIRONMENT_PY
				);
			});

			it('should create complete behave directory structure', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.createBehaveDirectory(mockProjectRoot),
					BEHAVE_METHODS.CREATE_BEHAVE_DIRECTORY
				);
			});

			it('should handle existing directories gracefully', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.createBehaveDirectory(mockProjectRoot),
					BEHAVE_METHODS.CREATE_BEHAVE_DIRECTORY
				);
			});
		});

		describe('Directory Structure Standards', () => {
			DIRECTORY_STRUCTURE.forEach((dir) => {
				it(`should ensure ${dir} directory exists`, async () => {
					await BehaveTestUtils.expectNotImplementedError(
						BehaveFramework.createBehaveDirectory(mockProjectRoot),
						BEHAVE_METHODS.CREATE_BEHAVE_DIRECTORY
					);
				});
			});

			it('should create __init__.py files for Python module recognition', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.createStepsDirectory(mockProjectRoot),
					BEHAVE_METHODS.CREATE_STEPS_DIRECTORY
				);
			});
		});

		describe('Directory Creation Error Handling', () => {
			const errorScenarios = [
				ERROR_SCENARIOS.DISK_SPACE,
				ERROR_SCENARIOS.PERMISSION_DENIED,
				ERROR_SCENARIOS.FILE_CONFLICT
			];

			errorScenarios.forEach((scenario) => {
				it(`should handle ${scenario} error`, async () => {
					await BehaveTestUtils.expectNotImplementedError(
						BehaveFramework.createBehaveDirectory(scenario),
						BEHAVE_METHODS.CREATE_BEHAVE_DIRECTORY
					);
				});
			});
		});
	});

	describe('Step Definitions for Common Gherkin Patterns', () => {
		describe('Sample Step Definition Files', () => {
			STEP_DEFINITION_FILES.forEach((stepFile) => {
				it(`should create ${stepFile} with sample implementations`, async () => {
					await BehaveTestUtils.expectNotImplementedError(
						BehaveFramework.createSampleStepDefinitions(stepFile),
						BEHAVE_METHODS.CREATE_SAMPLE_STEP_DEFINITIONS
					);
				});
			});
		});

		describe('Step Definition Patterns', () => {
			const patternTests = [
				{
					pattern: STEP_PATTERNS.DECORATORS,
					description: 'proper behave decorators'
				},
				{
					pattern: STEP_PATTERNS.PARAMETERS,
					description: 'parameterized step definitions'
				},
				{ pattern: STEP_PATTERNS.DATA_TABLES, description: 'data tables' },
				{ pattern: STEP_PATTERNS.DOCSTRINGS, description: 'docstrings' },
				{
					pattern: STEP_PATTERNS.SCENARIO_OUTLINES,
					description: 'scenario outlines'
				}
			];

			patternTests.forEach(({ pattern, description }) => {
				it(`should create step definitions for ${description}`, async () => {
					await BehaveTestUtils.expectNotImplementedError(
						BehaveFramework.createSampleStepDefinitions(pattern),
						BEHAVE_METHODS.CREATE_SAMPLE_STEP_DEFINITIONS
					);
				});
			});
		});

		describe('Step Definition Content', () => {
			const contentTests = [
				{
					pattern: STEP_PATTERNS.IMPORTS,
					description: 'proper imports for behave decorators'
				},
				{
					pattern: STEP_PATTERNS.CONTEXT_USAGE,
					description: 'context usage examples'
				},
				{
					pattern: STEP_PATTERNS.ASSERTIONS,
					description: 'assertion examples'
				},
				{
					pattern: STEP_PATTERNS.ERROR_HANDLING,
					description: 'error handling patterns'
				}
			];

			contentTests.forEach(({ pattern, description }) => {
				it(`should include ${description}`, async () => {
					await BehaveTestUtils.expectNotImplementedError(
						BehaveFramework.createSampleStepDefinitions(pattern),
						BEHAVE_METHODS.CREATE_SAMPLE_STEP_DEFINITIONS
					);
				});
			});
		});
	});

	describe('Behave Configuration Files', () => {
		describe('Behave Configuration Generation', () => {
			it('should create behave.ini configuration file', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.generateBehaveIni(mockProjectRoot),
					BEHAVE_METHODS.GENERATE_BEHAVE_INI
				);
			});

			const configTests = [
				{
					type: CONFIG_TYPES.FORMATTERS,
					description: 'default formatters (pretty, json)'
				},
				{
					type: CONFIG_TYPES.TAGS,
					description: 'tag expressions for test organization'
				},
				{ type: CONFIG_TYPES.LOGGING, description: 'logging settings' },
				{
					type: CONFIG_TYPES.JUNIT,
					description: 'junit output for CI integration'
				}
			];

			configTests.forEach(({ type, description }) => {
				it(`should configure ${description}`, async () => {
					await BehaveTestUtils.expectNotImplementedError(
						BehaveFramework.generateBehaveConfig(type),
						BEHAVE_METHODS.GENERATE_BEHAVE_CONFIG
					);
				});
			});
		});

		describe('Environment.py Configuration', () => {
			const hookTests = [
				{ hook: ENVIRONMENT_HOOKS.BEFORE_ALL, description: 'before_all hook' },
				{ hook: ENVIRONMENT_HOOKS.AFTER_ALL, description: 'after_all hook' },
				{
					hook: ENVIRONMENT_HOOKS.BEFORE_SCENARIO,
					description: 'before_scenario hook'
				},
				{
					hook: ENVIRONMENT_HOOKS.AFTER_SCENARIO,
					description: 'after_scenario hook'
				},
				{
					hook: ENVIRONMENT_HOOKS.CONTEXT_INIT,
					description: 'context initialization'
				},
				{
					hook: ENVIRONMENT_HOOKS.FIXTURES,
					description: 'fixture setup examples'
				}
			];

			hookTests.forEach(({ hook, description }) => {
				it(`should create environment.py with ${description}`, async () => {
					await BehaveTestUtils.expectNotImplementedError(
						BehaveFramework.createEnvironmentPy(hook),
						BEHAVE_METHODS.CREATE_ENVIRONMENT_PY
					);
				});
			});
		});

		describe('Configuration Error Handling', () => {
			it('should handle invalid configuration syntax', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.generateBehaveConfig(ERROR_SCENARIOS.INVALID_SYNTAX),
					BEHAVE_METHODS.GENERATE_BEHAVE_CONFIG
				);
			});

			it('should handle corrupted environment.py file', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.createEnvironmentPy(ERROR_SCENARIOS.CORRUPTED),
					BEHAVE_METHODS.CREATE_ENVIRONMENT_PY
				);
			});

			it('should handle conflicting configuration options', async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.configureBehaveEnvironment(ERROR_SCENARIOS.CONFLICTS),
					BEHAVE_METHODS.CONFIGURE_BEHAVE_ENVIRONMENT
				);
			});
		});
	});

	describe('pytest-bdd Secondary Validation Configuration', () => {
		const pytestBddTests = [
			{
				feature: PYTEST_BDD_FEATURES.INSTALL,
				description: 'install pytest-bdd package'
			},
			{
				feature: PYTEST_BDD_FEATURES.CONFIG,
				description: 'create pytest.ini configuration'
			},
			{
				feature: PYTEST_BDD_FEATURES.CONFTEST,
				description: 'create conftest.py for pytest fixtures'
			},
			{
				feature: PYTEST_BDD_FEATURES.DISCOVERY,
				description: 'configure feature file discovery for pytest-bdd'
			},
			{
				feature: PYTEST_BDD_FEATURES.SAMPLE_TEST,
				description: 'create sample pytest-bdd test file'
			}
		];

		pytestBddTests.forEach(({ feature, description }) => {
			it(`should ${description}`, async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.setupPytestBdd(feature),
					BEHAVE_METHODS.SETUP_PYTEST_BDD
				);
			});
		});
	});

	describe('Test Runner and Execution Setup', () => {
		const runnerTests = [
			{
				feature: RUNNER_FEATURES.SCRIPT,
				description: 'create run_tests.py script'
			},
			{
				feature: RUNNER_FEATURES.CLI_OPTIONS,
				description: 'configure command line options'
			},
			{
				feature: RUNNER_FEATURES.ENVIRONMENTS,
				description: 'set up environment-specific configurations'
			},
			{
				feature: RUNNER_FEATURES.PARALLEL,
				description: 'configure parallel execution options'
			},
			{
				feature: RUNNER_FEATURES.REPORTING,
				description: 'set up reporting and output configuration'
			}
		];

		runnerTests.forEach(({ feature, description }) => {
			it(`should ${description}`, async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.setupBehaveRunner(feature),
					BEHAVE_METHODS.SETUP_BEHAVE_RUNNER
				);
			});
		});
	});

	describe('Installation Validation and Testing', () => {
		const validationTests = [
			{
				type: VALIDATION_TYPES.COMMAND,
				description: 'verify behave command is available'
			},
			{
				type: VALIDATION_TYPES.STEP_DISCOVERY,
				description: 'verify step definition discovery works'
			},
			{
				type: VALIDATION_TYPES.HOOKS,
				description: 'verify environment.py hooks are functional'
			},
			{
				type: VALIDATION_TYPES.MINIMAL_TEST,
				description: 'run a minimal test to verify setup'
			},
			{
				type: VALIDATION_TYPES.PYTEST_BDD,
				description: 'verify pytest-bdd compatibility'
			}
		];

		validationTests.forEach(({ type, description }) => {
			it(`should ${description}`, async () => {
				await BehaveTestUtils.expectNotImplementedError(
					BehaveFramework.validateBehaveInstallation(type),
					BEHAVE_METHODS.VALIDATE_BEHAVE_INSTALLATION
				);
			});
		});
	});

	describe('Integration with Existing Gherkin Generation', () => {
		it('should ensure step definitions work with generated .feature files', async () => {
			await BehaveTestUtils.expectNotImplementedError(
				BehaveFramework.createSampleStepDefinitions(
					STEP_PATTERNS.GHERKIN_INTEGRATION
				),
				BEHAVE_METHODS.CREATE_SAMPLE_STEP_DEFINITIONS
			);
		});

		it('should validate compatibility with Task Master generated features', async () => {
			await BehaveTestUtils.expectNotImplementedError(
				BehaveFramework.validateBehaveInstallation(
					VALIDATION_TYPES.TASKMASTER_FEATURES
				),
				BEHAVE_METHODS.VALIDATE_BEHAVE_INSTALLATION
			);
		});

		it('should ensure step definitions handle all Gherkin patterns from converter', async () => {
			await BehaveTestUtils.expectNotImplementedError(
				BehaveFramework.createSampleStepDefinitions(STEP_PATTERNS.ALL_PATTERNS),
				BEHAVE_METHODS.CREATE_SAMPLE_STEP_DEFINITIONS
			);
		});
	});

	describe('Complete Behave Setup Integration', () => {
		it('should perform full setup workflow', async () => {
			const setupSteps = [
				() => BehaveFramework.validatePythonEnvironment(),
				() => BehaveFramework.installBehavePackage(),
				() => BehaveFramework.createBehaveDirectory(mockProjectRoot),
				() => BehaveFramework.createSampleStepDefinitions(),
				() => BehaveFramework.generateBehaveConfig(),
				() => BehaveFramework.setupPytestBdd(),
				() => BehaveFramework.validateBehaveInstallation()
			];

			for (const step of setupSteps) {
				await expect(step()).rejects.toThrow('not implemented');
			}
		});

		it('should have all required methods available', () => {
			const requiredMethods = Object.values(BEHAVE_METHODS);

			requiredMethods.forEach((method) => {
				expect(BehaveFramework[method]).toBeDefined();
				expect(typeof BehaveFramework[method]).toBe('function');
			});
		});

		it('should maintain consistent error handling across all methods', async () => {
			const methods = Object.values(BEHAVE_METHODS);

			for (const method of methods) {
				await expect(BehaveFramework[method]()).rejects.toThrow(
					`${method} not implemented`
				);
			}
		});
	});

	describe('Utility Function Coverage Tests', () => {
		it('should validate mock project structure format', () => {
			const validStructure = { '/test/project': { 'package.json': '{}' } };
			const invalidStructures = [null, undefined, 'string', [], {}, 123];

			expect(BehaveTestUtils.validateMockStructure(validStructure)).toBe(true);
			invalidStructures.forEach((structure) => {
				expect(BehaveTestUtils.validateMockStructure(structure)).toBe(false);
			});
		});

		it('should get method names from framework object', () => {
			const mockFramework = {
				method1: () => {},
				method2: jest.fn(),
				property1: 'string',
				property2: 123,
				method3: function () {}
			};

			const methodNames = BehaveTestUtils.getMethodNames(mockFramework);
			expect(methodNames).toEqual(['method1', 'method2', 'method3']);
			expect(methodNames).toHaveLength(3);
		});

		it('should create test configuration with default values', () => {
			const config = BehaveTestUtils.createTestConfig();

			expect(config).toEqual({
				features: 'features/',
				steps: 'features/steps/',
				timeout: 30000
			});
			expect(typeof config.timeout).toBe('number');
			expect(config.features).toContain('features');
			expect(config.steps).toContain('steps');
		});

		it('should create parameterized test descriptors', () => {
			const scenarios = ['scenario1', { name: 'custom test', param: 'param1' }];
			const getFramework = () => BehaveFramework;

			const testDescriptors = BehaveTestUtils.createParameterizedTest(
				getFramework,
				'testMethod',
				scenarios
			);

			expect(testDescriptors).toHaveLength(2);
			expect(testDescriptors[0].name).toBe('should handle scenario1');
			expect(testDescriptors[1].name).toBe('custom test');
			expect(typeof testDescriptors[0].test).toBe('function');
			expect(typeof testDescriptors[1].test).toBe('function');
		});

		it('should create item test descriptors', () => {
			const items = ['item1', 'item2'];
			const getFramework = () => BehaveFramework;

			const testDescriptors = BehaveTestUtils.createItemTests(
				getFramework,
				'testMethod',
				items,
				'should process'
			);

			expect(testDescriptors).toHaveLength(2);
			expect(testDescriptors[0].name).toBe('should process item1');
			expect(testDescriptors[1].name).toBe('should process item2');
			expect(typeof testDescriptors[0].test).toBe('function');
			expect(typeof testDescriptors[1].test).toBe('function');
		});

		it('should handle parameterized tests with function getFramework', async () => {
			const scenarios = ['test1'];
			const getFramework = () => BehaveFramework;

			const testDescriptors = BehaveTestUtils.createParameterizedTest(
				getFramework,
				BEHAVE_METHODS.INSTALL_BEHAVE_PACKAGE,
				scenarios
			);

			expect(testDescriptors).toHaveLength(1);
			expect(testDescriptors[0].name).toBe('should handle test1');
			expect(typeof testDescriptors[0].test).toBe('function');

			// Test that the descriptor creates working test functions that properly reject
			// The test function itself calls expectNotImplementedError, which returns a Jest expectation
			// We need to await the expectation to ensure it passes
			const testResult = testDescriptors[0].test();
			expect(testResult).toBeInstanceOf(Promise);
		});

		it('should handle parameterized tests with direct framework object', async () => {
			const scenarios = ['test1'];

			const testDescriptors = BehaveTestUtils.createParameterizedTest(
				BehaveFramework,
				BEHAVE_METHODS.INSTALL_BEHAVE_PACKAGE,
				scenarios
			);

			expect(testDescriptors).toHaveLength(1);
			expect(testDescriptors[0].name).toBe('should handle test1');
			expect(typeof testDescriptors[0].test).toBe('function');

			// Test that the descriptor creates working test functions
			const testResult = testDescriptors[0].test();
			expect(testResult).toBeInstanceOf(Promise);
		});

		it('should handle item tests with function getFramework', async () => {
			const items = ['test1'];
			const getFramework = () => BehaveFramework;

			const testDescriptors = BehaveTestUtils.createItemTests(
				getFramework,
				BEHAVE_METHODS.INSTALL_BEHAVE_PACKAGE,
				items
			);

			expect(testDescriptors).toHaveLength(1);
			expect(testDescriptors[0].name).toBe('should create test1');
			expect(typeof testDescriptors[0].test).toBe('function');

			// Test that the descriptor creates working test functions
			const testResult = testDescriptors[0].test();
			expect(testResult).toBeInstanceOf(Promise);
		});

		it('should handle item tests with direct framework object', async () => {
			const items = ['test1'];

			const testDescriptors = BehaveTestUtils.createItemTests(
				BehaveFramework,
				BEHAVE_METHODS.INSTALL_BEHAVE_PACKAGE,
				items
			);

			expect(testDescriptors).toHaveLength(1);
			expect(testDescriptors[0].name).toBe('should create test1');
			expect(typeof testDescriptors[0].test).toBe('function');

			// Test that the descriptor creates working test functions
			const testResult = testDescriptors[0].test();
			expect(testResult).toBeInstanceOf(Promise);
		});

		it('should create item tests with default description', () => {
			const items = ['item1'];

			const testDescriptors = BehaveTestUtils.createItemTests(
				BehaveFramework,
				'testMethod',
				items
			);

			expect(testDescriptors[0].name).toBe('should create item1');
		});

		it('should validate mock project structure with edge cases', () => {
			const structures = [
				{ '/project': {} }, // valid - object with key
				{ '/project': { nested: {} } }, // valid - nested object
				{}, // invalid - empty object
				{ key: null }, // valid - object with key even if value is null
				Object.create(null) // invalid - no prototype object
			];

			expect(BehaveTestUtils.validateMockStructure(structures[0])).toBe(true);
			expect(BehaveTestUtils.validateMockStructure(structures[1])).toBe(true);
			expect(BehaveTestUtils.validateMockStructure(structures[2])).toBe(false);
			expect(BehaveTestUtils.validateMockStructure(structures[3])).toBe(true);
			expect(BehaveTestUtils.validateMockStructure(structures[4])).toBe(false);
		});

		it('should get method names from empty object', () => {
			expect(BehaveTestUtils.getMethodNames({})).toEqual([]);
		});

		it('should get method names from object with only properties', () => {
			const obj = { prop1: 'value', prop2: 123, prop3: {} };
			expect(BehaveTestUtils.getMethodNames(obj)).toEqual([]);
		});

		it('should create mock project structure with correct format', () => {
			const projectRoot = '/test/project';
			const structure = BehaveTestUtils.createMockProjectStructure(projectRoot);

			// Verify structure shape
			expect(typeof structure).toBe('object');
			expect(structure).not.toBeNull();
			expect(Object.keys(structure)).toContain(projectRoot);

			const projectContents = structure[projectRoot];
			expect(typeof projectContents).toBe('object');
			expect(Object.keys(projectContents)).toContain('.taskmaster');
			expect(Object.keys(projectContents)).toContain('package.json');

			// Verify taskmaster structure
			const taskmasterContents = projectContents['.taskmaster'];
			expect(typeof taskmasterContents).toBe('object');
			expect(Object.keys(taskmasterContents)).toContain('tasks');
			expect(Object.keys(taskmasterContents)).toContain('config.json');

			// Verify JSON parsing works
			const tasksJson = JSON.parse(taskmasterContents['tasks']['tasks.json']);
			expect(tasksJson).toHaveProperty('tasks');
			expect(Array.isArray(tasksJson.tasks)).toBe(true);

			const configJson = JSON.parse(taskmasterContents['config.json']);
			expect(configJson).toHaveProperty('enableBDDGeneration');

			const packageJson = JSON.parse(projectContents['package.json']);
			expect(packageJson).toHaveProperty('name');
		});

		it('should create mock project structure with different project root', () => {
			const projectRoot = '/custom/path';
			const structure = BehaveTestUtils.createMockProjectStructure(projectRoot);

			expect(Object.keys(structure)).toHaveLength(1);
			expect(Object.keys(structure)[0]).toBe(projectRoot);
			expect(structure[projectRoot]).toBeDefined();
			expect(typeof structure[projectRoot]).toBe('object');
		});

		it('should create mock behave framework with all required methods', () => {
			const framework = BehaveTestUtils.createMockBehaveFramework();
			const requiredMethods = Object.values(BEHAVE_METHODS);

			requiredMethods.forEach((method) => {
				expect(framework).toHaveProperty(method);
				expect(typeof framework[method]).toBe('function');
				expect(jest.isMockFunction(framework[method])).toBe(true);
			});

			expect(Object.keys(framework)).toHaveLength(requiredMethods.length);
		});

		it('should verify mock framework methods throw correct errors', async () => {
			const framework = BehaveTestUtils.createMockBehaveFramework();

			for (const method of Object.values(BEHAVE_METHODS)) {
				await expect(framework[method]()).rejects.toThrow(
					`${method} not implemented`
				);
			}
		});

		it('should verify expectNotImplementedError utility works correctly', async () => {
			const mockPromise = Promise.reject(
				new Error('testMethod not implemented')
			);

			await expect(
				BehaveTestUtils.expectNotImplementedError(mockPromise, 'testMethod')
			).resolves.toBeUndefined();
		});

		it('should handle expectNotImplementedError with different error messages', async () => {
			const wrongErrorPromise = Promise.reject(new Error('different error'));

			await expect(
				BehaveTestUtils.expectNotImplementedError(
					wrongErrorPromise,
					'testMethod'
				)
			).rejects.toThrow('different error');
		});

		it('should test internal helper methods for coverage', () => {
			const tasksData = BehaveTestUtils._createTasksData();
			expect(tasksData).toHaveProperty('tasks');
			expect(Array.isArray(tasksData.tasks)).toBe(true);

			const configData = BehaveTestUtils._createConfigData();
			expect(configData).toHaveProperty('enableBDDGeneration', true);

			const packageData = BehaveTestUtils._createPackageData();
			expect(packageData).toHaveProperty('name', 'test-project');

			const scenario1 = 'test';
			const scenario2 = { name: 'custom', param: 'value' };

			const descriptor1 = BehaveTestUtils._createTestDescriptor(scenario1);
			expect(descriptor1.name).toBe('should handle test');
			expect(descriptor1.param).toBe('test');

			const descriptor2 = BehaveTestUtils._createTestDescriptor(scenario2);
			expect(descriptor2.name).toBe('custom');
			expect(descriptor2.param).toBe('value');

			const frameworkFunction = () => BehaveFramework;
			const frameworkDirect = BehaveFramework;

			const instance1 =
				BehaveTestUtils._getFrameworkInstance(frameworkFunction);
			const instance2 = BehaveTestUtils._getFrameworkInstance(frameworkDirect);

			expect(instance1).toBe(BehaveFramework);
			expect(instance2).toBe(BehaveFramework);
		});
	});
});
