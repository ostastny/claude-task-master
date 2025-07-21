#!/bin/bash

################################################################################################
# CLAUDE-CODE HEADLESS AUTOPILOT • PRD → PRODUCTION CODE • v2025-07-16
################################################################################################
#
# 🚀 MISSION
# Automated development workflow using headless Claude Code with proper progress reporting
# and error handling. Each step is a single headless Claude invocation.
#
################################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Check for flags
DEBUG_MODE=false
SKIP_SETUP=false

for arg in "$@"; do
    case $arg in
        --debug|-d)
            DEBUG_MODE=true
            echo "🐛 Debug mode enabled"
            ;;
        --skip-setup|-s)
            SKIP_SETUP=true
            echo "⏭️  Setup skip mode enabled - jumping to implementation loop"
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Progress tracking
TOTAL_STEPS=11
CURRENT_STEP=0

# Function to log progress
log_step() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    echo -e "${BLUE}[${CURRENT_STEP}/${TOTAL_STEPS}] $1${NC}"
}

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to log error
log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to log debug messages (only when debug mode is enabled)
log_debug() {
    if [[ "$DEBUG_MODE" == "true" ]]; then
        echo -e "${YELLOW}🐛 Debug: $1${NC}"
    fi
}

# Function to extract JSON from Claude Code response
extract_json_from_response() {
    local response="$1"
    
    # First try to extract from markdown code blocks in the result field
    local json_from_markdown=$(echo "$response" | sed -n '/```json/,/```/p' | sed '1d;$d' | head -1)
    
    if [[ -n "$json_from_markdown" && "$json_from_markdown" == *"{"* ]]; then
        echo "$json_from_markdown"
        return
    fi
    
    # Fallback: try to extract the result field and unescape it
    local result_field=$(echo "$response" | sed -n 's/.*"result":"\(.*\)","session_id".*/\1/p')
    local unescaped_result=$(echo "$result_field" | sed 's/\\"/"/g' | sed 's/\\n/\n/g')
    
    # Handle markdown code blocks in the unescaped result
    if [[ "$unescaped_result" == *'```json'* ]]; then
        echo "$unescaped_result" | sed -n '/```json/,/```/p' | sed '1d;$d'
    else
        echo "$unescaped_result"
    fi
}

# Function to debug and fix failing tests
debug_and_fix_tests() {
    local task_id="$1"
    local context="$2"
    
    DEBUG_PROMPT="Debug and fix failing tests $context for task $task_id:
1. Run the tests and analyze the specific failure messages
2. Identify exactly what's wrong with the current implementation
3. Make targeted fixes to address the test failures
4. Run tests again to verify fixes
5. Return 'TESTS_NOW_PASSING' if fixed, 'STILL_FAILING' if not, with specific error details"
    
    DEBUG_RESULT=$(run_claude "$DEBUG_PROMPT" "Edit Write Bash Read" "false")
    echo "$DEBUG_RESULT"
}

