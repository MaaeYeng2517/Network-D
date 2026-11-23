// Per-week enrichment: images, worked examples, and Q&A.
// Merged into each week object in lib/course-data.js.

export const ENRICHMENT = {
  1: {
    images: [
      { src: "/img/switch.jpg", caption: "สวิตช์เครือข่าย — หัวใจของการเชื่อมต่อแบบ Star" },
      { src: "/img/router.jpg", caption: "เราเตอร์ — เชื่อมต่อระหว่างเครือข่ายต่าง ๆ" },
    ],
    examples: [
      {
        h: "ตัวอย่างที่ 1: เปรียบเทียบ Star กับ Mesh",
        p:
          "สมมติเครือข่ายมี 5 เครื่อง หากใช้ Star จำเป็นต้องมีสาย 4 เส้นและอุปกรณ์กลาง 1 ตัว " +
          "การเพิ่มเครื่องเสียเพียงต่อเข้าสวิตช์ แต่เมื่อสวิตช์ล่มทั้งเครือข่ายล่ม " +
          "หากใช้ Full Mesh จะต้องมีสาย 5×4/2 = 10 เส้น รับประกันความเสถียรแต่ค่าใช้จ่ายและความซับซ้อนเพิ่มขึ้น",
        code: "Star: 4 links, 1 switch   |   Full Mesh(5 nodes): 10 links",
      },
      {
        h: "ตัวอย่างที่ 2: ออกแบบ Topology 3 ชั้น",
        p:
          "องค์กร 200 ผู้ใช้ ออกแบบเป็น 3 ชั้น: Core switch ตรงกลาง, Distribution switch 2 ตัว, " +
          "Access switch 8 ตัว ผู้ใช้เชื่อม access layer ด้วย Uplink/Trunk ขึ้น distribution " +
          "และต่อ core ด้วย fiber เพื่อรองรับแบนด์วิดท์และความทนทาน (redundancy)",
        code: "Core — Distribution (x2) — Access (x8) — PC/AP",
      },
    ],
    qa: [
      { q: "Star topology มีข้อเสียหลักอะไร?", a: "อุปกรณ์กลาง (ฮับ/สวิตช์) เป็นจุดเสี่ยงเดี่ยว หากล่มแล้วเครือข่ายทั้งหมดล่ม" },
      { q: "Physical topology ต่างจาก Logical topology อย่างไร?", a: "Physical บรรยายการเชื่อมต่อจริง (สาย/ตำแหน่ง) ส่วน Logical บรรยายการไหลของข้อมูล เช่น token หรือ broadcast" },
      { q: "Broadcast domain คืออะไร?", a: "ขอบเขตที่สัญญาณ broadcast (เช่น ARP) ส่งไปถึงได้ การเปลี่ยน subnet หรือใช้ VLAN จะแยก broadcast domain" },
      { q: "ทำไมเอกสารเครือข่ายจึงสำคัญ?", a: "ช่วยให้ทีมเข้าใจผังและที่อยู่ IP ตรงกัน ลดเวลาแก้ไขปัญหา และง่ายต่อการตรวจสอบย้อนหลัง" },
    ],
  },

  2: {
    images: [{ src: "/img/server-net.jpg", caption: "เซิร์ฟเวอร์ที่ต้องการที่อยู่ IP คงที่และแผน Subnet ชัดเจน" }],
    examples: [
      {
        h: "ตัวอย่างที่ 1: คำนวณ 192.168.10.0/26",
        p:
          "/26 หมายถึง 32−26 = 6 บิตสำหรับ host จำนวน host = 2^6−2 = 62 ที่อยู่ " +
          "Network = 192.168.10.0, Broadcast = 192.168.10.63, ช่วง host ใช้งานได้ 192.168.10.1–192.168.10.62",
        code: "192.168.10.0/26  mask 255.255.255.192  hosts 62  bcast .63",
      },
      {
        h: "ตัวอย่างที่ 2: VLSM จัดสรรให้ถูกขนาด",
        p:
          "เครือข่าย 192.168.1.0/24 แบ่งให้ฝ่าย HR 60 เครื่อง → /26 (62 host), " +
          "ฝ่ายขาย 25 เครื่อง → /27 (30 host), ลิงก์ point-to-point 2 ปลายทาง → /30 (2 host) " +
          "การจัดตามลำดับจากใหญ่ไปเล็กช่วยลดการสิ้นเปลืองที่อยู่",
        code: "HR .0/26 (62) · Sales .64/27 (30) · WAN .128/30 (2)",
      },
    ],
    qa: [
      { q: "192.168.10.0/26 ให้จำนวน host ที่ใช้งานได้กี่เครื่อง?", a: "62 เครื่อง (2^6 − 2)" },
      { q: "Network address ของ 192.168.1.130/25 คืออะไร?", a: "192.168.1.128 เพราะ /25 แบ่งเป็นบล็อกละ 128 ที่อยู่" },
      { q: "ช่วง Private IP มีอะไร?", a: "10.0.0.0/8, 172.16.0.0/12 และ 192.168.0.0/16" },
      { q: "IPv6 สั้นได้อย่างไร?", a: "ใช้สัญลักษณ์ :: ย่อส่วนที่เป็น 0 ติดกันได้เพียงครั้งเดียวต่อที่อยู่" },
    ],
  },

  3: {
    images: [
      { src: "/img/user-lan.jpg", caption: "สาย UTP สำหรับเชื่อมเข้าสวิตช์ในชั้น Access" },
      { src: "/img/mgmt.jpg", caption: "สายสีสำหรับการเชื่อมต่อจัดการเครือข่าย" },
    ],
    examples: [
      {
        h: "ตัวอย่างที่ 1: ขั้นตอน ARP",
        p:
          "PC 192.168.1.10 ต้องการส่งไปยัง 192.168.1.20 จึงกระจาย ARP Request ถาม “ใครเป็น .20” " +
          "เครื่อง .20 ตอบด้วย ARP Reply พร้อม MAC ของตน แล้ว PC จึงสร้าง Ethernet frame ไปที่ MAC นั้น",
        code: "arp -a   →   192.168.1.20  aa:bb:cc:dd:ee:ff  eth0",
      },
      {
        h: "ตัวอย่างที่ 2: โครงสร้าง Ethernet Frame",
        p:
          "Frame ประกอบด้วย Destination MAC (6B), Source MAC (6B), EtherType (2B), Payload และ FCS (4B) " +
          "EtherType 0x0800 = IPv4, 0x86DD = IPv6 และ 0x0806 = ARP ช่วยให้เครื่องรับทราบว่าต้องส่งต่อให้ protocol ใด",
        code: "D-MAC | S-MAC | Type | Payload | FCS",
      },
    ],
    qa: [
      { q: "ARP ทำงานที่ชั้นใด?", a: "ทำงานที่รอยต่อระหว่าง L2 กับ L3 เพื่อแปลง IP เป็น MAC" },
      { q: "MAC address ยาวกี่บิต?", a: "48 บิต เขียนเป็น 12 หลัก hex แบ่งเป็น 6 อเวจ" },
      { q: "Switch ใช้ CAM/MAC table ทำอะไร?", a: "เก็บความสัมพันธ์ MAC ↔ <port> เพื่อส่ง frame ไปยังพอร์ตที่ถูกต้องแทน broadcast" },
      { q: "TCP 3-way handshake มีขั้นตอนใด?", a: "SYN → SYN-ACK → ACK" },
    ],
  },

  4: {
    images: [
      { src: "/img/switch.jpg", caption: "สวิตช์ที่กำหนด VLAN และ trunk port" },
      { src: "/img/uplink.jpg", caption: "สาย Uplink/Trunk พาข้อมูลหลาย VLAN พร้อม tag 802.1Q" },
    ],
    examples: [
      {
        h: "ตัวอย่างที่ 1: สร้าง VLAN 10/20 และกำหนด access port",
        p:
          "สร้าง VLAN แล้วผูก port เข้ากับ VLAN ผู้ใช้/ระบบ " +
          "แต่ละ VLAN มี subnet แยกกัน และต้องมี default gateway ต่างกัน",
        code: "vlan 10\n name USERS\nvlan 20\n name SERVERS\ninterface g0/1\n switchport mode access\n switchport access vlan 10",
      },
      {
        h: "ตัวอย่างที่ 2: กำหนด Trunk ระหว่างสวิตช์",
        p:
          "Trunk พาข้อมูลหลาย VLAN ผ่านเส้นเดียวโดยใส่ 802.1Q tag " +
          "native VLAN คือ VLAN ที่ไม่ถูก tag และควรกำหนดให้ตรงกันทั้งสองฝั่ง",
        code: "interface g0/2\n switchport mode trunk\n switchport trunk allowed vlan 10,20",
      },
    ],
    qa: [
      { q: "Trunk ต่างจาก Access port อย่างไร?", a: "Trunk พาหลาย VLAN พร้อม tag ส่วน access port อยู่ใน VLAN เดียวและไม่ tag" },
      { q: "802.1Q tag ใช้ทำอะไร?", a: "ฝัง VLAN ID 4 ไบต์ใน Ethernet frame เพื่อให้สวิตช์รู้ว่า frame นี้ของ VLAN ใด" },
      { q: "Native VLAN คืออะไร?", a: "VLAN ที่ frame จะไม่ถูก tag บน trunk และควรกำหนดให้ตรงกันทั้งสองฝั่งเพื่อความปลอดภัย" },
      { q: "ทำไมต้องแยก VLAN?", a: "แยก broadcast domain เพื่อลดทราฟฟิก เพิ่มความปลอดภัย และจัดการง่ายขึ้น" },
    ],
  },

  5: {
    images: [{ src: "/img/router.jpg", caption: "เราเตอร์สำหรับ Inter-VLAN routing และ OSPF" }],
    examples: [
      {
        h: "ตัวอย่างที่ 1: Router-on-a-stick",
        p:
          "ใช้ sub-interface บนเราเตอร์ตัวเดียวรองรับหลาย VLAN โดยแต่ละ sub-interface เป็น gateway ของ VLAN นั้น " +
          "ต้องเปิด trunk ฝั่งสวิตช์และกำหนด encapsulation 802.1Q บนเราเตอร์",
        code: "interface g0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0",
      },
      {
        h: "ตัวอย่างที่ 2: OSPF single area",
        p:
          "เปิด OSPF process แล้วประกาศ network ที่ต้องการให้อยู่ใน OSPF " +
          "OSPF คำนวณ cost จาก 10^8 / bandwidth และจะเลือกเส้นทาง shortest path",
        code: "router ospf 1\n network 192.168.10.0 0.0.0.255 area 0",
      },
    ],
    qa: [
      { q: "Inter-VLAN routing ทำได้กี้วิธี?", a: "3 วิธี: Router-on-a-stick, Layer-3 switch (SVI) และ Firewall/router แยก" },
      { q: "OSPF cost คำนวณจากอะไร?", a: "10^8 ÷ interface bandwidth (ถ้าไม่ปรับ reference bandwidth)" },
      { q: "Default route ใช้ทำอะไร?", a: "เป็นทางส่งทราฟฟิกที่ไม่มี route ที่ชัดเจน เช่น ออกอินเทอร์เน็ต" },
      { q: "เขียน default route อย่างไร?", a: "ip route 0.0.0.0 0.0.0.0 <next-hop-or-exit>" },
    ],
  },

  6: {
    images: [
      { src: "/img/cloud.jpg", caption: "บริการที่สื่อสารผ่าน TCP/UDP socket" },
      { src: "/img/server-net.jpg", caption: "เซิร์ฟเวอร์ไคลเอนต์แบบให้บริการต่อเนื่อง" },
    ],
    examples: [
      {
        h: "ตัวอย่างที่ 1: TCP Echo Server (Python)",
        p:
          "สร้าง socket, bind ที่ port, listen แล้ว accept ผู้ใช้รายเครื่อง " +
          "TCP รับประกันลำดับและความครบถ้วนของข้อมูล",
        code: "s=socket.socket(); s.bind(('0.0.0.0',9000)); s.listen()\nwhile True:\n c,a=s.accept(); c.sendall(b'hello'); c.close()",
      },
      {
        h: "ตัวอย่างที่ 2: UDP Client",
        p:
          "UDP ไม่มี handshake จึงเร็วและ overhead ต่ำ เหมาะกับ DNS, voice, video ที่ไม่ต้องการการรับประกันทุกแพ็กเก็ต",
        code: "s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)\ns.sendto(b'ping',('127.0.0.1',9000))",
      },
    ],
    qa: [
      { q: "TCP ต่างจาก UDP อย่างไร?", a: "TCP แบบ connection-oriented รับประกันลำดับและความครบถ้วน ส่วน UDP แบบ connectionless เร็วแต่ไม่รับประกัน" },
      { q: "Socket ประกอบด้วยอะไร?", a: "IP address + port number + protocol (TCP/UDP)" },
      { q: "Port 80/443/53 คืออะไร?", a: "HTTP / HTTPS / DNS ตามลำดับ" },
      { q: "ทำไม TCP ต้องใช้ 3-way handshake?", a: "เพื่อตกลงเลขลำดับ (sequence) และยืนยันว่าทั้งสองฝ่ายพร้อมรับข้อมูลก่อนส่งจริง" },
    ],
  },

  7: {
    images: [{ src: "/img/cloud.jpg", caption: "DNS และ REST API ทำงานผ่านเครือข่ายปลายทาง" }],
    examples: [
      {
        h: "ตัวอย่างที่ 1: สอบถาม DNS",
        p:
          "ใช้ dig หรือ nslookup ดู record ของโดเมน " +
          "A record แปลงชื่อเป็น IPv4, AAAA เป็น IPv6, CNAME เป็น alias และ MX ระบบเมล",
        code: "dig example.com A\nnslookup example.com 8.8.8.8",
      },
      {
        h: "ตัวอย่างที่ 2: เรียก REST API ด้วย curl",
        p:
          "REST ใช้ HTTP method บอกการกระทำ และ status code บอกผลลัพธ์ " +
          "GET อ่าน, POST สร้าง, PUT อัปเดต และ DELETE ลบ",
        code: "curl -X POST https://api.example.com/users \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"name\":\"somchai\"}'",
      },
    ],
    qa: [
      { q: "HTTP method 4 ตัวหลักคืออะไร?", a: "GET (อ่าน), POST (สร้าง), PUT/PATCH (อัปเดต), DELETE (ลบ)" },
      { q: "Status code 404 และ 500 หมายถึงอะไร?", a: "404 = ไม่พบทรัพยากร, 500 = เซิร์ฟเวอร์เกิดข้อผิดพลาดภายใน" },
      { q: "DNS ใช้พอร์ตใด?", a: "53 (TCP/UDP)" },
      { q: "DNS record ประเภทที่พบบ่อย?", a: "A, AAAA, CNAME, MX, NS, TXT, PTR" },
    ],
  },

  8: {
    images: [
      { src: "/img/server.jpg", caption: "เซิร์ฟเวอร์ Linux ที่ใช้งาน container" },
      { src: "/img/cloud.jpg", caption: "Container เชื่อมต่อกันผ่าน virtual network" },
    ],
    examples: [
      {
        h: "ตัวอย่างที่ 1: สร้างและต่อ docker network",
        p:
          "สร้างเครือข่ายแบบ bridge แล้วต่อ container เข้าด้วยกัน " +
          "container ใน network เดียวกันจะสื่อสารด้วยชื่อ (DNS) ได้โดยตรง",
        code: "docker network create appnet\ndocker run -d --name db --network appnet postgres\ndocker run -d --name web --network appnet nginx",
      },
      {
        h: "ตัวอย่างที่ 2: ตรวจสอบ network ใน Linux",
        p:
          "ดูที่อยู่ IP, routing table และการเชื่อมต่อด้วย ip/ifconfig " +
          "ใช้ ping และ traceroute ตรวจสอบความสามารถในการเข้าถึง",
        code: "ip addr show\nip route\nping -c 3 8.8.8.8",
      },
    ],
    qa: [
      { q: "Docker bridge ต่างจาก host network?", a: "Bridge ให้ container มี IP แยกและ NAT ออกไปนอก ส่วน host ใช้ network ของเครื่อง host โดยตรง" },
      { q: "ดูที่อยู่ IP ใน Linux ด้วยคำสั่งใด?", a: "ip addr show หรือ ifconfig" },
      { q: "NAT ในบริบท container ทำหน้าที่อะไร?", a: "แปลงที่อยู่ private ของ container ให้ออกอินเทอร์เน็ตได้ และซ่อนโครงสร้างภายใน" },
      { q: "ทำไมต้องแยก network ของ container?", a: "เพื่อควบคุมว่า container ใดสื่อสารกับใครได้ เพิ่มความปลอดภัยและลดทราฟฟิกไม่จำเป็น" },
    ],
  },

  9: {
    images: [{ src: "/img/server.jpg", caption: "สถาปัตยกรรม Web + Application + Database" }],
    examples: [
      {
        h: "ตัวอย่างที่ 1: ติดตั้งและรัน nginx",
        p:
          "Nginx ทำหน้าที่ web server และ reverse proxy ให้แอปพลิเคชัน " +
          "กำหนด virtual host และทดสอบด้วย curl เพื่อยืนยันการตอบรับ",
        code: "apt install -y nginx\nsystemctl enable --now nginx\ncurl -I http://localhost",
      },
      {
        h: "ตัวอย่างที่ 2: แอปเชื่อมฐานข้อมูล",
        p:
          "แอปพลิเคชันเชื่อม DB ผ่าน connection string " +
          "DB แยกเครื่องและไม่ควรเปิดให้ภายนอกโดยตรง เพื่อความปลอดภัย",
        code: "DB_HOST=db.internal DB_PORT=5432 DB_NAME=app",
      },
    ],
    qa: [
      { q: "Client-Server ต่างจาก P2P อย่างไร?", a: "Client-Server มีผู้ให้บริการส่วนกลาง ส่วน P2P แต่ละโหนดเป็นทั้งผู้ให้และผู้รับบริการ" },
      { q: "3-tier architecture มีอะไร?", a: "Presentation (Web) → Application (Logic) → Data (Database)" },
      { q: "ฐานข้อมูลใช้พอร์ตใด?", a: "MySQL 3306, PostgreSQL 5432, MongoDB 27017" },
      { q: "Load balancer ทำหน้าที่อะไร?", a: "กระจายคำขอไปยังเซิร์ฟเวอร์หลายตัวเพื่อรับภาระและเพิ่มความพร้อมใช้งาน" },
    ],
  },

  10: {
    images: [{ src: "/img/user-lan.jpg", caption: "การจับแพ็กเก็ตบนอินเทอร์เฟซจริง" }],
    examples: [
      {
        h: "ตัวอย่างที่ 1: จับแพ็กเก็ตด้วย tcpdump",
        p:
          "ระบุอินเทอร์เฟซและตัวกรอง BPF เพื่อจับเฉพาะทราฟฟิกที่สนใจ " +
          "ตัวเลือก -nn ทำให้ไม่ต้องแปลง hostname และพอร์ต",
        code: "tcpdump -i eth0 -nn port 80\ntcpdump -i eth0 -nn 'tcp and host 10.0.0.5'",
      },
      {
        h: "ตัวอย่างที่ 2: สร้างแพ็กเก็ตด้วย Scapy",
        p:
          "Scapy ช่วยสร้างและวิเคราะห์แพ็กเก็ตได้ในเชิงลึก " +
          "เหมาะกับการทดสอบเครือข่ายและการเรียนรู้ protocol",
        code: "from scapy.all import *\nsend(IP(dst='8.8.8.8')/ICMP(), count=3)",
      },
    ],
    qa: [
      { q: "tcpdump ใช้ตัวกรองแบบใด?", a: "BPF (Berkeley Packet Filter) เช่น port 80, host 10.0.0.1, tcp" },
      { q: "Promiscuous mode คืออะไร?", a: "โหมดที่ NIC รับแพ็กเก็ตทุกแพ็กเก็ตในเครือข่าย ไม่ใช่แค่ที่มีปลายทางคือเรา" },
      { q: "ทำไมต้องจับแพ็กเก็ต?", a: "เพื่อวิเคราะห์ปัญหาเครือข่าย ตรวจสอบพฤติกรรม protocol และหาสาเหตุของ latency หรือ packet loss" },
      { q: "Wireshark display filter ยกตัวอย่าง?", a: "ip.addr==10.0.0.5 && tcp.port==443" },
    ],
  },

  11: {
    images: [
      { src: "/img/server.jpg", caption: "ระบบติดตามผลและตรวจวัดเครือข่าย" },
      { src: "/img/switch.jpg", caption: "อุปกรณ์ที่รายงานสถานะผ่าน SNMP" },
    ],
    examples: [
      {
        h: "ตัวอย่างที่ 1: วัด latency และ throughput",
        p:
          "ใช้ ping วัด RTT และ iperf3 วัด throughput " +
          "การเก็บค่าซ้ำ ๆ ช่วยสร้าง baseline และเปรียบเทียบเมื่อมีปัญหา",
        code: "ping -c 20 8.8.8.8\niperf3 -c 10.0.0.5 -t 10",
      },
      {
        h: "ตัวอย่างที่ 2: เก็บข้อมูลอุปกรณ์ด้วย SNMP",
        p:
          "SNMP ใช้พอร์ต 161 เก็บ OID ของอุปกรณ์ เช่น อุณหภูมิ จำนวนพอร์ตที่ใช้งาน " +
          "แล้วนำไปแสดงผลกราฟด้วย Grafana",
        code: "snmpwalk -v2c -c public 10.0.0.1 1.3.6.1.2.1.2",
      },
    ],
    qa: [
      { q: "SNMP ใช้พอร์ตใด?", a: "161 (และ trap ที่ 162)" },
      { q: "KPI หลักของเครือข่ายมีอะไร?", a: "Latency, Jitter, Packet loss, Throughput, Availability" },
      { q: "Prometheus กับ Grafana ต่างกันอย่างไร?", a: "Prometheus เก็บและดึงข้อมูล (time-series) ส่วน Grafana นำข้อมูลมาแสดงเป็นกราฟ/แดชบอร์ด" },
      { q: "Baseline คืออะไรและทำไมจำเป็น?", a: "ค่าปกติของระบบในสภาวะปกติ ใช้เป็นจุดอ้างอิงเพื่อบอกว่ามีอะไรผิดปกติเมื่อเกิดปัญหา" },
    ],
  },

  12: {
    images: [
      { src: "/img/switch.jpg", caption: "การจัดการอุปกรณ์หลายตัวผ่านสคริปต์" },
      { src: "/img/console.jpg", caption: "สาย console สำหรับตั้งค่าและกู้คืนอุปกรณ์" },
    ],
    examples: [
      {
        h: "ตัวอย่างที่ 1: เชื่อมอุปกรณ์ด้วย SSH อัตโนมัติ",
        p:
          "ใช้ SSH key แทนรหัสผ่านเพื่อความปลอดภัย " +
          "จากนั้นเรียกใช้คำสั่งหลายอุปกรณ์ซ้ำ ๆ ได้ด้วยสคริปต์",
        code: "ssh -i ~/.ssh/id_ed25519 admin@10.0.0.1 'show version'",
      },
      {
        h: "ตัวอย่างที่ 2: อัตโนมัติด้วย Python (Netmiko)",
        p:
          "อ่านรายการอุปกรณ์จากไฟล์ ค่อยเชื่อมและส่งคำสั่งเหมือนกันทุกตัว " +
          "ลดความผิดพลาดจากการพิมพ์ซ้ำและเพิ่มความสม่ำเสมอ",
        code: "from netmiko import ConnectHandler\nfor ip in devices:\n  net=ConnectHandler(ip=ip, device_type='cisco_ios', ...)\n  print(net.send_command('show ip int brief'))",
      },
    ],
    qa: [
      { q: "Ansible ใช้ protocol ใดในการเชื่อม?", a: "SSH เป็นหลัก (และ WinRM สำหรับ Windows)" },
      { q: "Infrastructure as Code (IaC) คืออะไร?", a: "การนิยามและจัดการระบบด้วยข้อความ/โค้ด แทนการตั้งค่าด้วยมือ" },
      { q: "ข้อดีของการ automate เครือข่าย?", a: "เร็ว สม่ำเสมอ ลดความผิดพลาด และตรวจสอบย้อนหลังได้ง่าย" },
      { q: "ความเสี่ยงที่ต้องระวัง?", a: "คำสั่งผิดอาจกระทบหลายอุปกรณ์พร้อมกัน จึงควรทดสอบใน lab และ backup ก่อนเสมอ" },
    ],
  },

  13: {
    images: [{ src: "/img/firewall.jpg", caption: "ไฟร์วอลล์กรองทราฟฟิกตามนโยบาย ACL" }],
    examples: [
      {
        h: "ตัวอย่างที่ 1: เขียน ACL จำกัดการเข้าถึง",
        p:
          "Extended ACL กำหนดได้ทั้ง protocol, แหล่ง และปลายทาง " +
          "ควรใช้หลัก least privilege คืออนุญาตเฉพาะที่จำเป็น",
        code: "access-list 110 permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.10 eq 443\naccess-list 110 deny ip any any",
      },
      {
        h: "ตัวอย่างที่ 2: สแกนช่องโหว่ด้วย nmap",
        p:
          "nmap ช่วยสำรวจพอร์ตและบริการที่เปิดอยู่ " +
          "ใช้ -sV ตรวจสอบเวอร์ชันบริการ และ -sS ทำ SYN scan อย่างเร็ว",
        code: "nmap -sS -sV 10.0.0.0/24\nnmap -p 1-1000 10.0.0.10",
      },
    ],
    qa: [
      { q: "Standard ACL ต่างจาก Extended ACL?", a: "Standard กรองตาม source IP เท่านั้น ส่วน Extended กรองได้ตาม protocol, source, destination และ port" },
      { q: "Stateful ต่างจาก Stateless firewall?", a: "Stateful จำสถานะการเชื่อมต่อ (connection state) ส่วน Stateless ดูที่แพ็กเก็ตแยกชิ้น" },
      { q: "nmap -sS คืออะไร?", a: "SYN scan (half-open) ส่ง SYN แล้วไม่ทำ handshake ให้จบ ทำให้รวดเร็วและไม่เปิดเต็มรูปแบบ" },
      { q: "Least privilege หมายถึงอะไร?", a: "ให้สิทธิ์น้อยที่สุดเท่าที่จำเป็นต่อการทำงาน เพื่อลดพื้นที่โจมตี" },
    ],
  },

  14: {
    images: [
      { src: "/img/uplink.jpg", caption: "การวัดประสิทธิภาพของลิงก์และอุปกรณ์" },
      { src: "/img/user-lan.jpg", caption: "ทราฟฟิกผู้ใช้ส่งผลต่อ latency และ throughput" },
    ],
    examples: [
      {
        h: "ตัวอย่างที่ 1: ทดสอบ throughput ด้วย iperf3",
        p:
          "รัน server ฝั่งหนึ่งและ client อีกฝั่งเพื่อวัดอัตราการส่งข้อมูลจริง " +
          "ทดสอบทั้ง TCP และ UDP และปรับจำนวน stream เพื่อดูความสามารถ",
        code: "iperf3 -s\niperf3 -c 10.0.0.5 -t 15 -P 4",
      },
      {
        h: "ตัวอย่างที่ 2: วิเคราะห์ค่าที่ได้",
        p:
          "หาก throughput ต่ำกว่า bandwidth ที่ควรจะเป็น ให้ตรวจ duplex mismatch, CRC error, congestion หรือ MTU " +
          "และวัด latency ด้วย ping เพื่อแยกปัญหาระหว่างความหน่วงและความจุ",
        code: "ping -c 20 10.0.0.5   # ดู RTT และ packet loss",
      },
    ],
    qa: [
      { q: "Throughput ต่างจาก Bandwidth อย่างไร?", a: "Bandwidth คือความจุทฤษฎีสูงสุดของลิงก์ ส่วน Throughput คืออัตราการส่งจริงที่ได้รับ" },
      { q: "Latency ต่างจาก Jitter อย่างไร?", a: "Latency คือความหน่วงรวมในการไปถึง, Jitter คือความแปรปรวนของ latency ระหว่างแพ็กเก็ต" },
      { q: "วิธีลด congestion?", a: "เพิ่มความจุ, ใช้ QoS จัดลำดับความสำคัญ, บีบอัดข้อมูล หรือกระจายภาระ" },
      { q: "MTU มาตรฐานของ Ethernet คือเท่าไร?", a: "1500 ไบต์ (ไม่รวม header)" },
    ],
  },

  15: {
    images: [
      { src: "/img/firewall.jpg", caption: "องค์ประกอบด้านความปลอดภัยของโครงงาน" },
      { src: "/img/router.jpg", caption: "การรัวต์และการเชื่อมต่อ WAN" },
      { src: "/img/switch.jpg", caption: "การจัดการ VLAN และการเชื่อมต่อภายใน" },
      { src: "/img/server.jpg", caption: "ผู้ให้บริการปลายทางของโครงงาน" },
      { src: "/img/ap.jpg", caption: "การเชื่อมต่อไร้สายสำหรับผู้ใช้" },
    ],
    examples: [
      {
        h: "ตัวอย่างที่ 1: โครงร่างโครงงานองค์กร",
        p:
          "ออกแบบเครือข่ายองค์กรย่อย: WAN ผ่าน firewall → router → core switch → access switch → PC/AP " +
          "แยก VLAN ผู้ใช้/ระบบ/จัดการ กำหนด DHCP และแผน IP ให้ครบ พร้อมเอกสารผัง",
        code: "ISP — Firewall — Router — Core — Access — {PC, AP, Server}",
      },
      {
        h: "ตัวอย่างที่ 2: เช็กลิสต์ก่อนส่งโครงงาน",
        p:
          "ตรวจสอบการเชื่อมต่อ, IP/subnet, VLAN, การรัวต์, ความปลอดภัย, การใช้งาน " +
          "และเอกสาร (ผัง + ตาราง IP) ให้ครบถ้วน พร้อมสาธิตการทำงานแบบบูรณาการ",
        code: "✓ connectivity  ✓ IP plan  ✓ VLAN/trunk  ✓ routing\n✓ ACL/security  ✓ monitoring  ✓ documentation",
      },
    ],
    qa: [
      { q: "โครงงานต้องนำเสนออะไรบ้าง?", a: "ผังเครือข่าย แผน IP/VLAN การรัวต์ ความปลอดภัย และการสาธิตการทำงานจริง" },
      { q: "เกณฑ์ประเมินโครงงานเน้นอะไร?", a: "ความถูกต้องทางเทคนิค ความครบถ้วนของเอกสาร และความสามารถในการแก้ปัญหา" },
      { q: "ทักษะที่ต้องรวมในโครงงาน?", a: "ออกแบบ topology, subnetting, VLAN/trunk, routing, ACL, monitoring และ automation" },
      { q: "การทดสอบระบบแบบบูรณาการทำอย่างไร?", a: "ทดสอบการเชื่อมต่อปลายทางถึงปลายทาง, ตรวจสอบการเข้าถึงบริการ และจำลองเงื่อนไขความล้มเหลว" },
    ],
  },

  16: {
    images: [],
    examples: [
      {
        h: "ตัวอย่างโจทย์ข้อสอบ (ทฤษฎี)",
        p:
          "โจทย์: เครือข่าย 172.16.0.0/22 ต้องการแบ่งเป็น 4 subnet " +
          "ให้ตอบคำถาม: จำนวน host ต่อ subnet, network/broadcast แรก–สุดท้าย และเขียนแผน IP ทั้งหมด",
        code: "172.16.0.0/22 → 4 × /24 : 172.16.0.0, .1.0, .2.0, .3.0 (254 host/ตัว)",
      },
      {
        h: "ตัวอย่างแนวคำตอบ (Practical)",
        p:
          "โจทย์: ให้จัด VLAN 10/20, กำหนด trunk, รัวต์ระหว่าง VLAN และตั้ง ACL อนุญาตเฉพาะ subnet ที่กำหนด " +
          "แนวคำตอบ: สร้าง VLAN → ผูก access port → ตั้ง trunk → สร้าง SVI/sub-interface → เขียน ACL → ทดสอบ ping",
        code: "vlan → trunk → SVI → ACL → verify",
      },
    ],
    qa: [
      { q: "ข้อสอบมีกี่ส่วนและคะแนนเท่าไร?", a: "ทฤษฎี 50 คะแนน และ Practical 50 คะแนน รวม 100" },
      { q: "เวลาสอบและข้อสอบครอบคลุมเนื้อหาใด?", a: "120 นาที ครอบคลุมเนื้อหาสัปดาห์ 1–15" },
      { q: "เนื้อหาส่วนใดมักถูกออกเป็นข้อสอบ?", a: "Subnetting/VLSM, VLAN & Trunk, Routing, ACL, TCP/IP และการอ่านผล capture" },
      { q: "ควรเตรียมตัวก่อนสอบอย่างไร?", a: "ทบทวน command สำคัญ ทำ lab ซ้ำ และฝึกอธิบายเหตุผลของคำตอบ" },
    ],
  },
};