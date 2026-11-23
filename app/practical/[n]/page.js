import { notFound } from "next/navigation";
import Link from "next/link";
import { PRACTICALS, MODULES, TOOLS } from "@/lib/course-data";

export async function generateStaticParams() {
  return PRACTICALS.map((p) => ({ n: String(p.n) }));
}

export const metadata = { title: "รายละเอียดปฏิบัติการ | Network Course" };

const PRACTICAL_DETAILS = {
  1: {
    title: "ออกแบบ Network Topology",
    description: "เรียนรู้การออกแบบโครงข่ายพื้นฐาน ตั้งแต่ Physical/Logical Topology, การเลือกอุปกรณ์ การวางแผน IP Address และ Subnetting",
    objectives: [
      "เข้าใจหลักการออกแบบ Network Topology แบบ Physical และ Logical",
      "สามารถเลือกอุปกรณ์เครือข่ายที่เหมาะสมกับขนาดและความต้องการ",
      "วางแผน IP Addressing และ Subnetting ได้ถูกต้อง",
      "ใช้ Packet Tracer จำลองและทดสอบ Topology ที่ออกแบบ",
      "ใช้ Draw.io สร้างแผนภาพเครือข่ายมาตรฐาน"
    ],
    tools: ["Packet Tracer", "Draw.io"],
    steps: [
      {
        title: "1. วิเคราะห์ความต้องการ",
        details: "ศึกษาข้อกำหนด: จำนวนผู้ใช้, ประเภทบริการ, ขอบเขตพื้นที่, งบประมาณ, และแผนขยายอนาคต"
      },
      {
        title: "2. เลือก Topology Type",
        details: "เลือกโครงสร้างที่เหมาะสม: Star (ส่วนใหญ่), Mesh (Critical), Tree (องค์กรใหญ่), Hybrid (ผสม)"
      },
      {
        title: "3. กำหนดอุปกรณ์",
        details: "เลือก Switch (L2/L3), Router, Firewall, AP, Server ตามสเปกและพอร์ตที่ต้องการ"
      },
      {
        title: "4. วางแผน IP Addressing",
        details: "แบ่ง Subnet ตาม VLAN/Department, กำหนด Gateway, DHCP Scope, Reserved IP สำหรับอุปกรณ์เครือข่าย"
      },
      {
        title: "5. สร้างใน Packet Tracer",
        details: "วางอุปกรณ์ ต่อสาย ตั้งค่า IP/VLAN/Routing ทดสอบ Ping/Traceroute ระหว่างทุก Segment"
      },
      {
        title: "6. วาดแผนภาพใน Draw.io",
        details: "สร้าง Physical Diagram และ Logical Diagram พร้อม Legend, IP Plan Table, Device List"
      },
      {
        title: "7. ทดสอบและบันทึกผล",
        details: "บันทึกผล Ping, Traceroute, Show running-config, Screenshot Topology"
      }
    ],
    testRecords: [
      { item: "Ping ทุก VLAN สำเร็จ", status: "pass", note: "Latency < 1ms" },
      { item: "Inter-VLAN Routing ทำงาน", status: "pass", note: "Router-on-stick OK" },
      { item: "DHCP แจก IP ถูกต้อง", status: "pass", note: "Scope ถูกต้องทุก VLAN" },
      { item: "Internet Access ผ่าน NAT", status: "pass", note: "Ping 8.8.8.8 สำเร็จ" },
      { item: "Draw.io Diagram ครบถ้วน", status: "pass", note: "Physical + Logical + IP Plan" }
    ],
    deliverables: [
      "Packet Tracer file (.pkt)",
      "Draw.io Diagram (.drawio / .png)",
      "IP Address Plan Table (Excel/CSV)",
      "Test Result Screenshots",
      "Lab Report (PDF)"
    ]
  },
  2: {
    title: "IP Calculator",
    description: "พัฒนาโปรแกรมคำนวณ IP Address และ Subnetting ด้วย Python รองรับ VLSM และ CIDR",
    objectives: [
      "เข้าใจหลักการ Subnetting, VLSM, CIDR อย่างลึกซึ้ง",
      "สามารถคำนวณ Network Address, Broadcast, Usable Host Range ได้ด้วยมือ",
      "พัฒนา Python Script คำนวณ Subnet อัตโนมัติ",
      "รองรับการแบ่ง Subnet ขนาดไม่เท่ากัน (VLSM)",
      "Export ผลลัพธ์เป็น CSV/JSON สำหรับนำไปใช้ต่อ"
    ],
    tools: ["Python", "Packet Tracer"],
    steps: [
      {
        title: "1. ทบทวนทฤษฎี Subnetting",
        details: "Binary AND Operation, CIDR Notation, VLSM Algorithm, Subnet Zero & All-Ones"
      },
      {
        title: "2. ออกแบบ Class/Function Structure",
        details: "IPv4Network class: network, broadcast, first_host, last_host, host_count, subnet_mask"
      },
      {
        title: "3. Implement VLSM Algorithm",
        details: "เรียง Host Count มาก→น้อย, จัดสรร Block ให้พอดี, คืนค่า Subnet ทุกขนาด"
      },
      {
        title: "4. CLI Interface",
        details: "argparse: --network, --hosts (list), --output (csv/json/table)"
      },
      {
        title: "5. ทดสอบกับกรณีตัวอย่าง",
        details: "192.168.1.0/24 แบ่ง 3 Subnet: 50, 25, 10 hosts → ตรวจสอบไม่ทับซ้อน"
      },
      {
        title: "6. นำไปใช้ใน Packet Tracer",
        details: "ตั้งค่า IP ตามคำนวณได้ ทดสอบ Connectivity จริง"
      }
    ],
    testRecords: [
      { item: "คำนวณ /24 → 3 Subnets ถูกต้อง", status: "pass", note: "No overlap, max utilization" },
      { item: "Edge case /30 (Point-to-Point)", status: "pass", note: "2 usable hosts OK" },
      { item: "Export CSV ใช้งานได้", status: "pass", note: "เปิด Excel ถูกต้อง" },
      { item: "Invalid input handling", status: "pass", note: "Error message ชัดเจน" }
    ],
    deliverables: [
      "ip_calculator.py (Source Code)",
      "Test Cases & Results",
      "Sample Output CSV/JSON",
      "Packet Tracer ตั้งค่า IP จากโปรแกรม",
      "Lab Report"
    ]
  },
  3: {
    title: "Packet Analysis Report",
    description: "จับแพ็กเก็ตด้วย Wireshark และ Scapy วิเคราะห์ Ethernet, MAC, ARP, TCP/IP แสดงรายงาน",
    objectives: [
      "ใช้ Wireshark Capture และ Filter ได้เชี่ยวชาญ",
      "เข้าใจโครงสร้าง Frame Ethernet, ARP Request/Reply, TCP 3-way Handshake",
      "ใช้ Scapy สร้าง/อ่าน/วิเคราะห์แพ็กเก็ตแบบโปรแกรม",
      "ระบุปัญหาจาก Packet Capture: Retransmission, Latency, Window Scaling"
    ],
    tools: ["Wireshark", "Linux", "Scapy", "Python"],
    steps: [
      {
        title: "1. Setup Capture Environment",
        details: "Wireshark บน Host, tcpdump บน Server, Promiscuous Mode, Capture Filter vs Display Filter"
      },
      {
        title: "2. Capture ARP Process",
        details: "ping IP ใหม่ → ดู ARP Request (Broadcast) / Reply (Unicast) → ARP Table Update"
      },
      {
        title: "3. Capture TCP 3-way Handshake",
        details: "SYN, SYN-ACK, ACK → Sequence/ACK Number, Window Size, MSS, SACK Permitted"
      },
      {
        title: "4. Capture HTTP Traffic",
        details: "GET/POST, Headers, Content-Length, Chunked Encoding, Keep-Alive"
      },
      {
        title: "5. Scapy Analysis Script",
        details: "rdpcap(), filter layers, extract fields, สถิติ Packet Size, Protocol Distribution"
      },
      {
        title: "6. เขียนรายงานวิเคราะห์",
        details: "สรุป Top Talkers, Protocol Hierarchy, Anomalies, TCP Retransmission Rate"
      }
    ],
    testRecords: [
      { item: "ARP Capture ครบ Request/Reply", status: "pass", note: "Wireshark + Scapy ตรงกัน" },
      { item: "TCP Handshake Sequence ถูกต้อง", status: "pass", note: "Relative Seq Number" },
      { item: "HTTP Request/Response Pair", status: "pass", note: "Follow TCP Stream OK" },
      { item: "Scapy Script รัน Error 0", status: "pass", note: "Output JSON Valid" },
      { item: "Retransmission < 1%", status: "pass", note: "Network Healthy" }
    ],
    deliverables: [
      "Capture File (.pcapng)",
      "Scapy Analysis Script (.py)",
      "Protocol Hierarchy Screenshot",
      "TCP Stream Analysis",
      "Lab Report (PDF)"
    ]
  },
  4: {
    title: "VLAN Network",
    description: "กำหนดค่า VLAN, Trunk, Access Port, Voice VLAN, Inter-VLAN Routing บน Packet Tracer",
    objectives: [
      "สร้างและจัดการ VLAN Database (vlan.dat)",
      "กำหนด Access Port และ Voice VLAN สำหรับ IP Phone",
      "ตั้งค่า Trunk 802.1Q, Allowed VLAN, Native VLAN",
      "Implement Inter-VLAN Routing (Router-on-Stick และ SVI)",
      "ทดสอบ VTP (Server/Client/Transparent) และ DTP"
    ],
    tools: ["Packet Tracer"],
    steps: [
      {
        title: "1. สร้าง VLAN Database",
        details: "vlan 10 (Data), 20 (Voice), 30 (Server), 99 (Mgmt) → name, state active"
      },
      {
        title: "2. กำหนด Access Ports",
        details: "switchport mode access, switchport access vlan 10, switchport voice vlan 20"
      },
      {
        title: "3. ตั้งค่า Trunk Ports",
        details: "switchport trunk encapsulation dot1q, switchport mode trunk, allowed vlan, native vlan 99"
      },
      {
        title: "4. Inter-VLAN Routing (SVI)",
        details: "interface vlan 10/20/30 → ip address, no shutdown → ip routing"
      },
      {
        title: "5. Inter-VLAN Routing (Router-on-Stick)",
        details: "Sub-interfaces: g0/0.10, .20, .30 → encapsulation dot1Q, ip address"
      },
      {
        title: "6. ทดสอบและ Verify",
        details: "show vlan brief, show interfaces trunk, show ip route, ping ระหว่าง VLAN"
      }
    ],
    testRecords: [
      { item: "VLAN 10,20,30,99 สร้างสำเร็จ", status: "pass", note: "show vlan brief OK" },
      { item: "Access Port VLAN Tagging", status: "pass", note: "PC ได้ IP VLAN 10" },
      { item: "Trunk Allowed VLAN ทำงาน", status: "pass", note: "Tag 10,20,30 ผ่าน" },
      { item: "SVI Routing ระหว่าง VLAN", status: "pass", note: "Ping 10↔20↔30 OK" },
      { item: "Router-on-Stick ทำงาน", status: "pass", note: "Sub-int Ping OK" }
    ],
    deliverables: [
      "Packet Tracer File (.pkt)",
      "Running-config ทุก Switch/Router",
      "Show Command Outputs",
      "Test Result Table",
      "Lab Report"
    ]
  },
  5: {
    title: "Routing Configuration",
    description: "Static Routing, Default Route, OSPF Single/Multi-Area, Route Redistribution",
    objectives: [
      "ตั้งค่า Static Route และ Default Route ให้ถูกต้อง",
      "เข้าใจ OSPF: Process ID, Router ID, Network Type, Area",
      "Config OSPF Single Area และ Multi-Area (Backbone Area 0)",
      "Route Summarization (ABR/ASBR)",
      "Redistribution Static ↔ OSPF, Default-information originate"
    ],
    tools: ["Packet Tracer"],
    steps: [
      {
        title: "1. Static & Default Routing",
        details: "ip route network mask next-hop, ip route 0.0.0.0 0.0.0.0 exit-int/next-hop"
      },
      {
        title: "2. OSPF Single Area",
        details: "router ospf 1, router-id, network x.x.x.x 0.0.0.255 area 0, passive-interface"
      },
      {
        title: "3. OSPF Multi-Area",
        details: "Area 0 (Backbone), Area 1, 2 → ABR สรุป Route (area range), Virtual Link ถ้าจำเป็น"
      },
      {
        title: "4. Route Summarization",
        details: "ABR: area 1 range 192.168.16.0 255.255.240.0, ASBR: summary-address"
      },
      {
        title: "5. Redistribution",
        details: "redistribute static subnets, default-information originate always"
      },
      {
        title: "6. Verify & Troubleshoot",
        details: "show ip ospf neighbor, show ip ospf database, show ip route ospf, debug ip ospf adj"
      }
    ],
    testRecords: [
      { item: "Static Route ปรากฏใน Table", status: "pass", note: "S* 0.0.0.0/0" },
      { item: "OSPF Neighbor FULL State", status: "pass", note: "All interfaces" },
      { item: "Multi-Area Route Learning", status: "pass", note: "O IA routes visible" },
      { item: "Summarization ลด Route Entries", status: "pass", note: "1 entry แทนหลาย Subnet" },
      { item: "Redistribution Static→OSPF", status: "pass", note: "O E2 Routes" }
    ],
    deliverables: [
      "Packet Tracer File (.pkt)",
      "Running-config ทุก Router",
      "OSPF Database Output",
      "Routing Table Comparison",
      "Lab Report"
    ]
  },
  6: {
    title: "Client-Server Application",
    description: "พัฒนา TCP/UDP Socket Programming: Echo Server, Chat App, File Transfer",
    objectives: [
      "เข้าใจ Socket API: socket(), bind(), listen(), accept(), connect(), send(), recv()",
      "พัฒนา TCP Server/Client แบบ Concurrent (Threading/Async)",
      "พัฒนา UDP Server/Client สำหรับ Real-time Application",
      "จัดการ Error Handling, Timeout, Graceful Shutdown",
      "ทดสอบผ่าน Wireshark ดู Sequence/Flow Control"
    ],
    tools: ["Python", "VS Code", "Wireshark"],
    steps: [
      {
        title: "1. TCP Echo Server (Single-thread)",
        details: "Blocking I/O, Buffer Size, Loop recv/send, Close Connection"
      },
      {
        title: "2. TCP Concurrent Server",
        details: "threading.Thread(target=handle_client), Thread Pool, Shared Resources"
      },
      {
        title: "3. UDP Datagram Server",
        details: "socket.SOCK_DGRAM, recvfrom/sendto, No Connection State"
      },
      {
        title: "4. Chat Application",
        details: "Multi-client Broadcast, Username, Message Format, Ctrl+C Exit"
      },
      {
        title: "5. File Transfer Protocol",
        details: "Header: filename, filesize → Data Chunks → CRC32 Checksum → ACK"
      },
      {
        title: "6. Wireshark Analysis",
        details: "TCP Handshake, Window Scaling, PSH/ACK, Retransmission, Throughput"
      }
    ],
    testRecords: [
      { item: "TCP Echo Server/Client ทำงาน", status: "pass", note: "Round-trip < 5ms" },
      { item: "Concurrent 5 Clients OK", status: "pass", note: "No deadlock" },
      { item: "UDP Chat Broadcast ทำงาน", status: "pass", note: "All receive messages" },
      { item: "File Transfer 10MB OK", status: "pass", note: "Checksum Match" },
      { item: "Wireshark Capture Analysis", status: "pass", note: "TCP Flow Graph OK" }
    ],
    deliverables: [
      "tcp_server.py, tcp_client.py",
      "udp_chat.py",
      "file_transfer_server.py, client.py",
      "Wireshark Captures",
      "Lab Report"
    ]
  },
  7: {
    title: "Network API Client",
    description: "พัฒนา DNS Query, HTTP/REST Client, FastAPI Service, Test ด้วย Postman",
    objectives: [
      "เข้าใจ DNS Protocol: Query/Response, Record Types (A, AAAA, MX, CNAME, TXT)",
      "พัฒนา DNS Resolver ด้วย Python (dnslib/scapy)",
      "สร้าง REST API ด้วย FastAPI: CRUD, Validation, OpenAPI Docs",
      "เขียน API Client เรียกใช้ Service จริง",
      "Test API ด้วย Postman: Collection, Environment, Test Scripts"
    ],
    tools: ["Python", "FastAPI", "Postman", "dnslib"],
    steps: [
      {
        title: "1. DNS Query Implementation",
        details: "dnslib: DNSRecord.question(), sendto UDP:53, parse Answer Section"
      },
      {
        title: "2. HTTP Client Basics",
        details: "requests/httpx: GET/POST/PUT/DELETE, Headers, Query Params, JSON Body"
      },
      {
        title: "3. FastAPI Service",
        details: "Pydantic Models, Dependency Injection, Background Tasks, /docs /redoc"
      },
      {
        title: "4. Network Device API",
        details: "RESTCONF/NETCONF Concepts, คำสั่ง show via API, Config via API"
      },
      {
        title: "5. Postman Testing",
        details: "Collection Runner, Pre-request Script, Tests Tab, Newman CLI"
      },
      {
        title: "6. Integration Test",
        details: "Client → API → Device, Error Handling, Retry Logic, Rate Limiting"
      }
    ],
    testRecords: [
      { item: "DNS Query A Record สำเร็จ", status: "pass", note: "google.com → 142.250.x.x" },
      { item: "FastAPI CRUD ทำงานครบ", status: "pass", note: "Swagger UI OK" },
      { item: "Postman Collection Pass 100%", status: "pass", note: "All Tests Green" },
      { item: "Error Handling 4xx/5xx", status: "pass", note: "Proper JSON Error" },
      { item: "OpenAPI Spec Valid", status: "pass", note: "Import Postman OK" }
    ],
    deliverables: [
      "dns_resolver.py",
      "fastapi_service/ (main.py, models.py, routes.py)",
      "Postman Collection (.json)",
      "API Documentation (Markdown)",
      "Lab Report"
    ]
  },
  8: {
    title: "Container Network",
    description: "Docker Networking: Bridge, Host, Overlay, Macvlan, Docker Compose Multi-container",
    objectives: [
      "เข้าใจ Docker Network Drivers: bridge, host, overlay, macvlan, none",
      "สร้าง User-defined Bridge Network แยก Service",
      "ใช้ Docker Compose ออเคสเตรท Multi-container App",
      "ตั้งค่า Port Mapping, Service Discovery (DNS), Network Aliases",
      "Debug Container Network: nsenter, tcpdump ใน Container"
    ],
    tools: ["Ubuntu", "WSL2", "Docker", "Docker Compose"],
    steps: [
      {
        title: "1. Default Bridge vs User-defined",
        details: "docker network ls, inspect, ping by IP vs Container Name (DNS)"
      },
      {
        title: "2. Host & Macvlan Network",
        details: "--network host (no isolation), macvlan (physical NIC mapping)"
      },
      {
        title: "3. Docker Compose Stack",
        details: "web (nginx) + api (fastapi) + db (postgres) + redis → networks, depends_on, healthcheck"
      },
      {
        title: "4. Service Discovery",
        details: "Internal DNS: service_name → Container IP, Network Aliases"
      },
      {
        title: "5. Overlay Network (Swarm)",
        details: "docker swarm init, overlay network, service deploy, routing mesh"
      },
      {
        title: "6. Network Troubleshooting",
        details: "nsenter -t <pid> -n tcpdump, docker exec tcpdump, iptables rules"
      }
    ],
    testRecords: [
      { item: "User-defined Bridge DNS Works", status: "pass", note: "ping api ทำงาน" },
      { item: "Compose Stack Up Healthy", status: "pass", note: "All 4 containers running" },
      { item: "Port Mapping External Access", status: "pass", note: "localhost:8080 → web" },
      { item: "Overlay Swarm Service Mesh", status: "pass", note: "VIP Load Balance" },
      { item: "Macvlan Direct LAN Access", status: "pass", note: "Container ได้ IP LAN" }
    ],
    deliverables: [
      "docker-compose.yml",
      "Dockerfile (web, api)",
      "Network Diagram",
      "tcpdump Captures",
      "Lab Report"
    ]
  },
  9: {
    title: "Distributed Service",
    description: "Deploy Web + Database + Cache + Load Balancer บน Docker Swarm/Kubernetes",
    objectives: [
      "ออกแบบ Architecture: LB → Web Replicas → DB (Primary/Replica) → Cache",
      "Docker Secrets/Configs สำหรับ Credentials",
      "Healthchecks, Rolling Updates, Rollback Strategy",
      "Persistent Volumes สำหรับ Database",
      "Monitoring: Prometheus Node Exporter, cAdvisor"
    ],
    tools: ["Docker", "FastAPI", "PostgreSQL", "Redis", "Nginx"],
    steps: [
      {
        title: "1. Architecture Design",
        details: "Nginx LB → 3x FastAPI → PostgreSQL Primary + Replica → Redis Cluster"
      },
      {
        title: "2. Docker Compose Production",
        details: "networks: frontend, backend; volumes: pgdata, redisdata; secrets: db_password"
      },
      {
        title: "3. Database Replication",
        details: "PostgreSQL Streaming Replication, Synchronous/Asynchronous, Failover"
      },
      {
        title: "4. Redis Cache Layer",
        details: "Session Store, Query Cache, Redis Sentinel/Cluster for HA"
      },
      {
        title: "5. Nginx Load Balancer",
        details: "upstream backend { least_conn; server api1; server api2; } health_check"
      },
      {
        title: "6. Deploy & Test",
        details: "docker stack deploy, scale api=5, siege/hey load test, failover test"
      }
    ],
    testRecords: [
      { item: "Stack Deploy Success", status: "pass", note: "All services running" },
      { item: "LB Distributes Requests", status: "pass", note: "Round-robin/least_conn" },
      { item: "DB Replication Lag < 1s", status: "pass", note: "SHOW SLAVE STATUS" },
      { item: "Cache Hit Ratio > 80%", status: "pass", note: "Redis INFO stats" },
      { item: "Failover < 30s", status: "pass", note: "Primary Down → Replica Promote" }
    ],
    deliverables: [
      "docker-compose.prod.yml",
      "Nginx Config",
      "PostgreSQL Replication Config",
      "Load Test Results (hey/siege)",
      "Lab Report"
    ]
  },
  10: {
    title: "Packet Analyzer",
    description: "พัฒนาเครื่องมือวิเคราะห์แพ็กเก็ตอัตโนมัติด้วย Scapy/Python: Protocol Stats, Anomaly Detection",
    objectives: [
      "ใช้ Scapy ประมวลผล pcap ขนาดใหญ่ (Streaming, khôngโหลดทั้งไฟล์)",
      "สรุปสถิติ Protocol Distribution, Top Talkers, Conversation Pairs",
      "Detect Anomalies: Port Scan, SYN Flood, DNS Amplification, Data Exfiltration",
      "สร้างรายงานอัตโนมัติ (HTML/PDF) พร้อมกราฟ",
      "Integration กับ Wireshark: Export PDML, Conversation Filter"
    ],
    tools: ["Wireshark", "Scapy", "Python", "Matplotlib/Plotly"],
    steps: [
      {
        title: "1. Scapy Streaming Parser",
        details: "PcapReader() generator, process packet by packet, memory efficient"
      },
      {
        title: "2. Protocol Classification",
        details: "Layer detection: Ether/IP/TCP/UDP/ICMP/DNS/HTTP/TLS, Counter per protocol"
      },
      {
        title: "3. Conversation Tracking",
        details: "5-tuple (src/dst IP, src/dst port, proto) → bytes, packets, duration, flags"
      },
      {
        title: "4. Anomaly Detection Rules",
        details: "SYN/ACK Ratio > 3, Unique Dst Ports > 100 (scan), DNS Response/Request > 10 (amp)"
      },
      {
        title: "5. Visualization",
        details: "Plotly: Protocol Pie, Top Talkers Bar, Timeline, Conversation Sankey"
      },
      {
        title: "6. Report Generation",
        details: "Jinja2 Template → HTML Report, Embed Charts, Export PDF (weasyprint)"
      }
    ],
    testRecords: [
      { item: "Parse 100MB pcap < 30s", status: "pass", note: "Streaming OK, Memory < 200MB" },
      { item: "Protocol Stats ตรง Wireshark", status: "pass", note: "Diff < 1%" },
      { item: "Port Scan Detection Works", status: "pass", note: "Nmap -sS Detected" },
      { item: "HTML Report Render OK", status: "pass", note: "Charts Interactive" },
      { item: "False Positive < 5%", status: "pass", note: "Tuned Thresholds" }
    ],
    deliverables: [
      "packet_analyzer.py",
      "report_template.html",
      "Sample Reports (HTML/PDF)",
      "Test pcaps + Results",
      "Lab Report"
    ]
  },
  11: {
    title: "Monitoring Dashboard",
    description: "สร้าง Monitoring Stack: Prometheus, Grafana, Node Exporter, Alertmanager",
    objectives: [
      "ติดตั้งและตั้งค่า Prometheus: scrape_configs, service discovery, retention",
      "Node Exporter: System Metrics (CPU, Memory, Disk, Network, Filesystem)",
      "Grafana: DataSource, Dashboard, Panels (Time Series, Stat, Table, Heatmap)",
      "Alertmanager: Rules, Inhibition, Silences, Notification (Email/Slack/Webhook)",
      "Blackbox Exporter: HTTP/TCP/ICMP/DNS Probes, SLA Monitoring"
    ],
    tools: ["Python", "Prometheus", "Grafana", "Alertmanager", "Node Exporter"],
    steps: [
      {
        title: "1. Prometheus Stack Deploy",
        details: "docker-compose: prometheus, alertmanager, node-exporter, cadaver, grafana"
      },
      {
        title: "2. Scrape Configuration",
        details: "static_configs, file_sd, docker_sd, relabel_configs, scrape_interval"
      },
      {
        title: "3. Node Exporter Metrics",
        details: "node_cpu_seconds_total, node_memory_*, node_disk_*, node_network_*"
      },
      {
        title: "4. Grafana Dashboard Design",
        details: "Import 1860 (Node Exporter Full), Custom Panels: RED Metrics, USE Metrics"
      },
      {
        title: "5. Alerting Rules",
        details: "High CPU > 80% 5m, Disk > 90%, Instance Down, HTTP 5xx Rate > 5%"
      },
      {
        title: "6. Alertmanager Config",
        details: "Routes, Receivers (Email, Slack, Webhook), Group_by, Group_wait, Repeat_interval"
      }
    ],
    testRecords: [
      { item: "Prometheus Scrape All Targets UP", status: "pass", note: "10/10 Targets UP" },
      { item: "Grafana Dashboard Load < 3s", status: "pass", note: "1860 Imported + Custom" },
      { item: "Alert Fire → Notification", status: "pass", note: "Slack Webhook Received" },
      { item: "Alert Resolve → Clear", status: "pass", note: "Auto-resolve OK" },
      { item: "Blackbox HTTP Probe OK", status: "pass", note: "Probe Success 200" }
    ],
    deliverables: [
      "docker-compose.monitoring.yml",
      "prometheus.yml",
      "alert.rules.yml",
      "Grafana Dashboard JSON",
      "Alertmanager Config",
      "Lab Report"
    ]
  },
  12: {
    title: "Automation Script",
    description: "Python Network Automation: Netmiko, NAPALM, Git Backup, Configuration Compliance",
    objectives: [
      "ใช้ Netmiko SSH ไปอุปกรณ์ Cisco/Arista/Juniper: Send Command, Config Mode",
      "ใช้ NAPALM abstraction: get_facts, get_config, compare_config, replace_config",
      "สร้าง Git-backed Config Backup: Scheduled Pull, Diff, Commit, Push",
      "Configuration Compliance Check: Golden Template vs Running Config",
      "Rollback Automation: Detect Drift → Alert → Auto-remediate (Optional)"
    ],
    tools: ["Python", "Netmiko", "NAPALM", "Git", "GitHub/GitLab"],
    steps: [
      {
        title: "1. Netmiko Basics",
        details: "ConnectHandler(device_type='cisco_ios'), send_command(), send_config_set()"
      },
      {
        title: "2. NAPALM Unified API",
        details: "get_network_driver('ios'), device.open(), get_facts(), get_interfaces()"
      },
      {
        title: "3. Config Backup Script",
        details: "Iterate Inventory → get_config() → Save to Git Repo → Commit/Push"
      },
      {
        title: "4. Compliance Engine",
        details: "Jinja2 Template (Golden Config) → Render → Compare with Running → Diff Report"
      },
      {
        title: "5. Change Management",
        details: "Dry-run (compare_config), Approval Gate, Deploy (replace_config), Verify"
      },
      {
        title: "6. Scheduled Automation",
        details: "cron/systemd timer, Inventory YAML, Logging, Error Handling, Slack Notify"
      }
    ],
    testRecords: [
      { item: "Netmiko Connect 5 Devices OK", status: "pass", note: "SSH Keys Used" },
      { item: "NAPALM Get Facts All Vendors", status: "pass", note: "Cisco, Arista OK" },
      { item: "Git Backup Daily Commit", status: "pass", note: "Auto-push Origin" },
      { item: "Compliance Detect Drift", status: "pass", note: "SNMP Community Mismatch" },
      { item: "Rollback Dry-run Safe", status: "pass", note: "No Config Change" }
    ],
    deliverables: [
      "backup_config.py",
      "compliance_check.py",
      "inventory.yml",
      "golden_templates/ (j2)",
      "Git Repo with History",
      "Lab Report"
    ]
  },
  13: {
    title: "Security Assessment Report",
    description: "Nmap Scanning, UFW Firewall, ACL Configuration, Vulnerability Assessment",
    objectives: [
      "Nmap: Host Discovery, Port Scan (-sS, -sU), Service Version (-sV), Script (-sC)",
      "解釋 Nmap Output: Open/Filtered/Closed, Service Info, OS Fingerprint",
      "UFW: Default Policies, Allow/Deny Rules, Logging, Application Profiles",
      "Packet Tracer ACL: Standard/Extended, Inbound/Outbound, Reflexive, Time-based",
      "สร้าง Security Assessment Report: Findings, Risk Rating, Remediation"
    ],
    tools: ["Packet Tracer", "Nmap", "UFW", "Wireshark"],
    steps: [
      {
        title: "1. Network Reconnaissance",
        details: "nmap -sn (ping sweep), -sS (SYN scan), -sU (UDP top 100), -sV (version)"
      },
      {
        title: "2. Vulnerability Scanning",
        details: "nmap --script vuln, auth, default, safe → CVE Mapping, CVSS Score"
      },
      {
        title: "3. UFW Firewall Hardening",
        details: "default deny incoming, allow ssh/http/https, logging on, rate limiting"
      },
      {
        title: "4. Cisco ACL Configuration",
        details: "access-list 101 permit tcp any host x.x.x.x eq 80, established, log"
      },
      {
        title: "5. Wireshark Verify Rules",
        details: "Capture → Verify Blocked Traffic Dropped, Allowed Traffic Passed"
      },
      {
        title: "6. Assessment Report",
        details: "Executive Summary, Technical Findings (Critical/High/Medium/Low), Remediation Plan"
      }
    ],
    testRecords: [
      { item: "Nmap Scan Complete < 10min", status: "pass", note: "Full TCP + Top UDP" },
      { item: "UFW Blocks Unauthorized Ports", status: "pass", note: "Port 23/135/445 Dropped" },
      { item: "ACL Permits Only Required", status: "pass", note: "Implicit Deny Works" },
      { item: "Vuln Scan: 0 Critical", status: "pass", note: "Patched/Filtered" },
      { item: "Report Format Standard", status: "pass", note: "Exec + Tech Sections" }
    ],
    deliverables: [
      "Nmap Output (.xml, .nmap, .gnmap)",
      "UFW Rules Export",
      "ACL Config (running-config)",
      "Security Assessment Report (PDF)",
      "Lab Report"
    ]
  },
  14: {
    title: "Performance Report",
    description: "iPerf3 Throughput/Latency/Jitter/Packet Loss, Wireshark TCP Analysis, Python Automation",
    objectives: [
      "iPerf3: Server/Client Mode, TCP/UDP, Bidirectional, Parallel Streams, Window Size",
      "วิเคราะห์ TCP Throughput: Bandwidth-Delay Product, Window Scaling, Congestion Control",
      "Latency/Jitter Measurement: Ping, iPerf3 --udp, owamp/twamp Concepts",
      "Packet Loss Analysis: Wireshark Retransmission, Duplicate ACK, SACK, Fast Retransmit",
      "Automated Performance Test Suite: Python + iPerf3 + Report Generation"
    ],
    tools: ["iPerf3", "Wireshark", "Python", "iperf3-python"],
    steps: [
      {
        title: "1. iPerf3 TCP Baseline",
        details: "iperf3 -s / iperf3 -c server -t 60 -P 4 -w 1M → Throughput, Retransmits"
      },
      {
        title: "2. iPerf3 UDP Jitter/Loss",
        details: "iperf3 -c server -u -b 100M -t 60 → Jitter, Loss%, Out-of-Order"
      },
      {
        title: "3. TCP Tuning",
        details: "sysctl: net.ipv4.tcp_rmem/wmem, BBR/Cubic, Window Scaling, MSS Clamping"
      },
      {
        title: "4. Wireshark TCP Analysis",
        details: "Time-Sequence Graph (Stevens), Throughput Graph, Retransmission Analysis"
      },
      {
        title: "5. Python Automation",
        details: "subprocess iperf3 --json, Parse JSON, Multiple Runs, Statistical Summary, Plot"
      },
      {
        title: "6. Performance Report",
        details: "Executive Summary, Test Topology, Parameters, Results Tables, Graphs, Conclusion"
      }
    ],
    testRecords: [
      { item: "TCP Throughput > 90% Line Rate", status: "pass", note: "9.4 Gbps / 10 Gbps" },
      { item: "UDP Jitter < 1ms", status: "pass", note: "0.3ms Avg" },
      { item: "Packet Loss < 0.01%", status: "pass", note: "Clean Fiber" },
      { item: "Retransmission Rate < 0.1%", status: "pass", note: "BBR Enabled" },
      { item: "Automated Suite 10 Runs", status: "pass", note: "CI/CD Integration Ready" }
    ],
    deliverables: [
      "iperf3_results.json (Raw)",
      "Python Automation Script",
      "Wireshark Captures (.pcapng)",
      "Performance Report (PDF)",
      "Lab Report"
    ]
  },
  15: {
    title: "Project Demonstration",
    description: "โครงงานบูรณาการ: ออกแบบ Topology, IP Plan, Config VLAN/Routing, TCP/UDP/API, Docker Services, Monitoring, Automation, iPerf3 Test, Nmap/UFW Security",
    objectives: [
      "บูรณาการทักษะทุกสัปดาห์สู่ระบบครบวงจรเดียว",
      "ออกแบบและนำเสนอ Architecture Diagram, IP Plan, HLD/LLD",
      "Demo End-to-End: User → Web → API → DB, Monitoring Visible, Automation Works",
      "Performance Test & Security Scan ผ่านเกณฑ์",
      "นำเสนอผลงาน: Slide, Live Demo, Q&A, Documentation Package"
    ],
    tools: ["All Tools"],
    steps: [
      {
        title: "1. Requirements & Design",
        details: "Use Case, Architecture (HLD/LLD), IP Plan, VLAN Plan, Security Zones, Bill of Materials"
      },
      {
        title: "2. Infrastructure Setup",
        details: "Packet Tracer Topology, VLAN/Routing Config, Firewall Policy, Device Hardening"
      },
      {
        title: "3. Application Development",
        details: "FastAPI Microservices, PostgreSQL, Redis, Docker Compose, CI/CD Pipeline"
      },
      {
        title: "4. Monitoring & Automation",
        details: "Prometheus/Grafana Dashboards, Netmiko Backup, Compliance Check, Alerting"
      },
      {
        title: "5. Testing & Validation",
        details: "iPerf3 Performance, Nmap Security Scan, UFW Verify, Chaos Engineering (Link Down)"
      },
      {
        title: "6. Final Presentation",
        details: "15-min Demo: Architecture → Live Traffic → Monitoring → Failover → Security → Q&A"
      }
    ],
    testRecords: [
      { item: "End-to-End Ping/Latency OK", status: "pass", note: "< 5ms LAN" },
      { item: "Web API Response < 200ms", status: "pass", note: "P95 150ms" },
      { item: "Monitoring All Green", status: "pass", note: "0 Active Alerts" },
      { item: "Automation Backup Verified", status: "pass", note: "Git Diff Clean" },
      { item: "Security Scan Pass", status: "pass", note: "No Critical/High" },
      { item: "Performance > 90% Target", status: "pass", note: "iPerf3 9.4 Gbps" },
      { item: "Documentation Complete", status: "pass", note: "HLD, LLD, IP Plan, Runbooks" }
    ],
    deliverables: [
      "Project Documentation Package (ZIP)",
      "Packet Tracer Final Topology",
      "Docker Compose Production Stack",
      "Grafana Dashboards Export",
      "Automation Scripts Repo",
      "Test Reports (Perf, Sec, Func)",
      "Presentation Slides (PDF)",
      "Video Demo (MP4)",
      "Final Report (PDF)"
    ]
  }
};

