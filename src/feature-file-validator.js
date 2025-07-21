/**
 * Feature File Validator for Python BDD frameworks
 * Validates feature files for compatibility with Behave and pytest-bdd
 */
export class FeatureFileValidator {
	constructor() {
		this.supportedFrameworks = ['behave', 'pytest-bdd'];
		this.validationCache = new Map();
	}

	/**
	 * Validate Behave compatibility
	 */
	async validateBehaveCompatibility(content) {
		const validation = {
			framework: 'behave',
			compatible: true,
			issues: [],
			validationResults: {}
		};

		// Run comprehensive Behave validation
		const syntaxValidation = await this.validatePythonDataTableSyntax(content, 'behave');
		const outlineValidation = await this.validatePythonScenarioOutlineSyntax(content, 'behave');
		const tagValidation = await this.validatePythonTagSyntax(content, 'behave');
		const parserValidation = await this.runBehaveParserValidation(content);

		validation.validationResults = {
			syntax: syntaxValidation,
			outlines: outlineValidation,
			tags: tagValidation,
			parser: parserValidation
		};

		// Aggregate issues
		const allValidations = [syntaxValidation, outlineValidation, tagValidation, parserValidation];
		for (const v of allValidations) {
			if (!v.valid) {
				validation.compatible = false;
				validation.issues.push(...(v.issues || []));
			}
		}

		return validation;
	}

	/**
	 * Validate pytest-bdd compatibility
	 */
	async validatePytestBddCompatibility(content) {
		const validation = {
			framework: 'pytest-bdd',
			compatible: true,
			issues: [],
			validationResults: {}
		};

		// Run comprehensive pytest-bdd validation
		const syntaxValidation = await this.validatePythonDataTableSyntax(content, 'pytest-bdd');
		const outlineValidation = await this.validatePythonScenarioOutlineSyntax(content, 'pytest-bdd');
		const tagValidation = await this.validatePythonTagSyntax(content, 'pytest-bdd');
		const parserValidation = await this.runPytestBddParserValidation(content);
		const stepValidation = await this.validatePythonStepDefinitionCompatibility(content, 'pytest-bdd');

		validation.validationResults = {
			syntax: syntaxValidation,
			outlines: outlineValidation,
			tags: tagValidation,
			parser: parserValidation,
			steps: stepValidation
		};

		// Aggregate issues
		const allValidations = [syntaxValidation, outlineValidation, tagValidation, parserValidation, stepValidation];
		for (const v of allValidations) {
			if (!v.valid) {
				validation.compatible = false;
				validation.issues.push(...(v.issues || []));
			}
		}

		return validation;
	}

	/**
	 * Validate Python data table syntax
	 */
	async validatePythonDataTableSyntax(content, framework) {
		const validation = {
			valid: true,
			issues: [],
			framework,
			dataTables: []
		};

		const lines = content.split('\n');
		let inDataTable = false;
		let currentTable = null;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const lineNumber = i + 1;

			if (this._isDataTableLine(line)) {
				if (!inDataTable) {
					// Start of new data table
					inDataTable = true;
					currentTable = {
						startLine: lineNumber,
						headers: [],
						rows: [],
						issues: []
					};
				}

				const cells = this._parseDataTableCells(line);
				
				if (currentTable.headers.length === 0 && cells.length > 0) {
					// This is the header row
					currentTable.headers = cells;
					
					// Validate each header
					for (const header of cells) {
						if (!this._isValidPythonIdentifier(header)) {
							const issue = {
								type: 'invalid_data_table_header',
								line: lineNumber,
								header,
								message: `Invalid Python identifier: "${header}"`
							};
							currentTable.issues.push(issue);
							validation.issues.push(issue);
							validation.valid = false;
						}
					}
				} else {
					currentTable.rows.push(cells);
				}
			} else if (inDataTable) {
				// End of data table
				inDataTable = false;
				currentTable.endLine = lineNumber - 1;
				validation.dataTables.push(currentTable);
				currentTable = null;
			}
		}

		// Handle case where data table ends at end of file
		if (currentTable) {
			currentTable.endLine = lines.length;
			validation.dataTables.push(currentTable);
		}

