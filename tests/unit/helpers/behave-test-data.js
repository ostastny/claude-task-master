/**
 * Test data constants for Behave Framework Testing (Task 110.2)
 * Centralized test data to reduce duplication and improve maintainability
 */

export const EXPECTED_RESULTS = {
	// Feature file syntax validation
	VALID_SYNTAX: { valid: true, errors: [] },
	PARSED_FEATURE: {
		feature: 'Test Feature',
		scenarios: ['Test Scenario'],
		steps: ['Given test step']
	},
	GHERKIN_COMPATIBLE: { compatible: true, issues: [] },
	PYTHON_COMPLIANT: { valid: true, pythonCompliant: true },

	// Feature file parser
	LOADED_FILES: {
		files: [
			'fork-taskmaster-repository-and-setup-development-environment.feature',
			'implement-prd-to-gherkin-parser-logic.feature',
			'create-feature-file-generation-engine.feature'
		],
		count: 3
	},
	EXTRACTED_SCENARIOS: {
		scenarios: ['Test scenario'],
		steps: ['Given test step']
	},
	VALID_STRUCTURE: { valid: true, structure: 'correct' },
	STEP_DEFINITIONS_COMPATIBLE: { compatible: true, missingSteps: [] },

	// Execution engine
	PARSER_SUCCESS: { success: true, parsed: 3, errors: [] },
	EXECUTION_SUCCESS: { success: true, passed: 1, failed: 0 },
	STEP_DISCOVERY_SUCCESS: { discovered: true, stepCount: 5 },
	RESULTS_COMPATIBLE: { compatible: true, recommendation: 'proceed' },

	// Python syntax checker
	PYTHON_FEATURES_COMPATIBLE: {
		compatible: true,
		pythonFeatures: ['decorators', 'context']
	},
	BEHAVE_KEYWORDS_VALID: (keywords) => ({ valid: true, supported: keywords }),
	STEP_PATTERNS_COMPATIBLE: {
		compatible: true,
		patterns: ['regex', 'params', 'tables']
	},
	SYNTAX_DOCUMENTED: { documented: true, filePath: './docs/python-syntax.md' },

	// Complexity levels
	COMPLEXITY_COMPATIBLE: (level) => ({
		compatible: true,
		level: level,
		tested: true
	}),
	BROAD_COMPATIBILITY: {
		compatible: true,
		testedLevels: ['simple', 'medium', 'complex', 'enterprise'],
		overallScore: 95
	},

	// Feature file parsing verification
	ALL_FILES_PARSED: {
		totalFiles: 10,
		parsedSuccessfully: 10,
		parseErrors: [],
		allValid: true
	},
	FILES_EXECUTABLE: { executable: true, validationPassed: true },

	// Error cases
	EMPTY_FILE_ERROR: {
		valid: false,
		errors: ['Empty file'],
		warning: 'No content to parse'
	},
	MALFORMED_ERROR: {
		valid: false,
		errors: ['Invalid syntax'],
		recommendation: 'Fix syntax errors'
	},
	MISSING_STEPS_ERROR: {
		compatible: false,
		missingSteps: [
			'Given undefined step',
			'When missing action',
			'Then unknown assertion'
		],
		suggestion: 'Create step definitions'
	},
	TIMEOUT_ERROR: {
		success: false,
		timedOut: true,
		recommendation: 'Increase timeout'
	},

	// Python-specific
	PYTHON_LIMITATIONS_CHECK: {
		limitations: [],
		pythonSpecific: ['decorators', 'imports'],
		compatible: true
	},
	DOCUMENTATION_WITH_WORKAROUNDS: {
		documentationGenerated: true,
		issuesFound: 0,
		workaroundsProvided: true
	}
};

export const TEST_DATA = {
	// Feature files list for verification
	ALL_FEATURE_FILES: [
		'fork-taskmaster-repository-and-setup-development-environment.feature',
		'implement-prd-to-gherkin-parser-logic.feature',
		'create-feature-file-generation-engine.feature',
		'implement-cucumber-compatible-directory-structure.feature',
		'replace-task-output-system-with-bdd-feature-generation.feature',
		'add-python-bdd-framework-compatibility--behave-.feature',
		'add-javascript-bdd-framework-compatibility--cucumber-js-.feature',
		'implement-human-readable-output-and-error-handling.feature',
		'update-documentation-and-usage-instructions.feature',
		'comprehensive-testing-and-quality-assurance.feature'
	],

	// Complexity levels
	COMPLEXITY_LEVELS: ['simple', 'medium', 'complex', 'enterprise'],

	// Test inputs
	INPUTS: {
		FEATURE_FILE: 'test-feature.feature',
		FEATURE_FILE_PATH: '/workspace/features/test.feature',
		GHERKIN_CONTENT: 'Feature: Test\n  Scenario: Test scenario',
		FEATURE_CONTENT:
			'Feature: Test\n  Scenario: Test scenario\n    Given test step',
		FEATURES_DIRECTORY: '/workspace/features',
		STEPS_DIRECTORY: '/workspace/features/steps',
		EMPTY_FEATURE: '',
		MALFORMED_FEATURE: 'Invalid Gherkin Syntax Without Proper Structure',
		VALID_STEP_DEFINITIONS: [
			'Given test step',
			'When action occurs',
			'Then result expected'
		],
		ORPHANED_STEPS: [
			'Given undefined step',
			'When missing action',
			'Then unknown assertion'
		],
		BEHAVE_KEYWORDS: [
			'Given',
			'When',
			'Then',
			'And',
			'But',
			'Background',
			'Scenario Outline'
		]
	},

	// Configuration objects
	CONFIGS: {
		SYNTAX_RULES: {
			stepDefinitions: true,
			contextUsage: true,
			pythonImports: true
		},
		PARSE_OPTIONS: {
			featuresPath: '/workspace/features',
			stepsPath: '/workspace/features/steps',
			validateOnly: true
		},
		EXECUTION_CONFIG: {
			features: ['/workspace/features/test.feature'],
			dryRun: true,
			formatters: ['json']
		},
		TIMEOUT_CONFIG: {
			timeout: 1, // 1ms to force timeout
			features: ['long-running-feature.feature']
		},
		PYTHON_SYNTAX_FEATURES: {
			decorators: true,
			contextUsage: true,
			stepParameters: true
		},
		STEP_PATTERNS: {
			regularExpressions: true,
			parameterTypes: true,
			dataTableSupport: true
		},
		DOCUMENTATION_CONFIG: {
			outputFormat: 'markdown',
			includeExamples: true,
			pythonSpecific: true
		},
		SYNTAX_LIMITATIONS: {
			checkDecorators: true,
			checkImports: true,
			checkContextUsage: true,
			checkStepDefinitions: true
		},
		ISSUE_DOCUMENTATION: {
			format: 'detailed',
			includeWorkarounds: true,
			pythonVersion: '3.8+',
			behaveVersion: 'latest'
		}
	}
};
