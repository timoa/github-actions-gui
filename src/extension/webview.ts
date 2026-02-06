import * as vscode from 'vscode';
import * as path from 'node:path';

export class WorkflowEditorProvider {
  public static readonly viewType = 'workflowEditor';

  private static _instance: WorkflowEditorProvider | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, fileToLoad?: vscode.Uri): WorkflowEditorProvider {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it and load the file if provided
    if (WorkflowEditorProvider._instance) {
      WorkflowEditorProvider._instance._panel.reveal(column);
      if (fileToLoad) {
        WorkflowEditorProvider._instance.loadFile(fileToLoad);
      }
      return WorkflowEditorProvider._instance;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      WorkflowEditorProvider.viewType,
      'Workflow Editor',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
        retainContextWhenHidden: true,
      }
    );

    const instance = new WorkflowEditorProvider(panel, extensionUri);
    if (fileToLoad) {
      instance._pendingFile = fileToLoad;
    }
    WorkflowEditorProvider._instance = instance;
    return instance;
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set context key for keybinding (Ctrl+S when workflow editor is focused)
    const updateFocusContext = () => {
      vscode.commands.executeCommand('setContext', 'workflowEditorFocus', this._panel.active);
    };
    updateFocusContext();
    this._panel.onDidChangeViewState(updateFocusContext, null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'openFile':
            await this._handleOpenFile();
            return;
          case 'saveFile':
            await this._handleSaveFile(message.content, message.filename);
            return;
          case 'getTheme':
            this._sendTheme();
            return;
          case 'ready':
            // Webview is ready
            this._isWebviewReady = true;
            // Send initial theme
            this._sendTheme();
            // If there's a file to load, load it
            if (this._pendingFile) {
              const uri = this._pendingFile;
              this._pendingFile = undefined;
              await this.loadFile(uri);
            }
            return;
        }
      },
      null,
      this._disposables
    );

    // Listen for theme changes
    vscode.window.onDidChangeActiveColorTheme(() => {
      this._sendTheme();
    }, null, this._disposables);
  }

  private _pendingFile: vscode.Uri | undefined;
  private _isWebviewReady: boolean = false;
  /** When set, Save writes directly to this file instead of showing Save As dialog. */
  private _currentFileUri: vscode.Uri | undefined;

  public static getInstance(): WorkflowEditorProvider | undefined {
    return WorkflowEditorProvider._instance;
  }

  public requestSave(): void {
    this._panel.webview.postMessage({ command: 'saveRequest' });
  }

  public async loadFile(uri: vscode.Uri) {
    this._currentFileUri = uri;
    try {
      const document = await vscode.workspace.openTextDocument(uri);
      const content = document.getText();
      const filename = path.basename(uri.fsPath);

      // If webview is ready, send immediately; otherwise store as pending
      if (this._isWebviewReady) {
        this._panel.webview.postMessage({
          command: 'loadFile',
          content,
          filename,
        });
      } else {
        // Store as pending - will be loaded when webview sends 'ready'
        this._pendingFile = uri;
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to load file: ${error}`);
    }
  }

  private async _handleOpenFile() {
    const fileUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        'YAML Files': ['yml', 'yaml'],
      },
    });

    if (fileUri && fileUri[0]) {
      await this.loadFile(fileUri[0]);
    }
  }

  private async _handleSaveFile(content: string, suggestedFilename?: string) {
    const fileUri = this._currentFileUri ?? (await vscode.window.showSaveDialog({
      defaultUri: suggestedFilename
        ? vscode.Uri.joinPath(
            vscode.workspace.workspaceFolders?.[0]?.uri || vscode.Uri.file(''),
            suggestedFilename
          )
        : vscode.Uri.joinPath(
            vscode.workspace.workspaceFolders?.[0]?.uri || vscode.Uri.file(''),
            'workflow.yml'
          ),
      filters: {
        'YAML Files': ['yml', 'yaml'],
      },
    })) ?? undefined;

    if (fileUri) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        await vscode.workspace.fs.writeFile(fileUri, data);
        if (!this._currentFileUri) {
          this._currentFileUri = fileUri;
        }
        vscode.window.showInformationMessage(`Workflow saved to ${path.basename(fileUri.fsPath)}`);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to save file: ${error}`);
      }
    }
  }

  private _sendTheme() {
    const theme = vscode.window.activeColorTheme.kind;
    const themeName = theme === vscode.ColorThemeKind.Dark ? 'dark' : 
                     theme === vscode.ColorThemeKind.Light ? 'light' : 
                     'dark'; // Default to dark for high contrast

    this._panel.webview.postMessage({
      command: 'themeChanged',
      theme: themeName,
    });
  }

  private _update() {
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
    );

    // Get the local path to css styles, then convert it to a uri we can use in the webview.
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css')
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet">
				<title>Workflow Editor</title>
			</head>
			<body>
				<div id="root"></div>
				<script nonce="${nonce}">
					try {
						const vscode = acquireVsCodeApi();
						window.vscode = vscode;
					} catch (error) {
						console.error('Failed to acquire VSCode API:', error);
					}
				</script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }

  public dispose() {
    vscode.commands.executeCommand('setContext', 'workflowEditorFocus', false);
    WorkflowEditorProvider._instance = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
