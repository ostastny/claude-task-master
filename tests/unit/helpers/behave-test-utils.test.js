/**
 * Tests for BehaveTestUtils utility functions
 * This test ensures comprehensive coverage of utility helper functions
 */

import { jest } from '@jest/globals';
import mockFs from 'mock-fs';
import { BehaveTestUtils } from './behave-test-utils.js';
import { BEHAVE_METHODS } from './behave-test-constants.js';

describe('BehaveTestUtils', () => {
	afterEach(() => {
		mockFs.restore();
		jest.clearAllMocks();
	});

	describe('createMockProjectStructure', () => {
		it('should create a valid mock project structure', () => {
			const projectRoot = '/test/project';
			const structure = BehaveTestUtils.createMockProjectStructure(projectRoot);

			expect(structure).toBeDefined();
			expect(structure[projectRoot]).toBeDefined();
			expect(structure[projectRoot]['.taskmaster']).toBeDefined();
			expect(structure[projectRoot]['.taskmaster']['tasks']).toBeDefined();
			expect(
				structure[projectRoot]['.taskmaster']['config.json']
			).toBeDefined();
			expect(structure[projectRoot]['package.json']).toBeDefined();
		});

		it('should create structure with valid JSON content', () => {
			const projectRoot = '/test/project';
			const structure = BehaveTestUtils.createMockProjectStructure(projectRoot);

			const tasksJson =
				structure[projectRoot]['.taskmaster']['tasks']['tasks.json'];
			const configJson = structure[projectRoot]['.taskmaster']['config.json'];
			const packageJson = structure[projectRoot]['package.json'];

			expect(() => JSON.parse(tasksJson)).not.toThrow();
			expect(() => JSON.parse(configJson)).not.toThrow();
			expect(() => JSON.parse(packageJson)).not.toThrow();
		});

		it('should include task 110 data in the structure', () => {
			const projectRoot = '/test/project';
			const structure = BehaveTestUtils.createMockProjectStructure(projectRoot);

			const tasksJson =
				structure[projectRoot]['.taskmaster']['tasks']['tasks.json'];
			const tasks = JSON.parse(tasksJson);

			expect(tasks.tasks).toHaveLength(1);
			expect(tasks.tasks[0].id).toBe(110);
			expect(tasks.tasks[0].title).toBe(
				'Add Python BDD Framework Compatibility (Behave)'
			);
			expect(tasks.tasks[0].subtasks).toHaveLength(1);
			expect(tasks.tasks[0].subtasks[0].id).toBe(1);
		});

		it('should create structure for different project roots', () => {
			const projectRoots = ['/project1', '/home/user/project', '/var/tmp/test'];

			projectRoots.forEach((root) => {
				const structure = BehaveTestUtils.createMockProjectStructure(root);
				expect(structure[root]).toBeDefined();
			});
		});
	});

	describe('createMockBehaveFramework', () => {
		it('should create a framework object with all required methods', () => {
			const framework = BehaveTestUtils.createMockBehaveFramework();

			const expectedMethods = Object.values(BEHAVE_METHODS);
			expectedMethods.forEach((method) => {
				expect(framework[method]).toBeDefined();
				expect(typeof framework[method]).toBe('function');
			});
		});

		it('should create methods that return rejected promises', async () => {
			const framework = BehaveTestUtils.createMockBehaveFramework();

			for (const method of Object.values(BEHAVE_METHODS)) {
				await expect(framework[method]()).rejects.toThrow(
					`${method} not implemented`
				);
			}
		});

		it('should create jest mock functions', () => {
			const framework = BehaveTestUtils.createMockBehaveFramework();

			Object.values(BEHAVE_METHODS).forEach((method) => {
				expect(jest.isMockFunction(framework[method])).toBe(true);
			});
		});

		it('should allow method calls with different parameters', async () => {
			const framework = BehaveTestUtils.createMockBehaveFramework();

			await expect(framework.installBehavePackage()).rejects.toThrow();
			await expect(
				framework.installBehavePackage('/some/path')
			).rejects.toThrow();
			await expect(
				framework.installBehavePackage('param1', 'param2')
			).rejects.toThrow();
		});
	});

	describe('expectNotImplementedError', () => {
		it('should correctly validate not implemented errors', async () => {
			const framework = BehaveTestUtils.createMockBehaveFramework();

			await BehaveTestUtils.expectNotImplementedError(
				framework.installBehavePackage(),
				'installBehavePackage'
			);
		});

		it('should work with different method names', async () => {
			const framework = BehaveTestUtils.createMockBehaveFramework();

			const methodNames = [
				'validatePythonEnvironment',
				'createBehaveDirectory',
				'generateBehaveConfig'
			];

			for (const methodName of methodNames) {
				await BehaveTestUtils.expectNotImplementedError(
					framework[methodName](),
					methodName
				);
			}
		});

		it('should handle promises that resolve', async () => {
			const resolvedPromise = Promise.resolve('success');

			await expect(
				BehaveTestUtils.expectNotImplementedError(resolvedPromise, 'testMethod')
			).rejects.toThrow();
		});

		it('should handle promises with different error messages', async () => {
			const customError = Promise.reject(new Error('custom error'));

			await expect(
				BehaveTestUtils.expectNotImplementedError(customError, 'testMethod')
			).rejects.toThrow();
		});
	});

	describe('createParameterizedTest', () => {
		it('should return test descriptors for string scenarios', () => {
			const mockFramework = BehaveTestUtils.createMockBehaveFramework();
			const scenarios = ['scenario1', 'scenario2', 'scenario3'];

			const testDescriptors = BehaveTestUtils.createParameterizedTest(
				() => mockFramework,
				'installBehavePackage',
				scenarios
			);

			expect(testDescriptors).toHaveLength(3);
			expect(testDescriptors[0]).toHaveProperty('name');
			expect(testDescriptors[0]).toHaveProperty('test');
			expect(testDescriptors[0].name).toBe('should handle scenario1');
			expect(typeof testDescriptors[0].test).toBe('function');
		});

		it('should return test descriptors for object scenarios', () => {
			const mockFramework = BehaveTestUtils.createMockBehaveFramework();
			const scenarios = [
				{ name: 'test scenario 1', param: 'param1' },
				{ name: 'test scenario 2', param: 'param2' }
			];

			const testDescriptors = BehaveTestUtils.createParameterizedTest(
				() => mockFramework,
				'installBehavePackage',
				scenarios
			);

			expect(testDescriptors).toHaveLength(2);
			expect(testDescriptors[0].name).toBe('test scenario 1');
			expect(testDescriptors[1].name).toBe('test scenario 2');
		});

		it('should handle framework factory function', async () => {
			const mockFramework = BehaveTestUtils.createMockBehaveFramework();
			const scenarios = ['test'];

			const testDescriptors = BehaveTestUtils.createParameterizedTest(
				() => mockFramework,
				'validatePythonEnvironment',
				scenarios
			);

			expect(testDescriptors).toHaveLength(1);
			// Execute the test to verify it works
			await expect(testDescriptors[0].test()).resolves.not.toThrow();
		});

		it('should handle framework object directly', async () => {
			const mockFramework = BehaveTestUtils.createMockBehaveFramework();
			const scenarios = ['test'];

			const testDescriptors = BehaveTestUtils.createParameterizedTest(
				mockFramework,
				'validatePythonEnvironment',
				scenarios
			);

			expect(testDescriptors).toHaveLength(1);
			// Execute the test to verify it works
			await expect(testDescriptors[0].test()).resolves.not.toThrow();
		});
	});

	describe('createItemTests', () => {
		it('should return test descriptors for multiple items', () => {
			const mockFramework = BehaveTestUtils.createMockBehaveFramework();
			const items = ['item1', 'item2', 'item3'];

			const testDescriptors = BehaveTestUtils.createItemTests(
				() => mockFramework,
				'createSampleStepDefinitions',
				items
			);

			expect(testDescriptors).toHaveLength(3);
			expect(testDescriptors[0]).toHaveProperty('name');
			expect(testDescriptors[0]).toHaveProperty('test');
			expect(testDescriptors[0].name).toBe('should create item1');
			expect(typeof testDescriptors[0].test).toBe('function');
		});

		it('should use custom description', () => {
			const mockFramework = BehaveTestUtils.createMockBehaveFramework();
			const items = ['test.py'];

			const testDescriptors = BehaveTestUtils.createItemTests(
				() => mockFramework,
				'createSampleStepDefinitions',
				items,
				'should generate'
			);

			expect(testDescriptors).toHaveLength(1);
			expect(testDescriptors[0].name).toBe('should generate test.py');
		});

		it('should handle empty items array', () => {
			const mockFramework = BehaveTestUtils.createMockBehaveFramework();
			const items = [];

			const testDescriptors = BehaveTestUtils.createItemTests(
				() => mockFramework,
				'createSampleStepDefinitions',
				items
			);

			expect(testDescriptors).toHaveLength(0);
		});

		it('should work with framework object directly', async () => {
			const mockFramework = BehaveTestUtils.createMockBehaveFramework();
			const items = ['test'];

			const testDescriptors = BehaveTestUtils.createItemTests(
				mockFramework,
				'createSampleStepDefinitions',
				items
			);

			expect(testDescriptors).toHaveLength(1);
			// Execute the test to verify it works
			await expect(testDescriptors[0].test()).resolves.not.toThrow();
		});
	});

	describe('validateMockStructure', () => {
		it('should validate correct mock structures', () => {
			const validStructures = [
				{ '/project': { 'file.js': 'content' } },
				{ '/test': { nested: { 'file.txt': 'data' } } },
				{ simple: 'structure' }
			];

			validStructures.forEach((structure) => {
				expect(BehaveTestUtils.validateMockStructure(structure)).toBe(true);
			});
		});

		it('should reject invalid structures', () => {
			const invalidStructures = [
				null,
				undefined,
				'',
				0,
				[],
				{} // Empty object should return false
			];

			invalidStructures.forEach((structure) => {
				expect(BehaveTestUtils.validateMockStructure(structure)).toBe(false);
			});
		});

		it('should handle non-object types', () => {
			const nonObjects = ['string', 123, true, false, Symbol('test')];

			nonObjects.forEach((value) => {
				expect(BehaveTestUtils.validateMockStructure(value)).toBe(false);
			});
		});

		it('should handle complex nested structures', () => {
			const complexStructure = {
				'/project': {
					src: {
						'main.js': 'code',
						utils: {
							'helper.js': 'utils'
						}
					},
					'package.json': '{"name": "test"}'
				}
			};

			expect(BehaveTestUtils.validateMockStructure(complexStructure)).toBe(
				true
			);
		});
	});

	describe('getMethodNames', () => {
		it('should extract method names from framework object', () => {
			const framework = BehaveTestUtils.createMockBehaveFramework();
			const methodNames = BehaveTestUtils.getMethodNames(framework);

			expect(methodNames).toEqual(Object.values(BEHAVE_METHODS));
			expect(methodNames.length).toBeGreaterThan(0);
		});

		it('should filter out non-function properties', () => {
			const mixedObject = {
				method1: jest.fn(),
				method2: jest.fn(),
				property1: 'string',
				property2: 123,
				property3: {}
			};

			const methodNames = BehaveTestUtils.getMethodNames(mixedObject);
			expect(methodNames).toEqual(['method1', 'method2']);
		});

		it('should handle empty objects', () => {
			const methodNames = BehaveTestUtils.getMethodNames({});
			expect(methodNames).toEqual([]);
		});

		it('should handle objects with no methods', () => {
			const noMethods = {
				prop1: 'value',
				prop2: 123,
				prop3: []
			};

			const methodNames = BehaveTestUtils.getMethodNames(noMethods);
			expect(methodNames).toEqual([]);
		});
	});

	describe('createTestConfig', () => {
		it('should create a valid test configuration', () => {
			const config = BehaveTestUtils.createTestConfig();

			expect(config).toBeDefined();
			expect(config.features).toBe('features/');
			expect(config.steps).toBe('features/steps/');
			expect(config.timeout).toBe(30000);
		});

		it('should create consistent configurations', () => {
			const config1 = BehaveTestUtils.createTestConfig();
			const config2 = BehaveTestUtils.createTestConfig();

			expect(config1).toEqual(config2);
		});

		it('should have all required properties', () => {
			const config = BehaveTestUtils.createTestConfig();

			expect(config).toHaveProperty('features');
			expect(config).toHaveProperty('steps');
			expect(config).toHaveProperty('timeout');
		});

		it('should have correct data types', () => {
			const config = BehaveTestUtils.createTestConfig();

			expect(typeof config.features).toBe('string');
			expect(typeof config.steps).toBe('string');
			expect(typeof config.timeout).toBe('number');
		});
	});

	describe('Integration with mock-fs', () => {
		it('should work with mock filesystem', () => {
			const projectRoot = '/test/project';
			const structure = BehaveTestUtils.createMockProjectStructure(projectRoot);

			mockFs(structure);

			expect(BehaveTestUtils.validateMockStructure(structure)).toBe(true);
		});

		it('should handle multiple mock structures', () => {
			const structures = [
				BehaveTestUtils.createMockProjectStructure('/project1'),
				BehaveTestUtils.createMockProjectStructure('/project2')
			];

			structures.forEach((structure) => {
				expect(BehaveTestUtils.validateMockStructure(structure)).toBe(true);
			});
		});
	});

	describe('Error handling and edge cases', () => {
		it('should handle undefined parameters gracefully', () => {
			expect(() =>
				BehaveTestUtils.validateMockStructure(undefined)
			).not.toThrow();
			expect(() => BehaveTestUtils.getMethodNames(undefined)).toThrow();
		});

		it('should handle null parameters', () => {
			expect(() => BehaveTestUtils.validateMockStructure(null)).not.toThrow();
			expect(() => BehaveTestUtils.getMethodNames(null)).toThrow();
		});

		it('should create framework with all expected methods', () => {
			const framework = BehaveTestUtils.createMockBehaveFramework();
			const expectedMethodCount = Object.keys(BEHAVE_METHODS).length;
			const actualMethodCount = Object.keys(framework).length;

			expect(actualMethodCount).toBe(expectedMethodCount);
		});
	});
});
