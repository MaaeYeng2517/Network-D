import * as vscode from 'vscode';
import { WebviewManager } from './webviewManager';

interface CourseItem extends vscode.TreeItem {
  toolId?: string;
  children?: CourseItem[];
}

export class CourseExplorerProvider implements vscode.TreeDataProvider<CourseItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<CourseItem | undefined | null | void> = new vscode.EventEmitter<CourseItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<CourseItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private webviewManager: WebviewManager;

  constructor(webviewManager: WebviewManager) {
    this.webviewManager = webviewManager;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CourseItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: CourseItem): Thenable<CourseItem[]> {
    if (!element) {
      // Root level - main categories
      return Promise.resolve(this.getRootItems());
    }
    return Promise.resolve(element.children || []);
  }

  private getRootItems(): CourseItem[] {
    return [
      {
        label: '📚 Lessons',
        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
        contextValue: 'category',
        children: this.getLessonItems()
      },
      {
        label: '🔧 Tools',
        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
        contextValue: 'category',
        children: this.getToolItems()
      },
      {
        label: '🧪 Practical Labs',
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        contextValue: 'category',
        children: this.getPracticalItems()
      },
      {
        label: '📊 Assessment',
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        contextValue: 'category',
        children: [
          { label: '📝 Grading Criteria', toolId: 'assessment', collapsibleState: vscode.TreeItemCollapsibleState.None, command: { command: 'networkCourse.openAssessment', title: 'Open Assessment' } },
          { label: '⚙️ Admin Dashboard', toolId: 'admin', collapsibleState: vscode.TreeItemCollapsibleState.None, command: { command: 'networkCourse.openDashboard', title: 'Open Admin' } }
        ]
      },
      {
        label: '🖥️ Servers',
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        contextValue: 'category',
        children: [
          { 
            label: '▶ Start All Servers', 
            toolId: 'start', 
            collapsibleState: vscode.TreeItemCollapsibleState.None, 
            command: { command: 'networkCourse.startServers', title: 'Start Servers' },
            iconPath: new vscode.ThemeIcon('play')
          },
          { 
            label: '⏹ Stop All Servers', 
            toolId: 'stop', 
            collapsibleState: vscode.TreeItemCollapsibleState.None, 
            command: { command: 'networkCourse.stopServers', title: 'Stop Servers' },
            iconPath: new vscode.ThemeIcon('stop')
          },
          { 
            label: '📊 Server Status', 
            toolId: 'status', 
            collapsibleState: vscode.TreeItemCollapsibleState.None, 
            command: { command: 'networkCourse.showStatus', title: 'Show Status' },
            iconPath: new vscode.ThemeIcon('pulse')
          }
        ]
      }
    ];
  }

  private getLessonItems(): CourseItem[] {
    const lessons = [
      { n: 0, title: 'Pre-lesson: Network Fundamentals', titleEn: 'Pre-lesson: Network Fundamentals' },
      { n: 1, title: 'Network Architecture & Topology', titleEn: 'Network Architecture & Topology' },
      { n: 2, title: 'IP Addressing & Subnetting', titleEn: 'IP Addressing & Subnetting' },
      { n: 3, title: 'Ethernet, MAC, ARP & TCP/IP Analysis', titleEn: 'Ethernet, MAC, ARP & TCP/IP Analysis' },
      { n: 4, title: 'VLAN & Trunk Configuration', titleEn: 'VLAN & Trunk Configuration' },
      { n: 5, title: 'Inter-VLAN, Static Routing & OSPF', titleEn: 'Inter-VLAN, Static Routing & OSPF' },
      { n: 6, title: 'TCP & UDP Socket Programming', titleEn: 'TCP & UDP Socket Programming' }
    ];

    return lessons.map(lesson => ({
      label: `Lesson ${lesson.n}: ${lesson.title}`,
      description: lesson.titleEn,
      toolId: `lesson-${lesson.n}`,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      command: {
        command: 'networkCourse.openLessons',
        title: `Open Lesson ${lesson.n}`,
        arguments: [lesson.n]
      },
      iconPath: new vscode.ThemeIcon('book')
    }));
  }

  private getToolItems(): CourseItem[] {
    return [
      { label: '🔗 Topology Designer', toolId: 'topology', collapsibleState: vscode.TreeItemCollapsibleState.None, command: { command: 'networkCourse.openTopology', title: 'Open Topology' }, iconPath: new vscode.ThemeIcon('graph') },
      { label: '📊 iPerf3 Bandwidth Test', toolId: 'iperf3', collapsibleState: vscode.TreeItemCollapsibleState.None, command: { command: 'networkCourse.openIperf3', title: 'Open iPerf3' }, iconPath: new vscode.ThemeIcon('graph-line') },
      { label: '📦 tcpdump Packet Capture', toolId: 'tcpdump', collapsibleState: vscode.TreeItemCollapsibleState.None, command: { command: 'networkCourse.openTcpdump', title: 'Open tcpdump' }, iconPath: new vscode.ThemeIcon('package') },
      { label: '🐍 Scapy Packet Crafting', toolId: 'scapy', collapsibleState: vscode.TreeItemCollapsibleState.None, command: { command: 'networkCourse.openScapy', title: 'Open Scapy' }, iconPath: new vscode.ThemeIcon('symbol-class') },
      { label: '🛤️ Traceroute', toolId: 'traceroute', collapsibleState: vscode.TreeItemCollapsibleState.None, command: { command: 'networkCourse.openTraceroute', title: 'Open Traceroute' }, iconPath: new vscode.ThemeIcon('map') }
    ];
  }

  private getPracticalItems(): CourseItem[] {
    const practicals = [
      { n: 1, topic: 'Network Configuration Lab - Basic Setup', tools: 'Cisco CLI, Packet Tracer' },
      { n: 2, topic: 'Switch Configuration - VLAN & Trunk', tools: 'Cisco Switch, Packet Tracer' },
      { n: 3, topic: 'Router Configuration - Static Routing', tools: 'Cisco Router, Packet Tracer' },
      { n: 4, topic: 'Inter-VLAN Routing (Router-on-a-Stick)', tools: 'Router, Switch, Packet Tracer' },
      { n: 5, topic: 'Dynamic Routing - OSPF Configuration', tools: 'Cisco Router, Packet Tracer' },
      { n: 6, topic: 'DHCP & NAT Configuration', tools: 'Cisco Router, Packet Tracer' },
      { n: 7, topic: 'ACL & Network Security', tools: 'Cisco Router, Packet Tracer' },
      { n: 8, topic: 'Network Monitoring & Troubleshooting', tools: 'Wireshark, ping, traceroute' },
      { n: 9, topic: 'Python Socket Programming - TCP/UDP', tools: 'Python, Scapy, Wireshark' },
      { n: 10, topic: 'Network Automation with Python', tools: 'Python, Netmiko, NAPALM' },
      { n: 11, topic: 'Performance Testing with iPerf3', tools: 'iPerf3, Wireshark' },
      { n: 12, topic: 'Packet Analysis with Wireshark/tshark', tools: 'Wireshark, tshark, tcpdump' },
      { n: 13, topic: 'Network Design Project', tools: 'Packet Tracer, Draw.io' },
      { n: 14, topic: 'Integration Testing & Documentation', tools: 'All tools' },
      { n: 15, topic: 'Final Project Presentation', tools: 'Presentation' }
    ];

    return practicals.map(p => ({
      label: `Lab ${p.n}: ${p.topic}`,
      description: p.tools,
      toolId: `practical-${p.n}`,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      command: {
        command: 'networkCourse.openPracticals',
        title: `Open Lab ${p.n}`,
        arguments: [p.n]
      },
      iconPath: new vscode.ThemeIcon('beaker')
    }));
  }
}