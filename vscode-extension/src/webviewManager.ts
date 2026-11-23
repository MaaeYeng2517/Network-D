import * as vscode from 'vscode';
import { ServerManager } from './serverManager';

interface ToolConfig {
  id: string;
  title: string;
  path: string;
  icon: string;
  description: string;
}

const TOOLS: ToolConfig[] = [
  { id: 'dashboard', title: 'Dashboard', path: '/', icon: '🏠', description: 'Course overview and quick access' },
  { id: 'lessons', title: 'Lessons', path: '/lessons', icon: '📚', description: 'Interactive lessons with fullscreen slides' },
  { id: 'topology', title: 'Topology Designer', path: '/topology', icon: '🔗', description: 'Network topology designer with devices, cables, connectors' },
  { id: 'iperf3', title: 'iPerf3', path: '/iperf', icon: '📊', description: 'Bandwidth testing with live charts' },
  { id: 'tcpdump', title: 'tcpdump', path: '/tcpdump', icon: '📦', description: 'Packet capture and analysis' },
  { id: 'scapy', title: 'Scapy', path: '/scapy', icon: '🐍', description: 'Packet crafting and injection' },
  { id: 'traceroute', title: 'Traceroute', path: '/traceroute', icon: '🛤️', description: 'Network path tracing' },
  { id: 'practicals', title: 'Practical Labs', path: '/practical', icon: '🧪', description: 'Hands-on lab exercises' },
  { id: 'assessment', title: 'Assessment', path: '/assessment', icon: '📝', description: 'Grading criteria and rubrics' },
  { id: 'admin', title: 'Admin Dashboard', path: '/admin', icon: '⚙️', description: 'Instructor admin panel' }
];

export class WebviewManager {
  private context: vscode.ExtensionContext;
  private serverManager: ServerManager;
  private webviews: Map<string, vscode.WebviewPanel> = new Map();

  constructor(context: vscode.ExtensionContext, serverManager: ServerManager) {
    this.context = context;
    this.serverManager = serverManager;
  }

  async openDashboard(): Promise<void> {
    await this.openTool('dashboard');
  }

  async openLessons(): Promise<void> {
    await this.openTool('lessons');
  }

  async openTopology(): Promise<void> {
    await this.openTool('topology');
  }

  async openIperf3(): Promise<void> {
    await this.openTool('iperf3');
  }

  async openTcpdump(): Promise<void> {
    await this.openTool('tcpdump');
  }

  async openScapy(): Promise<void> {
    await this.openTool('scapy');
  }

  async openTraceroute(): Promise<void> {
    await this.openTool('traceroute');
  }

  async openPracticals(): Promise<void> {
    await this.openTool('practicals');
  }

  async openAssessment(): Promise<void> {
    await this.openTool('assessment');
  }

  async openAdmin(): Promise<void> {
    await this.openTool('admin');
  }

  private async openTool(toolId: string): Promise<void> {
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) {
      vscode.window.showErrorMessage(`Unknown tool: ${toolId}`);
      return;
    }

    // Check if servers are running, start if needed
    if (!this.serverManager.isNextjsRunning()) {
      const shouldStart = await vscode.window.showInformationMessage(
        'Next.js server is not running. Start it now?',
        'Start Server',
        'Open Anyway'
      );
      if (shouldStart === 'Start Server') {
        await this.serverManager.startNextjsServer();
      }
    }

    if (!this.serverManager.isPythonRunning() && ['iperf3', 'tcpdump', 'scapy'].includes(toolId)) {
      const shouldStart = await vscode.window.showInformationMessage(
        'Python iPerf3 server is not running. Some features may not work. Start it now?',
        'Start Server',
        'Continue Anyway'
      );
      if (shouldStart === 'Start Server') {
        await this.serverManager.startPythonServer();
      }
    }

    const config = vscode.workspace.getConfiguration('networkCourse');
    const openInBrowser = config.get<boolean>('openBrowser', true);

    if (openInBrowser) {
      // Open in external browser
      const url = this.serverManager.getNextjsUrl() + tool.path;
      vscode.env.openExternal(vscode.Uri.parse(url));
    } else {
      // Open in VS Code webview
      this.openInWebview(tool);
    }
  }

  private openInWebview(tool: ToolConfig): void {
    // Check if already open
    const existing = this.webviews.get(tool.id);
    if (existing) {
      existing.reveal(vscode.ViewColumn.One);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      `networkCourse.${tool.id}`,
      `${tool.icon} ${tool.title}`,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(this.serverManager.getProjectRoot())
        ]
      }
    );

    const url = this.serverManager.getNextjsUrl() + tool.path;
    
    panel.webview.html = this.getWebviewHtml(url, tool.title);
    
    panel.onDidDispose(() => {
      this.webviews.delete(tool.id);
    });

    this.webviews.set(tool.id, panel);
  }

  private getWebviewHtml(url: string, title: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Network Course</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0b0f14; 
      color: #e8eef5;
      height: 100vh;
      overflow: hidden;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      background: #141c26;
      border-bottom: 1px solid #223040;
      flex-shrink: 0;
    }
    .toolbar button {
      background: #1e2a3a;
      border: 1px solid #2a3a4a;
      color: #94a3b8;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.15s;
    }
    .toolbar button:hover {
      background: #2a3a4a;
      border-color: #3ea6ff;
      color: #3ea6ff;
    }
    .toolbar .spacer { flex: 1; }
    .toolbar .title { font-weight: 600; color: #e8eef5; }
    iframe {
      width: 100%;
      height: calc(100vh - 48px);
      border: none;
      background: #0b0f14;
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #64748b;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #2a3a4a;
      border-top-color: #3ea6ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #f85149;
      text-align: center;
      padding: 24px;
    }
    .error button {
      margin-top: 16px;
      padding: 10px 20px;
      background: #3ea6ff;
      color: #04121f;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span class="title">${title}</span>
    <span class="spacer"></span>
    <button onclick="reload()">↻ Reload</button>
    <button onclick="openExternal()">🌐 Open in Browser</button>
  </div>
  <div id="content">
    <div class="loading">
      <div class="spinner"></div>
      <span>Loading ${title}...</span>
    </div>
  </div>
  <script>
    const iframe = document.createElement('iframe');
    iframe.src = '${url}';
    iframe.onload = () => {
      document.getElementById('content').innerHTML = '';
      document.getElementById('content').appendChild(iframe);
    };
    iframe.onerror = () => {
      document.getElementById('content').innerHTML = \`
        <div class="error">
          <h3>Failed to load</h3>
          <p>Could not connect to <code>${url}</code></p>
          <p>Make sure the Next.js server is running on port ${new URL('${url}').port}</p>
          <button onclick="location.reload()">Retry</button>
        </div>
      \`;
    };
    
    function reload() {
      if (iframe.contentWindow) {
        iframe.contentWindow.location.reload();
      }
    }
    
    function openExternal() {
      // This would need to communicate with the extension host
      // For now, just open in new tab
      window.open('${url}', '_blank');
    }
  </script>
</body>
</html>`;
  }

  dispose(): void {
    this.webviews.forEach(panel => panel.dispose());
    this.webviews.clear();
  }
}