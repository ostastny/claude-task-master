import {
	Parser,
	AstBuilder,
	GherkinClassicTokenMatcher
} from '@cucumber/gherkin';
import { IdGenerator } from '@cucumber/messages';

/**
 * PrdToGherkinParser - Converts PRD content to Gherkin features
 *
 * This parser implements the core logic for Task 106: PRD to Gherkin Parser Logic
 * It handles natural language processing of PRD content and converts it to structured Gherkin scenarios
 */
export class PrdToGherkinParser {
	constructor() {
		this.parser = new Parser(
			new AstBuilder(IdGenerator.uuid()),
			new GherkinClassicTokenMatcher()
		);
	}

	/**
	 * Parse PRD content to extract requirements and user stories
	 * @param {string} prdContent - Raw PRD content
	 * @returns {Array} Array of requirement objects
	 */
	parseRequirements(prdContent) {
		if (!prdContent || typeof prdContent !== 'string') {
			return [];
		}

		const requirements = [];
		const lines = prdContent
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0);

		let currentRequirement = null;
		let currentSection = null;

		for (const line of lines) {
			// Detect feature titles (usually standalone lines or headers)
			if (this.isFeatureTitle(line)) {
				if (currentRequirement) {
					requirements.push(currentRequirement);
				}
				currentRequirement = {
					title: line.replace(/^#+\s*/, ''), // Remove markdown headers
					userStory: '',
					acceptanceCriteria: []
				};
				currentSection = 'title';
			}
			// Detect user stories (As a... I want... so that...)
			else if (this.isUserStory(line)) {
				// If we already have a current requirement, save it and start a new one
				if (currentRequirement) {
					requirements.push(currentRequirement);
				}
				currentRequirement = {
					title: this.extractTitleFromUserStory(line),
					userStory: line,
					acceptanceCriteria: []
				};
				currentSection = 'userStory';
			}
			// Detect acceptance criteria section
			else if (this.isAcceptanceCriteriaHeader(line)) {
				currentSection = 'acceptanceCriteria';
			}
			// Process acceptance criteria items
			else if (
				this.isAcceptanceCriteriaItem(line) &&
				currentSection === 'acceptanceCriteria'
			) {
				if (currentRequirement) {
					currentRequirement.acceptanceCriteria.push(
						line.replace(/^[-*]\s*/, '')
					);
				}
			}
			// Handle standalone requirements that might not have full user story format
			else if (this.isStandaloneRequirement(line) && !currentRequirement) {
				currentRequirement = {
					title: line,
					userStory: '',
					acceptanceCriteria: []
				};
			}
		}

		// Add the last requirement if it exists
		if (currentRequirement) {
			requirements.push(currentRequirement);
		}

		return requirements.filter((req) => req.title || req.userStory);
	}

	/**
	 * Check if a line is a feature title
	 * @param {string} line - Line to check
	 * @returns {boolean}
	 */
	isFeatureTitle(line) {
		return (
			/^#+\s+/.test(line) || // Markdown headers
			/^Feature:\s*/.test(line) || // Explicit feature
			(/^[A-Z]/.test(line) &&
				line.length < 100 &&
				!line.includes('As a') &&
				!line.includes('I want'))
		);
	}

	/**
	 * Check if a line is a user story
	 * @param {string} line - Line to check
	 * @returns {boolean}
	 */
	isUserStory(line) {
		return /^As a\s+.+,?\s*I want\s+.+/i.test(line);
	}

	/**
	 * Check if a line is an acceptance criteria header
	 * @param {string} line - Line to check
	 * @returns {boolean}
	 */
	isAcceptanceCriteriaHeader(line) {
		return /^Acceptance\s+Criteria:?$/i.test(line);
	}

	/**
	 * Check if a line is an acceptance criteria item
	 * @param {string} line - Line to check
	 * @returns {boolean}
	 */
	isAcceptanceCriteriaItem(line) {
		return /^[-*]\s+/.test(line);
	}

	/**
	 * Check if a line is a standalone requirement
	 * @param {string} line - Line to check
	 * @returns {boolean}
	 */
	isStandaloneRequirement(line) {
		return (
			line.length > 10 &&
			line.length < 200 &&
			!line.includes(':') &&
			/^[A-Z]/.test(line)
		);
	}

	/**
	 * Extract title from user story
	 * @param {string} userStory - User story text
	 * @returns {string}
	 */
	extractTitleFromUserStory(userStory) {
		const match = userStory.match(/I want to ([^,]+)/i);
		if (match) {
			return match[1].trim();
		}
		return userStory.substring(0, 50) + '...';
	}

