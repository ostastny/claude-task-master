/**
 * Constants for Behave Framework Testing (Task 110.1)
 */

export const BEHAVE_METHODS = {
	// Installation methods
	INSTALL_BEHAVE_PACKAGE: 'installBehavePackage',
	VALIDATE_PYTHON_ENVIRONMENT: 'validatePythonEnvironment',
	VALIDATE_BEHAVE_DEPENDENCIES: 'validateBehaveDependencies',
	VALIDATE_BEHAVE_INSTALLATION: 'validateBehaveInstallation',
	CREATE_REQUIREMENTS_TXT: 'createRequirementsTxt',
	SETUP_PYTEST_BDD: 'setupPytestBdd',

	// Directory structure methods
	CREATE_BEHAVE_DIRECTORY: 'createBehaveDirectory',
	CREATE_FEATURES_DIRECTORY: 'createFeaturesDirectory',
	CREATE_STEPS_DIRECTORY: 'createStepsDirectory',
	CREATE_ENVIRONMENT_PY: 'createEnvironmentPy',

	// Configuration methods
	GENERATE_BEHAVE_CONFIG: 'generateBehaveConfig',
	GENERATE_BEHAVE_INI: 'generateBehaveIni',
	CONFIGURE_BEHAVE_ENVIRONMENT: 'configureBehaveEnvironment',

	// Step definition methods
	CREATE_SAMPLE_STEP_DEFINITIONS: 'createSampleStepDefinitions',

	// Runner methods
	SETUP_BEHAVE_RUNNER: 'setupBehaveRunner'
};

export const DIRECTORY_STRUCTURE = [
	'features/',
	'features/steps/',
	'features/support/'
];

export const STEP_DEFINITION_FILES = [
	'authentication_steps.py',
	'common_steps.py',
	'api_steps.py',
	'database_steps.py',
	'user_management_steps.py'
];

export const STEP_PATTERNS = {
	DECORATORS: 'decorators',
	PARAMETERS: 'parameters',
	DATA_TABLES: 'data_tables',
	DOCSTRINGS: 'docstrings',
	SCENARIO_OUTLINES: 'scenario_outlines',
	IMPORTS: 'imports',
	CONTEXT_USAGE: 'context_usage',
	ASSERTIONS: 'assertions',
	ERROR_HANDLING: 'error_handling',
	GHERKIN_INTEGRATION: 'gherkin_integration',
	ALL_PATTERNS: 'all_patterns'
};

export const CONFIG_TYPES = {
	FORMATTERS: 'formatters',
	TAGS: 'tags',
	LOGGING: 'logging',
	JUNIT: 'junit'
};

export const ENVIRONMENT_HOOKS = {
	BEFORE_ALL: 'before_all',
	AFTER_ALL: 'after_all',
	BEFORE_SCENARIO: 'before_scenario',
	AFTER_SCENARIO: 'after_scenario',
	CONTEXT_INIT: 'context_init',
	FIXTURES: 'fixtures'
};

export const PYTEST_BDD_FEATURES = {
	INSTALL: 'install',
	CONFIG: 'config',
	CONFTEST: 'conftest',
	DISCOVERY: 'discovery',
	SAMPLE_TEST: 'sample_test'
};

export const RUNNER_FEATURES = {
	SCRIPT: 'script',
	CLI_OPTIONS: 'cli_options',
	ENVIRONMENTS: 'environments',
	PARALLEL: 'parallel',
	REPORTING: 'reporting'
};

export const VALIDATION_TYPES = {
	COMMAND: 'command',
	STEP_DISCOVERY: 'step_discovery',
	HOOKS: 'hooks',
	MINIMAL_TEST: 'minimal_test',
	PYTEST_BDD: 'pytest_bdd',
	TASKMASTER_FEATURES: 'taskmaster_features'
};

export const ERROR_SCENARIOS = {
	// Python/Installation errors
	PYTHON_NOT_FOUND: 'not_found',
	PIP_ERROR: 'pip_error',
	NETWORK_ERROR: 'network_error',
	PERMISSION_ERROR: 'permission_error',
	VERSION_CHECK: 'version_check',

	// Directory errors
	DISK_SPACE: 'disk_space',
	PERMISSION_DENIED: 'permission_denied',
	FILE_CONFLICT: 'file_conflict',

	// Configuration errors
	INVALID_SYNTAX: 'invalid_syntax',
	CORRUPTED: 'corrupted',
	CONFLICTS: 'conflicts'
};
