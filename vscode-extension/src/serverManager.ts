import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export class ServerManager {
  private context: vscode.ExtensionContext;
  private pythonProcess: ChildProcess | null = null;
  private nextjsProcess: ChildProcess | null = null;
  private projectRoot: string;
  private pythonPort: number;
  private nextjsPort: number;
  private pythonPath: string;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.projectRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    const config = vscode.workspace.getConfiguration('networkCourse');
    this.pythonPort = config.get<number>('iperfPort', 8765);
    this.nextjsPort = config.get<number>('port', 3000);
    this.pythonPath = config.get<string>('pythonPath', 'python3');
  }

  async startAll(): Promise<void> {
    await this.startPythonServer();
    await this.startNextjsServer();
    vscode.window.showInformationMessage('Network Course servers started successfully!');
  }

  async startPythonServer(): Promise<void> {
    if (this.pythonProcess) {
      return; // Already running
    }

    const serverScript = path.join(this.projectRoot, 'server.py');
    if (!fs.existsSync(serverScript)) {
      throw new Error(`server.py not found at ${serverScript}`);
    }

    return new Promise((resolve, reject) => {
      const env = { ...process.env, IPERF_PORT: String(this.pythonPort) };
      
      this.pythonProcess = spawn(this.pythonPath, ['server.py'], {
        cwd: this.projectRoot,
        env,
        detached: false
      });

      this.pythonProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log(`[Python] ${output}`);
        if (output.includes(`port ${this.pythonPort}`) || output.includes('Ready') || output.includes('Starting')) {
          resolve();
        }
      });

      this.pythonProcess.stderr?.on('data', (data) => {
        console.error(`[Python Error] ${data}`);
      });

      this.pythonProcess.on('error', (err) => {
        console.error('Failed to start Python server:', err);
        this.pythonProcess = null;
        reject(new Error(`Failed to start Python server: ${err.message}. Make sure Python and iperf3 are installed.`));
      });

      this.pythonProcess.on('exit', (code) => {
        console.log(`Python server exited with code ${code}`);
        this.pythonProcess = null;
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pythonProcess) {
          resolve(); // Assume it started
        }
      }, 10000);
    });
  }

  async startNextjsServer(): Promise<void> {
    if (this.nextjsProcess) {
      return; // Already running
    }

    const packageJson = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packageJson)) {
      throw new Error(`package.json not found at ${packageJson}`);
    }

    return new Promise((resolve, reject) => {
      const env = { ...process.env, PORT: String(this.nextjsPort) };
      
      this.nextjsProcess = spawn('npm', ['run', 'dev'], {
        cwd: this.projectRoot,
        env,
        detached: false,
        shell: process.platform === 'win32'
      });

      this.nextjsProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log(`[Next.js] ${output}`);
        if (output.includes('Ready') || output.includes('Compiled') || output.includes('Local:')) {
          resolve();
        }
      });

      this.nextjsProcess.stderr?.on('data', (data) => {
        console.error(`[Next.js Error] ${data}`);
      });

      this.nextjsProcess.on('error', (err) => {
        console.error('Failed to start Next.js server:', err);
        this.nextjsProcess = null;
        reject(new Error(`Failed to start Next.js server: ${err.message}. Make sure Node.js and npm are installed.`));
      });

      this.nextjsProcess.on('exit', (code) => {
        console.log(`Next.js server exited with code ${code}`);
        this.nextjsProcess = null;
      });

      // Timeout after 30 seconds (Next.js takes longer to compile)
      setTimeout(() => {
        if (this.nextjsProcess) {
          resolve(); // Assume it started
        }
      }, 30000);
    });
  }

  async stopAll(): Promise<void> {
    await this.stopPythonServer();
    await this.stopNextjsServer();
    vscode.window.showInformationMessage('Network Course servers stopped.');
  }

  async stopPythonServer(): Promise<void> {
    if (this.pythonProcess) {
      this.pythonProcess.kill('SIGTERM');
      this.pythonProcess = null;
    }
  }

  async stopNextjsServer(): Promise<void> {
    if (this.nextjsProcess) {
      this.nextjsProcess.kill('SIGTERM');
      this.nextjsProcess = null;
    }
  }

  isPythonRunning(): boolean {
    return this.pythonProcess !== null;
  }

  isNextjsRunning(): boolean {
    return this.nextjsProcess !== null;
  }

  getPythonUrl(): string {
    return `http://localhost:${this.pythonPort}`;
  }

  getNextjsUrl(): string {
    return `http://localhost:${this.nextjsPort}`;
  }

  showStatus(): void {
    const pythonStatus = this.isPythonRunning() ? 'Running' : 'Stopped';
    const nextjsStatus = this.isNextjsRunning() ? 'Running' : 'Stopped';
    
    vscode.window.showInformationMessage(
      `Network Course Status:\nPython (iperf3): ${pythonStatus} on port ${this.pythonPort}\nNext.js: ${nextjsStatus} on port ${this.nextjsPort}`
    );
  }

  getProjectRoot(): string {
    return this.projectRoot;
  }
}