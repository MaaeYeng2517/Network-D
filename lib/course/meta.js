// Course metadata, modules, tools, practicals, project, outcomes, assessment, schedule.
// 16-week plan: Network Engineering, Programming & Automation Laboratory.

export const COURSE = {
  title: "Network Engineering, Programming & Automation Laboratory",
  titleTh: "ระบบเครือข่ายคอมพิวเตอร์และการสื่อสารข้อมูล",
  code: "NET-ENG 2xx",
  credits: "3 (2-2-5)",
  weeks: 16,
  examWeek: 16,
  projectWeek: 15,
};

export const MODULES = [
  { id: 1, name: "Network Fundamentals", weeks: "1–2", scope: "Architecture, Topology, IP, Subnetting" },
  { id: 2, name: "Data Communication", weeks: "3", scope: "Ethernet, MAC, ARP, TCP/IP" },
  { id: 3, name: "Switching & Routing", weeks: "4–5", scope: "VLAN, Trunk, Routing, OSPF" },
  { id: 4, name: "Network Programming", weeks: "6–7", scope: "TCP, UDP, DNS, HTTP, API" },
  { id: 5, name: "Network Services", weeks: "8–9", scope: "Linux, Docker, Web, Database" },
  { id: 6, name: "Network Analysis", weeks: "10", scope: "Packet Capture, Scapy" },
  { id: 7, name: "Network Monitoring", weeks: "11", scope: "Metrics, Monitoring, Dashboard" },
  { id: 8, name: "Network Automation", weeks: "12", scope: "Python Automation, Device Management" },
  { id: 9, name: "Network Security", weeks: "13", scope: "ACL, Firewall, Scanning" },
  { id: 10, name: "Network Performance", weeks: "14", scope: "Performance Measurement" },
  { id: 11, name: "Integrated Project", weeks: "15", scope: "System Integration" },
  { id: 12, name: "Final Examination", weeks: "16", scope: "ทดสอบความรู้และทักษะปฏิบัติ" },
];

export const TOOLS = [
  { href: "/topology", name: "Packet Tracer", desc: "ออกแบบและจำลองเครือข่าย" },
  { href: "/tshark", name: "Wireshark", desc: "จับและวิเคราะห์แพ็กเก็ต" },
  { href: "/iperf", name: "iPerf3", desc: "วัด throughput / latency" },
  { href: "/scapy", name: "Scapy", desc: "สร้างและวิเคราะห์แพ็กเก็ต" },
  { href: "/tcpdump", name: "tcpdump", desc: "จับแพ็กเก็ตเชิงลึก" },
  { href: null, name: "Python", desc: "Network Programming & Automation" },
  { href: null, name: "Docker", desc: "Container Networking" },
  { href: null, name: "Nmap / UFW", desc: "Security Scanning & Firewall" },
];

