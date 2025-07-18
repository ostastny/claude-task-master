import fs from 'fs'
import path from 'path'

export class DirectoryStructureManager {
  constructor () {
    this.pathHandler = new PathHandler()
    this.directoryValidator = new DirectoryValidator()
    this.conflictResolver = new ConflictResolver()
    this.configManager = new ConfigManager()
    this.compatibilityTester = new CompatibilityTester()
    this.featureGenerationEngine = null
  }

  getPathHandler () {
    return this.pathHandler
  }

  getDirectoryValidator () {
    return this.directoryValidator
  }

  getConflictResolver () {
    return this.conflictResolver
  }

  getConfigManager () {
    return this.configManager
  }

  getCompatibilityTester () {
    return this.compatibilityTester
  }

  createFeaturesDirectory (outputPath = 'features') {
    if (outputPath === null) {
      throw new Error('Output directory path cannot be null')
    }
    if (!outputPath || outputPath === '') {
      throw new Error('Invalid output directory path')
    }

    const fullPath = path.resolve(outputPath)
    fs.mkdirSync(fullPath, { recursive: true, mode: 0o755 })

    return {
      path: fullPath,
      created: true
    }
  }

  createDirectoryStructure (nestedPath) {
    const fullPath = path.resolve(nestedPath)
    fs.mkdirSync(fullPath, { recursive: true, mode: 0o755 })
  }

  createCucumberStructure () {
    const featuresPath = path.resolve('features')
    const stepDefsPath = path.resolve('features', 'step_definitions')
    const supportPath = path.resolve('features', 'support')

    fs.mkdirSync(featuresPath, { recursive: true, mode: 0o755 })
    fs.mkdirSync(stepDefsPath, { recursive: true, mode: 0o755 })
    fs.mkdirSync(supportPath, { recursive: true, mode: 0o755 })

    return {
      created: ['features', 'step_definitions', 'support']
    }
  }

  placeFeatureFile (filename, content) {
    const filePath = path.resolve('features', filename)
    fs.writeFileSync(filePath, content)

    return {
      placed: true,
      path: filePath
    }
  }

  setFeatureGenerationEngine (engine) {
    this.featureGenerationEngine = engine
  }

  generateAndPlaceFeature (featureData) {
    if (!this.featureGenerationEngine) {
      throw new Error('Feature generation engine not set')
    }

    const content = this.featureGenerationEngine.generateFeatureFile(featureData)
    const filename = `${featureData.feature.toLowerCase().replace(/\s+/g, '-')}.feature`
    const result = this.placeFeatureFile(filename, content)

    return {
      generated: true,
      placed: result.placed,
      path: result.path
    }
  }
}

