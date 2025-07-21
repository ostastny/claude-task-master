import { jest } from '@jest/globals';
import { BEHAVE_METHODS } from './behave-test-constants.js';

/**
 * Utility functions for Behave Framework Testing (Task 110.1)
 */
export class BehaveTestUtils {
	/**
	 * Creates a mock project structure for testing
	 */
	static createMockProjectStructure(projectRoot) {
		const tasksData = BehaveTestUtils._createTasksData();
		const configData = BehaveTestUtils._createConfigData();
		const packageData = BehaveTestUtils._createPackageData();

		return {
			[projectRoot]: {
				'.taskmaster': {
					tasks: {
						'tasks.json': JSON.stringify(tasksData, null, 2)
					},
					'config.json': JSON.stringify(configData, null, 2)
				},
				'package.json': JSON.stringify(packageData, null, 2)
			}
		};
	}

	/**
	 * Creates tasks data for mock project structure
	 */
	static _createTasksData() {
		return {
			tasks: [
				{
					id: 110,
					title: 'Add Python BDD Framework Compatibility (Behave)',
					status: 'in-progress',
					subtasks: [
						{
							id: 1,
							title: 'Setup Behave Framework Testing Environment',
							status: 'in-progress'
						}
					]
				}
			]
		};
	}

	/**
	 * Creates config data for mock project structure
	 */
	static _createConfigData() {
		return {
			enableBDDGeneration: true,
			pythonBDDCompatibility: true
		};
	}

	/**
	 * Creates package data for mock project structure
	 */
	static _createPackageData() {
		return {
			name: 'test-project',
			devDependencies: {}
		};
	}

	/**
	 * Helper to create a mock method that rejects with not implemented error
	 */
	static _createMockMethod(methodName) {
		return jest
			.fn()
			.mockRejectedValue(new Error(`${methodName} not implemented`));
	}

	/**
	 * Creates a mock Behave framework with all methods
	 */
	static createMockBehaveFramework() {
		const mockModule = {};

		Object.values(BEHAVE_METHODS).forEach((method) => {
			mockModule[method] = BehaveTestUtils._createMockMethod(method);
		});

		return mockModule;
	}

	/**
	 * Helper to assert that a method throws a "not implemented" error
	 */
	static expectNotImplementedError(testPromise, methodName) {
		return expect(testPromise).rejects.toThrow(`${methodName} not implemented`);
	}

	/**
	 * Helper to create a single parameterized test
	 */
	static _createSingleParameterizedTest(getFramework, methodName, scenario) {
		const testDescriptor = BehaveTestUtils._createTestDescriptor(scenario);

		return {
			name: testDescriptor.name,
			test: async () => {
				const framework = BehaveTestUtils._getFrameworkInstance(getFramework);
				await BehaveTestUtils.expectNotImplementedError(
					framework[methodName](testDescriptor.param),
					methodName
				);
			}
		};
	}

	/**
	 * Creates a parameterized test for a method with multiple scenarios
	 */
	static createParameterizedTest(getFramework, methodName, scenarios) {
		return scenarios.map((scenario) =>
			BehaveTestUtils._createSingleParameterizedTest(
				getFramework,
				methodName,
				scenario
			)
		);
	}

	/**
	 * Creates test descriptor from scenario
	 */
	static _createTestDescriptor(scenario) {
		const isString = typeof scenario === 'string';
		return {
			name: isString ? `should handle ${scenario}` : scenario.name,
			param: isString ? scenario : scenario.param
		};
	}

	/**
	 * Gets framework instance from getter
	 */
	static _getFrameworkInstance(getFramework) {
		return typeof getFramework === 'function' ? getFramework() : getFramework;
	}

	/**
	 * Helper to create a single item test
	 */
	static _createSingleItemTest(getFramework, methodName, item, description) {
		return {
			name: `${description} ${item}`,
			test: async () => {
				const framework = BehaveTestUtils._getFrameworkInstance(getFramework);
				await BehaveTestUtils.expectNotImplementedError(
					framework[methodName](item),
					methodName
				);
			}
		};
	}

	/**
	 * Creates tests for a list of items with a method
	 */
	static createItemTests(
		getFramework,
		methodName,
		items,
		description = 'should create'
	) {
		return items.map((item) =>
			BehaveTestUtils._createSingleItemTest(
				getFramework,
				methodName,
				item,
				description
			)
		);
	}

	/**
	 * Helper to check if structure is valid object type
	 */
	static _isValidObjectType(structure) {
		return (
			structure && typeof structure === 'object' && !Array.isArray(structure)
		);
	}

	/**
	 * Helper to check if structure has content
	 */
	static _hasContent(structure) {
		return Object.keys(structure).length > 0;
	}

	/**
	 * Validates mock project structure format
	 */
	static validateMockStructure(structure) {
		if (!BehaveTestUtils._isValidObjectType(structure)) {
			return false;
		}

		return BehaveTestUtils._hasContent(structure);
	}

	/**
	 * Gets method names from a framework object
	 */
	static getMethodNames(framework) {
		return Object.keys(framework).filter(
			(key) => typeof framework[key] === 'function'
		);
	}

	/**
	 * Creates a minimal test configuration
	 */
	static createTestConfig() {
		return {
			features: 'features/',
			steps: 'features/steps/',
			timeout: 30000
		};
	}
}
