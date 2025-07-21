import fs from 'fs';
import path from 'path';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

// Import the feature file generation engine that should be implemented
// This will fail until the actual implementation exists (TDD Red phase)
let FeatureFileGenerationEngine;
try {
	const module = await import('../../src/feature-file-generation-engine.js');
	FeatureFileGenerationEngine =
		module.FeatureFileGenerationEngine || module.default;
} catch (error) {
	// Expected to fail in Red phase - engine doesn't exist yet
	FeatureFileGenerationEngine = null;
}

describe('FeatureFileGenerationEngine - Task 107', () => {
	let engine;

	beforeEach(() => {
		// This should fail since the implementation doesn't exist yet
		if (!FeatureFileGenerationEngine) {
			throw new Error(
				'FeatureFileGenerationEngine not found - implementation needed'
			);
		}
		engine = new FeatureFileGenerationEngine();
	});

	describe('Subtask 107.1 - Gherkin Feature File Template System', () => {
		test('should create template classes with proper Gherkin structure', () => {
			expect(engine).toBeDefined();
			expect(engine.createTemplate).toBeDefined();

			const template = engine.createTemplate({
				featureName: 'User Authentication',
				description: 'Test feature description'
			});

			expect(template).toHaveProperty('featureHeader');
			expect(template).toHaveProperty('scenarioBlocks');
			expect(template.featureHeader).toContain('Feature: User Authentication');
		});

		test('should support configurable template variables', () => {
			const templateConfig = {
				featureName: 'Custom Feature',
				description: 'Custom description',
				scenarios: ['Login scenario', 'Logout scenario']
			};

			const template = engine.createTemplate(templateConfig);
			expect(template.featureHeader).toContain('Custom Feature');
			expect(template.description).toContain('Custom description');
			expect(template.scenarios).toHaveLength(2);
		});

		test('should follow Cucumber best practices', () => {
			const template = engine.createTemplate({ featureName: 'Test Feature' });
			const content = engine.generateFeatureContent(template);

			// Check proper indentation levels
			expect(content).toMatch(/^Feature: /m);
			expect(content).toMatch(/^ {2}Scenario: /m);
			expect(content).toMatch(/^ {4}Given /m);
			expect(content).toMatch(/^ {4}When /m);
			expect(content).toMatch(/^ {4}Then /m);
		});

		test('should generate content with template description', () => {
			const template = engine.createTemplate({
				featureName: 'Test Feature',
				description: 'Test feature description'
			});
			const content = engine.generateFeatureContent(template);

			// Check that description is included in content (covers line 38)
			expect(content).toContain('Test feature description');
		});

		test('should handle empty scenario blocks', () => {
			const template = engine.createTemplate({
				featureName: 'Test Feature',
				scenarios: []
			});
			// Manually set empty scenarioBlocks to test that branch
			template.scenarioBlocks = [];
			const content = engine.generateFeatureContent(template);

			// Check that default scenario is generated (covers lines 42-46)
			expect(content).toContain('Scenario: Default scenario');
			expect(content).toContain('Given something');
			expect(content).toContain('When something happens');
			expect(content).toContain('Then something should occur');
		});

		test('should handle non-empty scenario blocks', () => {
			const template = engine.createTemplate({
				featureName: 'Test Feature',
				scenarios: ['Test Scenario One', 'Test Scenario Two']
			});
			const content = engine.generateFeatureContent(template);

			// Check that all scenarios are generated (covers lines 48-52)
			expect(content).toContain('Scenario: Test Scenario One');
			expect(content).toContain('Scenario: Test Scenario Two');
		});
	});

	describe('Subtask 107.2 - Gherkin Syntax Formatting Engine', () => {
		test('should validate and format Gherkin syntax', () => {
			const formatter = engine.getSyntaxFormatter();
			expect(formatter).toBeDefined();
			expect(formatter.validateGherkin).toBeDefined();
			expect(formatter.formatKeywords).toBeDefined();
			expect(formatter.applyIndentation).toBeDefined();
			expect(formatter.handleComments).toBeDefined();
		});

		test('should test all formatter methods for coverage', () => {
			const formatter = engine.getSyntaxFormatter();

			// Test validateGherkin (covers line 62)
			const isValid = formatter.validateGherkin('Feature: Test');
			expect(isValid).toBe(true);

			// Test applyIndentation (covers line 64)
			const indented = formatter.applyIndentation('test content');
			expect(indented).toBe('test content');

			// Test handleComments (covers line 65)
			const commented = formatter.handleComments('test content');
			expect(commented).toBe('test content');
		});

		test('should enforce proper Gherkin keyword formatting', () => {
			const formatter = engine.getSyntaxFormatter();
			const testScenario = {
				feature: 'Test Feature',
				scenarios: [
					{
						title: 'Test Scenario',
						steps: [
							'given user exists',
							'when user logs in',
							'then user sees dashboard'
						]
					}
				]
			};

			const formatted = formatter.formatKeywords(testScenario);
			expect(formatted).toContain('Feature: Test Feature');
			expect(formatted).toContain('Scenario: Test Scenario');
			expect(formatted).toContain('Given user exists');
			expect(formatted).toContain('When user logs in');
			expect(formatted).toContain('Then user sees dashboard');
		});

		test('should handle indentation and line breaks correctly', () => {
			const content = engine.generateFeatureFile({
				feature: 'Test Feature',
				scenarios: [
					{
						title: 'Test Scenario',
						steps: [
							'Given user exists',
							'When user logs in',
							'Then user sees dashboard'
						]
					}
				]
			});

			const lines = content.split('\n');
			expect(lines[0]).toMatch(/^Feature: /);
			expect(lines.find((l) => l.includes('Scenario:'))).toMatch(
				/^ {2}Scenario: /
			);
			expect(lines.find((l) => l.includes('Given'))).toMatch(/^ {4}Given/);
		});

		test('should prevent invalid Gherkin output', () => {
			const invalidInput = { feature: '', scenarios: [] };
			expect(() => engine.generateFeatureFile(invalidInput)).toThrow();

			const malformedInput = {
				feature: 'Test',
				scenarios: [{ title: '', steps: ['invalid step'] }]
			};
			expect(() => engine.generateFeatureFile(malformedInput)).toThrow();
		});

		test('should validate empty scenarios array', () => {
			// Test the scenarios validation branch (covers line 97)
			const noScenariosInput = { feature: 'Valid Feature', scenarios: [] };
			expect(() => engine.generateFeatureFile(noScenariosInput)).toThrow(
				'At least one scenario is required'
			);
		});
	});

	describe('Subtask 107.3 - File Naming and Sanitization System', () => {
		test('should convert feature titles to valid filesystem names', () => {
			const sanitizer = engine.getFilenameSanitizer();

			expect(sanitizer.sanitizeFilename('User Authentication')).toBe(
				'user-authentication.feature'
			);
			expect(
				sanitizer.sanitizeFilename('Feature: With Special!@#$%Characters')
			).toBe('feature-with-special-characters.feature');
			expect(sanitizer.sanitizeFilename('   Spaces   Everywhere   ')).toBe(
				'spaces-everywhere.feature'
			);
		});

		test('should handle special characters and length limits', () => {
			const sanitizer = engine.getFilenameSanitizer();

			const longTitle = 'A'.repeat(300);
			const sanitized = sanitizer.sanitizeFilename(longTitle);
			expect(sanitized.length).toBeLessThanOrEqual(255);
			expect(sanitized.endsWith('.feature')).toBe(true);

			expect(
				sanitizer.sanitizeFilename('Feature/With\\Invalid:Characters|<>?*')
			).toBe('feature-with-invalid-characters.feature');
			expect(sanitizer.sanitizeFilename('CON')).not.toBe('con.feature'); // Windows reserved word
		});

		test('should ensure cross-platform compatibility', () => {
			const sanitizer = engine.getFilenameSanitizer();

			const testCases = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1'];
			testCases.forEach((reservedWord) => {
				const result = sanitizer.sanitizeFilename(reservedWord);
				expect(result).not.toBe(reservedWord.toLowerCase() + '.feature');
			});

			expect(sanitizer.sanitizeFilename('file.name')).toBe('file-name.feature');
		});

		test('should handle naming conflicts', () => {
			const conflictResolver = engine.getConflictResolver();
			const existingFiles = ['user-login.feature', 'user-login-1.feature'];

			const result = conflictResolver.resolveConflict(
				'User Login',
				existingFiles
			);
			expect(result).toBe('user-login-2.feature');

			const timestampResult =
				conflictResolver.resolveConflictWithTimestamp('User Login');
			expect(timestampResult).toMatch(/user-login-\d{13}\.feature/);
		});
	});

	describe('Subtask 107.4 - Comprehensive Error Handling', () => {
		test('should handle file system operation failures', () => {
			const mockFs = {
				writeFileSync: jest.fn(() => {
					throw new Error('EACCES: permission denied');
				})
			};
			engine.setFileSystem(mockFs);

			expect(() => engine.writeFeatureFile('test.feature', 'content')).toThrow(
				'EACCES: permission denied'
			);

			const diskFullFs = {
				writeFileSync: jest.fn(() => {
					throw new Error('ENOSPC: no space left on device');
				})
			};
			engine.setFileSystem(diskFullFs);
			expect(() => engine.writeFeatureFile('test.feature', 'content')).toThrow(
				'ENOSPC: no space left on device'
			);
		});

		test('should handle template processing failures', () => {
			const invalidTemplate = { feature: null, scenarios: undefined };
			expect(() => engine.processTemplate(invalidTemplate)).toThrow(
				'Invalid template structure'
			);

			const missingVariables = { feature: '{{missing_var}}', scenarios: [] };
			expect(() => engine.processTemplate(missingVariables)).toThrow(
				'Missing template variable: missing_var'
			);
		});

		test('should handle invalid Gherkin syntax gracefully', () => {
			const malformedData = {
				feature: '',
				scenarios: [{ title: '', steps: [] }]
			};
			expect(() => engine.generateFeatureFile(malformedData)).toThrow(
				'Feature name cannot be empty'
			);

			const invalidSteps = {
				feature: 'Test',
				scenarios: [{ title: 'Test', steps: ['Invalid step without keyword'] }]
			};
			expect(() => engine.generateFeatureFile(invalidSteps)).toThrow(
				'Invalid step format'
			);
		});

		test('should provide informative error messages', () => {
			try {
				engine.generateFeatureFile({ feature: '', scenarios: [] });
			} catch (error) {
				expect(error.message).toContain('Feature name cannot be empty');
				expect(error.context).toBeDefined();
				expect(error.suggestion).toContain('Provide a valid feature name');
			}
		});

		test('should implement graceful failure modes', () => {
			const partialData = [
				{
					feature: 'Valid Feature',
					scenarios: [{ title: 'Valid', steps: ['Given valid step'] }]
				},
				{ feature: '', scenarios: [] }, // Invalid
				{
					feature: 'Another Valid',
					scenarios: [{ title: 'Valid', steps: ['Given another step'] }]
				}
			];

			const result = engine.generateFeatureFiles(partialData, {
				continueOnError: true
			});
			expect(result.successful).toHaveLength(2);
			expect(result.failed).toHaveLength(1);
			expect(result.errors).toHaveLength(1);
		});

		test('should throw immediately when continueOnError is false', () => {
			// Test the error propagation path (covers line 260)
			const partialData = [
				{
					feature: 'Valid Feature',
					scenarios: [{ title: 'Valid', steps: ['Given valid step'] }]
				},
				{ feature: '', scenarios: [] } // Invalid
			];

			expect(() =>
				engine.generateFeatureFiles(partialData, { continueOnError: false })
			).toThrow();
		});

		test('should handle successful template processing', () => {
			// Test successful path in processTemplate (covers line 241)
			const validTemplate = {
				feature: 'Valid Feature',
				scenarios: [{ title: 'Test', steps: ['Given test'] }]
			};

			const result = engine.processTemplate(validTemplate);
			expect(result).toEqual(validTemplate);
		});
	});

	describe('Subtask 107.5 - Output Validation System', () => {
		test('should validate generated feature files against Gherkin standards', () => {
			const validator = engine.getOutputValidator();
			const featureContent = engine.generateFeatureFile({
				feature: 'Test Feature',
				scenarios: [
					{
						title: 'Test Scenario',
						steps: [
							'Given test step',
							'When action occurs',
							'Then result expected'
						]
					}
				]
			});

			const validation = validator.validateGherkinStandards(featureContent);
			expect(validation.isValid).toBe(true);
			expect(validation.syntaxErrors).toHaveLength(0);
			expect(validation.structureErrors).toHaveLength(0);
		});

		test('should verify feature structure completeness', () => {
			const validator = engine.getOutputValidator();

			const validFeature = {
				feature: 'Complete Feature',
				scenarios: [
					{
						title: 'Complete Scenario',
						steps: ['Given precondition', 'When action', 'Then outcome']
					}
				]
			};
			const validation = validator.validateStructure(validFeature);
			expect(validation.hasFeature).toBe(true);
			expect(validation.hasScenarios).toBe(true);
			expect(validation.hasRequiredSteps).toBe(true);

			const incompleteFeature = { feature: 'Test', scenarios: [] };
			const invalidValidation = validator.validateStructure(incompleteFeature);
			expect(invalidValidation.hasScenarios).toBe(false);
		});

		test('should validate step syntax correctness', () => {
			const validator = engine.getOutputValidator();

			const validSteps = [
				'Given user is logged in',
				'When user clicks button',
				'Then page loads',
				'And user sees message'
			];
			expect(validator.validateSteps(validSteps).isValid).toBe(true);

			const invalidSteps = ['Invalid step', 'Another invalid step'];
			expect(validator.validateSteps(invalidSteps).isValid).toBe(false);

			const mixedSteps = [
				'Given valid step',
				'Invalid step',
				'Then valid outcome'
			];
			const mixedValidation = validator.validateSteps(mixedSteps);
			expect(mixedValidation.isValid).toBe(false);
			expect(mixedValidation.invalidSteps).toContain('Invalid step');
		});

		test('should test against external Gherkin parsers', () => {
			const validator = engine.getOutputValidator();
			const featureContent = engine.generateFeatureFile({
				feature: 'Parser Compatibility Test',
				scenarios: [
					{
						title: 'Test Scenario',
						steps: ['Given setup', 'When action', 'Then result']
					}
				]
			});

			const cucumberCompatibility =
				validator.testCucumberCompatibility(featureContent);
			expect(cucumberCompatibility.isCompatible).toBe(true);

			const specFlowCompatibility =
				validator.testSpecFlowCompatibility(featureContent);
			expect(specFlowCompatibility.isCompatible).toBe(true);

			const behaveCompatibility =
				validator.testBehaveCompatibility(featureContent);
			expect(behaveCompatibility.isCompatible).toBe(true);
		});
	});

	describe('Subtask 107.6 - Integration with Parser Components', () => {
		test('should integrate with existing PRD parser components', () => {
			const engine = new FeatureFileGenerationEngine();
			expect(engine.setPrdParser).toBeDefined();

			const mockParser = { parse: jest.fn() };
			engine.setPrdParser(mockParser);
			expect(engine.prdParser).toBe(mockParser);
		});

		test('should create unified workflow from PRD to feature files', () => {
			const engine = new FeatureFileGenerationEngine();
			expect(engine.processFullWorkflow).toBeDefined();

			const mockPrdData = {
				feature: 'Test Workflow',
				scenarios: [
					{
						title: 'Test Scenario',
						steps: ['Given test', 'When action', 'Then result']
					}
				]
			};

			const result = engine.processFullWorkflow(mockPrdData);
			expect(result).toContain('Feature: Test Workflow');
		});

		test('should support configuration options', () => {
			const engine = new FeatureFileGenerationEngine();
			expect(engine.setConfiguration).toBeDefined();
			expect(engine.getConfiguration).toBeDefined();

			const config = { outputDir: '/test', template: 'custom' };
			engine.setConfiguration(config);
			expect(engine.getConfiguration()).toEqual(config);
		});
	});

	describe('Integration Tests for Complete Feature File Generation', () => {
		test('should generate complete feature files from parsed PRD requirements', () => {
			const engine = new FeatureFileGenerationEngine();
			const prdData = {
				feature: 'User Management',
				scenarios: [
					{
						title: 'User Login',
						steps: [
							'Given user exists',
							'When user logs in',
							'Then user sees dashboard'
						]
					},
					{
						title: 'User Logout',
						steps: [
							'Given user is logged in',
							'When user logs out',
							'Then user sees login page'
						]
					}
				]
			};

			const result = engine.generateFeatureFile(prdData);
			expect(result).toContain('Feature: User Management');
			expect(result).toContain('Scenario: User Login');
			expect(result).toContain('Scenario: User Logout');
		});

		test('should handle complex PRD scenarios with multiple features', () => {
			const engine = new FeatureFileGenerationEngine();
			const complexFeatures = [
				{
					feature: 'Authentication',
					scenarios: [
						{
							title: 'Login',
							steps: [
								'Given user exists',
								'When user logs in',
								'Then user authenticated'
							]
						}
					]
				},
				{
					feature: 'Authorization',
					scenarios: [
						{
							title: 'Access Control',
							steps: [
								'Given user authenticated',
								'When user accesses resource',
								'Then access granted'
							]
						}
					]
				}
			];

			const result = engine.generateFeatureFiles(complexFeatures);
			expect(result.successful).toHaveLength(2);
			expect(result.failed).toHaveLength(0);
		});

		test('should maintain file consistency across generations', () => {
			const engine = new FeatureFileGenerationEngine();
			const testData = {
				feature: 'Consistent Feature',
				scenarios: [
					{
						title: 'Test Scenario',
						steps: ['Given test', 'When action', 'Then result']
					}
				]
			};

			const result1 = engine.generateFeatureFile(testData);
			const result2 = engine.generateFeatureFile(testData);
			expect(result1).toBe(result2); // Should be deterministic
		});
	});

	describe('Error Handling Integration Tests', () => {
		test('should handle invalid input data gracefully', () => {
			const engine = new FeatureFileGenerationEngine();

			// Test with malformed data
			expect(() =>
				engine.generateFeatureFile({ feature: '', scenarios: [] })
			).toThrow();
			expect(() => engine.generateFeatureFile({ feature: null })).toThrow();
			expect(() => engine.generateFeatureFile({})).toThrow();
		});

		test('should recover from partial failures', () => {
			const engine = new FeatureFileGenerationEngine();
			const mixedData = [
				{
					feature: 'Valid Feature',
					scenarios: [{ title: 'Valid', steps: ['Given valid'] }]
				},
				{ feature: '', scenarios: [] }, // Invalid
				{
					feature: 'Another Valid',
					scenarios: [{ title: 'Valid', steps: ['Given another'] }]
				}
			];

			const result = engine.generateFeatureFiles(mixedData, {
				continueOnError: true
			});
			expect(result.successful).toHaveLength(2);
			expect(result.failed).toHaveLength(1);
			expect(result.errors).toHaveLength(1);
		});
	});

	describe('File System Integration Tests', () => {
		test('should create valid filesystem structure', () => {
			const engine = new FeatureFileGenerationEngine();
			const mockFs = { writeFileSync: jest.fn() };
			engine.setFileSystem(mockFs);

			engine.writeFeatureFile('test.feature', 'Feature: Test');
			expect(mockFs.writeFileSync).toHaveBeenCalledWith(
				'test.feature',
				'Feature: Test'
			);
		});

		test('should handle filesystem edge cases', () => {
			const engine = new FeatureFileGenerationEngine();
			const sanitizer = engine.getFilenameSanitizer();

			// Test long filenames
			const longName = 'A'.repeat(300);
			const sanitized = sanitizer.sanitizeFilename(longName);
			expect(sanitized.length).toBeLessThanOrEqual(255);

			// Test special characters
			expect(sanitizer.sanitizeFilename('File/With\\Special:Characters')).toBe(
				'file-with-special-characters.feature'
			);
		});
	});

	describe('Performance and Scalability Tests', () => {
		test('should handle large PRD documents efficiently', () => {
			const largePrdData = {
				features: Array.from({ length: 100 }, (_, i) => ({
					name: `Feature ${i}`,
					scenarios: Array.from({ length: 10 }, (_, j) => ({
						title: `Scenario ${j}`,
						steps: ['Given setup', 'When action', 'Then result']
					}))
				}))
			};

			const startTime = Date.now();
			const startMemory = process.memoryUsage().heapUsed;

			const result = engine.generateFromLargePrd(largePrdData, {
				batchSize: 10,
				enableStreaming: true,
				optimizeMemory: true
			});

			const endTime = Date.now();
			const endMemory = process.memoryUsage().heapUsed;
			const memoryIncrease = endMemory - startMemory;

			expect(result.success).toBe(true);
			expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
			expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Should use less than 100MB additional memory
			expect(result.performance.batchesProcessed).toBeGreaterThan(0);
		});

		test('should scale with number of generated files', () => {
			const manyFeatures = Array.from({ length: 500 }, (_, i) => ({
				feature: `Scalability Test Feature ${i}`,
				scenarios: [
					{
						title: `Test Scenario ${i}`,
						steps: [
							`Given test setup ${i}`,
							`When action ${i}`,
							`Then result ${i}`
						]
					}
				]
			}));

			const concurrentResult = engine.generateFeatureFilesConcurrently(
				manyFeatures,
				{
					maxConcurrency: 10,
					timeout: 30000,
					enableProgressTracking: true
				}
			);

			expect(concurrentResult.successful).toHaveLength(500);
			expect(concurrentResult.failed).toHaveLength(0);
			expect(concurrentResult.performance.totalTime).toBeLessThan(30000);
			expect(concurrentResult.performance.averageTimePerFile).toBeLessThan(100);
			expect(concurrentResult.resourceUsage.peakMemory).toBeDefined();
			expect(concurrentResult.resourceUsage.cleaned).toBe(true);
		});

		test('should handle errors in concurrent generation', () => {
			// Test the error path in concurrent generation (covers line 352)
			const mixedFeatures = [
				{
					feature: 'Valid Feature',
					scenarios: [{ title: 'Valid', steps: ['Given valid'] }]
				},
				{ feature: '', scenarios: [] } // Invalid - will cause error
			];

			const result = engine.generateFeatureFilesConcurrently(mixedFeatures);
			expect(result.successful).toHaveLength(1);
			expect(result.failed).toHaveLength(1);
			expect(result.failed[0]).toHaveProperty('error');
		});

		test('should validate input arrays in batch methods', () => {
			// Test new input validation
			expect(() => engine.generateFeatureFiles('not an array')).toThrow(
				'dataArray must be an array'
			);
			expect(() =>
				engine.generateFeatureFilesConcurrently('not an array')
			).toThrow('features must be an array');
			expect(() => engine.generateFeatureFiles(null)).toThrow(
				'dataArray must be an array'
			);
			expect(() => engine.generateFeatureFilesConcurrently(undefined)).toThrow(
				'features must be an array'
			);
		});

		test('should handle memory usage gracefully', () => {
			// Test the new _getMemoryUsage method
			const memoryUsage = engine._getMemoryUsage();
			expect(typeof memoryUsage).toBe('number');
			expect(memoryUsage).toBeGreaterThanOrEqual(0);
		});
	});
});

