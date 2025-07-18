import { jest, describe, test, expect, beforeEach } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import { PrdToGherkinParser } from '../../src/parsers/prd-to-gherkin-parser.js'

describe('PrdToGherkinParser', () => {
  let parser

  beforeEach(() => {
    parser = new PrdToGherkinParser()
  })

  describe('constructor', () => {
    test('should create a parser instance', () => {
      expect(parser).toBeDefined()
      expect(parser instanceof PrdToGherkinParser).toBe(true)
    })
  })

  describe('parseRequirements', () => {
    test('should extract requirements from simple PRD content', () => {
      const prdContent = `
        User Authentication
        
        As a user, I want to log in to the system so that I can access my account.
        
        Acceptance Criteria:
        - User can enter username and password
        - System validates credentials
        - User is redirected to dashboard on success
      `

      const result = parser.parseRequirements(prdContent)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('title')
      expect(result[0]).toHaveProperty('userStory')
      expect(result[0]).toHaveProperty('acceptanceCriteria')
    })

    test('should handle empty PRD content', () => {
      const result = parser.parseRequirements('')
      expect(result).toEqual([])
    })

    test('should handle PRD with multiple user stories', () => {
      const prdContent = `
        Feature: User Management
        
        As a user, I want to register an account.
        
        As an admin, I want to manage user permissions.
      `

      const result = parser.parseRequirements(prdContent)
      expect(result.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('mapToGherkin', () => {
    test('should convert requirement to Gherkin feature', () => {
      const requirement = {
        title: 'User Login',
        userStory: 'As a user, I want to log in to the system so that I can access my account.',
        acceptanceCriteria: [
          'User can enter username and password',
          'System validates credentials',
          'User is redirected to dashboard on success'
        ]
      }

      const result = parser.mapToGherkin(requirement)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('feature')
      expect(result).toHaveProperty('scenarios')
      expect(result.feature).toContain('User Login')
      expect(result.scenarios).toBeInstanceOf(Array)
    })

    test('should generate proper Given/When/Then scenarios', () => {
      const requirement = {
        title: 'User Login',
        userStory: 'As a user, I want to log in to the system so that I can access my account.',
        acceptanceCriteria: [
          'User can enter username and password',
          'System validates credentials'
        ]
      }

      const result = parser.mapToGherkin(requirement)
      const scenario = result.scenarios[0]

      expect(scenario).toHaveProperty('title')
      expect(scenario).toHaveProperty('steps')
      expect(scenario.steps.some(step => step.startsWith('Given'))).toBe(true)
      expect(scenario.steps.some(step => step.startsWith('When'))).toBe(true)
      expect(scenario.steps.some(step => step.startsWith('Then'))).toBe(true)
    })
  })

  describe('generateGherkinFeature', () => {
    test('should generate complete Gherkin feature file content', () => {
      const gherkinData = {
        feature: 'User Authentication',
        scenarios: [
          {
            title: 'Successful login',
            steps: [
              'Given I am on the login page',
              'When I enter valid credentials',
              'Then I should be redirected to the dashboard'
            ]
          }
        ]
      }

      const result = parser.generateGherkinFeature(gherkinData)

      expect(result).toBeDefined()
      expect(result).toContain('Feature: User Authentication')
      expect(result).toContain('Scenario: Successful login')
      expect(result).toContain('Given I am on the login page')
      expect(result).toContain('When I enter valid credentials')
      expect(result).toContain('Then I should be redirected to the dashboard')
    })
  })

  describe('validateGherkinSyntax', () => {
    test('should validate correct Gherkin syntax', () => {
      const validGherkin = `
Feature: User Authentication

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be redirected to the dashboard
      `

      const result = parser.validateGherkinSyntax(validGherkin)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    test('should detect invalid Gherkin syntax', () => {
      const invalidGherkin = `
Feature: User Authentication
  Scenario: Successful login
    Invalid step without keyword
      `

      const result = parser.validateGherkinSyntax(invalidGherkin)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('handleEdgeCases', () => {
    test('should handle ambiguous requirements', () => {
      const ambiguousContent = `
        Some vague requirement that might be unclear
      `

      const result = parser.parseRequirements(ambiguousContent)
      expect(result).toBeDefined()
      // Should either parse successfully or return empty array
      expect(Array.isArray(result)).toBe(true)
    })

    test('should handle duplicate requirements', () => {
      const duplicateContent = `
        As a user, I want to log in.
        As a user, I want to log in.
      `

      const result = parser.parseRequirements(duplicateContent)
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('parsePrdToGherkin', () => {
    test('should parse complete PRD to Gherkin features', () => {
      const prdContent = `
        User Authentication System
        
        As a user, I want to log in to the system so that I can access my account.
        
        Acceptance Criteria:
        - User can enter username and password
        - System validates credentials
        - User is redirected to dashboard on success
      `

      const result = parser.parsePrdToGherkin(prdContent)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('features')
      expect(Array.isArray(result.features)).toBe(true)
      expect(result.features.length).toBeGreaterThan(0)

      const feature = result.features[0]
      expect(feature).toHaveProperty('content')
      expect(feature.content).toContain('Feature:')
      expect(feature.content).toContain('Scenario:')
      expect(feature.content).toContain('Given')
      expect(feature.content).toContain('When')
      expect(feature.content).toContain('Then')
    })

    test('should handle integration workflow', () => {
      const prdContent = `
        Multi-Feature System
        
        As a user, I want to register an account.
        As a user, I want to log in.
        As an admin, I want to manage users.
      `

      const result = parser.parsePrdToGherkin(prdContent)

      expect(result.features.length).toBeGreaterThanOrEqual(2)

      // Each feature should be valid Gherkin
      result.features.forEach(feature => {
        const validation = parser.validateGherkinSyntax(feature.content)
        expect(validation.isValid).toBe(true)
      })
    })
  })
})