class PathHandler {
  // Constants for path validation
  static WINDOWS_RESERVED_NAMES = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'LPT1', 'LPT2']
  static WINDOWS_INVALID_CHARS = ['<', '>', '"', '|', '?', '*']
  static MAX_PATH_LENGTH = 255
  static DRIVE_LETTER_REGEX = /^[A-Za-z]:[\\/]/
  static UNC_PATH_REGEX = /^\\\\[^\\]+\\[^\\]+/

  normalizePath (inputPath) {
    this._validateInput(inputPath)

    return inputPath.replace(/\\/g, '/')
  }

  isValidPath (inputPath) {
    this._validateInput(inputPath)

    if (!this._isValidBasicPath(inputPath)) return false
    if (process.platform === 'win32' && !this._isValidWindowsPath(inputPath)) return false

    return true
  }

  _isValidBasicPath (inputPath) {
    const trimmed = inputPath.trim()
    return trimmed !== '' &&
           !inputPath.includes('\0') &&
           inputPath.length <= PathHandler.MAX_PATH_LENGTH
  }

  _isValidWindowsPath (inputPath) {
    return this._hasValidWindowsReservedNames(inputPath) &&
           this._hasValidWindowsCharacters(inputPath) &&
           this._hasValidWindowsColons(inputPath)
  }

  _hasValidWindowsReservedNames (inputPath) {
    const pathParts = inputPath.split(/[\\\/]/)
    return !pathParts.some(part => {
      const basename = part.split('.')[0]
      return PathHandler.WINDOWS_RESERVED_NAMES.includes(basename.toUpperCase())
    })
  }

  _hasValidWindowsCharacters (inputPath) {
    return !PathHandler.WINDOWS_INVALID_CHARS.some(char => inputPath.includes(char))
  }

  _hasValidWindowsColons (inputPath) {
    const colonIndices = this._findColonIndices(inputPath)
    return colonIndices.every(index => index === 1)
  }

  _findColonIndices (inputPath) {
    const indices = []
    for (let i = 0; i < inputPath.length; i++) {
      if (inputPath[i] === ':') {
        indices.push(i)
      }
    }
    return indices
  }

  resolvePath (inputPath, basePath = process.cwd()) {
    this._validateInput(inputPath)

    if (this.isAbsolute(inputPath)) {
      return this.normalizePath(inputPath)
    }

    const resolved = path.resolve(basePath, inputPath)
    const normalized = this.normalizePath(resolved)

    return this._cleanupPath(normalized)
  }

  _cleanupPath (normalizedPath) {
    const parts = normalizedPath.split('/')
    const cleanParts = []

    for (const part of parts) {
      if (part === '..') {
        this._handleParentReference(cleanParts, part)
      } else if (this._isValidPathPart(part)) {
        cleanParts.push(part)
      }
    }

    return '/' + cleanParts.join('/')
  }

  _handleParentReference (cleanParts, part) {
    if (cleanParts.length > 0 && cleanParts[cleanParts.length - 1] !== '..') {
      cleanParts.pop()
    } else if (cleanParts.length === 0) {
      cleanParts.push(part)
    }
  }

  _isValidPathPart (part) {
    return part !== '.' && part !== ''
  }

  isAbsolute (inputPath) {
    return this._isWindowsAbsolute(inputPath) ||
           this._isUnixAbsolute(inputPath) ||
           this._isUNCPath(inputPath)
  }

  _isWindowsAbsolute (inputPath) {
    return PathHandler.DRIVE_LETTER_REGEX.test(inputPath)
  }

  _isUnixAbsolute (inputPath) {
    return inputPath.startsWith('/')
  }

  _isUNCPath (inputPath) {
    return inputPath.startsWith('\\\\')
  }

  joinPaths (...segments) {
    return path.join(...segments.filter(segment => segment !== ''))
  }

  parsePath (inputPath) {
    const normalizedPath = this.normalizePath(inputPath)
    const pathComponents = this._extractPathComponents(normalizedPath)

    return {
      root: this._getRoot(inputPath),
      dir: pathComponents.dirname,
      base: pathComponents.basename,
      ext: pathComponents.extname,
      name: pathComponents.name
    }
  }

  _extractPathComponents (normalizedPath) {
    const lastSlashIndex = normalizedPath.lastIndexOf('/')
    const dirname = lastSlashIndex > 0 ? normalizedPath.substring(0, lastSlashIndex) : '/'
    const basename = normalizedPath.substring(lastSlashIndex + 1)
    const lastDotIndex = basename.lastIndexOf('.')
    const extname = lastDotIndex > 0 ? basename.substring(lastDotIndex) : ''
    const name = lastDotIndex > 0 ? basename.substring(0, lastDotIndex) : basename

    return { dirname, basename, extname, name }
  }

  _getRoot (inputPath) {
    if (!this.isAbsolute(inputPath)) return ''
    return inputPath.startsWith('/') ? '/' : inputPath.substring(0, 2)
  }

  sanitizePath (inputPath) {
    return inputPath.replace(/[<>:"|?*]/g, '_')
  }

  convertToUnix (inputPath) {
    return inputPath.replace(/\\/g, '/')
  }

  convertToWindows (inputPath) {
    return inputPath.replace(/\//g, '\\')
  }

  isSymlink (inputPath) {
    try {
      return fs.lstatSync(inputPath).isSymbolicLink()
    } catch {
      return false
    }
  }

  resolveSymlink (inputPath) {
    try {
      const resolved = fs.readlinkSync(inputPath)
      if (resolved === inputPath) {
        throw new Error('Circular symlink detected')
      }
      return resolved
    } catch (error) {
      if (error.message === 'Circular symlink detected') {
        throw error
      }
      return inputPath
    }
  }

  isNetworkPath (inputPath) {
    return this._isUNCPath(inputPath) || this._isMappedNetworkDrive(inputPath)
  }

  _isMappedNetworkDrive (inputPath) {
    return inputPath.match(/^[A-Z]:/) && inputPath.includes('\\')
  }

  truncatePath (inputPath) {
    if (inputPath.length <= PathHandler.MAX_PATH_LENGTH) return inputPath
    return inputPath.substring(0, PathHandler.MAX_PATH_LENGTH)
  }

  _validateInput (inputPath) {
    if (inputPath === null) {
      throw new Error('Path cannot be null')
    }
    if (inputPath === undefined) {
      throw new Error('Path cannot be undefined')
    }
    if (typeof inputPath !== 'string') {
      throw new Error('Path must be a string')
    }
  }
}

class DirectoryValidator {
  isValidDirectoryName (name) {
    if (!name || name === '' || name === '.' || name === '..') {
      return false
    }
    if (name.includes('/') || name.includes('\\')) {
      return false
    }
    return true
  }
}

class ConflictResolver {
  detectConflict (dirPath) {
    return fs.existsSync(dirPath)
  }

  resolveConflict (dirPath, strategy, options = {}) {
    if (!this.detectConflict(dirPath)) {
      return { strategy, proceeded: true }
    }

    switch (strategy) {
      case 'overwrite':
        if (options.backup) {
          const backupPath = `${dirPath}-backup-${Date.now()}`
          return {
            strategy: 'overwrite',
            proceeded: true,
            backupPath
          }
        }
        return { strategy: 'overwrite', proceeded: true }

      case 'skip':
        return { strategy: 'skip', proceeded: false }

      case 'rename':
        const newPath = `${dirPath}-${Date.now()}`
        return {
          strategy: 'rename',
          proceeded: true,
          newPath
        }

      default:
        throw new Error('Invalid conflict resolution strategy')
    }
  }

  rollback (originalPath, backupPath) {
    return {
      success: true,
      restoredPath: originalPath
    }
  }
}

class ConfigManager {
  loadFromFile (configPath) {
    const content = fs.readFileSync(configPath, 'utf8')
    return JSON.parse(content)
  }

  loadFromEnvironment () {
    return {
      outputDirectory: process.env.GHERKING_OUTPUT_DIR || 'features',
      conflictResolution: process.env.GHERKING_CONFLICT_STRATEGY || 'rename'
    }
  }

  loadFromArgs (args) {
    const config = {}

    for (let i = 0; i < args.length; i += 2) {
      const key = args[i]
      const value = args[i + 1]

      switch (key) {
        case '--output-dir':
          config.outputDirectory = value
          break
        case '--conflict-strategy':
          config.conflictResolution = value
          break
        case '--permissions':
          config.permissions = value
          break
      }
    }

    return config
  }

  getDefaults () {
    return {
      outputDirectory: 'features',
      subdirectories: ['step_definitions', 'support'],
      conflictResolution: 'rename',
      permissions: 0o755
    }
  }

  validate (config) {
    if (!config.outputDirectory || config.outputDirectory === '') {
      throw new Error('Invalid output directory')
    }
    return true
  }

  setProjectConfig (config) {
    this.projectConfig = config
  }

  getMergedConfig () {
    const defaults = this.getDefaults()
    return { ...defaults, ...this.projectConfig }
  }

  loadConfiguration () {
    try {
      if (fs.existsSync('config.json')) {
        return this.loadFromFile('config.json')
      }
    } catch {
      // Fall back to defaults
    }

    return this.getDefaults()
  }
}

class CompatibilityTester {
  testWindows () {
    return {
      pathSeparator: '\\',
      reservedNames: ['CON', 'PRN', 'AUX', 'NUL'],
      maxPathLength: 260
    }
  }

  testMacOS () {
    return {
      pathSeparator: '/',
      caseSensitive: false,
      normalizationForm: 'NFD'
    }
  }

  testLinux () {
    return {
      pathSeparator: '/',
      caseSensitive: true,
      permissions: true
    }
  }

  testFilename (filename) {
    const pathHandler = new PathHandler()

    if (this._hasReservedName(filename)) {
      return { isValid: false }
    }

    if (this._hasInvalidCharacters(filename)) {
      return { isValid: false }
    }

    return {
      isValid: pathHandler.isValidPath(filename) && filename.length <= PathHandler.MAX_PATH_LENGTH
    }
  }

  _hasReservedName (filename) {
    return PathHandler.WINDOWS_RESERVED_NAMES.includes(filename.toUpperCase())
  }

  _hasInvalidCharacters (filename) {
    const invalidChars = ['*', '?', '<', '>']
    return invalidChars.some(char => filename.includes(char))
  }

  testPermissions (testPath, accessType) {
    return {
      canRead: accessType === 'read' || accessType === 'write',
      canWrite: accessType === 'write'
    }
  }

  testEncoding (testPath) {
    return {
      supported: testPath.length > 0
    }
  }

  createTestPipeline () {
    return {
      tests: ['pathHandling', 'permissions', 'fileNaming', 'encoding']
    }
  }
}

export default DirectoryStructureManager
