#!/bin/bash
# .github/scripts/enforce-sdd.sh
# Called by preToolUse hook for feature issues
# Ensures spec artifacts exist before allowing implementation code writes

TOOL=$(echo "$1" | jq -r '.tool // empty')
FILE=$(echo "$1" | jq -r '.tool_input.path // empty')
BRANCH=$(git branch --show-current)

# Only enforce for feature branches (feature-engineer agent creates these)
if [[ "$BRANCH" != feature/* ]] && [[ "$BRANCH" != copilot/feature/* ]]; then
  exit 0
fi

# Only enforce on file write operations
if [[ "$TOOL" != "str_replace_based_edit" ]] && [[ "$TOOL" != "create_file" ]]; then
  exit 0
fi

# Allow writes to specs/ directory — that's what we want the agent to do first
if [[ "$FILE" == specs/* ]]; then
  exit 0
fi

# Allow writes to test files — these can come after spec but before impl
if [[ "$FILE" == *test* ]] || [[ "$FILE" == *spec* ]]; then
  exit 0
fi

# For any other source file write, verify spec artifacts exist
FEATURE=$(echo "$BRANCH" | sed 's|copilot/feature/||' | sed 's|feature/||')
SPEC_FILE="specs/${FEATURE}/spec.md"
PLAN_FILE="specs/${FEATURE}/plan.md"
TASKS_FILE="specs/${FEATURE}/tasks.md"

if [[ ! -f "$SPEC_FILE" ]] || [[ ! -f "$PLAN_FILE" ]] || [[ ! -f "$TASKS_FILE" ]]; then
  echo "BLOCKED: Spec artifacts not found for feature '${FEATURE}'."
  echo "Required before implementation:"
  echo "  1. specs/${FEATURE}/spec.md  — $([ -f "$SPEC_FILE" ] && echo 'EXISTS' || echo 'MISSING')"
  echo "  2. specs/${FEATURE}/plan.md  — $([ -f "$PLAN_FILE" ] && echo 'EXISTS' || echo 'MISSING')"
  echo "  3. specs/${FEATURE}/tasks.md — $([ -f "$TASKS_FILE" ] && echo 'EXISTS' || echo 'MISSING')"
  echo ""
  echo "Run /speckit.specify, /speckit.plan, /speckit.tasks, /speckit.analyze"
  echo "Commit the spec artifacts, then proceed with implementation."
  # Exit 2 = deny this specific tool call
  exit 2
fi

# Spec artifacts exist — allow the write
exit 0