	/**
	 * Map a requirement to Gherkin feature structure
	 * @param {Object} requirement - Requirement object
	 * @returns {Object} Gherkin feature structure
	 */
	mapToGherkin(requirement) {
		const feature =
			requirement.title ||
			this.extractTitleFromUserStory(requirement.userStory);
		const scenarios = this.generateScenarios(requirement);

		return {
			feature,
			scenarios
		};
	}

	/**
	 * Generate scenarios from a requirement
	 * @param {Object} requirement - Requirement object
	 * @returns {Array} Array of scenario objects
	 */
	generateScenarios(requirement) {
		const scenarios = [];

		// If there are acceptance criteria, create scenarios based on them
		if (
			requirement.acceptanceCriteria &&
			requirement.acceptanceCriteria.length > 0
		) {
			requirement.acceptanceCriteria.forEach((criteria, index) => {
				const scenario = this.createScenarioFromCriteria(criteria, requirement);
				if (scenario) {
					scenarios.push(scenario);
				}
			});
		} else {
			// Create a basic scenario from the user story
			const scenario = this.createBasicScenario(requirement);
			if (scenario) {
				scenarios.push(scenario);
			}
		}

		return scenarios;
	}

	/**
	 * Create a scenario from acceptance criteria
	 * @param {string} criteria - Acceptance criteria text
	 * @param {Object} requirement - Parent requirement
	 * @returns {Object} Scenario object
	 */
	createScenarioFromCriteria(criteria, requirement) {
		const title = this.generateScenarioTitle(criteria);
		const steps = this.generateStepsFromCriteria(criteria, requirement);

		return {
			title,
			steps
		};
	}

	/**
	 * Create a basic scenario from user story
	 * @param {Object} requirement - Requirement object
	 * @returns {Object} Scenario object
	 */
	createBasicScenario(requirement) {
		const title = 'Basic scenario';
		const steps = this.generateBasicSteps(requirement);

		return {
			title,
			steps
		};
	}

	/**
	 * Generate scenario title from criteria
	 * @param {string} criteria - Acceptance criteria text
	 * @returns {string} Scenario title
	 */
	generateScenarioTitle(criteria) {
		// Convert criteria to a readable scenario title
		let title = criteria.toLowerCase();
		title = title.replace(/^(user|system|application)\s+/i, '');
		title = title.replace(/^(can|should|will|must)\s+/i, '');
		title = title.charAt(0).toUpperCase() + title.slice(1);

		return title;
	}

	/**
	 * Generate Gherkin steps from acceptance criteria
	 * @param {string} criteria - Acceptance criteria text
	 * @param {Object} requirement - Parent requirement
	 * @returns {Array} Array of Gherkin steps
	 */
	generateStepsFromCriteria(criteria, requirement) {
		const steps = [];

		// Generate Given step (precondition)
		const givenStep = this.generateGivenStep(requirement);
		if (givenStep) {
			steps.push(givenStep);
		}

		// Generate When step (action)
		const whenStep = this.generateWhenStep(criteria, requirement);
		if (whenStep) {
			steps.push(whenStep);
		}

		// Generate Then step (outcome)
		const thenStep = this.generateThenStep(criteria, requirement);
		if (thenStep) {
			steps.push(thenStep);
		}

		return steps;
	}

	/**
	 * Generate basic steps from user story
	 * @param {Object} requirement - Requirement object
	 * @returns {Array} Array of Gherkin steps
	 */
	generateBasicSteps(requirement) {
		const steps = [];

		// Extract actor, action, and outcome from user story
		const userStoryMatch = requirement.userStory.match(
			/^As a (.+?),?\s*I want (?:to\s+)?(.+?)(?:\s+so that\s+(.+))?$/i
		);

		if (userStoryMatch) {
			const [, actor, action, outcome] = userStoryMatch;

			steps.push(`Given I am a ${actor.trim()}`);
			steps.push(`When I ${action.trim()}`);

			if (outcome) {
				steps.push(`Then I should ${outcome.trim()}`);
			} else {
				steps.push('Then the action should be successful');
			}
		} else {
			// Fallback for non-standard user stories
			steps.push('Given I am on the application');
			steps.push('When I perform the required action');
			steps.push('Then I should see the expected result');
		}

		return steps;
	}

