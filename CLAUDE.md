This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

# THE RULES, ALWAYS FOLLOW THESE.

## Rule 0: General Rules

Your thinking should be thorough but avoid unnecessary repetition and verbosity. You should be concise, but thorough.

Your training date is in the past so your knowledge on some things is out of date.

## Rule 1: Centralized Event Logging for Easy Debugging

- **Single Log File**: All components (FE, BE, services) write to `dev.log`
- **Structured Format**: `[TIMESTAMP] [COMPONENT] [LEVEL] MESSAGE`
- **State Events**: Log startup, shutdown, config changes, errors, key operations
- **Example**: `[2025-07-12T10:30:15] [API] [INFO] Server started on port 3000`
- **File Location**: Place `dev.log` in project root for easy Claude access

## Rule 2: Command Documentation

- Keep `commands.md` with frequently used commands:
  - Build/test/deploy commands
  - Environment setup
  - Debugging procedures

## Development Commands

```bash
make dev          # Development (starts both frontend and backend.  This autoreloads and auto compiles.  Don't ever stop the server)
make build        # Production build (we rarely need this)
make check        # Linting and type checking (for backend and frontend)
make format       # Code formatting (for backend and frontend)
make clean        # Clean build artifacts (we rarely need this)
make tail-log     # Reads the current log file (last 100 lines of code)
```

**IMPORTANT:**

- The server and the frontend log everything into the dev.log file.
- Use the `make tail-log` command to read the log file.
- Never stop the server! It keeps running. It auto compiles and auto reloads. It does log to `dev.log`
- If you fail to run the Makefile, you have to remember that you have to run it from the top-level directory.

# Project Details

## Summary

<to be filled>

## Architecture

<to be filled>

## Key Features

<to be filled>
