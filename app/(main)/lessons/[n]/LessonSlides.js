"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Figure from "@/components/Figure";

const SECTION_IMAGES = {
  // Week 0 - Pre-lesson
  "ความหมายของระบบเครือข่ายคอมพิวเตอร์": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "เครือข่ายคอมพิวเตอร์เชื่อมต่อโลก", description: "เครือข่ายคอมพิวเตอร์ (Computer Network) คือ การเชื่อมต่อระหว่างคอมพิวเตอร์ 2 เครื่องขึ้นไป เพื่อแลกเปลี่ยนข้อมูลและทรัพยากร เช่น ไฟล์ พิมพ์เตอร์ อินเทอร์เน็ต เป้าหมายหลักคือ Resource Sharing และ Communication" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "LAN, WAN, MAN, PAN โครงสร้างเครือข่าย", description: "แบ่งตามขอบเขตพื้นที่: LAN (Local Area Network) ครอบคลุมอาคาร/ห้อง, WAN (Wide Area Network) เชื่อมระยะไกลข้ามประเทศ, MAN (Metropolitan Area Network) ครอบคลุมเมือง, PAN (Personal Area Network) ระยะใกล้รอบตัว เช่น Bluetooth" },
  ],
  "องค์ประกอบหลัก 5 ประการของเครือข่าย": [
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "โครงสร้าง 5 องค์ประกอบ: ข้อมูล ผู้ส่ง ผู้รับ สื่อ โปรโตคอล", description: "5 องค์ประกอบที่ครบถ้วน: 1) ข้อความ/ข้อมูล (Message/Data) - ข้อมูลที่ส่ง เช่น ข้อความ รูป วิดีโอ 2) ผู้ส่ง (Sender/Source) - อุปกรณ์สร้างข้อมูล เช่น PC เซิร์ฟเวอร์ 3) ผู้รับ (Receiver/Destination) - อุปกรณ์รับข้อมูล 4) สื่อการส่ง (Transmission Medium) - ทางส่ง เช่น สาย UTP ใยแก้ว ไร้สาย 5) โปรโตคอล (Protocol) - กฎระเบียบ เช่น TCP/IP HTTP Ethernet" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Data Flow ในเครือข่าย", description: "กระบวนการส่งข้อมูล: Sender สร้างข้อมูล → Encapsulation เพิ่ม Header ทุกชั้น → ส่งผ่าน Medium → Receiver รับ → Decapsulation ถอด Header → ได้ข้อมูลต้นฉบับ" },
  ],
  "อุปกรณ์เครือข่ายหลักและหน้าที่": [
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Router, Switch, Access Point, Firewall", description: "อุปกรณ์กลาง (Intermediary Devices): Switch เชื่อมอุปกรณ์ใน LAN เดียวกัน ส่ง Frame ตาม MAC (L2), Router ร่วมต่อเครือข่ายต่างกัน ส่ง Packet ตาม IP (L3), Access Point จุดเชื่อม Wi-Fi เข้าสู่เครือข่ายสาย, Firewall กรองทราฟฟิกตามนโยบายความปลอดภัย" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "End Devices และ Network Devices", description: "End Devices (อุปกรณ์ปลายทาง): PC, Laptop, Server, Printer, IP Phone, IoT - เป็นต้นทาง/ปลายทางข้อมูล, Network Devices: Switch, Router, AP, Firewall, Modem - ทำหน้าที่ส่งต่อ จำลอง จัดการทราฟฟิก" },
    { src: "https://images.unsplash.com/photo-1558655146-9f40138eddee?w=1200&q=80", caption: "Modem และการเชื่อมต่อ ISP", description: "Modem (Modulator-Demodulator) แปลงสัญญาณดิจิทัล ↔ อนาล็อก เพื่อเชื่อมต่อกับ ISP ผ่านสายโทรศัพท์/เคเบิล/ไฟเบอร์ เป็นประตูทางเข้าสู่อินเทอร์เน็ต" },
  ],
  "สื่อนำสัญญาณ (Transmission Media)": [
    { src: "https://images.unsplash.com/photo-1558655146-9f40138eddee?w=1200&q=80", caption: "Twisted Pair UTP Cat5e Cat6 Cat6A", description: "สายคู่บิด (Twisted Pair) แบ่ง UTP (Unshielded) และ STP (Shielded) มาตรฐาน Cat5e (1 Gbps), Cat6 (1-10 Gbps), Cat6A (10 Gbps) ราคาถูก ติดตั้งง่าย ใช้ใน LAN มากที่สุด" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Fiber Optic Single-mode Multi-mode", description: "ใยแก้ว (Fiber Optic) ส่งแสง: Single-mode (SMF) แกนน้อย ระยะไกล 10-100+ km ใช้ WAN/Backbone, Multi-mode (MMF) แกนกว้าง ระยะสั้น 300-550 m ใช้ LAN/Data Center ความเร็วสูง ไม่รบกวน EMI" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Coaxial Cable และ Wireless", description: "สายโคแอกเชียล (Coaxial) RG-6 RG-59 ใช้ Cable TV CCTV Broadband แบบเก่า, ไร้สาย (Wireless) Wi-Fi 802.11, Bluetooth, Cellular 4G/5G, Satellite - สะดวก ไม่ต้องสาย แต่มีแสงแดด EMI รบกวน" },
  ],
  "โปรโตคอลเครือข่ายและโมเดลมาตรฐาน": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "โมเดล OSI 7 ชั้น", description: "OSI Model (Open Systems Interconnection) 7 ชั้น: 1 Physical (สัญญาณ/สาย), 2 Data Link (Frame/MAC), 3 Network (Packet/IP), 4 Transport (Segment/TCP-UDP), 5 Session (เซสชัน), 6 Presentation (เข้ารหัส/บีบอัด), 7 Application (HTTP/DNS/DHCP)" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "โมเดล TCP/IP 4 ชั้น", description: "TCP/IP Model ใช้งานจริงในอินเทอร์เน็ต 4 ชั้น: 1 Network Access (Physical+Data Link), 2 Internet (IP/ICMP), 3 Transport (TCP/UDP), 4 Application (HTTP/DNS/SMTP) - เรียบง่ายกว่า OSI" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Encapsulation และ Decapsulation", description: "Encapsulation: ห่อหุ้มข้อมูลเพิ่ม Header (และ Trailer) ทุกชั้นเมื่อส่งลง, Decapsulation: ถอด Header เมื่อรับขึ้น Header แต่ละชั้น: L2=Frame Header+FCS, L3=IP Header, L4=TCP/UDP Header" },
  ],

  // Week 1 - Network Architecture & Topology
  "องค์ประกอบและสถาปัตยกรรมเครือข่าย": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "Client-Server Architecture", description: "Client-Server: เซิร์ฟเวอร์ให้บริการรวมกลาง (Web, DNS, DHCP, File, Database) ไคลเอนต์ขอบริการ เน้นการควบคุม ศูนย์กลาง ความปลอดภัย และการจัดการง่าย" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Peer-to-Peer และ Distributed/Cloud", description: "P2P: อุปกรณ์ทุกตัวทำหน้าที่ทั้ง Client และ Server แบบกระจาย ไม่มีจุดศูนย์กลาง, Distributed/Cloud: รวมทรัพยากรหลายที่ ไม่ขึ้นกับฮาร์ดแวร์ตัวเดียว ความพร้อมใช้งานสูง ขยายได้" },
  ],
  "รูปแบบ Topology": [
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Bus, Star, Ring, Mesh, Tree, Hybrid Topology", description: "Physical Topology: Bus (สายหลักเดียว, ถูกแตกชนง่าย), Star (จุดกลาง Switch/Hub, จุดเดียวเสี่ยงแต่แก้ง่าย), Ring (วงกลม Token passing), Mesh (เชื่อมทุกคู่ เสถียรสูง แพง), Tree (Hierarchical Star+Bus), Hybrid (ผสมผสาน)" },
    { src: "https://images.unsplash.com/photo-1558655146-9f40138eddee?w=1200&q=80", caption: "Physical vs Logical Topology", description: "Physical: การต่อสายจริง, Logical: การไหลของสัญญาณ/ข้อมูล เช่น Ethernet ใช้สาย Star แต่ Logical เป็น Bus (Shared medium), Wi-Fi Physical เป็น Star (AP) แต่ Logical เป็น Bus (CSMA/CA)" },
  ],
  "การออกแบบและเอกสารเครือข่าย": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "Packet Tracer Network Simulation", description: "Cisco Packet Tracer จำลองอุปกรณ์ Router Switch PC ทดสอบการเชื่อมต่อ Ping Traceroute ตรวจสอบ Routing Table CDP Neighbors ก่อนติดตั้งจริง" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Draw.io Network Diagram", description: "Draw.io (diagrams.net) วาดผัง Topology ใส่ป้ายชื่ออุปกรณ์ IP Address Interface VLAN ใช้สัญลักษณ์มาตรฐาน Cisco ส่งออกเป็น PNG/PDF/SVG สำหรับเอกสาร" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "IP Planning และ Device Inventory", description: "จัดทำแผน IP Address: Subnet สำหรับแต่ละแผนก/ชั้น Gateway DNS DHCP Scope สร้าง Device Inventory: Hostname, IP, MAC, Location, Role, OS, Firmware เพื่อบริหารจัดการ" },
  ],

  // Week 2 - IP Addressing & Subnetting
  "ที่อยู่ IP และการเข้ารหัส": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "IPv4 32-bit Structure และ Octet", description: "IPv4 = 32 บิต แบ่ง 4 Octet (8 บิต/อเวจ) เขียนแบบ Dotted Decimal เช่น 192.168.1.10 แต่ละอเวจ 0-255 Private Range: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "IPv6 128-bit Hex Notation", description: "IPv6 = 128 บิต เขียน Hex 8 กลุ่ม คั่นด้วย : เช่น 2001:0db8:85a3:0000:0000:8a2e:0370:7334 ย่อได้ด้วย :: แทนศูนย์ซ้ำ รองรับอุปกรณ์มหาศาล ไม่ต้อง NAT" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Private vs Public IP Ranges", description: "Private IP ใช้ในองค์กร (RFC 1918) ไม่เส้นทางในอินเทอร์เน็ต ต้อง NAT, Public IP จดทะเบียน IANA/RIR เส้นทางในอินเทอร์เน็ตได้ ต้องซื้อ/ขอจาก ISP" },
  ],
  "Subnetting และ CIDR": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "Subnet Mask และ CIDR Notation", description: "Subnet Mask แยก Network/Host เช่น 255.255.255.0 = /24 CIDR: /prefix-length บอกจำนวนบิต Network 2^(32-prefix) = จำนวน IP ทั้ง subnet Usable Host = 2^(32-prefix) - 2" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Network, Broadcast, Host Range Calculation", description: "Network Address = IP AND Mask (บิตสุดท้ายเป็น 0), Broadcast = IP OR ~Mask (บิตสุดท้ายเป็น 1), Host Range = Network+1 ถึง Broadcast-1 เช่น 192.168.1.10/28 → Net=192.168.1.0, Bcast=192.168.1.15, Host=1-14" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "VLSM Variable Length Subnet Mask", description: "VLSM ใช้ Mask ความยาวต่างกันในเครือข่ายเดียวกัน แบ่ง Subnet ใหญ่เป็น Subnet ย่อยตามขนาดจริง ประหยัด IP เช่น /24 แบ่งเป็น /26 (62 host), /27 (30 host), /28 (14 host), /30 (2 host สำหรับ Point-to-Point)" },
  ],
  "การออกแบบแผน IP": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "IP Address Planning Strategy", description: "หลักการ: 1) เรียง Subnet ตามขนาด Host มาก→น้อย 2) จองพื้นที่ขยาย (Growth) 3) แยกตามหน่วยงาน/ชั้น/โซนความปลอดภัย 4) ใช้ Private Range ให้พอดี 5) Document ทุกการมอบหมาย" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "ipcalc และ Subnet Calculator Tools", description: "เครื่องมือคำนวณ: ipcalc (Linux CLI) python3 -c 'import ipaddress; print(ipaddress.IPv4Network(\"192.168.1.0/24\"))' หรือเว็บ subnetcalculator.com ให้ Network, Broadcast, Host Range, Wildcard Mask, Binary" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Gateway, DNS, DHCP Configuration", description: "Gateway = IP แรกหรือสุดท้ายของ Subnet (เช่น .1 หรือ .254), DNS: 8.8.8.8 1.1.1.1 หรือ Internal DNS, DHCP: Scope (Range), Lease Time, Option 3=Gateway, Option 6=DNS, Option 15=Domain, Reservation สำหรับ Server/Printer" },
  ],

  // Week 3 - Ethernet, MAC, ARP, TCP/IP Analysis
  "Ethernet และ MAC Address": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "Ethernet Frame Structure IEEE 802.3", description: "Ethernet Frame: Preamble(7B) + SFD(1B) + Dest MAC(6B) + Src MAC(6B) + EtherType/Length(2B) + Payload(46-1500B) + FCS(4B CRC) = Min 64B Max 1518B (untagged)" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "MAC Address 48-bit OUI และ NIC", description: "MAC 48 บิต (6 ไบต์) เขียน Hex คั่น : หรือ - เช่น aa:bb:cc:dd:ee:ff 3 ไบต์แรก = OUI (ผู้ผลิต) 3 ไบต์ท้าย = Serial NIC Unicast/Broadcast(ff:ff:ff:ff:ff:ff)/Multicast(01:00:5e...)" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "MTU 1500 bytes และ Jumbo Frames", description: "MTU (Maximum Transmission Unit) Ethernet มาตรฐาน 1500 ไบต์ Payload Jumbo Frames 9000+ ไบต์ ใช้ใน Data Center/Storage ลด Overhead CPU แต่ต้องรองรับ End-to-End" },
  ],
  "ARP และ Address Resolution": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "ARP Request Broadcast และ ARP Reply", description: "ARP: ส่ง Broadcast 'Who has IP? Tell me' ผู้มี IP ตอบ Unicast 'IP is at MAC' เก็บใน ARP Cache (timeout ~5-20 นาที) ใช้ใน L2 เพื่อส่ง Frame" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "ARP Cache Table และ Aging Timer", description: "ARP Cache: ตาราง IP↔MAC บน Host/Switch ใช้คำสั่ง 'ip neigh show' (Linux) หรือ 'show ip arp' (Cisco) Aging: ลบ Entry เก่าออกเองป้องกัน Stale Entry รองรับ Gratuitous ARP อัปเดต MAC ใหม่" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Gratuitous ARP และ Proxy ARP", description: "Gratuitous ARP: ส่ง ARP Reply เองโดยไม่มี Request (เปลี่ยน IP/MAC, Failover, Detect Duplicate), Proxy ARP: Router ตอบ ARP แทน Host อีกฝั่ง (ใช้ได้แต่ไม่แนะนำ ปิดด้วย 'no ip proxy-arp')" },
  ],
  "การวิเคราะห์แพ็กเก็ตด้วย Wireshark": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "Wireshark Packet Capture Interface", description: "Wireshark: GUI Capture/Analyze packets เริ่ม Capture บน Interface ใส่ Capture Filter (BPF syntax) เช่น 'port 80' แล้วเริ่มจับ Stop ได้ Packet List + Packet Details + Packet Bytes" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Display Filters: arp, tcp, http, dns", description: "Display Filter (ไม่ใช่ Capture Filter) ใช้หลังจับแล้ว: 'arp', 'tcp.port==80', 'http', 'dns', 'ip.addr==192.168.1.1', 'tcp.flags.syn==1', 'frame contains error' รองรับ Operators และ Logic" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Packet Details Pane - All Layers", description: "Packet Details แสดงโครงสร้างชั้นๆ: Frame (L2) → Ethernet II → IP (L3) → TCP/UDP (L4) → HTTP/DNS (L7) ขยายแต่ละชั้นดู Header Fields คลิก Field จะ Highlight ใน Packet Bytes" },
  ],

  // Week 4 - VLAN & Trunk Configuration
  "VLAN พื้นฐาน": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "VLAN Logical Segmentation", description: "VLAN (Virtual LAN) แบ่ง Switch ตัวเดียวเป็นหลาย Broadcast Domain แยก Logical ไม่ต้องซื้อ Switch เพิ่ม แต่ละ VLAN ต้องมี IP Subnet ต่างกัน สื่อสารระหว่าง VLAN ต้องผ่าน Router/L3 Switch" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Broadcast Domain Isolation", description: "Broadcast (ARP, DHCP, NetBIOS) อยู่ใน VLAN เดียวเท่านั้น ไม่ข้าม VLAN ลด Traffic Broadcast Storm เพิ่ม Security แยกแผนก HR/IT/Finance" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "VLAN ID 1-4094 และ VLAN Database", description: "VLAN ID: 1-4094 (12-bit) VLAN 1 = Default/Native (ไม่ลบได้) 1002-1005 = Reserved (Token Ring/FDDI) Extended Range 1006-4094 ต้อง VTP Transparent Mode VLAN Database เก็บใน vlan.dat" },
  ],
  "Trunk และ 802.1Q": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "802.1Q Tag 4-byte Field", description: "802.1Q Tag 4 ไบต์ระหว่าง Src MAC และ EtherType: TPID(0x8100 2B) + TCI(2B: PCP 3b + DEI 1b + VLAN ID 12b) Switch เพิ่ม Tag เมื่อออก Trunk ถอด Tag เมื่อออก Access" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Native VLAN และ Untagged Traffic", description: "Native VLAN = VLAN ที่ไม่ Tag บน Trunk (Default VLAN 1) ใช้สำหรับ Untagged Traffic ทั้งสองข้างต้องตรงกัน มิฉะนั้น VLAN Hopping Attack ควรเปลี่ยน Native VLAN เป็น Unused ID เช่น 999" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Access Port vs Trunk Port", description: "Access Port: เหมาะกับ End Device (PC, Printer) 1 VLAN ไม่ Tag, Trunk Port: เชื่อม Switch-Switch หรือ Switch-Router หลาย VLAN Tag ทั้งหมด (ยกเว้น Native) คำสั่ง: 'switchport mode access/trunk'" },
  ],
  "การกำหนดค่าและทดสอบ": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "Cisco Switch VLAN Configuration CLI", description: "CLI: 'vlan 10', 'name HR', 'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'interface fa0/24', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20,30' verify: 'show vlan brief'" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "show vlan brief และ show interfaces trunk", description: "'show vlan brief' แสดง VLAN ID, Name, Status, Ports member, 'show interfaces trunk' แสดง Trunk Ports, Allowed VLANs, Native VLAN, Pruning eligible ตรวจสอบ Config ถูกต้อง" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Inter-VLAN Connectivity Test", description: "ทดสอบ: PC ใน VLAN 10 ping PC ใน VLAN 20 ผ่าน Router/L3 Switch ต้องมี Gateway ถูกต้อง Traceroute ดู Path MTU Ping Size DF-bit ตรวจสอบ Fragmentation" },
  ],

  // Week 5 - Inter-VLAN, Static Routing & OSPF
  "Inter-VLAN Routing": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "Router-on-a-Stick Sub-interfaces", description: "Router-on-a-Stick: Router 1 Port ต่อ Trunk สร้าง Sub-interface ต่อ VLAN: 'int g0/0.10', 'encapsulation dot1Q 10', 'ip address 192.168.10.1 255.255.255.0' ใช้ CPU Router ทั้งหมด" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Layer-3 Switch SVI Configuration", description: "L3 Switch: สร้าง SVI (Switch Virtual Interface) 'int vlan 10', 'ip address 192.168.10.1 255.255.255.0', 'ip routing' เร็วกว่า Router (Hardware Switching) รองรับหลาย SVI" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Default Gateway per VLAN", description: "แต่ละ VLAN ต้องมี Gateway IP = SVI หรือ Sub-interface IP Host ใน VLAN ตั้ง Default Gateway = IP นี้ เช่น VLAN 10 GW=192.168.10.1, VLAN 20 GW=192.168.20.1" },
  ],
  "Static Routing": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "Static Route: Network, Mask, Next-hop", description: "Static Route: 'ip route 192.168.20.0 255.255.255.0 10.1.1.2' (Network Mask Next-hop) หรือ 'ip route 192.168.20.0 255.255.255.0 g0/1' (Exit Interface) AD=1 ใช้ใน Stub Network หรือ Backup" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Default Route 0.0.0.0/0", description: "Default Route: 'ip route 0.0.0.0 0.0.0.0 10.1.1.1' ใช้เมื่อไม่มี Route ตรงกับ Destination (Gateway of Last Resort) ใน Stub Network ใช้ Default Route เดียวแทน Full Table" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Routing Table และ Administrative Distance", description: "'show ip route' แสดง Routing Table: Code (S=Static, C=Connected, O=OSPF), Network, AD/Metric, Next-hop, Interface AD ใกล้ 0 = น่าเชื่อถือมาก: Connected=0, Static=1, EIGRP=90, OSPF=110, RIP=120" },
  ],
  "Dynamic Routing: OSPF": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "OSPF Link-State Protocol", description: "OSPF (Open Shortest Path First) Link-State: ทุก Router รู้ Topology ทั้งหมด สร้าง LSDB ใช้ Dijkstra SPF คำนวณ Shortest Path Tree เป็น Root เอง Metric = Cost = 100Mbps/Bandwidth (default)" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "OSPF Area Design และ Cost Metric", description: "Area: แบ่ง Domain ลด LSDB/SPF Area 0 = Backbone (ต้องต่อทุก Area) Stub/NSSA Area ลด External LSA Cost = Ref-BW/BW(interface) ปรับ Ref-BW 'auto-cost reference-bandwidth 1000' สำหรับ 1G/10G" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "show ip ospf neighbor และ DR/BDR", description: "'show ip ospf neighbor' แสดง Neighbor State: Down→Init→2-Way→Exstart→Exchange→Loading→Full DR/BDR: Multi-access (Ethernet) เลือก DR (Priority สูงสุด, Router ID มาก) BDR สำรอง DROther ต่อ DR/BDR เท่านั้น" },
  ],

  // Week 6 - TCP & UDP Socket Programming
  "Socket API พื้นฐาน": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "Socket API: socket, bind, listen, accept", description: "Socket API (BSD): socket() สร้าง Socket (domain=AF_INET, type=SOCK_STREAM/DGRAM, protocol=0) bind() ผูก IP:Port listen() รอ Connection (backlog queue) accept() รับ Connection ใหม่ ส่งคืน Socket ใหม่" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "IP:Port Tuple และ Socket States", description: "Socket ถูกระบุด้วย Tuple: (Local IP, Local Port, Remote IP, Remote Port, Protocol) TCP States: CLOSED→LISTEN→SYN_RCVD→ESTABLISHED→FIN_WAIT→TIME_WAIT→CLOSED ใช้ 'netstat -an' หรือ 'ss -tuln' ดู" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "Blocking vs Non-blocking I/O", description: "Blocking (Default): read()/accept() รอจนมีข้อมูล/Connection Non-blocking: ตั้ง Flag O_NONBLOCK คืนทันที EWOULDBLOCK ใช้กับ select()/poll()/epoll() จัดการหลาย Connection เดียว (Event-driven/Async I/O)" },
  ],
  "TCP Socket": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "TCP 3-Way Handshake", description: "TCP 3-Way Handshake: 1) Client→Server SYN (seq=x) 2) Server→Client SYN+ACK (seq=y, ack=x+1) 3) Client→Server ACK (ack=y+1) → ESTABLISHED ใช้ Wireshark Filter 'tcp.flags.syn==1' ดู" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "TCP Stream: send, recv, close", description: "TCP Stream: ไม่มี Message Boundary ต้องกำหนด Protocol เอง (Length-prefix, Delimiter) send()/write() ส่ง, recv()/read() รับ close() ปิด: FIN→ACK→FIN→ACK (4-way) TIME_WAIT 2*MSL ป้องกัน Duplicate" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "TCP Server/Client Python Example", description: "Server: s=socket(); s.bind(('',8080)); s.listen(5); conn,addr=s.accept(); data=conn.recv(1024); conn.send(b'OK'); conn.close() Client: c=socket(); c.connect(('127.0.0.1',8080)); c.send(b'Hi'); print(c.recv(1024))" },
  ],
  "UDP Socket": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "UDP Connectionless Datagram", description: "UDP: Connectionless ไม่ Handshake ไม่ Sequence ไม่ ACK ไม่ Retransmit Datagram อิสระ มีขอบเขต Message (Message Boundary) ใช้ sendto()/recvfrom() ระบุ IP:Port ทุกครั้ง Overhead ต่ำ เร็ว" },
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "sendto/recvfrom และ Socket Options", description: "sendto(data, 0, (ip,port)) recvfrom(bufsize) → (data, (ip,port)) Socket Options: SO_REUSEADDR (reuse port ทันทีหลัง close) SO_BROADCAST (ส่ง Broadcast) SO_RCVBUF/SO_SNDBUF (ปรับ Buffer)" },
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "UDP Use Cases: DNS, Gaming, Streaming", description: "DNS: Query/Response ใช้ UDP Port 53 (ขนาดเล็ก เร็ว) Gaming: Real-time Position/State ไม่ต้อง Reliable ใช้ UDP Streaming: Video/Audio (RTP/RTCP) Packet Loss ยอมรับได้ ใช้ Jitter Buffer" },
  ],

  // Generic fallbacks
  "บทนำ": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "ภาพรวมระบบเครือข่ายคอมพิวเตอร์", description: "ภาพรวม: เครือข่ายเชื่อมอุปกรณ์เพื่อแลกเปลี่ยนข้อมูล ใช้โปรโตคอลมาตรฐาน OSI/TCP-IP ผ่านสื่อสาย/ไร้สาย จัดการโดยอุปกรณ์ Switch Router Firewall" },
  ],
  "วัตถุประสงค์": [
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Learning Objectives", description: "วัตถุประสงค์การเรียนรู้ (CLO): หลังจบบทเรียน นักศึกษาจะอธิบาย ใส่ใจ จำแนก วิเคราะห์ และออกแบบระบบเครือข่ายได้ตามมาตรฐานอุตสาหกรรม" },
  ],
  "ตัวอย่าง": [
    { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80", caption: "ตัวอย่างการทำงาน", description: "ตัวอย่างปฏิบัติ: การตั้งค่า IP, Ping Test, Traceroute, Wireshark Capture, VLAN Config, Static Route, OSPF Neighbors, Python Socket Programming" },
  ],
  "คำศัพท์": [
    { src: "https://images.unsplash.com/photo-1558655146-9f40138eddee?w=1200&q=80", caption: "Key Terms", description: "คำศัพท์สำคัญ: Network, LAN/WAN/MAN/PAN, Protocol, Bandwidth, Latency, Throughput, Packet, Frame, Segment, Encapsulation, Routing, Switching, Subnet, VLAN, Trunk" },
  ],
  "คำสั่ง": [
    { src: "https://wcdt.co.th/wp-content/uploads/2018/12/network-_system02.png", caption: "CLI Commands", description: "คำสั่ง CLI พื้นฐาน: ping, traceroute, ipconfig/ifconfig/ip addr, netstat/ss, nslookup/dig, arp/ip neigh, tcpdump/tshark, show run/show ip route/show vlan" },
  ],
  "Q&A": [
    { src: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&q=80", caption: "Frequently Asked Questions", description: "Q&A: คำถามที่พบบ่อย - ทำไมต้อง Subnet? ความต่าง Switch/Router? TCP vs UDP? VLAN ทำงานอย่างไร? OSPF Area Design? NAT/PAT? การ Troubleshoot เริ่มต้นที่ไหน?" },
  ],
};

const getSectionImages = (title) => {
  return SECTION_IMAGES[title] || [];
};

export default function LessonSlides({ week, prev, next }) {
  const slides = [
    { id: "intro", title: "บทนำ", content: "intro" },
    { id: "objectives", title: "วัตถุประสงค์", content: "objectives" },
    ...week.sections.map((s, i) => ({ id: `section-${i}`, title: s.h, content: "section", index: i })),
    ...(week.examples?.length ? [{ id: "examples", title: "ตัวอย่าง", content: "examples" }] : []),
    ...(week.terms?.length ? [{ id: "terms", title: "คำศัพท์", content: "terms" }] : []),
    ...(week.commands?.length ? [{ id: "commands", title: "คำสั่ง", content: "commands" }] : []),
    ...(week.qa?.length ? [{ id: "qa", title: "Q&A", content: "qa" }] : []),
  ];

  const [slideIndex, setSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSlide, setAutoSlide] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [penColor, setPenColor] = useState("#e3b341");
  const [penSize, setPenSize] = useState(3);
  const [strokes, setStrokes] = useState({});
  const currentSlide = slides[slideIndex];
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const drawRef = useRef(null);

  const goPrev = () => setSlideIndex((i) => Math.max(0, i - 1));
  const goNext = () => setSlideIndex((i) => Math.min(slides.length - 1, i + 1));

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (e) {
        console.warn("Fullscreen request failed:", e);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (e) {
        console.warn("Exit fullscreen failed:", e);
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (isFullscreen && !document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => setIsFullscreen(false));
    }
  }, [slideIndex, isFullscreen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Home") setSlideIndex(0);
      if (e.key === "End") setSlideIndex(slides.length - 1);
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "d" || e.key === "D") setDrawMode((v) => !v);
      if (e.key === "Escape") {
        if (drawMode) setDrawMode(false);
        else if (isFullscreen) toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slideIndex, slides.length, drawMode, isFullscreen]);

  useEffect(() => {
    if (!autoSlide) return;
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoSlide, slides.length]);

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / (rect.width / canvas.width),
      y: (e.clientY - rect.top) / (rect.height / canvas.height),
    };
  };

  const onPointerDown = (e) => {
    if (!drawMode) return;
    e.preventDefault();
    const p = getCanvasPoint(e);
    const stroke = {
      id: `s${Date.now()}${Math.floor(Math.random() * 1000)}`,
      color: penColor,
      width: penSize,
      points: [p],
    };
    drawRef.current = stroke;
    setStrokes((s) => ({ ...s, [currentSlide.id]: [...(s[currentSlide.id] || []), stroke] }));
    e.target.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drawRef.current) return;
    const p = getCanvasPoint(e);
    drawRef.current.points.push(p);
    setStrokes((s) => ({
      ...s,
      [currentSlide.id]: s[currentSlide.id].map((st) =>
        st.id === drawRef.current.id ? { ...st, points: [...drawRef.current.points] } : st
      ),
    }));
  };

  const onPointerUp = () => {
    drawRef.current = null;
  };

  const clearSlideDrawings = () => {
    setStrokes((s) => ({ ...s, [currentSlide.id]: [] }));
  };

  const clearAllDrawings = () => {
    setStrokes({});
  };

  const renderSlide = (slide) => {
    let sectionTitle = "";
    let sectionImages = [];
    
    switch (slide.content) {
      case "intro":
        sectionTitle = "บทนำ";
        sectionImages = getSectionImages("บทนำ");
        return (
          <>
            <Figure name={week.figure} caption={week.summary} />
            <p className="lesson-summary">{week.summary}</p>
            {week.images && week.images.length > 0 && (
              <div className="lesson-gallery">
                {week.images.map((im, i) => (
                  <figure className="lesson-figure" key={i}>
                    <img src={im.src} alt={im.caption} loading="lazy" />
                    <figcaption>{im.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
            {sectionImages.length > 0 && (
              <div className="lesson-gallery">
                {sectionImages.map((im, i) => (
                  <figure className="lesson-figure" key={i}>
                    <img src={im.src} alt={im.caption} loading="lazy" />
                    <figcaption>{im.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </>
        );
      case "objectives":
        sectionTitle = "วัตถุประสงค์";
        sectionImages = getSectionImages("วัตถุประสงค์");
        return (
          <section className="lesson-section">
            <h2>วัตถุประสงค์การเรียนรู้ (CLO)</h2>
            <ul className="obj">
              {week.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
            {sectionImages.length > 0 && (
              <div className="lesson-gallery">
                {sectionImages.map((im, i) => (
                  <figure className="lesson-figure" key={i}>
                    <img src={im.src} alt={im.caption} loading="lazy" />
                    <figcaption>{im.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        );
      case "section":
        const s = week.sections[slide.index];
        sectionTitle = s.h;
        sectionImages = getSectionImages(s.h);
        return (
          <section className="lesson-section">
            <h2>{s.h}</h2>
            {s.p && <p>{s.p}</p>}
            {s.bullets && s.bullets.length > 0 && (
              <ul>
                {s.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
            {s.images && s.images.length > 0 && (
              <div className="lesson-gallery">
                {s.images.map((im, i) => (
                  <figure className="lesson-figure" key={i}>
                    <img src={im.src} alt={im.caption} loading="lazy" />
                    <figcaption>{im.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
            {sectionImages.length > 0 && (
              <div className="lesson-gallery">
                {sectionImages.map((im, i) => (
                  <figure className="lesson-figure" key={i}>
                    <img src={im.src} alt={im.caption} loading="lazy" />
                    <figcaption>{im.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        );
      case "examples":
        sectionTitle = "ตัวอย่าง";
        sectionImages = getSectionImages("ตัวอย่าง");
        return (
          <section className="lesson-section">
            <h2>ตัวอย่างประกอบการเรียนรู้</h2>
            {week.examples.map((ex, i) => (
              <div className="example" key={i}>
                <h3>{ex.h}</h3>
                <p>{ex.p}</p>
                {ex.code && (
                  <pre className="example-code">
                    <code>{ex.code}</code>
                  </pre>
                )}
                {ex.images && ex.images.length > 0 && (
                  <div className="lesson-gallery">
                    {ex.images.map((im, j) => (
                      <figure className="lesson-figure" key={j}>
                        <img src={im.src} alt={im.caption} loading="lazy" />
                        <figcaption>{im.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sectionImages.length > 0 && (
              <div className="lesson-gallery">
                {sectionImages.map((im, i) => (
                  <figure className="lesson-figure" key={i}>
                    <img src={im.src} alt={im.caption} loading="lazy" />
                    <figcaption>{im.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        );
      case "terms":
        sectionTitle = "คำศัพท์";
        sectionImages = getSectionImages("คำศัพท์");
        return (
          <section className="lesson-section">
            <h2>คำศัพท์สำคัญ</h2>
            <div className="terms">
              {week.terms.map(([t, d], i) => (
                <div className="term" key={i}>
                  <b>{t}</b>
                  <span>{d}</span>
                </div>
              ))}
            </div>
            {sectionImages.length > 0 && (
              <div className="lesson-gallery">
                {sectionImages.map((im, i) => (
                  <figure className="lesson-figure" key={i}>
                    <img src={im.src} alt={im.caption} loading="lazy" />
                    <figcaption>{im.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        );
      case "commands":
        sectionTitle = "คำสั่ง";
        sectionImages = getSectionImages("คำสั่ง");
        return (
          <section className="lesson-section">
            <h2>คำสั่งที่เกี่ยวข้อง</h2>
            <div className="cmds">
              {week.commands.map((c, i) => (
                <code className="cmd" key={i}>{c}</code>
              ))}
            </div>
            {sectionImages.length > 0 && (
              <div className="lesson-gallery">
                {sectionImages.map((im, i) => (
                  <figure className="lesson-figure" key={i}>
                    <img src={im.src} alt={im.caption} loading="lazy" />
                    <figcaption>{im.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        );
      case "qa":
        sectionTitle = "Q&A";
        sectionImages = getSectionImages("Q&A");
        return (
          <section className="lesson-section">
            <h2>คำถาม–คำตอบ (Q&A)</h2>
            <div className="qa">
              {week.qa.map((item, i) => (
                <details className="qa-item" key={i}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
            {sectionImages.length > 0 && (
              <div className="lesson-gallery">
                {sectionImages.map((im, i) => (
                  <figure className="lesson-figure" key={i}>
                    <img src={im.src} alt={im.caption} loading="lazy" />
                    <figcaption>{im.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  const slideStrokes = strokes[currentSlide.id] || [];

  return (
    <>
      <div className={`slide-container${isFullscreen ? " fullscreen" : ""}`} ref={containerRef}>
        <div className="slide-toolbar">
          <div className="slide-progress">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`slide-dot${i === slideIndex ? " active" : ""}`}
                onClick={() => setSlideIndex(i)}
                aria-label={s.title}
                title={s.title}
              />
            ))}
          </div>
          <div className="slide-toolbar-actions">
            <label className="slide-toggle">
              <input
                type="checkbox"
                checked={autoSlide}
                onChange={(e) => setAutoSlide(e.target.checked)}
              />
              <span>เลื่อนอัตโนมัติ</span>
            </label>
            <button
              className={`slide-btn slide-draw-btn${drawMode ? " active" : ""}`}
              onClick={() => setDrawMode((v) => !v)}
              title={`โหมดวาด (D) ${drawMode ? "เปิด" : "ปิด"}`}
            >
              ✏️
            </button>
            {drawMode && (
              <div className="draw-tools">
                <label>
                  <input
                    type="color"
                    value={penColor}
                    onChange={(e) => setPenColor(e.target.value)}
                  />
                </label>
                <label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={penSize}
                    onChange={(e) => setPenSize(Number(e.target.value))}
                    style={{ width: "80px" }}
                  />
                  <span>{penSize}px</span>
                </label>
                <button
                  className="slide-btn"
                  onClick={clearSlideDrawings}
                  title="ล้างภาพวาดหน้านี้"
                >
                  🗑️ ล้างหน้านี้
                </button>
                <button
                  className="slide-btn"
                  onClick={clearAllDrawings}
                  title="ล้างภาพวาดทั้งหมด"
                >
                  🗑️ ล้างทั้งหมด
                </button>
              </div>
            )}
            <button
              className="slide-btn slide-fullscreen-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? "ออกจากเต็มจอ (F)" : "เต็มจอ (F)"}
            >
              ⛶
            </button>
          </div>
        </div>

        <div className="slide-content-wrapper">
          <div className="slide-content">{renderSlide(currentSlide)}</div>
          {drawMode && (
            <canvas
              ref={canvasRef}
              className="slide-draw-canvas"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          )}
        </div>

        <div className="slide-nav">
          <button className="slide-btn" onClick={goPrev} disabled={slideIndex === 0}>
            ← ย้อนหลัง
          </button>
          <span className="slide-counter">
            {slideIndex + 1} / {slides.length}
          </span>
          <button className="slide-btn" onClick={goNext} disabled={slideIndex === slides.length - 1}>
            ถัดไป →
          </button>
        </div>

        <div className="slide-hints">
          <kbd>←</kbd> <kbd>→</kbd> นำทาง &nbsp;|&nbsp; <kbd>Home</kbd> <kbd>End</kbd> หน้าแรก/สุดท้าย &nbsp;|&nbsp; <kbd>F</kbd> เต็มจอ &nbsp;|&nbsp; <kbd>Space</kbd> ถัดไป &nbsp;|&nbsp; <kbd>D</kbd> วาด/เขียน &nbsp;|&nbsp; <kbd>Esc</kbd> ยกเลิก
        </div>
      </div>

      <nav className="lesson-nav">
        <div>
          {prev && (
            <Link className="ln-link" href={`/lessons/${prev.n}`}>
              ← เรื่องที่ {prev.n}
            </Link>
          )}
        </div>
        <div>
          {next && (
            <Link className="ln-link" href={`/lessons/${next.n}`}>
              เรื่องที่ {next.n} →
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}