export default async function PracticalDetailPage({ params }) {
  const resolvedParams = await params;
  const n = parseInt(resolvedParams.n, 10);
  const practical = PRACTICALS.find((p) => p.n === n);
  const detail = PRACTICAL_DETAILS[n];

  if (!practical || !detail) {
    notFound();
  }

  const module = MODULES.find((m) => {
    const [start, end] = m.weeks.split("–").map(Number);
    return n >= start && n <= end;
  });

  return (
    <div className="course practical-detail">
      <Link href="/practical" className="back-link">
        ← กลับรายการปฏิบัติการ
      </Link>

      <header className="pr-header">
        <div className="pr-meta-top">
          <span className="pr-module">{module?.name || "Module"}</span>
          <span className="pr-week">เรื่องที่ {n}</span>
          <span className="pr-clo">{practical.clo}</span>
        </div>
        <h1>{detail.title}</h1>
        <p className="pr-desc">{detail.description}</p>
        <div className="pr-tools">
          {detail.tools.map((t, i) => (
            <span key={i} className="tool-tag">{t}</span>
          ))}
        </div>
      </header>

      <nav className="pr-toc">
        <h3>สารบัญ</h3>
        <ul>
          <li><a href="#objectives">วัตถุประสงค์</a></li>
          <li><a href="#tools">เครื่องมือ</a></li>
          <li><a href="#steps">ขั้นตอนการปฏิบัติการ</a></li>
          <li><a href="#test-records">บันทึกผลการทดสอบ</a></li>
          <li><a href="#deliverables">ส่งงาน</a></li>
        </ul>
      </nav>

      <section id="objectives" className="pr-section">
        <h2>วัตถุประสงค์</h2>
        <ul className="pr-list">
          {detail.objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </section>

      <section id="tools" className="pr-section">
        <h2>เครื่องมือที่ใช้</h2>
        <div className="pr-tools-grid">
          {detail.tools.map((t, i) => (
            <div key={i} className="tool-card">
              <b>{t}</b>
              <small>{TOOLS.find((x) => x.name === t)?.desc || ""}</small>
            </div>
          ))}
        </div>
      </section>

      <section id="steps" className="pr-section">
        <h2>ขั้นตอนการปฏิบัติการ</h2>
        <ol className="pr-steps">
          {detail.steps.map((step, i) => (
            <li key={i} className="pr-step">
              <h3>{step.title}</h3>
              <p>{step.details}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="test-records" className="pr-section">
        <h2>บันทึกผลการทดสอบ</h2>
        <div className="pr-table-wrap">
          <table className="pr-table">
            <thead>
              <tr>
                <th>รายการทดสอบ</th>
                <th>ผลลัพธ์</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {detail.testRecords.map((tr, i) => (
                <tr key={i} className={tr.status}>
                  <td>{tr.item}</td>
                  <td>
                    <span className={`status-badge ${tr.status}`}>
                      {tr.status === "pass" ? "ผ่าน" : tr.status === "fail" ? "ไม่ผ่าน" : "ข้าม"}
                    </span>
                  </td>
                  <td>{tr.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="deliverables" className="pr-section">
        <h2>ส่งงาน (Deliverables)</h2>
        <ul className="pr-deliverables">
          {detail.deliverables.map((d, i) => (
            <li key={i}>
              <input type="checkbox" id={`del-${n}-${i}`} />
              <label htmlFor={`del-${n}-${i}`}>{d}</label>
            </li>
          ))}
        </ul>
      </section>

      <footer className="pr-footer">
        <Link href="/practical" className="btn secondary">
          ← กลับรายการปฏิบัติการ
        </Link>
        {n < 15 && (
          <Link href={`/practical/${n + 1}`} className="btn primary">
            ปฏิบัติการถัดไป →
          </Link>
        )}
      </footer>
    </div>
  );
}