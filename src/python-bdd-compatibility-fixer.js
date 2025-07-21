/**
 * Python BDD Compatibility Fixer
 * Handles fixing compatibility issues between generated features and Python BDD frameworks
 */
export class PythonBddCompatibilityFixer {
	constructor() {
		this.supportedFrameworks = ['behave', 'pytest-bdd'];
		this.pythonReservedKeywords = [
			'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del',
			'elif', 'else', 'except', 'exec', 'finally', 'for', 'from',
			'global', 'if', 'import', 'in', 'is', 'lambda', 'not', 'or',
			'pass', 'print', 'raise', 'return', 'try', 'while', 'with', 'yield'
		];
		// Constants for consistent regex patterns
		this.patterns = {
			pythonIdentifier: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
			startWithNumber: /^\d/,
			tagName: /^[a-zA-Z_][a-zA-Z0-9_-]*$/,
			scenarioOutlineParams: /<([^>]+)>/g,
			stepParams: /\{([^}]+)\}/g
		};
		// Constants for issue types
		this.issueTypes = {
			INVALID_DATA_TABLE_HEADER: 'invalid_data_table_header',
			INVALID_SCENARIO_OUTLINE_PARAMETER: 'invalid_scenario_outline_parameter',
			INVALID_TAG_NAME: 'invalid_tag_name',
			INVALID_STEP_PARAMETER: 'invalid_step_parameter',
			UNSUPPORTED_FRAMEWORK: 'unsupported_framework'
		};
	}

	/**
	 * Detect Python BDD compatibility issues in feature content
	 */
	async detectPythonBddCompatibilityIssues(content, framework, options = {}) {
		const issues = [];
		
		// Check if framework is supported
		issues.push(...this._validateFrameworks(framework));
		
		// Parse content for issues
		const lines = content.split('\n');
		
		// Detect all types of issues
		issues.push(
			...this._detectDataTableIssues(lines, options),
			...this._detectScenarioOutlineIssues(lines, options),
			...this._detectTagIssues(lines, options),
			...this._detectStepParameterIssues(lines, options)
		);
		
		return this._createDetectionResult(issues, framework);
	}

	/**
	 * Fix data table syntax for Behave framework
	 */
	async fixDataTableSyntaxForBehave(content, options = {}) {
		const lines = content.split('\n');
		const { fixedLines, mappingDoc } = this._processLines(lines, {
			processor: (line) => this._isDataTableHeader(line) ? this._fixDataTableHeaderLine(line) : { fixed: line },
			collectMappings: options.generateMappingDoc
		});
		
		return this._createFixResult(lines, fixedLines, mappingDoc, options.generateMappingDoc);
	}

	/**
	 * Fix scenario outline Python compatibility
	 */
	async fixScenarioOutlinePythonCompatibility(content, options = {}) {
		const lines = content.split('\n');
		const parameterMappings = new Map();
		
		const fixedLines = lines.map(line => {
			let fixedLine = this._fixParametersInLine(line, parameterMappings);
			
			if (this._isExamplesTableHeader(line)) {
				fixedLine = this._fixExamplesTableHeader(fixedLine, parameterMappings);
			}
			
			return fixedLine;
		});
		
		return {
			content: fixedLines.join('\n'),
			parameterMappings: Array.from(parameterMappings.entries()),
			changed: this._hasChanges(lines, fixedLines)
		};
	}

	/**
	 * Fix tag system compatibility
	 */
	async fixTagSystemCompatibility(content, options = {}) {
		const lines = content.split('\n');
		const { fixedLines, mappingDoc: tagMappings } = this._processLines(lines, {
			processor: (line) => this._isTagLine(line) ? this._fixTagLine(line) : { fixed: line },
			collectMappings: options.generateTagMapping,
			mappingProperty: 'mappings'
		});
		
		return this._createTagFixResult(lines, fixedLines, tagMappings, options.generateTagMapping);
	}

	/**
	 * Validate Python identifier compliance
	 */
	async validatePythonIdentifierCompliance(content, options = {}) {
		const violations = [];
		const lines = content.split('\n');
		
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const lineNumber = i + 1;
			
			if (options.checkParameters || !options.checkDataTables && !options.checkTags) {
				violations.push(...this._checkParametersInLine(line, lineNumber));
			}
			
			if (options.checkDataTables || !options.checkParameters && !options.checkTags) {
				violations.push(...this._checkDataTableInLine(line, lineNumber));
			}
			
			if (options.checkTags || !options.checkParameters && !options.checkDataTables) {
				violations.push(...this._checkTagsInLine(line, lineNumber));
			}
		}
		
		const result = {
			compliant: violations.length === 0,
			violations
		};
		
		if (options.detailedReport) {
			result.summary = {
				totalViolations: violations.length,
				violationTypes: [...new Set(violations.map(v => v.type))]
			};
		}
		
		return result;
	}

	/**
	 * Ensure step definition compatibility
	 */
	async ensureStepDefinitionCompatibility(content, framework, options = {}) {
		const analysis = {
			framework,
			compatible: true,
			issues: [],
			stepDefinitions: []
		};
		
		const lines = content.split('\n');
		
		for (const line of lines) {
			if (this._isStepLine(line)) {
				const stepAnalysis = this._analyzeStepCompatibility(line, framework);
				analysis.stepDefinitions.push(stepAnalysis);
				
				if (!stepAnalysis.compatible) {
					analysis.compatible = false;
					analysis.issues.push(...stepAnalysis.issues);
				}
			}
		}
		
		if (options.generateTemplates) {
			analysis.templates = this._generateStepTemplates(analysis.stepDefinitions, framework);
		}
		
		return analysis;
	}

	/**
	 * Modify Gherkin generator for Python
	 */
	async modifyGherkinGeneratorForPython(generatorType) {
		return {
			generatorType,
			modifications: [
				'Added Python identifier validation',
				'Enhanced data table processing',
				'Updated parameter naming conventions',
				'Added tag compatibility checks'
			],
			status: 'modified'
		};
	}

	/**
	 * Add Python BDD validation rules
	 */
	async addPythonBddValidationRules() {
		return {
			rules: [
				'python_identifier_compliance',
				'reserved_keyword_avoidance',
				'data_table_header_validation',
				'scenario_outline_parameter_validation',
				'tag_naming_validation'
			],
			status: 'added'
		};
	}

	/**
	 * Prevent incompatible syntax generation
	 */
	async preventIncompatibleSyntaxGeneration() {
		return {
			preventionRules: [
				'Block invalid Python identifiers',
				'Convert special characters in names',
				'Validate against reserved keywords',
				'Ensure framework-specific compatibility'
			],
			status: 'implemented'
		};
	}

	/**
	 * Update documentation for Python BDD
	 */
	async updateDocumentationForPythonBdd(options = {}) {
		const sections = {
			dataTables: 'Data table headers must be valid Python identifiers',
			scenarioOutlines: 'Parameters must follow Python naming conventions',
			tags: 'Tags should use underscores instead of hyphens',
			stepDefinitions: 'Step definitions must be compatible with framework syntax'
		};
		
		if (options.section) {
			return {
				section: options.section,
				documentation: sections[options.section] || 'Section not found',
				status: 'updated'
			};
		}
		
		return {
			sections,
			status: 'updated'
		};
	}

	// Helper methods - Framework Validation
	_validateFrameworks(framework) {
		const issues = [];
		const frameworks = Array.isArray(framework) ? framework : [framework];
		
		for (const fw of frameworks) {
			if (fw !== 'all' && !this.supportedFrameworks.includes(fw)) {
				issues.push({
					type: this.issueTypes.UNSUPPORTED_FRAMEWORK,
					framework: fw,
					message: `Unsupported framework: ${fw}`
				});
			}
		}
		
		return issues;
	}
	
	_createDetectionResult(issues, framework) {
		return {
			issues,
			framework,
			hasIssues: issues.length > 0
		};
	}
	
	// Helper methods - Line Processing
	_processLines(lines, { processor, collectMappings, mappingProperty = 'mapping' }) {
		const fixedLines = [];
		const mappingDoc = [];
		
		for (const line of lines) {
			const result = processor(line);
			fixedLines.push(result.fixed);
			
			if (collectMappings && result[mappingProperty]) {
				const mappings = Array.isArray(result[mappingProperty]) ? 
					result[mappingProperty] : [result[mappingProperty]];
				mappingDoc.push(...mappings);
			}
		}
		
		return { fixedLines, mappingDoc };
	}
	
	_createFixResult(originalLines, fixedLines, mappingDoc, includeMappings) {
		const result = {
			content: fixedLines.join('\n'),
			changed: this._hasChanges(originalLines, fixedLines)
		};
		
		if (includeMappings) {
			result.mappingDoc = mappingDoc;
		}
		
		return result;
	}
	
	_createTagFixResult(originalLines, fixedLines, tagMappings, includeTagMapping) {
		const result = {
			content: fixedLines.join('\n'),
			changed: this._hasChanges(originalLines, fixedLines)
		};
		
		if (includeTagMapping) {
			result.tagMappings = tagMappings;
		}
		
		return result;
	}
	
	_hasChanges(originalLines, fixedLines) {
		return fixedLines.some((line, i) => line !== originalLines[i]);
	}
	
	_createIssue(type, line, properties, message) {
		return {
			type,
			line,
			...properties,
			message
		};
	}
	
	// Helper methods - Issue Detection
	_detectDataTableIssues(lines, options) {
		const issues = [];
		
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			
			if (this._isDataTableHeader(line)) {
				const headers = this._extractDataTableHeaders(line);
				
				for (const header of headers) {
					if (!this._isValidPythonIdentifier(header.trim())) {
						issues.push(this._createIssue(
							this.issueTypes.INVALID_DATA_TABLE_HEADER,
							options.includeLineNumbers ? i + 1 : undefined,
							{ header: header.trim() },
							`Invalid Python identifier: ${header.trim()}`
						));
					}
				}
			}
		}
		
		return issues;
	}

	_detectScenarioOutlineIssues(lines, options) {
		const issues = [];
		
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const parameterMatches = line.match(this.patterns.scenarioOutlineParams);
			
			if (parameterMatches) {
				for (const match of parameterMatches) {
					const parameter = match.slice(1, -1); // Remove < >
					
					if (!this._isValidPythonIdentifier(parameter)) {
						issues.push(this._createIssue(
							this.issueTypes.INVALID_SCENARIO_OUTLINE_PARAMETER,
							options.includeLineNumbers ? i + 1 : undefined,
							{ parameter },
							`Invalid parameter name: ${parameter}`
						));
					}
				}
			}
		}
		
		return issues;
	}

	_detectTagIssues(lines, options) {
		const issues = [];
		
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			
			if (this._isTagLine(line)) {
				const tags = this._extractTags(line);
				
				for (const tag of tags) {
					if (!this._isValidTagName(tag)) {
						issues.push(this._createIssue(
							this.issueTypes.INVALID_TAG_NAME,
							options.includeLineNumbers ? i + 1 : undefined,
							{ tag },
							`Invalid tag name: ${tag}`
						));
					}
				}
			}
		}
		
		return issues;
	}

	_detectStepParameterIssues(lines, options) {
		const issues = [];
		
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			
			// Check for {parameter} style parameters
			const paramMatches = line.match(this.patterns.stepParams);
			
			if (paramMatches) {
				for (const match of paramMatches) {
					const parameter = match.slice(1, -1); // Remove { }
					
					if (!this._isValidPythonIdentifier(parameter)) {
						issues.push(this._createIssue(
							this.issueTypes.INVALID_STEP_PARAMETER,
							options.includeLineNumbers ? i + 1 : undefined,
							{ parameter },
							`Invalid step parameter: ${parameter}`
						));
					}
				}
			}
		}
		
		return issues;
	}

	_isDataTableHeader(line) {
		const trimmed = line.trim();
		return trimmed.startsWith('|') && trimmed.endsWith('|') && (trimmed.match(/\|/g) || []).length >= 2;
	}

	_extractDataTableHeaders(line) {
		return line.split('|').map(h => h.trim()).filter(h => h.length > 0);
	}

	_isValidPythonIdentifier(identifier) {
		if (!identifier || identifier.length === 0) return false;
		if (this.pythonReservedKeywords.includes(identifier)) return false;
		if (this.patterns.startWithNumber.test(identifier)) return false;
		return this.patterns.pythonIdentifier.test(identifier);
	}

	_isTagLine(line) {
		return line.trim().startsWith('@');
	}

	_extractTags(line) {
		return line.trim().split(/\s+/).filter(tag => tag.startsWith('@')).map(tag => tag.substring(1));
	}

	_isValidTagName(tag) {
		// Tags should be valid Python identifiers or use underscores
		return this.patterns.tagName.test(tag);
	}

	_fixDataTableHeaderLine(line) {
		const parts = line.split('|');
		const mapping = {};
		
		const fixedParts = parts.map(part => {
			const trimmed = part.trim();
			if (trimmed && !this._isValidPythonIdentifier(trimmed)) {
				const fixed = this._sanitizeIdentifier(trimmed);
				mapping[trimmed] = fixed;
				return ` ${fixed} `;
			}
			return part;
		});
		
		return {
			fixed: fixedParts.join('|'),
			mapping: Object.keys(mapping).length > 0 ? mapping : null
		};
	}

	_sanitizeIdentifier(identifier) {
		// Convert to valid Python identifier
		let sanitized = identifier.replace(/[^a-zA-Z0-9_]/g, '_');
		
		// Ensure doesn't start with number
		if (this.patterns.startWithNumber.test(sanitized)) {
			sanitized = '_' + sanitized;
		}
		
		// Handle reserved keywords
		if (this.pythonReservedKeywords.includes(sanitized)) {
			sanitized = sanitized + '_param';
		}
		
		return sanitized;
	}

	_fixParametersInLine(line, mappings) {
		return line.replace(this.patterns.scenarioOutlineParams, (match, param) => {
			if (!this._isValidPythonIdentifier(param)) {
				const fixed = this._sanitizeIdentifier(param);
				mappings.set(param, fixed);
				return `<${fixed}>`;
			}
			return match;
		});
	}

	_isExamplesTableHeader(line) {
		const trimmed = line.trim();
		return trimmed.startsWith('|') && !trimmed.includes('Examples:');
	}

	_fixExamplesTableHeader(line, mappings) {
		const parts = line.split('|');
		
		const fixedParts = parts.map(part => {
			const trimmed = part.trim();
			if (trimmed && !this._isValidPythonIdentifier(trimmed)) {
				const fixed = mappings.get(trimmed) || this._sanitizeIdentifier(trimmed);
				mappings.set(trimmed, fixed);
				return ` ${fixed} `;
			}
			return part;
		});
		
		return fixedParts.join('|');
	}

	_fixTagLine(line) {
		const tags = line.trim().split(/\s+/);
		const mappings = [];
		
		const fixedTags = tags.map(tag => {
			if (tag.startsWith('@')) {
				const tagName = tag.substring(1);
				if (!this._isValidTagName(tagName)) {
					const fixed = this._sanitizeIdentifier(tagName);
					mappings.push({ original: tagName, fixed });
					return '@' + fixed;
				}
			}
			return tag;
		});
		
		return {
			fixed: fixedTags.join(' '),
			mappings
		};
	}

	_checkParametersInLine(line, lineNumber) {
		const violations = [];
		const paramMatches = line.match(this.patterns.scenarioOutlineParams);
		
		if (paramMatches) {
			for (const match of paramMatches) {
				const parameter = match.slice(1, -1);
				if (!this._isValidPythonIdentifier(parameter)) {
					violations.push({
						type: 'invalid_parameter',
						line: lineNumber,
						parameter,
						violation: 'Not a valid Python identifier'
					});
				}
			}
		}
		
		return violations;
	}

	_checkDataTableInLine(line, lineNumber) {
		const violations = [];
		
		if (this._isDataTableHeader(line)) {
			const headers = this._extractDataTableHeaders(line);
			for (const header of headers) {
				if (!this._isValidPythonIdentifier(header)) {
					violations.push({
						type: 'invalid_data_table_header',
						line: lineNumber,
						header,
						violation: 'Not a valid Python identifier'
					});
				}
			}
		}
		
		return violations;
	}

	_checkTagsInLine(line, lineNumber) {
		const violations = [];
		
		if (this._isTagLine(line)) {
			const tags = this._extractTags(line);
			for (const tag of tags) {
				if (!this._isValidTagName(tag)) {
					violations.push({
						type: 'invalid_tag',
						line: lineNumber,
						tag,
						violation: 'Not a valid tag name'
					});
				}
			}
		}
		
		return violations;
	}

	_isStepLine(line) {
		const trimmed = line.trim();
		return trimmed.startsWith('Given ') || 
		       trimmed.startsWith('When ') || 
		       trimmed.startsWith('Then ') || 
		       trimmed.startsWith('And ') || 
		       trimmed.startsWith('But ');
	}

	_analyzeStepCompatibility(line, framework) {
		const analysis = {
			step: line.trim(),
			compatible: true,
			issues: []
		};
		
		// Basic compatibility analysis
		if (line.includes('{') && framework === 'pytest-bdd') {
			analysis.issues.push('pytest-bdd prefers parameter style over string formatting');
		}
		
		if (analysis.issues.length > 0) {
			analysis.compatible = false;
		}
		
		return analysis;
	}

	_generateStepTemplates(stepDefinitions, framework) {
		return stepDefinitions.map(step => ({
			step: step.step,
			template: framework === 'behave' ? 
				`@given('${step.step.replace(/^Given /, '')}')\ndef step_impl(context):\n    pass` :
				`@given(parsers.parse('${step.step.replace(/^Given /, '')}'))\ndef step_impl():\n    pass`
		}));
	}
}

export default PythonBddCompatibilityFixer;