		return validation;
	}

	/**
	 * Validate Python scenario outline syntax
	 */
	async validatePythonScenarioOutlineSyntax(content, framework) {
		const validation = {
			valid: true,
			issues: [],
			framework,
			scenarioOutlines: []
		};

		const lines = content.split('\n');
		let inScenarioOutline = false;
		let currentOutline = null;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const lineNumber = i + 1;

			if (line.trim().startsWith('Scenario Outline:')) {
				inScenarioOutline = true;
				currentOutline = {
					title: line.trim().substring('Scenario Outline:'.length).trim(),
					startLine: lineNumber,
					parameters: new Set(),
					exampleTables: [],
					issues: []
				};
			} else if (inScenarioOutline && line.trim().startsWith('Scenario')) {
				// End of current scenario outline
				if (currentOutline) {
					validation.scenarioOutlines.push(currentOutline);
				}
				inScenarioOutline = false;
				currentOutline = null;
			} else if (inScenarioOutline && currentOutline) {
				// Check for parameters in step lines
				const parameterMatches = line.match(/<([^>]+)>/g);
				if (parameterMatches) {
					for (const match of parameterMatches) {
						const parameter = match.slice(1, -1);
						currentOutline.parameters.add(parameter);
						
						if (!this._isValidPythonIdentifier(parameter)) {
							const issue = {
								type: 'invalid_scenario_outline_parameter',
								line: lineNumber,
								parameter,
								message: `Invalid parameter name: "${parameter}"`
							};
							currentOutline.issues.push(issue);
							validation.issues.push(issue);
							validation.valid = false;
						}
					}
				}

				// Check for Examples tables
				if (line.trim().startsWith('Examples:')) {
					// Next data table belongs to this outline
					const table = this._parseExamplesTable(lines, i + 1);
					if (table) {
						currentOutline.exampleTables.push(table);
						
						// Validate that example headers match parameters
						const headerSet = new Set(table.headers);
						for (const param of currentOutline.parameters) {
							if (!headerSet.has(param)) {
								const issue = {
									type: 'missing_example_header',
									line: table.startLine,
									parameter: param,
									message: `Parameter "${param}" not found in Examples table`
								};
								currentOutline.issues.push(issue);
								validation.issues.push(issue);
								validation.valid = false;
							}
						}
					}
				}
			}
		}

		// Handle case where scenario outline ends at end of file
		if (currentOutline) {
			validation.scenarioOutlines.push(currentOutline);
		}

		return validation;
	}

	/**
	 * Validate Python tag syntax
	 */
	async validatePythonTagSyntax(content, framework) {
		const validation = {
			valid: true,
			issues: [],
			framework,
			tags: []
		};

		const lines = content.split('\n');

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const lineNumber = i + 1;

			if (this._isTagLine(line)) {
				const tags = this._extractTags(line);
				
				for (const tag of tags) {
					validation.tags.push({
						tag,
						line: lineNumber
					});

					if (!this._isValidTagName(tag)) {
						const issue = {
							type: 'invalid_tag_name',
							line: lineNumber,
							tag,
							message: `Invalid tag name: "${tag}"`
						};
						validation.issues.push(issue);
						validation.valid = false;
					}
				}
			}
		}

		return validation;
	}

	/**
	 * Validate Python step definition compatibility
	 */
	async validatePythonStepDefinitionCompatibility(content, framework) {
		const validation = {
			valid: true,
			issues: [],
			framework,
			steps: []
		};

		const lines = content.split('\n');

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const lineNumber = i + 1;

			if (this._isStepLine(line)) {
				const stepAnalysis = this._analyzeStepDefinitionCompatibility(line, framework);
				stepAnalysis.line = lineNumber;
				validation.steps.push(stepAnalysis);

				if (!stepAnalysis.compatible) {
					validation.valid = false;
					validation.issues.push(...stepAnalysis.issues.map(issue => ({
						...issue,
						line: lineNumber
					})));
				}
			}
		}

		return validation;
	}

	/**
	 * Run Behave parser validation
	 */
	async runBehaveParserValidation(content) {
		const validation = {
			valid: true,
			issues: [],
			framework: 'behave',
			parserResults: {}
		};

		// Simulate Behave parser validation
		try {
			// Basic structure validation
			const structureValidation = this._validateGherkinStructure(content);
			validation.parserResults.structure = structureValidation;
			
			if (!structureValidation.valid) {
				validation.valid = false;
				validation.issues.push(...structureValidation.issues);
			}

			// Behave-specific validations
			const contextValidation = this._validateBehaveContextUsage(content);
			validation.parserResults.context = contextValidation;
			
			if (!contextValidation.valid) {
				validation.valid = false;
				validation.issues.push(...contextValidation.issues);
			}

		} catch (error) {
			validation.valid = false;
			validation.issues.push({
				type: 'parser_error',
				message: error.message
			});
		}

		return validation;
	}

	/**
	 * Run pytest-bdd parser validation
	 */
	async runPytestBddParserValidation(content) {
		const validation = {
			valid: true,
			issues: [],
			framework: 'pytest-bdd',
			parserResults: {}
		};

		// Simulate pytest-bdd parser validation
		try {
			// Basic structure validation
			const structureValidation = this._validateGherkinStructure(content);
			validation.parserResults.structure = structureValidation;
			
			if (!structureValidation.valid) {
				validation.valid = false;
				validation.issues.push(...structureValidation.issues);
			}

			// pytest-bdd specific validations
			const fixtureValidation = this._validatePytestBddFixtureCompatibility(content);
			validation.parserResults.fixtures = fixtureValidation;
			
			if (!fixtureValidation.valid) {
				validation.valid = false;
				validation.issues.push(...fixtureValidation.issues);
			}

		} catch (error) {
			validation.valid = false;
			validation.issues.push({
				type: 'parser_error',
				message: error.message
			});
		}

		return validation;
	}

	// Helper methods
	_isDataTableLine(line) {
		const trimmed = line.trim();
		return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2;
	}

	_parseDataTableCells(line) {
		return line.split('|')
			.map(cell => cell.trim())
			.filter(cell => cell.length > 0);
	}

	_isValidPythonIdentifier(identifier) {
		if (!identifier || identifier.length === 0) return false;
		if (/^\d/.test(identifier)) return false; // Cannot start with number
		return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
	}

	_parseExamplesTable(lines, startIndex) {
		const table = {
			startLine: startIndex + 1,
			headers: [],
			rows: []
		};

		for (let i = startIndex; i < lines.length; i++) {
			const line = lines[i];
			
			if (!this._isDataTableLine(line)) {
				break;
			}

			const cells = this._parseDataTableCells(line);
			if (table.headers.length === 0) {
				table.headers = cells;
			} else {
				table.rows.push(cells);
			}
		}

		return table.headers.length > 0 ? table : null;
	}

	_isTagLine(line) {
		return line.trim().startsWith('@');
	}

	_extractTags(line) {
		return line.trim()
			.split(/\s+/)
			.filter(part => part.startsWith('@'))
			.map(tag => tag.substring(1));
	}

	_isValidTagName(tag) {
		// Allow alphanumeric, underscores, and hyphens for tags
		return /^[a-zA-Z0-9_-]+$/.test(tag) && !/^\d/.test(tag);
	}

	_isStepLine(line) {
		const trimmed = line.trim();
		return trimmed.startsWith('Given ') || 
		       trimmed.startsWith('When ') || 
		       trimmed.startsWith('Then ') || 
		       trimmed.startsWith('And ') || 
		       trimmed.startsWith('But ');
	}

	_analyzeStepDefinitionCompatibility(line, framework) {
		const analysis = {
			step: line.trim(),
			compatible: true,
			issues: []
		};

		// Framework-specific compatibility checks
		if (framework === 'behave') {
			// Check for Behave-specific patterns
			if (line.includes('context.') && !line.includes('Given') && !line.includes('When') && !line.includes('Then')) {
				analysis.issues.push({
					type: 'context_usage_in_step',
					message: 'Context usage should be in step definition, not step text'
				});
				analysis.compatible = false;
			}
		} else if (framework === 'pytest-bdd') {
			// Check for pytest-bdd specific patterns
			if (line.includes('{') && line.includes('}')) {
				analysis.issues.push({
					type: 'parameter_format',
					message: 'pytest-bdd prefers angle brackets <> for parameters'
				});
			}
		}

		return analysis;
	}

	_validateGherkinStructure(content) {
		const validation = {
			valid: true,
			issues: []
		};

		// Check for basic Gherkin structure
		if (!content.includes('Feature:')) {
			validation.valid = false;
			validation.issues.push({
				type: 'missing_feature',
				message: 'No Feature declaration found'
			});
		}

		if (!content.includes('Scenario')) {
			validation.valid = false;
			validation.issues.push({
				type: 'missing_scenario',
				message: 'No Scenario found'
			});
		}

		return validation;
	}

	_validateBehaveContextUsage(content) {
		return {
			valid: true,
			issues: []
		};
	}

	_validatePytestBddFixtureCompatibility(content) {
		return {
			valid: true,
			issues: []
		};
	}
}

export default FeatureFileValidator;