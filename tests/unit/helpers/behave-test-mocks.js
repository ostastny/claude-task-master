/**
 * Mock classes for Behave Framework Testing (Task 110.2)
 * Extracted from main test file for better organization and reusability
 */

/**
 * Mock BehaveValidator class for testing
 */
export class BehaveValidator {
	async validateFeatureFileSyntax(featureFile) {
		if (featureFile === '') {
			return {
				valid: false,
				errors: ['Empty file'],
				warning: 'No content to parse'
			};
		}
		return { valid: true, errors: [] };
	}

	async parseFeatureFile(featureFilePath) {
		if (featureFilePath === 'Invalid Gherkin Syntax Without Proper Structure') {
			return {
				valid: false,
				errors: ['Invalid syntax'],
				recommendation: 'Fix syntax errors'
			};
		}
		if (featureFilePath === '/workspace/features/test.feature') {
			return {
				feature: 'Test Feature',
				scenarios: ['Test Scenario'],
				steps: ['Given test step']
			};
		}
		// For feature files in the verification loop
		if (featureFilePath.includes('.feature')) {
			return { valid: true };
		}
		return { valid: true };
	}

	async checkGherkinCompatibility(gherkinContent) {
		return { compatible: true, issues: [] };
	}

	async validatePythonSyntaxRequirements(syntaxRules) {
		return { valid: true, pythonCompliant: true };
	}

	async testExecutionCompatibility(complexityConfig) {
		if (complexityConfig.testAllFeatures) {
			return {
				compatible: true,
				testedLevels: ['simple', 'medium', 'complex', 'enterprise'],
				overallScore: 95
			};
		}
		return { compatible: true, level: complexityConfig.level, tested: true };
	}
}

/**
 * Mock FeatureFileParser class for testing
 */
export class FeatureFileParser {
	async loadFeatureFiles(featuresDirectory) {
		return {
			files: [
				'fork-taskmaster-repository-and-setup-development-environment.feature',
				'implement-prd-to-gherkin-parser-logic.feature',
				'create-feature-file-generation-engine.feature'
			],
			count: 3
		};
	}

	async extractScenarios(featureContent) {
		return {
			scenarios: ['Test scenario'],
			steps: ['Given test step']
		};
	}

	async validateFileStructure(featureFile) {
		return { valid: true, structure: 'correct' };
	}

	async checkStepDefinitions(stepDefinitions) {
		const orphanedSteps = [
			'Given undefined step',
			'When missing action',
			'Then unknown assertion'
		];
		if (stepDefinitions.some((step) => orphanedSteps.includes(step))) {
			return {
				compatible: false,
				missingSteps: orphanedSteps,
				suggestion: 'Create step definitions'
			};
		}
		return { compatible: true, missingSteps: [] };
	}
}

/**
 * Mock BehaveExecutionEngine class for testing
 */
export class BehaveExecutionEngine {
	async runBehaveParser(parseOptions) {
		return { success: true, parsed: 3, errors: [] };
	}

	async executeFeatureFiles(executionConfig) {
		if (executionConfig.timeout && executionConfig.timeout === 1) {
			return {
				success: false,
				timedOut: true,
				recommendation: 'Increase timeout'
			};
		}
		if (executionConfig.mode === 'dryRun') {
			return { executable: true, validationPassed: true };
		}
		return { success: true, passed: 1, failed: 0 };
	}

	async validateStepDiscovery(stepsDirectory) {
		return { discovered: true, stepCount: 5 };
	}

	async checkExecutionResults(executionResults) {
		return { compatible: true, recommendation: 'proceed' };
	}
}

/**
 * Mock PythonSyntaxChecker class for testing
 */
export class PythonSyntaxChecker {
	async checkPythonGherkinSyntax(pythonSyntaxFeatures) {
		if (pythonSyntaxFeatures.checkDecorators) {
			return {
				limitations: [],
				pythonSpecific: ['decorators', 'imports'],
				compatible: true
			};
		}
		return { compatible: true, pythonFeatures: ['decorators', 'context'] };
	}

	async validateBehaveKeywords(behaveKeywords) {
		return { valid: true, supported: behaveKeywords };
	}

	async checkStepPatternCompatibility(stepPatterns) {
		return { compatible: true, patterns: ['regex', 'params', 'tables'] };
	}

	async documentSyntaxRequirements(documentationConfig) {
		if (documentationConfig.includeWorkarounds) {
			return {
				documentationGenerated: true,
				issuesFound: 0,
				workaroundsProvided: true
			};
		}
		return { documented: true, filePath: './docs/python-syntax.md' };
	}
}
