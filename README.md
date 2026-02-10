# Workflow Editor

[![VS Code Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/timoa.workflow-visual-editor)](https://marketplace.visualstudio.com/items?itemName=timoa.workflow-visual-editor)
[![Coverage Status](https://codecov.io/gh/timoa/workflow-editor/branch/main/graph/badge.svg)](https://codecov.io/gh/timoa/workflow-editor)
[![CI (Tests, Lint & Security)](https://github.com/timoa/workflow-editor/actions/workflows/pull-request.yml/badge.svg)](https://github.com/timoa/workflow-editor/actions/workflows/pull-request.yml)
[![Release](https://github.com/timoa/workflow-editor/actions/workflows/release.yml/badge.svg)](https://github.com/timoa/workflow-editor/actions/workflows/release.yml)
[![Publish](https://github.com/timoa/workflow-editor/actions/workflows/publish.yml/badge.svg)](https://github.com/timoa/workflow-editor/actions/workflows/publish.yml)
[![License](https://img.shields.io/github/license/timoa/workflow-editor)](LICENSE)

> **_WARNING:_** This extension is currently in heavy development and can have a few bugs. Please save your changes on Git before updating your Workflows

A VSCode extension providing a visual editor for GitHub Actions workflow files. Open a workflow (YAML), view jobs and steps as a diagram, edit job properties in a side panel, and save back to YAML.

![Workflow Editor screenshot](https://workflow-editor.com/images/visual-editor-hero.webp)

## Features

- **Diagram**: Jobs as nodes, edges from `needs` dependencies. Built with [React Flow](https://reactflow.dev/).
- **Trigger visualization**: Visual trigger nodes showing workflow triggers (push, pull_request, schedule, etc.) with connections to jobs.
- **Trigger editing**: Edit workflow triggers with a dedicated panel supporting all trigger types and configurations (branches, tags, paths, cron schedules, etc.).
- **Property panel**: Click a job node to edit name, runs-on, needs, matrix strategy, and steps (N8N-style).
- **Matrix strategy**: Configure matrix builds with multiple variable combinations. Visual indicator shows total matrix combinations (e.g., "6× matrix").
- **Source code preview**: View and edit workflow YAML in a large dialog. Changes apply only when saved.
- **Run script editor**: Edit step run scripts in a full-size popup dialog with a comfortable code-style editor (same font and theme as the app). Click "Edit script" next to a step’s run field to open the dialog; save with **Save changes** or **Ctrl/Cmd+S**, cancel with **Escape**.
- **Workflow validation**: Automatic validation using the official [@actions/workflow-parser](https://github.com/actions/languageservices) (same as the GitHub Actions VS Code extension). Reports schema and syntax errors with detailed messages.
- **VSCode Integration**: Open workflow files via context menu or command palette; save directly to workspace. Theme automatically follows your IDE theme (no in-editor theme toggle).
- **Simplified navbar**: Toolbar keeps Save, View source, Clear/Load sample, Add Trigger/Job, and workflow config; Open file, Paste YAML, and theme buttons were removed for a cleaner UX.
- **Validation**: Parse errors and lint errors shown in a banner when opening or editing workflows.

## Installation

### From Marketplace

1. Open VSCode (or Cursor, Windsurf, or other VSCode-based IDE)
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Workflow Visual Editor"
4. Click Install

### From VSIX

1. Download the `.vsix` file from the [latest release](https://github.com/timoa/workflow-editor/releases/latest)
2. Open VSCode
3. Go to Extensions → ... → Install from VSIX...
4. Select the downloaded `.vsix` file

**Note**: The `.vsix` file is attached to each GitHub release as an asset.

## Usage

### Open Workflow Editor

- **Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac), type "Workflow Editor: Open", and press Enter
- **Context Menu**: Right-click a `.yml` or `.yaml` file in the Explorer, select "Open with Workflow Editor"
- **Command**: `workflow-visual-editor.open` - Opens an empty editor
- **Command**: `workflow-visual-editor.openFile` - Opens file picker to load a workflow

### Keyboard Shortcuts

- **Ctrl/Cmd+Z**: Undo last change (when the Workflow Editor tab is focused)
- **Ctrl/Cmd+S**: Save workflow (when the Workflow Editor tab is focused; uses VSCode command so it works reliably)
- **Escape**: Close property panel, source dialog, or run script dialog

### File Operations

- **Open**: Use the Command Palette ("Workflow Editor: Open Workflow File") or right-click a `.yml`/`.yaml` file in the Explorer and choose "Open with Workflow Editor"
- **Save**: Click the save icon in the toolbar or press Ctrl/Cmd+S when the workflow editor is focused
- **View Source**: Click the code icon to view/edit raw YAML

## Contribute

### Prerequisites

- Node.js >= 24
- PNPM >= 10
- VSCode (for testing the extension)

### Setup

```bash
pnpm install
```

### Build

```bash
# Build extension code
pnpm run compile

# Build webview bundle
pnpm run webpack

# Or build both (for packaging)
pnpm run vscode:prepublish
```

### Development Mode

```bash
# Watch extension code
pnpm run watch

# Watch webview bundle (in another terminal)
pnpm run webpack-dev
```

### Debug

1. Open this project in VSCode
2. Press `F5` to launch Extension Development Host
3. In the Extension Development Host, use the commands to open the workflow editor
4. Set breakpoints in `src/extension/` or `src/webview/` code

### Package Extension

```bash
# Create .vsix file
pnpm run package
```

The `.vsix` file will be created in the project root.

### Test

```bash
pnpm test
pnpm lint
```

## CI (Pull request checks)

On every pull request to `main` or `master`, GitHub Actions runs:

- **Lint**: ESLint (TypeScript + React hooks and refresh)
- **Test**: Vitest
- **Build**: TypeScript compilation and webpack bundle
- **Security**: `pnpm audit --audit-level=high` (fails on high or critical vulnerabilities)

Workflow file: [.github/workflows/pull-request.yml](.github/workflows/pull-request.yml). Runs only when relevant files (e.g. `src/`, configs, `package.json`, lockfile) change.

## Security

### GitHub Actions Security with Harden Runner

All GitHub Actions workflows are secured using [step-security/harden-runner](https://github.com/step-security/harden-runner), a security agent that monitors and protects CI/CD pipelines.

**What it does:**
- Monitors network egress to detect unauthorized outbound calls
- Tracks file integrity to detect tampering
- Monitors process activity for suspicious behavior
- Auto-detects GitHub Actions cache endpoints

**Current Configuration:**
All workflows run in **audit mode**, which monitors and logs all activity without blocking. This allows us to:
1. Review which network endpoints are accessed during workflow runs
2. Identify any suspicious or unexpected network activity
3. Build a policy of allowed endpoints for future enforcement

**Workflows Protected:**
- [.github/workflows/pull-request.yml](.github/workflows/pull-request.yml) - CI checks
- [.github/workflows/release.yml](.github/workflows/release.yml) - Release automation
- [.github/workflows/publish.yml](.github/workflows/publish.yml) - Marketplace publishing

Audit results and insights are available at the [Step Security dashboard](https://app.stepsecurity.io/).

## Release & Publishing

### Automated Release

Releases are automated with [Semantic Release](https://semantic-release.gitbook.io/). On every **push to `main` or `master`**:

1. **Test** job runs: lint, unit tests (Vitest), and build.
2. **Release** job runs only if tests pass: Semantic Release analyzes commits, bumps the version, updates `package.json` and `CHANGELOG.md`, pushes a release commit, and creates a GitHub release.

Use [Conventional Commits](https://www.conventionalcommits.org/) so versions and changelog are derived from commit messages:

- `feat: ...` → minor release (e.g. 1.1.0)
- `fix: ...` → patch (e.g. 1.0.1)
- `feat!: ...` or `fix!: ...` → major (e.g. 2.0.0)
- `docs:`, `chore:`, etc. → no release (included in changelog when relevant)

Workflow: [.github/workflows/release.yml](.github/workflows/release.yml). Config: [.releaserc.cjs](.releaserc.cjs).

### Publishing to Marketplace

When a GitHub release is created by Semantic Release, the [publish workflow](.github/workflows/publish.yml) automatically:

1. Builds the extension (`pnpm run compile` + `pnpm run webpack`)
2. Packages it (`pnpm run package`)
3. Uploads the `.vsix` file to the GitHub release assets
4. Publishes to VSCode Marketplace (`pnpm run publish`)

**Note**: Commits with `chore:`, `docs:`, or other non-release types don't trigger publishing since Semantic Release doesn't create a release for them.

**Required Secret**: `VSCE_PAT` - Personal Access Token from [Azure DevOps](https://dev.azure.com/) with Marketplace publish permissions.

To get a token:
1. Go to https://dev.azure.com/
2. Create or sign in to your organization
3. Go to User Settings → Personal Access Tokens
4. Create a token with "Marketplace (Manage)" scope
5. Add it as `VSCE_PAT` secret in GitHub repository settings

## Keyboard shortcuts

- **Ctrl/Cmd+Z**: Undo last change (when Workflow Editor tab is focused)
- **Ctrl/Cmd+S**: Save workflow (when Workflow Editor tab is focused)
- **Escape**: Close property panel, source dialog, or run script dialog

## Stack

- **Extension Host**: Node.js + VSCode Extension API
- **Webview UI**: React 18 + TypeScript
- **Build**: TypeScript compiler + Webpack
- **Flow Editor**: [@xyflow/react](https://www.npmjs.com/package/@xyflow/react) (React Flow)
- **YAML**: [yaml](https://www.npmjs.com/package/yaml) for parse/serialize
- **Styling**: Tailwind CSS
- **Packaging**: [@vscode/vsce](https://www.npmjs.com/package/@vscode/vsce)

## Compatibility

- **VSCode**: Full support (minimum version 1.80.0)
- **Cursor**: Compatible (VSCode-compatible extension)
- **Windsurf**: Compatible (VSCode-compatible extension)
- **Other VSCode-based IDEs**: Should work with any IDE that supports VSCode extensions
