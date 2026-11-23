import * as vscode from 'vscode';
import { CourseExplorerProvider } from './courseExplorer';
import { ServerStatusProvider } from './serverStatus';
import { ServerManager } from './serverManager';
import { WebviewManager } from './webviewManager';

let serverManager: ServerManager;
let webviewManager: WebviewManager;
let serverStatusProvider: ServerStatusProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log('Network Course Platform extension activated');

  // Initialize managers
  serverManager = new ServerManager(context);
  webviewManager = new WebviewManager(context, serverManager);
  serverStatusProvider = new ServerStatusProvider(serverManager);

  // Register tree views
  const courseExplorerProvider = new CourseExplorerProvider(webviewManager);
  vscode.window.registerTreeDataProvider('networkCourse.explorer', courseExplorerProvider);
  vscode.window.registerTreeDataProvider('networkCourse.servers', serverStatusProvider);

  // Register commands
  const commands = [
    vscode.commands.registerCommand('networkCourse.openDashboard', () => {
      webviewManager.openDashboard();
    }),
    vscode.commands.registerCommand('networkCourse.openLessons', () => {
      webviewManager.openLessons();
    }),
    vscode.commands.registerCommand('networkCourse.openTopology', () => {
      webviewManager.openTopology();
    }),
    vscode.commands.registerCommand('networkCourse.openIperf3', () => {
      webviewManager.openIperf3();
    }),
    vscode.commands.registerCommand('networkCourse.openTcpdump', () => {
      webviewManager.openTcpdump();
    }),
    vscode.commands.registerCommand('networkCourse.openScapy', () => {
      webviewManager.openScapy();
    }),
    vscode.commands.registerCommand('networkCourse.openTraceroute', () => {
      webviewManager.openTraceroute();
    }),
    vscode.commands.registerCommand('networkCourse.openPracticals', () => {
      webviewManager.openPracticals();
    }),
    vscode.commands.registerCommand('networkCourse.openAssessment', () => {
      webviewManager.openAssessment();
    }),
    vscode.commands.registerCommand('networkCourse.startServers', async () => {
      await serverManager.startAll();
      serverStatusProvider.refresh();
    }),
    vscode.commands.registerCommand('networkCourse.stopServers', async () => {
      await serverManager.stopAll();
      serverStatusProvider.refresh();
    }),
    vscode.commands.registerCommand('networkCourse.showStatus', () => {
      serverManager.showStatus();
    })
  ];

  commands.forEach(cmd => context.subscriptions.push(cmd));

  // Auto-start if configured
  const config = vscode.workspace.getConfiguration('networkCourse');
  if (config.get<boolean>('autoStart', false)) {
    serverManager.startAll().then(() => serverStatusProvider.refresh());
  }

  // Status bar item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(server) Network Course';
  statusBarItem.tooltip = 'Click to open Network Course Dashboard';
  statusBarItem.command = 'networkCourse.openDashboard';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Refresh server status periodically
  const statusInterval = setInterval(() => {
    serverStatusProvider.refresh();
  }, 30000);
  context.subscriptions.push({ dispose: () => clearInterval(statusInterval) });

  // Welcome message on first activation
  const hasShownWelcome = context.globalState.get<boolean>('networkCourse.welcomeShown', false);
  if (!hasShownWelcome) {
    vscode.window.showInformationMessage(
      'Network Course Platform is ready! Click the network icon in the Activity Bar or press Ctrl+Alt+N to open the dashboard.',
      'Open Dashboard'
    ).then(selection => {
      if (selection === 'Open Dashboard') {
        webviewManager.openDashboard();
      }
    });
    context.globalState.update('networkCourse.welcomeShown', true);
  }
}

export function deactivate() {
  console.log('Network Course Platform extension deactivated');
  serverManager?.stopAll();
}