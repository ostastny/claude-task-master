/**
 * Test helper functions for Behave Framework Testing (Task 110.2)
 * Common test patterns and utilities to reduce code duplication
 */

/**
 * Creates a standard async test that validates a method call and expected result
 */
export function createAsyncTest(
	getInstance,
	methodName,
	input,
	expectedResult
) {
	return async () => {
		const instance =
			typeof getInstance === 'function' ? getInstance() : getInstance;
		const result = await instance[methodName](input);
		expect(result).toEqual(expectedResult);
	};
}

/**
 * Creates a test for methods that take config objects
 */
export function createConfigTest(
	getInstance,
	methodName,
	config,
	expectedResult
) {
	return async () => {
		const instance =
			typeof getInstance === 'function' ? getInstance() : getInstance;
		const result = await instance[methodName](config);
		expect(result).toEqual(expectedResult);
	};
}

/**
 * Creates a parameterized test for complexity levels
 */
export function createComplexityTest(getValidator, level, complexityLevels) {
	return async () => {
		const validator =
			typeof getValidator === 'function' ? getValidator() : getValidator;
		const complexityConfig = {
			level: level,
			features: 10 * (complexityLevels.indexOf(level) + 1),
			scenarios: 20 * (complexityLevels.indexOf(level) + 1)
		};
		const expectedResult = { compatible: true, level: level, tested: true };

		const result = await validator.testExecutionCompatibility(complexityConfig);
		expect(result).toEqual(expectedResult);
	};
}

/**
 * Creates a test suite for a group of related tests
 */
export function createTestGroup(description, tests) {
	return describe(description, () => {
		tests.forEach((test) => {
			it(test.name, test.test);
		});
	});
}

/**
 * Creates multiple tests from a test configuration
 */
export function createMultipleTests(testConfigs) {
	return testConfigs.map((config) => ({
		name: config.name,
		test: createAsyncTest(
			config.instance,
			config.method,
			config.input,
			config.expected
		)
	}));
}

/**
 * Helper to create test instances
 */
export function createTestInstances(mockClasses) {
	const instances = {};
	Object.entries(mockClasses).forEach(([key, MockClass]) => {
		instances[key] = new MockClass();
	});
	return instances;
}

/**
 * Helper to parse all feature files
 */
async function parseAllFeatureFiles(validator, featureFiles) {
	const results = [];
	for (const featureFile of featureFiles) {
		const result = await validator.parseFeatureFile(featureFile);
		results.push(result);
	}
	return results;
}

/**
 * Helper to create aggregated result from parsing results
 */
function createAggregatedResult(results) {
	return {
		totalFiles: results.length,
		parsedSuccessfully: results.filter((r) => r.valid).length,
		parseErrors: results.filter((r) => !r.valid),
		allValid: results.every((r) => r.valid)
	};
}

/**
 * Helper to get expected verification result
 */
function getExpectedVerificationResult() {
	return {
		totalFiles: 10,
		parsedSuccessfully: 10,
		parseErrors: [],
		allValid: true
	};
}

/**
 * Creates a feature file parsing verification test
 */
export function createFeatureFileVerificationTest(getValidator, featureFiles) {
	return async () => {
		const validator =
			typeof getValidator === 'function' ? getValidator() : getValidator;
		const results = await parseAllFeatureFiles(validator, featureFiles);
		const aggregatedResult = createAggregatedResult(results);
		const expectedResult = getExpectedVerificationResult();

		expect(aggregatedResult).toEqual(expectedResult);
	};
}
