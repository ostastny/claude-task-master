import { jest } from '@jest/globals';
import { BEHAVE_METHODS } from './helpers/behave-test-constants.js';
import { EXPECTED_RESULTS, TEST_DATA } from './helpers/behave-test-data.js';
import {
	createAsyncTest,
	createComplexityTest,
	createConfigTest,
	createFeatureFileVerificationTest,
	createTestInstances
} from './helpers/behave-test-helpers.js';
import {
	BehaveExecutionEngine,
	BehaveValidator,
	FeatureFileParser,
	PythonSyntaxChecker
} from './helpers/behave-test-mocks.js';
import { BehaveTestUtils } from './helpers/behave-test-utils.js';

/**
 * Unit Tests for Task 110.2: Validate Generated Feature Files with Behave
 *
 * Test Requirements:
 * 1. Feature file syntax validation against Behave parser
 * 2. Feature file execution compatibility testing
 * 3. Python-specific Gherkin syntax requirements documentation
 * 4. PRD complexity level compatibility validation
 * 5. Feature file parsing verification
 *
 * These tests are written in TDD fashion - they will FAIL until proper implementation is done
 */

describe('Task 110.2: Validate Generated Feature Files with Behave', () => {
	let instances;

	beforeEach(() => {
		instances = createTestInstances({
			behaveValidator: BehaveValidator,
			featureFileParser: FeatureFileParser,
			executionEngine: BehaveExecutionEngine,
			syntaxChecker: PythonSyntaxChecker
		});
	});

	describe('Feature File Syntax Validation', () => {
		it(
			'should successfully validate feature file syntax against Behave parser',
			createAsyncTest(
				() => instances.behaveValidator,
				'validateFeatureFileSyntax',
				TEST_DATA.INPUTS.FEATURE_FILE,
				EXPECTED_RESULTS.VALID_SYNTAX
			)
		);

		it(
			'should successfully parse individual feature files',
			createAsyncTest(
				() => instances.behaveValidator,
				'parseFeatureFile',
				TEST_DATA.INPUTS.FEATURE_FILE_PATH,
				EXPECTED_RESULTS.PARSED_FEATURE
			)
		);

		it(
			'should successfully check Gherkin compatibility with Behave',
			createAsyncTest(
				() => instances.behaveValidator,
				'checkGherkinCompatibility',
				TEST_DATA.INPUTS.GHERKIN_CONTENT,
				EXPECTED_RESULTS.GHERKIN_COMPATIBLE
			)
		);

		it(
			'should successfully validate Python-specific Gherkin syntax requirements',
			createConfigTest(
				() => instances.behaveValidator,
				'validatePythonSyntaxRequirements',
				TEST_DATA.CONFIGS.SYNTAX_RULES,
				EXPECTED_RESULTS.PYTHON_COMPLIANT
			)
		);
	});

	describe('Feature File Parser Testing', () => {
		it(
			'should successfully load all generated feature files',
			createAsyncTest(
				() => instances.featureFileParser,
				'loadFeatureFiles',
				TEST_DATA.INPUTS.FEATURES_DIRECTORY,
				EXPECTED_RESULTS.LOADED_FILES
			)
		);

		it(
			'should successfully extract scenarios from feature files',
			createAsyncTest(
				() => instances.featureFileParser,
				'extractScenarios',
				TEST_DATA.INPUTS.FEATURE_CONTENT,
				EXPECTED_RESULTS.EXTRACTED_SCENARIOS
			)
		);

		it(
			'should successfully validate feature file structure',
			createAsyncTest(
				() => instances.featureFileParser,
				'validateFileStructure',
				EXPECTED_RESULTS.PARSED_FEATURE,
				EXPECTED_RESULTS.VALID_STRUCTURE
			)
		);

		it(
			'should successfully check step definitions compatibility',
			createAsyncTest(
				() => instances.featureFileParser,
				'checkStepDefinitions',
				TEST_DATA.INPUTS.VALID_STEP_DEFINITIONS,
				EXPECTED_RESULTS.STEP_DEFINITIONS_COMPATIBLE
			)
		);
	});

	describe('Behave Execution Engine Testing', () => {
		it(
			'should successfully run Behave parser against feature files',
			createConfigTest(
				() => instances.executionEngine,
				'runBehaveParser',
				TEST_DATA.CONFIGS.PARSE_OPTIONS,
				EXPECTED_RESULTS.PARSER_SUCCESS
			)
		);

		it(
			'should successfully execute feature files through Behave',
			createConfigTest(
				() => instances.executionEngine,
				'executeFeatureFiles',
				TEST_DATA.CONFIGS.EXECUTION_CONFIG,
				EXPECTED_RESULTS.EXECUTION_SUCCESS
			)
		);

		it(
			'should successfully validate step discovery mechanism',
			createAsyncTest(
				() => instances.executionEngine,
				'validateStepDiscovery',
				TEST_DATA.INPUTS.STEPS_DIRECTORY,
				EXPECTED_RESULTS.STEP_DISCOVERY_SUCCESS
			)
		);

		it('should successfully check execution results for compatibility', async () => {
			const executionResults = {
				passed: 10,
				failed: 0,
				skipped: 2,
				parseErrors: []
			};
			const result =
				await instances.executionEngine.checkExecutionResults(executionResults);
			expect(result).toEqual(EXPECTED_RESULTS.RESULTS_COMPATIBLE);
		});
	});

	describe('Python-Specific Syntax Requirements', () => {
		it(
			'should successfully check Python Gherkin syntax compatibility',
			createConfigTest(
				() => instances.syntaxChecker,
				'checkPythonGherkinSyntax',
				TEST_DATA.CONFIGS.PYTHON_SYNTAX_FEATURES,
				EXPECTED_RESULTS.PYTHON_FEATURES_COMPATIBLE
			)
		);

		it('should successfully validate Behave-specific keywords', async () => {
			const result = await instances.syntaxChecker.validateBehaveKeywords(
				TEST_DATA.INPUTS.BEHAVE_KEYWORDS
			);
			expect(result).toEqual(
				EXPECTED_RESULTS.BEHAVE_KEYWORDS_VALID(TEST_DATA.INPUTS.BEHAVE_KEYWORDS)
			);
		});

		it(
			'should successfully check step pattern compatibility',
			createConfigTest(
				() => instances.syntaxChecker,
				'checkStepPatternCompatibility',
				TEST_DATA.CONFIGS.STEP_PATTERNS,
				EXPECTED_RESULTS.STEP_PATTERNS_COMPATIBLE
			)
		);

		it(
			'should successfully document syntax requirements',
			createConfigTest(
				() => instances.syntaxChecker,
				'documentSyntaxRequirements',
				TEST_DATA.CONFIGS.DOCUMENTATION_CONFIG,
				EXPECTED_RESULTS.SYNTAX_DOCUMENTED
			)
		);
	});

	describe('PRD Complexity Level Compatibility', () => {
		TEST_DATA.COMPLEXITY_LEVELS.forEach((level) => {
			it(
				`should successfully validate compatibility for ${level} PRD complexity`,
				createComplexityTest(
					() => instances.behaveValidator,
					level,
					TEST_DATA.COMPLEXITY_LEVELS
				)
			);
		});

		it('should successfully test broad compatibility across all complexity levels', async () => {
			const broadCompatibilityTest = {
				levels: TEST_DATA.COMPLEXITY_LEVELS,
				testAllFeatures: true,
				validateParsing: true,
				checkExecution: true
			};
			const result = await instances.behaveValidator.testExecutionCompatibility(
				broadCompatibilityTest
			);
			expect(result).toEqual(EXPECTED_RESULTS.BROAD_COMPATIBILITY);
		});
	});

	describe('Feature File Parsing Verification', () => {
		it(
			'should successfully verify all feature files parse correctly',
			createFeatureFileVerificationTest(
				() => instances.behaveValidator,
				TEST_DATA.ALL_FEATURE_FILES
			)
		);

		it('should successfully verify feature files can be executed', async () => {
			const executionTest = {
				featureFiles: 'all',
				mode: 'dryRun',
				validateSteps: true
			};
			const result =
				await instances.executionEngine.executeFeatureFiles(executionTest);
			expect(result).toEqual(EXPECTED_RESULTS.FILES_EXECUTABLE);
		});
	});

	describe('Syntax Compatibility Issues Identification', () => {
		it(
			'should successfully identify Python-specific syntax limitations',
			createConfigTest(
				() => instances.syntaxChecker,
				'checkPythonGherkinSyntax',
				TEST_DATA.CONFIGS.SYNTAX_LIMITATIONS,
				EXPECTED_RESULTS.PYTHON_LIMITATIONS_CHECK
			)
		);

		it(
			'should successfully document compatibility issues',
			createConfigTest(
				() => instances.syntaxChecker,
				'documentSyntaxRequirements',
				TEST_DATA.CONFIGS.ISSUE_DOCUMENTATION,
				EXPECTED_RESULTS.DOCUMENTATION_WITH_WORKAROUNDS
			)
		);
	});

	describe('Integration with BehaveTestUtils', () => {
		it('should use BehaveTestUtils for mock project structure', () => {
			const mockStructure =
				BehaveTestUtils.createMockProjectStructure('/workspace');
			expect(BehaveTestUtils.validateMockStructure(mockStructure)).toBe(true);
		});

		it('should validate test configuration', () => {
			const config = BehaveTestUtils.createTestConfig();
			expect(config).toHaveProperty('features');
			expect(config).toHaveProperty('steps');
			expect(config).toHaveProperty('timeout');
		});

		it('should create parameterized tests for validation methods', () => {
			const scenarios = [
				'simple_feature',
				'complex_feature',
				'invalid_feature'
			];
			const tests = BehaveTestUtils.createParameterizedTest(
				() => instances.behaveValidator,
				'validateFeatureFileSyntax',
				scenarios
			);

			expect(tests).toHaveLength(3);
			expect(tests[0]).toHaveProperty('name');
			expect(tests[0]).toHaveProperty('test');
		});
	});

	describe('Error Handling and Edge Cases', () => {
		it(
			'should handle malformed feature files gracefully',
			createAsyncTest(
				() => instances.behaveValidator,
				'parseFeatureFile',
				TEST_DATA.INPUTS.MALFORMED_FEATURE,
				EXPECTED_RESULTS.MALFORMED_ERROR
			)
		);

		it(
			'should handle missing step definitions appropriately',
			createAsyncTest(
				() => instances.featureFileParser,
				'checkStepDefinitions',
				TEST_DATA.INPUTS.ORPHANED_STEPS,
				EXPECTED_RESULTS.MISSING_STEPS_ERROR
			)
		);

		it(
			'should handle empty feature files',
			createAsyncTest(
				() => instances.behaveValidator,
				'validateFeatureFileSyntax',
				TEST_DATA.INPUTS.EMPTY_FEATURE,
				EXPECTED_RESULTS.EMPTY_FILE_ERROR
			)
		);

		it(
			'should handle execution timeout scenarios',
			createConfigTest(
				() => instances.executionEngine,
				'executeFeatureFiles',
				TEST_DATA.CONFIGS.TIMEOUT_CONFIG,
				EXPECTED_RESULTS.TIMEOUT_ERROR
			)
		);
	});
});
