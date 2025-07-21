import path from 'path';
import { BDDReplacementSystem } from '../bdd-replacement-system.js';

/**
 * BDD Integration utility for consistent BDD system usage
 */
export class BDDIntegration {
	constructor() {
		this.bddSystem = new BDDReplacementSystem();
	}

	/**
	 * Process PRD to BDD features with consistent error handling
	 * @param {string} prdPath - Path to PRD file
	 * @param {string} projectRoot - Project root directory
	 * @param {Object} logger - Logger instance
	 * @returns {Promise<Object>} - Processing result
	 */
	async processPRDToBDDFeatures(prdPath, projectRoot, logger) {
		const bddOutputDir = path.join(projectRoot, 'features');

		try {
			const result = await this.bddSystem.processPRDToBDD(
				prdPath,
				bddOutputDir
			);

			if (result.success) {
				logger.success(`BDD features generated in ${bddOutputDir}`);
				if (result.errors?.length > 0) {
					logger.warn(
						`Some BDD features had issues: ${result.errors.length} errors`
					);
				}
			} else {
				logger.warn('BDD feature generation completed with errors');
			}

			return {
				success: true,
				bddResult: result,
				outputDir: bddOutputDir
			};
		} catch (error) {
			logger.warn(`BDD feature generation failed: ${error.message}`);
			return {
				success: false,
				error: error.message,
				outputDir: bddOutputDir
			};
		}
	}

	/**
	 * Validate that BDD features were generated correctly
	 * @param {string} outputDir - Directory to validate
	 * @returns {Promise<Object>} - Validation result
	 */
	async validateBDDOutput(outputDir) {
		return await this.bddSystem.validateFeatureFilesOnly(outputDir);
	}
}

export default BDDIntegration;
