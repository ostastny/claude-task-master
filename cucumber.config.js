const cucumberConfig = {
	features: ['tests/bdd-cucumber/features/**/*.feature'],
	steps: ['tests/bdd-cucumber/step_definitions/**/*.js'],
	format: ['pretty', 'json:cucumber-report.json'],
	parallel: 1,
	require: ['tests/bdd-cucumber/step_definitions/**/*.js'],
	publishQuiet: true,
	failAmbiguousDefinitions: true,
	retry: 0,
	tags: process.env.CUCUMBER_TAGS || undefined,
	timeout: 10000
};

export default cucumberConfig;