export const PRACTICALS = [
  { n: 1, module: "Network Fundamentals", topic: "Network Architecture & Topology", tools: "Packet Tracer, Draw.io", lab: "ออกแบบ Network Topology", clo: "CLO2" },
  { n: 2, module: "Network Fundamentals", topic: "IP Addressing & Subnetting", tools: "Packet Tracer, Python", lab: "IP Calculator", clo: "CLO2" },
  { n: 3, module: "Data Communication", topic: "Ethernet, MAC, ARP, TCP/IP Analysis", tools: "Wireshark, Linux", lab: "Packet Analysis Report", clo: "CLO5" },
  { n: 4, module: "Switching", topic: "VLAN & Trunk Configuration", tools: "Packet Tracer", lab: "VLAN Network", clo: "CLO2" },
  { n: 5, module: "Routing", topic: "Inter-VLAN, Static Routing & OSPF", tools: "Packet Tracer", lab: "Routing Configuration", clo: "CLO2" },
  { n: 6, module: "Network Programming", topic: "TCP & UDP Socket Programming", tools: "Python, VS Code, Wireshark", lab: "Client-Server Application", clo: "CLO3" },
  { n: 7, module: "Network Programming", topic: "DNS, HTTP & REST API", tools: "Python, FastAPI, Postman", lab: "Network API Client", clo: "CLO4" },
  { n: 8, module: "Network Services", topic: "Linux Network & Docker Networking", tools: "Ubuntu, WSL2, Docker", lab: "Container Network", clo: "CLO4" },
  { n: 9, module: "Network Services", topic: "Web Server, Database & Client-Server", tools: "Docker, FastAPI, PostgreSQL", lab: "Distributed Service", clo: "CLO4" },
  { n: 10, module: "Network Analysis", topic: "Packet Capture & Programming", tools: "Wireshark, Scapy, Python", lab: "Packet Analyzer", clo: "CLO5" },
  { n: 11, module: "Network Monitoring", topic: "Network Monitoring & Visualization", tools: "Python, Prometheus, Grafana", lab: "Monitoring Dashboard", clo: "CLO6" },
  { n: 12, module: "Network Automation", topic: "Network Automation & Device Management", tools: "Python, Netmiko, Git", lab: "Automation Script", clo: "CLO6" },
  { n: 13, module: "Network Security", topic: "ACL, Firewall & Network Scanning", tools: "Packet Tracer, Nmap, UFW", lab: "Security Assessment Report", clo: "CLO2" },
  { n: 14, module: "Network Performance", topic: "Throughput, Latency, Jitter & Packet Loss", tools: "iPerf3, Wireshark, Python", lab: "Performance Report", clo: "CLO5" },
  { n: 15, module: "Integration", topic: "Integrated Network Engineering Project", tools: "เครื่องมือทั้งหมด", lab: "Project Demonstration", clo: "CLO7" },
];

export const PROJECT = {
  title: "Integrated Network Engineering Project",
  desc:
    "จัดกลุ่มออกแบบและบูรณาการระบบเครือข่ายครบวงจร ตั้งแต่การออกแบบ Topology และแผน IP/Subnet, " +
    "กำหนดค่า VLAN/Routing บน Packet Tracer, พัฒนาโปรแกรม TCP/UDP และ REST API, จัดวางบริการด้วย Docker " +
    "(Web + Database), ติดตั้ง Monitoring (Prometheus/Grafana) และ Automation (Python/Netmiko) " +
    "จากนั้นทดสอบประสิทธิภาพ (iPerf3) และความปลอดภัย (Nmap/UFW) " +
    "จนนำเสนอผลการทดลองและสาธิตระบบการทำงานแบบอินเทอร์เน็ตในสัปดาห์ที่ 15",
};

export const OUTCOMES = [
  { id: "CLO1", text: "อธิบายหลักการและโปรโตคอลเครือข่าย" },
  { id: "CLO2", text: "ออกแบบและกำหนดค่าเครือข่าย" },
  { id: "CLO3", text: "พัฒนาโปรแกรม TCP/UDP" },
  { id: "CLO4", text: "พัฒนาโปรแกรม DNS, HTTP และ API" },
  { id: "CLO5", text: "วิเคราะห์ Packet และ Performance" },
  { id: "CLO6", text: "พัฒนาระบบ Monitoring และ Automation" },
  { id: "CLO7", text: "บูรณาการและประเมินระบบเครือข่าย" },
];

export const SCHEDULE = [
  { activity: "ทบทวนทฤษฎีและหลักการ", pct: "15%" },
  { activity: "สาธิตเครื่องมือและวิธีทดลอง", pct: "15%" },
  { activity: "ปฏิบัติการด้วยตนเอง", pct: "50%" },
  { activity: "วิเคราะห์และอภิปรายผล", pct: "10%" },
  { activity: "สรุปและส่งผลงาน", pct: "10%" },
];

