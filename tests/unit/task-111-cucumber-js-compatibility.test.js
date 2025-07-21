import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { jest } from '@jest/globals';
import { CucumberTestHelpers } from '../helpers/cucumber-test-helpers.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

describe('Task 111: JavaScript BDD Framework Compatibility (Cucumber.js)', () => {
	const testFeatureDir = path.join(
		__dirname,
		'../../temp/cucumber-js-test-features'
	);
	const testStepDir = path.join(__dirname, '../../temp/cucumber-js-test-steps');
	const samplePrdPath = path.join(__dirname, '../fixtures/sample-prd.txt');

	beforeEach(() => {
		// Clean up test directories before each test
		if (fs.existsSync(testFeatureDir)) {
			fs.rmSync(testFeatureDir, { recursive: true, force: true });
		}
		if (fs.existsSync(testStepDir)) {
			fs.rmSync(testStepDir, { recursive: true, force: true });
		}
	});

	afterEach(() => {
		// Clean up test directories after each test
		if (fs.existsSync(testFeatureDir)) {
			fs.rmSync(testFeatureDir, { recursive: true, force: true });
		}
		if (fs.existsSync(testStepDir)) {
			fs.rmSync(testStepDir, { recursive: true, force: true });
		}
	});

	describe('Subtask 111.1: Set up Cucumber.js testing environment', () => {
		it('should install and configure Cucumber.js framework', async () => {
			// Check for package.json with cucumber dependencies
			const packageJsonPath = path.join(__dirname, '../../package.json');
			expect(fs.existsSync(packageJsonPath)).toBe(true);

			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

			// Cucumber.js should be installed as dependency
			const hasCucumberDep =
				(packageJson.dependencies &&
					packageJson.dependencies['@cucumber/cucumber']) ||
				(packageJson.devDependencies &&
					packageJson.devDependencies['@cucumber/cucumber']);

			expect(hasCucumberDep).toBeTruthy();
		});

		it('should create Cucumber.js configuration file', async () => {
			const configPath = path.join(__dirname, '../../cucumber.config.js');
			expect(fs.existsSync(configPath)).toBe(true);

			const config = await import(configPath);
			expect(config).toHaveProperty('default');
			expect(config.default).toHaveProperty('features');
			expect(config.default).toHaveProperty('steps');
		});

		it('should have proper test directory structure for Cucumber.js', () => {
			const cucumberTestDir = path.join(__dirname, '../../tests/bdd-cucumber');
			expect(fs.existsSync(cucumberTestDir)).toBe(true);

			const featuresDir = path.join(cucumberTestDir, 'features');
			const stepsDir = path.join(cucumberTestDir, 'step_definitions');

			expect(fs.existsSync(featuresDir)).toBe(true);
			expect(fs.existsSync(stepsDir)).toBe(true);
		});

		it('should create sample step definitions for Cucumber.js', () => {
			const stepsFile = path.join(
				__dirname,
				'../../tests/bdd-cucumber/step_definitions/common_steps.js'
			);
			expect(fs.existsSync(stepsFile)).toBe(true);

			const content = fs.readFileSync(stepsFile, 'utf8');
			expect(content).toContain('Given(');
			expect(content).toContain('When(');
			expect(content).toContain('Then(');
		});
	});

	describe('Subtask 111.2: Validate JavaScript-specific Gherkin syntax compatibility', () => {
		it('should generate feature files compatible with Cucumber.js parser', async () => {
			// Mock PRD parsing to generate feature files
			const mockFeatureContent = `Feature: Sample Feature
  As a user
  I want to test functionality
  So that I can ensure quality

  Scenario: Basic scenario
    Given I have a test setup
    When I run a test
    Then I should see results

  Scenario Outline: Data-driven scenario
    Given I have <data> input
    When I process it
    Then I should get <result>
    
    Examples:
      | data | result |
      | test | pass   |
      | bad  | fail   |`;

			fs.mkdirSync(testFeatureDir, { recursive: true });
			const featureFile = path.join(testFeatureDir, 'sample.feature');
			fs.writeFileSync(featureFile, mockFeatureContent);

			// Test that Cucumber.js can parse the feature file
			const parseResult =
				await CucumberTestHelpers.parseCucumberFeature(featureFile);
			expect(parseResult.success).toBe(true);
			expect(parseResult.errors).toHaveLength(0);
		});

		it('should handle data tables correctly in Cucumber.js format', async () => {
			const featureWithDataTable = `Feature: Data table test
  
  Scenario: Process data table
    Given I have the following data:
      | name  | age | city    |
      | Alice | 30  | New York|
      | Bob   | 25  | London  |
    When I process the data
    Then I should get formatted results`;

			fs.mkdirSync(testFeatureDir, { recursive: true });
			const featureFile = path.join(testFeatureDir, 'data-table.feature');
			fs.writeFileSync(featureFile, featureWithDataTable);

			const parseResult =
				await CucumberTestHelpers.parseCucumberFeature(featureFile);
			expect(parseResult.success).toBe(true);
			expect(parseResult.dataTable).toBeDefined();
		});

		it('should handle tags properly for JavaScript BDD', async () => {
			const taggedFeature = `@integration @smoke
Feature: Tagged feature test

  @critical
  Scenario: Important test
    Given I have critical functionality
    When I test it
    Then it should work perfectly
    
  @slow @optional
  Scenario: Performance test
    Given I have heavy operations
    When I run them
    Then they should complete within limits`;

			fs.mkdirSync(testFeatureDir, { recursive: true });
			const featureFile = path.join(testFeatureDir, 'tagged.feature');
			fs.writeFileSync(featureFile, taggedFeature);

			const parseResult =
				await CucumberTestHelpers.parseCucumberFeature(featureFile);
			expect(parseResult.success).toBe(true);
			expect(parseResult.tags).toContain('@integration');
			expect(parseResult.tags).toContain('@smoke');
		});

		it('should validate cross-platform compatibility between Behave and Cucumber.js', async () => {
			// Test that the same feature file works with both frameworks
			const sharedFeature = `Feature: Cross-platform compatibility

  Scenario: Shared functionality
    Given I have a cross-platform test
    When I run it with different BDD frameworks
    Then it should work consistently`;

			fs.mkdirSync(testFeatureDir, { recursive: true });
			const featureFile = path.join(testFeatureDir, 'cross-platform.feature');
			fs.writeFileSync(featureFile, sharedFeature);

			// Test with Cucumber.js
			const cucumberResult =
				await CucumberTestHelpers.parseCucumberFeature(featureFile);
			expect(cucumberResult.success).toBe(true);

			// Test with Behave (assuming Python environment is available)
			const behaveResult =
				await CucumberTestHelpers.parseBehaveFeature(featureFile);
			expect(behaveResult.success).toBe(true);

			// Both should parse successfully
			expect(cucumberResult.success).toBe(behaveResult.success);
		});
	});

	describe('Subtask 111.3: Create integration tests for Cucumber.js compatibility', () => {
		it('should generate feature files from PRD and execute with Cucumber.js', async () => {
			// Mock the PRD to feature generation process
			const mockPrd =
				'Feature: User Authentication\nAs a user I want to login securely';

			fs.mkdirSync(testFeatureDir, { recursive: true });
			const prdFile = path.join(testFeatureDir, 'test.prd');
			fs.writeFileSync(prdFile, mockPrd);

			// Generate feature files from PRD
			const generatedFeatures =
				await CucumberTestHelpers.generateFeaturesFromPRD(prdFile);
			expect(generatedFeatures.length).toBeGreaterThan(0);

			// Validate each generated feature with Cucumber.js
			for (const featureFile of generatedFeatures) {
				const result =
					await CucumberTestHelpers.executeCucumberTest(featureFile);
				expect(result.success).toBe(true);
			}
		});

		it('should run automated compatibility tests between Python and JavaScript BDD', async () => {
			const testFeatures = [
				'basic-scenario.feature',
				'scenario-outline.feature',
				'data-tables.feature',
				'tagged-scenarios.feature'
			];

			for (const featureName of testFeatures) {
				const featureContent =
					await CucumberTestHelpers.generateSampleFeature(featureName);

				fs.mkdirSync(testFeatureDir, { recursive: true });
				const featureFile = path.join(testFeatureDir, featureName);
				fs.writeFileSync(featureFile, featureContent);

				// Test with both frameworks
				const cucumberResult =
					await CucumberTestHelpers.executeCucumberTest(featureFile);
				const behaveResult =
					await CucumberTestHelpers.executeBehaveTest(featureFile);

				expect(cucumberResult.success).toBe(true);
				expect(behaveResult.success).toBe(true);

				// Both should have similar test outcomes
				expect(cucumberResult.scenarioCount).toBe(behaveResult.scenarioCount);
			}
		});

		it('should prevent regression in JavaScript BDD compatibility', async () => {
			// Run a comprehensive suite of compatibility tests
			const compatibilityTests = [
				'basic-gherkin-syntax',
				'scenario-outlines-with-examples',
				'data-tables-parsing',
				'tag-filtering',
				'background-steps',
				'multiline-strings'
			];

			const results = [];

			for (const testType of compatibilityTests) {
				const testResult =
					await CucumberTestHelpers.runCompatibilityTest(testType);
				results.push({
					testType,
					passed: testResult.success,
					errors: testResult.errors || []
				});
			}

			// All compatibility tests should pass
			const failedTests = results.filter((r) => !r.passed);
			expect(failedTests).toHaveLength(0);

			// Create compatibility report
			const compatibilityReport =
				CucumberTestHelpers.generateCompatibilityReport(results);
			expect(compatibilityReport).toHaveProperty('overallCompatibility', 100);
		});

		it('should handle edge cases and error scenarios in Cucumber.js', async () => {
			const edgeCases = [
				{
					name: 'empty-feature-file',
					content: ''
				},
				{
					name: 'malformed-gherkin',
					content: 'Not a valid feature file content'
				},
				{
					name: 'missing-step-definitions',
					content: `Feature: Missing steps
                   Scenario: Undefined steps
                     Given I have an undefined step
                     When I run undefined actions
                     Then I get undefined results`
				}
			];

			for (const edgeCase of edgeCases) {
				fs.mkdirSync(testFeatureDir, { recursive: true });
				const featureFile = path.join(
					testFeatureDir,
					`${edgeCase.name}.feature`
				);
				fs.writeFileSync(featureFile, edgeCase.content);

				const result =
					await CucumberTestHelpers.handleCucumberEdgeCase(featureFile);

				// Should handle errors gracefully
				expect(result).toHaveProperty('handled', true);
				if (!result.success) {
					expect(result.errors).toBeDefined();
					expect(result.errors.length).toBeGreaterThan(0);
				}
			}
		});
	});
});