	/**
	 * Generate Given step (precondition)
	 * @param {Object} requirement - Requirement object
	 * @returns {string} Given step
	 */
	generateGivenStep(requirement) {
		// Extract actor from user story
		const userStoryMatch = requirement.userStory.match(/^As a (.+?),/i);
		if (userStoryMatch) {
			const actor = userStoryMatch[1].trim();
			return `Given I am a ${actor}`;
		}

		return 'Given I am on the application';
	}

	/**
	 * Generate When step (action)
	 * @param {string} criteria - Acceptance criteria
	 * @param {Object} requirement - Requirement object
	 * @returns {string} When step
	 */
	generateWhenStep(criteria, requirement) {
		// Convert criteria to action
		let action = criteria.toLowerCase();
		action = action.replace(/^(user|system|application)\s+/i, 'I ');
		action = action.replace(/^(can|should|will|must)\s+/i, '');

		return `When ${action}`;
	}

	/**
	 * Generate Then step (outcome)
	 * @param {string} criteria - Acceptance criteria
	 * @param {Object} requirement - Requirement object
	 * @returns {string} Then step
	 */
	generateThenStep(criteria, requirement) {
		// Convert criteria to expected outcome
		let outcome = criteria.toLowerCase();
		outcome = outcome.replace(/^(user|system|application)\s+/i, 'I ');
		outcome = outcome.replace(/^(can|should|will|must)\s+/i, 'should ');

		return `Then ${outcome}`;
	}

	/**
	 * Generate complete Gherkin feature file content
	 * @param {Object} gherkinData - Gherkin data structure
	 * @returns {string} Complete Gherkin feature file content
	 */
	generateGherkinFeature(gherkinData) {
		let content = `Feature: ${gherkinData.feature}\n\n`;

		gherkinData.scenarios.forEach((scenario, index) => {
			content += `  Scenario: ${scenario.title}\n`;

			scenario.steps.forEach((step) => {
				content += `    ${step}\n`;
			});

			if (index < gherkinData.scenarios.length - 1) {
				content += '\n';
			}
		});

		return content;
	}

	/**
	 * Validate Gherkin syntax using @cucumber/gherkin parser
	 * @param {string} gherkinContent - Gherkin content to validate
	 * @returns {Object} Validation result
	 */
	validateGherkinSyntax(gherkinContent) {
		try {
			// First check for basic structure requirements
			const lines = gherkinContent.trim().split('\n');

			// Check for invalid steps (lines without proper Gherkin keywords)
			const invalidSteps = lines.filter((line) => {
				const trimmed = line.trim();
				if (
					!trimmed ||
					trimmed.startsWith('Feature:') ||
					trimmed.startsWith('Scenario:') ||
					trimmed.startsWith('Given') ||
					trimmed.startsWith('When') ||
					trimmed.startsWith('Then') ||
					trimmed.startsWith('And') ||
					trimmed.startsWith('But') ||
					trimmed.startsWith('#')
				) {
					return false;
				}
				// Check for lines that look like steps but don't have proper keywords
				return (
					trimmed.length > 0 && /^[A-Z]/.test(trimmed) && !trimmed.includes(':')
				);
			});

			if (invalidSteps.length > 0) {
				return {
					isValid: false,
					errors: [
						`Invalid steps without proper Gherkin keywords: ${invalidSteps.join(', ')}`
					],
					ast: null
				};
			}

			const ast = this.parser.parse(gherkinContent);
			return {
				isValid: true,
				errors: [],
				ast
			};
		} catch (error) {
			return {
				isValid: false,
				errors: [error.message],
				ast: null
			};
		}
	}

	/**
	 * Main method to parse PRD content to Gherkin features
	 * @param {string} prdContent - PRD content
	 * @returns {Object} Result with generated Gherkin features
	 */
	parsePrdToGherkin(prdContent) {
		const requirements = this.parseRequirements(prdContent);
		const features = [];

		requirements.forEach((requirement) => {
			const gherkinData = this.mapToGherkin(requirement);
			const featureContent = this.generateGherkinFeature(gherkinData);

			// Validate the generated Gherkin
			const validation = this.validateGherkinSyntax(featureContent);

			features.push({
				title: gherkinData.feature,
				content: featureContent,
				isValid: validation.isValid,
				errors: validation.errors,
				requirement
			});
		});

		return {
			features,
			totalFeatures: features.length,
			validFeatures: features.filter((f) => f.isValid).length,
			errors: features
				.filter((f) => !f.isValid)
				.map((f) => ({ title: f.title, errors: f.errors }))
		};
	}
}

export default PrdToGherkinParser;
