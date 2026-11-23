import * as vscode from 'vscode';
import { ServerManager } from './serverManager';

interface StatusItem extends vscode.TreeItem {
  children?: StatusItem[];
}

export class ServerStatusProvider implements vscode.TreeDataProvider<StatusItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<StatusItem | undefined | null | void> = new vscode.EventEmitter<StatusItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<StatusItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private serverManager: ServerManager;

  constructor(serverManager: ServerManager) {
    this.serverManager = serverManager;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: StatusItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: StatusItem): Thenable<StatusItem[]> {
    if (!element) {
      return Promise.resolve(this.getStatusItems());
    }
    return Promise.resolve(element.children || []);
  }

  private getStatusItems(): StatusItem[] {
    const pythonRunning = this.serverManager.isPythonRunning();
    const nextjsRunning = this.serverManager.isNextjsRunning();
    const pythonUrl = this.serverManager.getPythonUrl();
    const nextjsUrl = this.serverManager.getNextjsUrl();

    return [
      {
        label: 'Python iPerf3 Dashboard',
        description: pythonRunning ? `Running on ${pythonUrl}` : 'Stopped',
        iconPath: pythonRunning 
          ? new vscode.ThemeIcon('server', new vscode.ThemeColor('testing.iconPassed'))
          : new vscode.ThemeIcon('server', new vscode.ThemeColor('testing.iconFailed')),
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        command: pythonRunning ? {
          command: 'vscode.open',
          title: 'Open iPerf3 Dashboard',
          arguments: [vscode.Uri.parse(pythonUrl)]
        } : undefined,
        contextValue: pythonRunning ? 'running' : 'stopped'
      },
      {
        label: 'Next.js Frontend',
        description: nextjsRunning ? `Running on ${nextjsUrl}` : 'Stopped',
        iconPath: nextjsRunning
          ? new vscode.ThemeIcon('globe', new vscode.ThemeColor('testing.iconPassed'))
          : new vscode.ThemeIcon('globe', new vscode.ThemeColor('testing.iconFailed')),
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        command: nextjsRunning ? {
          command: 'vscode.open',
          title: 'Open Next.js App',
          arguments: [vscode.Uri.parse(nextjsUrl)]
        } : undefined,
        contextValue: nextjsRunning ? 'running' : 'stopped'
      },
      {
        label: 'Actions',
        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
        children: [
          {
            label: pythonRunning ? 'Stop Python Server' : 'Start Python Server',
            iconPath: new vscode.ThemeIcon(pythonRunning ? 'stop' : 'play'),
            command: {
              command: pythonRunning ? 'networkCourse.stopServers' : 'networkCourse.startServers',
              title: pythonRunning ? 'Stop Python Server' : 'Start Python Server'
            }
          },
          {
            label: nextjsRunning ? 'Stop Next.js Server' : 'Start Next.js Server',
            iconPath: new vscode.ThemeIcon(nextjsRunning ? 'stop' : 'play'),
            command: {
              command: nextjsRunning ? 'networkCourse.stopServers' : 'networkCourse.startServers',
              title: nextjsRunning ? 'Stop Next.js Server' : 'Start Next.js Server'
            }
          },
          {
            label: 'Restart All',
            iconPath: new vscode.ThemeIcon('sync'),
            command: {
              command: 'networkCourse.startServers',
              title: 'Restart All Servers'
            }
          }
        ]
      }
    ];
  }
}