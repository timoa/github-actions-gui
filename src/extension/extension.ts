import * as vscode from 'vscode';
import { WorkflowEditorProvider } from './webview';

export function activate(context: vscode.ExtensionContext) {
  // Register command to open workflow editor
  const openCommand = vscode.commands.registerCommand('workflow-visual-editor.open', () => {
    WorkflowEditorProvider.createOrShow(context.extensionUri);
  });

  // Register command to open file picker and load workflow
  const openFileCommand = vscode.commands.registerCommand('workflow-visual-editor.openFile', async () => {
    const fileUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        'YAML Files': ['yml', 'yaml'],
      },
    });

    if (fileUri && fileUri[0]) {
      const provider = WorkflowEditorProvider.createOrShow(context.extensionUri);
      await provider.loadFile(fileUri[0]);
    }
  });

  // Register context menu command for .yml/.yaml files
  const openWithEditorCommand = vscode.commands.registerCommand(
    'workflow-visual-editor.openWithEditor',
    async (uri?: vscode.Uri) => {
      // If invoked from context menu, uri will be provided
      if (uri) {
        WorkflowEditorProvider.createOrShow(context.extensionUri, uri);
        return;
      }

      // If invoked from command palette, check active editor or show file picker
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        const document = activeEditor.document;
        if (document.languageId === 'yaml' || document.fileName.endsWith('.yml') || document.fileName.endsWith('.yaml')) {
          // Load the active editor's file
          WorkflowEditorProvider.createOrShow(context.extensionUri, document.uri);
          return;
        }
      }

      // No active YAML file, show file picker
      const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
          'YAML Files': ['yml', 'yaml'],
        },
      });

      if (fileUri && fileUri[0]) {
        const provider = WorkflowEditorProvider.createOrShow(context.extensionUri);
        await provider.loadFile(fileUri[0]);
      }
    }
  );

  // Register save command (triggered by Ctrl+S when workflow editor is focused)
  const saveCommand = vscode.commands.registerCommand('workflow-visual-editor.save', () => {
    const provider = WorkflowEditorProvider.getInstance();
    if (provider) {
      provider.requestSave();
    }
  });

  // Register undo command (triggered by Ctrl+Z when workflow editor is focused)
  const undoCommand = vscode.commands.registerCommand('workflow-visual-editor.undo', () => {
    const provider = WorkflowEditorProvider.getInstance();
    if (provider) {
      provider.requestUndo();
    }
  });

  context.subscriptions.push(openCommand, openFileCommand, openWithEditorCommand, saveCommand, undoCommand);

  // If a .yml/.yaml file is already open, offer to open it in the editor
  if (vscode.window.activeTextEditor) {
    const document = vscode.window.activeTextEditor.document;
    if (document.languageId === 'yaml' || document.fileName.endsWith('.yml') || document.fileName.endsWith('.yaml')) {
      // Optionally auto-open or show notification
    }
  }
}

export function deactivate() {}