# Function to run headless Claude with error handling
run_claude() {
    local prompt="$1"
    local allowed_tools="$2"
    local expect_json="$3"
    
    echo "  → Running Claude with prompt: ${prompt:0:60}..."
    
    if [[ "$expect_json" == "true" ]]; then
        if [[ -n "$allowed_tools" ]]; then
            claude -p "$prompt" --output-format json --allowedTools "$allowed_tools" --dangerously-skip-permissions
        else
            claude -p "$prompt" --output-format json --dangerously-skip-permissions
        fi
    else
        if [[ -n "$allowed_tools" ]]; then
            claude -p "$prompt" --allowedTools "$allowed_tools" --dangerously-skip-permissions
        else
            claude -p "$prompt" --dangerously-skip-permissions
        fi
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

################################################################################################
# MAIN EXECUTION
################################################################################################

echo "🚀 Starting Claude Code Headless Autopilot..."
echo "Working directory: $(pwd)"
echo "Timestamp: $(date)"
if [[ "$DEBUG_MODE" == "false" ]]; then
    echo "💡 Use --debug or -d flag to see detailed debug output"
fi
if [[ "$SKIP_SETUP" == "false" ]]; then
    echo "💡 Use --skip-setup or -s flag to skip validation and setup steps"
fi
echo

if [[ "$SKIP_SETUP" == "true" ]]; then
    echo "⏭️  Skipping setup steps and jumping to implementation loop..."
    # Adjust step counter to start at step 4
    CURRENT_STEP=3
else
    # 0. SELF-CHECKS (fail fast)
    log_step "Self-checks and prerequisites"

    # Check if claude command exists
    if ! command_exists claude; then
        log_error "Claude Code CLI not found. Please install it first."
        exit 1
    fi

    # Check if git repo
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        log_error "Not a git repository. Please run in a git repository."
        exit 1
    fi

    # Check MCP connectivity with headless Claude
    MCP_CHECK=$(run_claude "Check if Task Master MCP tools are available by running mcp__taskmaster-ai__get_tasks with projectRoot='$(pwd)'. Return 'MCP_OK' if successful, 'MCP_FAIL' if not." "mcp__taskmaster-ai__get_tasks" "false" || echo "MCP_FAIL")

    if [[ "$MCP_CHECK" == *"MCP_FAIL"* ]]; then
        log_error "Task Master MCP tools not available. Check your .mcp.json configuration."
        exit 1
    fi

    # Check working tree status
    if [[ -n "$(git status --porcelain)" ]]; then
        log_warning "Working tree is not clean. Continuing anyway..."
    fi

    log_success "Self-checks completed"

    # 1. BACKLOG CREATION (idempotent)
    log_step "Backlog creation and initialization"

    BACKLOG_PROMPT="Initialize Task Master project if needed and create backlog:
1. Check if .taskmaster directory exists
2. If not, run mcp__taskmaster-ai__initialize_project with projectRoot='$(pwd)', rules=['cursor','claude'], yes=true, storeTasksInGit=true
3. Check if .taskmaster/tasks/tasks.json exists and has tasks data
4. If tasks.json exists with data:
   - Get task count using mcp__taskmaster-ai__get_tasks with projectRoot='$(pwd)'
   - Return: {\"status\": \"skipped\", \"reason\": \"tasks_exist\", \"task_count\": N}
5. If no tasks exist:
   - Check if .taskmaster/docs/prd.txt exists
   - If not, create directory and copy PRD.md to .taskmaster/docs/prd.txt using bash
   - Parse PRD using mcp__taskmaster-ai__parse_prd with projectRoot='$(pwd)'
   - Generate task files using mcp__taskmaster-ai__generate with projectRoot='$(pwd)'
   - Get final task count using mcp__taskmaster-ai__get_tasks with projectRoot='$(pwd)'
- Return: {\"status\": \"success\", \"task_count\": N}
Handle errors gracefully and return appropriate status."

    BACKLOG_RESULT=$(run_claude "$BACKLOG_PROMPT" "mcp__taskmaster-ai__initialize_project mcp__taskmaster-ai__parse_prd mcp__taskmaster-ai__generate mcp__taskmaster-ai__get_tasks Bash" "true")

    log_debug "Backlog result: $BACKLOG_RESULT"

    # Extract task count from Claude Code response
    JSON_CONTENT=$(extract_json_from_response "$BACKLOG_RESULT")
    TASK_COUNT=$(echo "$JSON_CONTENT" | grep -o '"task_count": [0-9]*' | grep -o '[0-9]*' | head -1)
    TASK_COUNT=${TASK_COUNT:-0}

    log_debug "Extracted task count: $TASK_COUNT"
    log_debug "JSON content: $JSON_CONTENT"

    if [[ "$JSON_CONTENT" == *"tasks_exist"* ]] || [[ "$JSON_CONTENT" == *"skipped"* ]]; then
        log_warning "Backlog creation skipped - tasks already exist ($TASK_COUNT tasks)"
    elif [[ "$JSON_CONTENT" == *"success"* ]]; then
        log_success "Backlog created with $TASK_COUNT tasks"
    else
        log_error "Failed to create backlog"
        log_error "Full response: $BACKLOG_RESULT"
        log_error "JSON content: $JSON_CONTENT"
        exit 1
    fi

    # 2. PROJECT MEMORY (CLAUDE.md)
    log_step "Project memory management"

    MEMORY_PROMPT="Manage project memory in CLAUDE.md:
1. Calculate SHA256 hash of .taskmaster/docs/prd.txt
2. Read current CLAUDE.md content
3. If hash is not found in CLAUDE.md, append: '\\n## PRD-Hash: [hash] (reset [date])\\n'
4. Return the hash for tracking"

    HASH_RESULT=$(run_claude "$MEMORY_PROMPT" "Bash Read Edit" "false")
    log_success "Project memory updated"

    # 3. TASK COMPLEXITY ANALYSIS
    if [[ "$JSON_CONTENT" == *"tasks_exist"* ]] || [[ "$JSON_CONTENT" == *"skipped"* ]]; then
        log_step "Task complexity analysis (skipped - tasks already exist)"
        log_success "Complexity analysis skipped - using existing tasks"
    else
        log_step "Task complexity analysis"
        
        COMPLEXITY_PROMPT="Analyze task complexity and expand complex tasks:
1. Run mcp__taskmaster-ai__analyze_project_complexity with projectRoot='$(pwd)', research=true
2. Get all tasks with mcp__taskmaster-ai__get_tasks
3. For any task with complexity > 6, expand it using mcp__taskmaster-ai__expand_task with research=true
4. Return summary of expansions performed"
        
        COMPLEXITY_RESULT=$(run_claude "$COMPLEXITY_PROMPT" "mcp__taskmaster-ai__analyze_project_complexity mcp__taskmaster-ai__get_tasks mcp__taskmaster-ai__expand_task" "false")
        log_success "Complexity analysis completed"
    fi

fi  # End of SKIP_SETUP conditional

# 4. MAIN IMPLEMENTATION LOOP
log_step "Starting main implementation loop"

LOOP_ITERATION=0
MAX_ITERATIONS=50  # Safety limit

while true; do
    LOOP_ITERATION=$((LOOP_ITERATION + 1))
    
    if [[ $LOOP_ITERATION -gt $MAX_ITERATIONS ]]; then
        log_error "Maximum iterations reached. Breaking loop."
        break
    fi
    
    echo "  → Loop iteration $LOOP_ITERATION"
    
    # Check for pending tasks
    PENDING_CHECK=$(run_claude "Check if there are pending tasks by running mcp__taskmaster-ai__get_tasks with status='pending' and projectRoot='$(pwd)'. Return 'TASKS_REMAIN' if there are pending tasks, 'COMPLETE' if none. If tasks remain, also return the count." "mcp__taskmaster-ai__get_tasks" "false")
    
    # Check for permission errors
    if [[ "$PENDING_CHECK" == *"permission"* ]]; then
        log_error "Permission denied checking pending tasks. Check MCP configuration."
        exit 1
    fi
    
    if [[ "$PENDING_CHECK" == *"COMPLETE"* ]]; then
        log_success "No pending tasks remaining"
        break
    fi
    
    # Extract and log pending task count
    PENDING_COUNT=$(echo "$PENDING_CHECK" | grep -o '[0-9]\+' | head -1 || echo "unknown")
    echo "  → Pending tasks: $PENDING_COUNT"
    
    # Get next task
    NEXT_TASK_PROMPT="Get the next available task:
1. Run mcp__taskmaster-ai__next_task with projectRoot='$(pwd)'
2. If no task available, return 'NO_TASK'
3. If task found, return JSON: {\"task_id\": \"X\", \"title\": \"...\", \"complexity\": N}
4. If complexity > 6 AND task has no subtasks, expand it using mcp__taskmaster-ai__expand_task and return 'EXPANDED: Task X expanded due to complexity > 6'
5. If complexity > 6 BUT task already has subtasks, return the task JSON (don't expand again)"
    
    NEXT_TASK=$(run_claude "$NEXT_TASK_PROMPT" "mcp__taskmaster-ai__next_task mcp__taskmaster-ai__expand_task" "true")
    
    # Check for permission errors
    if [[ "$NEXT_TASK" == *"permission"* ]]; then
        log_error "Permission denied. Check MCP configuration and tool allowlist."
        exit 1
    fi
    
    if [[ "$NEXT_TASK" == *"NO_TASK"* ]]; then
        log_success "No more tasks available"
        break
    fi
    
    if [[ "$NEXT_TASK" == *"EXPANDED"* ]]; then
        # Extract task ID from expanded message - try multiple patterns
        EXPANDED_TASK_ID=$(echo "$NEXT_TASK" | grep -o 'Task [0-9.]*' | head -1 || echo "")
        if [[ -z "$EXPANDED_TASK_ID" ]]; then
            # Try extracting from result field
            EXPANDED_TASK_ID=$(echo "$NEXT_TASK" | grep -o '"task_id": "[^"]*"' | sed 's/"task_id": "//' | sed 's/"//' | head -1 || echo "unknown task")
        fi
        log_success "Task $EXPANDED_TASK_ID expanded due to complexity"
        continue
    fi
    
    # Extract task ID and details from Claude Code response
    log_debug "Raw response first 200 chars: ${NEXT_TASK:0:200}..."
    
    JSON_CONTENT=$(extract_json_from_response "$NEXT_TASK")
    TASK_ID=$(echo "$JSON_CONTENT" | grep -o '"task_id": "[^"]*"' | sed 's/"task_id": "//' | sed 's/"//' | head -1)
    TASK_TITLE=$(echo "$JSON_CONTENT" | grep -o '"title": "[^"]*"' | sed 's/"title": "//' | sed 's/"//' | head -1)
    TASK_COMPLEXITY=$(echo "$JSON_CONTENT" | grep -o '"complexity": [0-9]*' | sed 's/"complexity": //' | head -1)
    
    log_debug "Extracted - ID: '$TASK_ID', Title: '$TASK_TITLE', Complexity: '$TASK_COMPLEXITY'"
    
    if [[ -z "$TASK_ID" ]]; then
        log_error "Could not extract task ID from: $NEXT_TASK"
        log_error "Full response: $NEXT_TASK"
        continue
    fi
    
    echo "  → Processing task: $TASK_ID"
    echo "  → Task title: $TASK_TITLE"
    echo "  → Task complexity: $TASK_COMPLEXITY"
    
    # 4.1 IMPLEMENT TASK
    log_step "Implementing task $TASK_ID"
    
    # Step 4.1.1: Set task status and get details
    log_step "Setting task status and getting details"
    
    STATUS_PROMPT="Set task status and get details for task $TASK_ID:
1. Set task status to 'in-progress' using mcp__taskmaster-ai__set_task_status with projectRoot='$(pwd)', id='$TASK_ID', status='in-progress'
2. Get full task details using mcp__taskmaster-ai__get_task with projectRoot='$(pwd)', id='$TASK_ID'
3. Return the task title and description for implementation"
    
    STATUS_RESULT=$(run_claude "$STATUS_PROMPT" "mcp__taskmaster-ai__set_task_status mcp__taskmaster-ai__get_task" "false")
    log_success "Task status set to in-progress"
    
    # Step 4.1.2: Write failing tests
    log_step "Writing failing unit tests (TDD Red Phase)"
    
    TEST_PROMPT="Write failing unit tests for task $TASK_ID:
1. Analyze the task requirements from the previous step
2. Create comprehensive unit tests that cover all requirements
3. Ensure tests are written BEFORE any implementation code
4. Run the tests to confirm they fail (Red phase of TDD)
5. Return 'TESTS_WRITTEN_AND_FAILING' if tests are created and failing, 'TESTS_FAILED_TO_CREATE' if issues"
    
    TEST_RESULT=$(run_claude "$TEST_PROMPT" "Edit Write Bash Read" "false")
    
    if [[ "$TEST_RESULT" == *"TESTS_FAILED_TO_CREATE"* ]]; then
        log_error "Failed to create tests: $TEST_RESULT"
        continue
    fi
    
    log_success "Failing tests written successfully (Red phase complete)"
    
    # Step 4.1.3: Implement code to make tests pass
    log_step "Implementing code to make tests pass (TDD Green Phase)"
    
    IMPLEMENT_PROMPT="Implement the minimal code to make tests pass for task $TASK_ID:
1. Write the simplest implementation that makes all tests pass
2. Do NOT over-engineer - focus on making tests green
3. Run tests after each small change
4. Continue until all tests pass
5. Return 'IMPLEMENTATION_COMPLETE' when all tests pass, 'IMPLEMENTATION_STRUGGLING' if tests still failing after multiple attempts"
    
    IMPLEMENT_RESULT=$(run_claude "$IMPLEMENT_PROMPT" "Edit Write Bash Read" "false")
    
    # Step 4.1.4: Iterative test-fix cycle if needed
    IMPLEMENTATION_RETRY_COUNT=0
    MAX_IMPLEMENTATION_RETRIES=5
    
    while [[ "$IMPLEMENT_RESULT" == *"IMPLEMENTATION_STRUGGLING"* ]] && [[ $IMPLEMENTATION_RETRY_COUNT -lt $MAX_IMPLEMENTATION_RETRIES ]]; do
        IMPLEMENTATION_RETRY_COUNT=$((IMPLEMENTATION_RETRY_COUNT + 1))
        log_warning "Tests still failing (attempt $IMPLEMENTATION_RETRY_COUNT/$MAX_IMPLEMENTATION_RETRIES). Debugging and fixing..."
        
        DEBUG_RESULT=$(debug_and_fix_tests "$TASK_ID" "during implementation")
        
        if [[ "$DEBUG_RESULT" == *"TESTS_NOW_PASSING"* ]]; then
            log_success "Tests are now passing after debugging"
            IMPLEMENT_RESULT="IMPLEMENTATION_COMPLETE"
            break
        else
            log_warning "Debug attempt $IMPLEMENTATION_RETRY_COUNT failed: $DEBUG_RESULT"
        fi
    done
    
    if [[ "$IMPLEMENT_RESULT" != *"IMPLEMENTATION_COMPLETE"* ]] && [[ "$IMPLEMENT_RESULT" != *"TESTS_NOW_PASSING"* ]]; then
        log_error "Implementation failed after $IMPLEMENTATION_RETRY_COUNT attempts: $IMPLEMENT_RESULT"
        continue
    fi
    
    log_success "Implementation complete - all tests passing (Green phase complete)"
    
    # Step 4.1.5: Refactor if needed (TDD Refactor Phase)
    log_step "Code refactoring for task $TASK_ID (TDD Refactor Phase)"
    
    REFACTOR_PROMPT="Refactor the implementation for task $TASK_ID if needed:
1. Review the current implementation for code quality
2. Look for opportunities to improve readability, reduce duplication, improve structure
3. Make refactoring changes while keeping all tests passing
4. Run tests after each refactoring to ensure no regressions
5. Return 'REFACTORING_COMPLETE' when done (even if no changes were needed)"
    
    REFACTOR_RESULT=$(run_claude "$REFACTOR_PROMPT" "Edit Write Bash Read" "false")
    log_success "Refactoring complete (TDD cycle complete)"
    
    if [[ "$IMPLEMENT_RESULT" == *"FAILED"* ]]; then
        log_error "Task implementation failed: $IMPLEMENT_RESULT"
        continue
    fi
    
    # 4.2 QUALITY CHECKS
    log_step "Quality checks for task $TASK_ID"
    
    QUALITY_PROMPT="Perform quality checks:
1. Run tests with coverage: 'npm test' or 'pytest' 
2. Check coverage is >= 90% with 'npx nyc npm test && nyc report --check-coverage --lines 90'
3. Run complexity analysis on JS files:
   - Remove old report: 'rm -rf report'
   - Get tracked JS files: 'git ls-files \"*.js\"'
   - If JS files exist, run: 'es6-plato -r -d report [js_files]'
   - Extract max complexity: 'node -e \"console.log(Math.max(...require('./report/report.json').map(f => f.complexity.aggregate.cyclomatic)))\"'
   - If complexity > 20, return 'COMPLEXITY_HIGH' with the value
   - If complexity <= 20, continue
4. Return 'QUALITY_OK' if all checks pass, 'QUALITY_FAIL' with details if not"
    
    QUALITY_RESULT=$(run_claude "$QUALITY_PROMPT" "Bash" "false")
    
    # If quality checks fail, try to improve the code
    QUALITY_RETRY_COUNT=0
    MAX_QUALITY_RETRIES=3
    
    while [[ "$QUALITY_RESULT" == *"QUALITY_FAIL"* ]] && [[ $QUALITY_RETRY_COUNT -lt $MAX_QUALITY_RETRIES ]]; do
        QUALITY_RETRY_COUNT=$((QUALITY_RETRY_COUNT + 1))
        log_warning "Quality check failed (attempt $QUALITY_RETRY_COUNT/$MAX_QUALITY_RETRIES). Attempting to improve code..."
        
        # Extract the specific failure reason from Claude Code response
        log_debug "Quality result: $QUALITY_RESULT"
        
        JSON_CONTENT=$(extract_json_from_response "$QUALITY_RESULT")
        FAILURE_REASON=$(echo "$JSON_CONTENT" | sed -n 's/.*QUALITY_FAIL.*- \(.*\)/\1/p')
        
        # If no specific reason found, use the whole response but clean it up
        if [[ -z "$FAILURE_REASON" ]]; then
            FAILURE_REASON=$(echo "$QUALITY_RESULT" | grep -o 'QUALITY_FAIL[^"]*' | head -1)
            if [[ -z "$FAILURE_REASON" ]]; then
                FAILURE_REASON="Quality check failed - see debug output for details"
            fi
        fi
        
        echo "  → Quality issue: $FAILURE_REASON"
        
        # Attempt to fix the quality issues
        QUALITY_FIX_PROMPT="Fix the quality issues for task $TASK_ID:
Issue: $FAILURE_REASON

Steps to fix:
1. Analyze the current code and test files
2. If coverage is low, add more comprehensive tests to reach 90% coverage
3. If complexity is high, refactor code to reduce complexity below 20
4. If linting issues, fix code style and formatting problems
5. Run the quality checks again to verify fixes
6. Return 'QUALITY_IMPROVED' if fixes were successful, 'QUALITY_STILL_FAILING' if not"
        
        QUALITY_FIX_RESULT=$(run_claude "$QUALITY_FIX_PROMPT" "Edit Write Bash Read" "false")
        
        if [[ "$QUALITY_FIX_RESULT" == *"QUALITY_IMPROVED"* ]]; then
            log_success "Code quality improved. Re-running tests to ensure they still pass..."
            
            # Step 4.1.4 Redux: Re-run tests after quality improvements
            TEST_RERUN_PROMPT="Re-run tests after quality improvements for task $TASK_ID:
1. Run the full test suite to ensure all tests still pass
2. If tests fail due to quality improvements (e.g., new test coverage), debug and fix
3. Continue until all tests pass again
4. Return 'TESTS_PASSING' if all tests pass, 'TESTS_FAILING' if issues remain"
            
            TEST_RERUN_RESULT=$(run_claude "$TEST_RERUN_PROMPT" "Edit Write Bash Read" "false")
            
            if [[ "$TEST_RERUN_RESULT" == *"TESTS_FAILING"* ]]; then
                log_warning "Tests are failing after quality improvements. Attempting to fix..."
                
                DEBUG_RESULT=$(debug_and_fix_tests "$TASK_ID" "after quality improvements")
                
                if [[ "$DEBUG_RESULT" != *"TESTS_NOW_PASSING"* ]]; then
                    log_error "Tests still failing after quality improvement and debug attempt"
                    break
                fi
            fi
            
            log_success "Tests confirmed passing after quality improvements. Re-running quality checks..."
            
            # Re-run quality checks
            QUALITY_RESULT=$(run_claude "$QUALITY_PROMPT" "Bash" "false")
        else
            log_warning "Quality improvement attempt failed: $QUALITY_FIX_RESULT"
            break
        fi
    done
    
    # Final quality check result
    if [[ "$QUALITY_RESULT" == *"QUALITY_FAIL"* ]]; then
        log_error "Quality checks failed after $QUALITY_RETRY_COUNT improvement attempts"
        log_error "Final quality result: $QUALITY_RESULT"
        continue
    fi
    
    # 4.3 STATIC ANALYSIS
    log_step "Static analysis for task $TASK_ID"
    
    LINTING_PROMPT="Run static analysis and linting:
1. Run GitHub Super-Linter: 'docker run --rm -e RUN_LOCAL=true -v \"\$(pwd)\":/tmp/lint github/super-linter:slim-v5'
2. Fix any critical issues found
3. Return 'LINT_OK' if clean, 'LINT_ISSUES' with details if problems remain"
    
    LINTING_RESULT=$(run_claude "$LINTING_PROMPT" "Bash Edit" "false")
    
    if [[ "$LINTING_RESULT" == *"LINT_ISSUES"* ]]; then
        log_warning "Linting issues found: $LINTING_RESULT"
        # Continue anyway for now
    fi
    
    # 4.4 COMMIT CHANGES
    log_step "Committing changes for task $TASK_ID"
    
    COMMIT_PROMPT="Commit the changes:
1. Stage all changes: 'git add -A'
2. Commit with message: 'feat: $TASK_ID - task completed'
3. Review the diff and ensure quality
4. Return 'COMMITTED' on success"
    
    COMMIT_RESULT=$(run_claude "$COMMIT_PROMPT" "Bash" "false")
    
    # 4.5 UPDATE TASK STATUS AND MEMORY
    log_step "Finalizing task $TASK_ID"
    
    FINALIZE_PROMPT="Finalize task completion for $TASK_ID:
1. Update CLAUDE.md with task completion notes
2. Set task status to 'done' using mcp__taskmaster-ai__set_task_status with projectRoot='$(pwd)', id='$TASK_ID', status='done'
3. If this is a subtask (contains dot like '109.2'), check if all sibling subtasks are now done:
   - Get parent task details using mcp__taskmaster-ai__get_task to see all subtasks
   - If all subtasks are done, also mark parent task as done
4. Return 'FINALIZED' on success"
    
    FINALIZE_RESULT=$(run_claude "$FINALIZE_PROMPT" "mcp__taskmaster-ai__set_task_status mcp__taskmaster-ai__get_task Edit" "false")
    
    log_success "Task $TASK_ID completed successfully"
    
    # Brief pause between iterations
    sleep 1
done

# 5. FINAL VALIDATION
log_step "Final validation and cleanup"

FINAL_PROMPT="Perform final validation:
1. Run comprehensive tests: 'npm test --silent'
2. Check final coverage: 'npx nyc report --check-coverage --lines 90'
3. Run final linting: 'docker run --rm -e RUN_LOCAL=true -v \"\$(pwd)\":/tmp/lint github/super-linter:slim-v5'
4. Run final complexity analysis using mcp__taskmaster-ai__analyze_project_complexity
5. Return summary of final state"

FINAL_RESULT=$(run_claude "$FINAL_PROMPT" "Bash mcp__taskmaster-ai__analyze_project_complexity" "false")

log_success "Final validation completed"

# COMPLETION SUMMARY
echo
echo "================================================================================================"
echo "🎉 AUTOPILOT MISSION COMPLETE"
echo "================================================================================================"
echo "Total iterations: $LOOP_ITERATION"
echo "Completion time: $(date)"
echo
echo "Final status:"
echo "$FINAL_RESULT"
echo
echo "All tasks completed successfully!"
echo "Repository is ready for review and merge."
echo "================================================================================================"