// Additional utility tests for the Red phase
describe('FeatureFileGenerationEngine - Critical Path Validation', () => {
	test('implementation file should exist', async () => {
		try {
			const module = await import(
				'../../src/feature-file-generation-engine.js'
			);
			// If we get here, the file exists and the class should be exported correctly
			expect(module.FeatureFileGenerationEngine).toBeDefined();
			expect(typeof module.FeatureFileGenerationEngine).toBe('function');
		} catch (error) {
			// Should not happen now that implementation exists
			throw new Error(`Implementation file should exist: ${error.message}`);
		}
	});

	test('all required methods should be implemented', () => {
		// This test validates that all required methods are implemented
		const requiredMethods = [
			'createTemplate',
			'getSyntaxFormatter',
			'getFilenameSanitizer',
			'getConflictResolver',
			'getOutputValidator',
			'generateFeatureFile',
			'writeFeatureFile',
			'processTemplate',
			'generateFeatureFiles',
			'setPrdParser',
			'processFullWorkflow',
			'setConfiguration',
			'getConfiguration'
		];

		// This should now pass with the implementation
		if (!FeatureFileGenerationEngine) {
			throw new Error('FeatureFileGenerationEngine class not found');
		}
		const engine = new FeatureFileGenerationEngine();
		requiredMethods.forEach((method) => {
			expect(engine[method]).toBeDefined();
			expect(typeof engine[method]).toBe('function');
		});
	});
});