export const ASSESSMENT = {
  intro:
    "การประเมินผลรายวิชาออกแบบตามสมรรถนะปฏิบัติจริง แยกคะแนนการกำหนดค่าเครือข่าย การเขียนโปรแกรม " +
    "การวิเคราะห์และทดสอบ โครงงาน และการสอบปลายภาค เพื่อวัดทั้งความรู้และทักษะการใช้งานเครื่องมือ",
  items: [
    { name: "Network Configuration Laboratory", weight: "20%", desc: "การปฏิบัติการกำหนดค่าเครือข่าย สัปดาห์ 1–5" },
    { name: "Programming & Automation Laboratory", weight: "20%", desc: "การปฏิบัติการเขียนโปรแกรมและ Automation สัปดาห์ 6–9" },
    { name: "Network Analysis & Testing", weight: "15%", desc: "การวิเคราะห์แพ็กเก็ตและทดสอบประสิทธิภาพ สัปดาห์ 3, 10–14" },
    { name: "Lab Reports & Assignments", weight: "10%", desc: "รายงานและใบงานจากการปฏิบัติการ สัปดาห์ 1–14" },
    { name: "Integrated Project", weight: "15%", desc: "โครงงานบูรณาการและนำเสนอผล สัปดาห์ 15" },
    { name: "Final Examination", weight: "20%", desc: "การสอบปลายภาค สัปดาห์ 16" },
  ],
  details: [
    { period: "สัปดาห์ 1–5", item: "Network Configuration Labs", score: 20 },
    { period: "สัปดาห์ 6–9", item: "Programming & Automation Labs", score: 20 },
    { period: "สัปดาห์ 3, 10–14", item: "Analysis & Testing", score: 15 },
    { period: "สัปดาห์ 1–14", item: "Reports & Assignments", score: 10 },
    { period: "สัปดาห์ 15", item: "Integrated Project", score: 15 },
    { period: "สัปดาห์ 16", item: "Final Examination", score: 20 },
  ],
  final: {
    total: 20,
    parts: [
      {
        name: "ส่วนที่ 1: ทฤษฎีและการวิเคราะห์",
        score: 10,
        desc: "ข้อสอบความเข้าใจหลักการและการวิเคราะห์สถานการณ์",
        topics: [
          "Network Architecture และ TCP/IP",
          "IP Addressing และ Subnetting",
          "VLAN และ Routing",
          "TCP, UDP, DNS และ HTTP",
          "Docker และ Network Services",
          "Network Security และ Performance",
        ],
      },
      {
        name: "ส่วนที่ 2: Practical Examination",
        score: 10,
        desc: "สอบปฏิบัติจริงจากโจทย์ที่กำหนด",
        topics: [
          "ออกแบบหรือแก้ไข Network Configuration",
          "วิเคราะห์ Packet ด้วย Wireshark",
          "เขียนหรือแก้ไข Python Network Program",
          "ตรวจสอบและวิเคราะห์ปัญหาเครือข่าย",
        ],
      },
    ],
    practicalCriteria: [
      { criterion: "วิเคราะห์ปัญหา", score: 2 },
      { criterion: "กำหนดค่าและแก้ไขระบบ", score: 3 },
      { criterion: "เขียนโปรแกรมหรือใช้เครื่องมือ", score: 2 },
      { criterion: "ทดสอบและยืนยันผล", score: 2 },
      { criterion: "อธิบายผลการทดลอง", score: 1 },
    ],
  },
  rubric: [
    "ความถูกต้องทางเทคนิคและการอ้างอิงมาตรฐาน",
    "ความครบถ้วนของขั้นตอนการทดลองและหลักฐาน (capture/ผลวัด)",
    "ความสามารถในการวิเคราะห์และสรุปผล",
    "ความปลอดภัยและจริยธรรมในการทดลอง",
    "การนำเสนอและการรายงาน",
  ],
  cloMap: [
    { clo: "CLO1", outcome: "อธิบายหลักการและโปรโตคอลเครือข่าย", method: "Quiz, Final Theory" },
    { clo: "CLO2", outcome: "ออกแบบและกำหนดค่าเครือข่าย", method: "Lab 1–5, Final Practical" },
    { clo: "CLO3", outcome: "พัฒนาโปรแกรม TCP/UDP", method: "Lab 6" },
    { clo: "CLO4", outcome: "พัฒนาโปรแกรม DNS, HTTP และ API", method: "Lab 7–9" },
    { clo: "CLO5", outcome: "วิเคราะห์ Packet และ Performance", method: "Lab 3, 10, 14" },
    { clo: "CLO6", outcome: "พัฒนาระบบ Monitoring และ Automation", method: "Lab 11–12" },
    { clo: "CLO7", outcome: "บูรณาการและประเมินระบบเครือข่าย", method: "Lab 15, Final" },
  ],
};