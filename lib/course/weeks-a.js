// Weeks 1-6
export const WEEKS_A = [
  {
    n: 0,
    title: "ก่อนเรียน: พื้นฐานระบบเครือข่าย",
    titleEn: "Pre-lesson: Network Fundamentals",
    figure: "fundamentals",
    summary:
      "ความหมาย องค์ประกอบ อุปกรณ์ สื่อนำสัญญาณ โปรโตคอล และแนวคิดพื้นฐานของระบบเครือข่ายคอมพิวเตอร์",
    objectives: [
      "อธิบายความหมายและความสำคัญของระบบเครือข่ายคอมพิวเตอร์",
      "ระบุองค์ประกอบหลัก 5 ประการของเครือข่ายและบทบาทของแต่ละส่วน",
      "จำแนกประเภทอุปกรณ์เครือข่ายและหน้าที่การทำงานได้",
      "อธิบายชนิดของสื่อนำสัญญาณ (Twisted Pair, Fiber, Coaxial, Wireless)",
      "อธิบายโปรโตคอลเครือข่ายพื้นฐาน และโมเดล OSI/TCP-IP",
    ],
    sections: [
      {
        h: "ความหมายของระบบเครือข่ายคอมพิวเตอร์",
        p: "เครือข่ายคอมพิวเตอร์ (Computer Network) คือ การเชื่อมต่อระหว่างคอมพิวเตอร์ 2 เครื่องขึ้นไป เพื่อแลกเปลี่ยนข้อมูลและทรัพยากร เช่น ไฟล์ พิมพ์เตอร์ อินเทอร์เน็ต",
        bullets: [
          "เป้าหมายหลัก: แชร์ทรัพยากร (Resource Sharing) และสื่อสารข้อมูล (Communication)",
          "ประโยชน์: ลดต้นทุน เพิ่มประสิทธิภาพ การทำงานร่วมกัน (Collaboration) และเข้าถึงข้อมูลจากที่ไหนก็ได้",
          "ตัวอย่างเครือข่าย: LAN (ท้องถิ่น), WAN (ระยะไกล), MAN (เมือง), PAN (ส่วนบุคคล)",
        ],
      },
      {
        h: "องค์ประกอบหลัก 5 ประการของเครือข่าย",
        p: "เครือข่ายที่สมบูรณ์ต้องมีองค์ประกอบครบ 5 ส่วน ดังนี้",
        bullets: [
          "1. ข้อความ (Message/Data): ข้อมูลที่ต้องการส่ง เช่น ข้อความ รูปภาพ วิดีโอ ไฟล์",
          "2. ผู้ส่ง (Sender/Source): อุปกรณ์ที่สร้างและส่งข้อมูล เช่น คอมพิวเตอร์ เซิร์ฟเวอร์ โทรศัพท์",
          "3. ผู้รับ (Receiver/Destination): อุปกรณ์ที่รับข้อมูล เช่น คอมพิวเตอร์อื่น โทรศัพท์ เซิร์ฟเวอร์",
          "4. สื่อการส่ง (Transmission Medium): ทางส่งสัญญาณ เช่น สาย UTP ใยแก้ว สัญญาณไร้สาย",
          "5. โปรโตคอล (Protocol): กฎระเบียบและมาตรฐานที่ควบคุมการสื่อสาร เช่น TCP/IP, HTTP, Ethernet",
        ],
      },
      {
        h: "อุปกรณ์เครือข่ายหลักและหน้าที่",
        p: "อุปกรณ์เครือข่ายแบ่งตามหน้าที่และชั้นของโมเดล OSI",
        bullets: [
          "End Devices (อุปกรณ์ปลายทาง): PC, Laptop, Server, Printer, IP Phone, IoT Device — ต้นทาง/ปลายทางของข้อมูล",
          "Switch (สวิตช์): เชื่อมอุปกรณ์ใน LAN เดียวกัน ส่ง Frame ตาม MAC Address (ชั้น 2)",
          "Router (เราเตอร์): ร่วมต่อระหว่างเครือข่ายต่างๆ ส่ง Packet ตาม IP Address (ชั้น 3)",
          "Access Point (AP): จุดเชื่อมต่อไร้สาย เชื่อมอุปกรณ์ Wi-Fi เข้าสู่เครือข่ายสาย",
          "Firewall (ไฟร์วอลล์): กรองและตรวจสอบทราฟฟิกตามนโยบายความปลอดภัย",
          "Modem (โมเด็ม): แปลงสัญญาณดิจิทัล↔อนาล็อก เพื่อเชื่อมต่อกับ ISP",
        ],
      },
      {
        h: "สื่อนำสัญญาณ (Transmission Media)",
        p: "สื่อนำสัญญาณแบ่งเป็น 2 ประเภทหลัก คือ สาย (Guided) และ ไร้สาย (Unguided)",
        bullets: [
          "Twisted Pair (สายคู่บิด): UTP/STP เช่น Cat5e, Cat6, Cat6A — ราคาถูก ติดตั้งง่าย รองรับ 1-10 Gbps",
          "Fiber Optic (ใยแก้ว): Single-mode (ไกล) และ Multi-mode (สั้น) — ความเร็วสูง ไม่รบกวนEMI ระยะไกล",
          "Coaxial Cable (สายโคแอกเชียล): RG-6, RG-59 — ใช้กับ Cable TV, CCTV, Broadband แบบเก่า",
          "Wireless (ไร้สาย): Wi-Fi (802.11), Bluetooth, Cellular (4G/5G), Satellite — สะดวก ไม่ต้องสาย",
        ],
      },
      {
        h: "โปรโตคอลเครือข่ายและโมเดลมาตรฐาน",
        p: "โปรโตคอลคือชุดกฎที่กำหนดการจัดรูปแบบ การส่ง และการรับข้อมูล ให้อุปกรณ์ต่างยี่ห้อทำงานร่วมกันได้",
        bullets: [
          "OSI Model (7 ชั้น): Physical, Data Link, Network, Transport, Session, Presentation, Application",
          "TCP/IP Model (4 ชั้น): Network Access, Internet, Transport, Application — ใช้งานจริงในอินเทอร์เน็ต",
          "โปรโตคอลสำคัญ: Ethernet (L2), IP (L3), TCP/UDP (L4), HTTP/HTTPS, DNS, DHCP (L7)",
          "Encapsulation: ห่อหุ้มข้อมูลเพิ่ม Header ตามชั้น Decapsulation: ถอด Header เมื่อรับข้อมูล",
        ],
      },
    ],
    terms: [
      ["Network", "เครือข่ายคอมพิวเตอร์ การเชื่อมต่ออุปกรณ์เพื่อแลกเปลี่ยนข้อมูล"],
      ["LAN", "Local Area Network เครือข่ายท้องถิ่นครอบคลุมพื้นที่จำกัด"],
      ["WAN", "Wide Area Network เครือข่ายครอบคลุมพื้นที่กว้าง"],
      ["Protocol", "โปรโตคอล กฎระเบียบการสื่อสารระหว่างอุปกรณ์"],
      ["Bandwidth", "แบนด์วิดท์ ความจุการส่งข้อมูลสูงสุด (bps)"],
      ["Latency", "เลตันซี่ ความล่าช้าในการส่งข้อมูล"],
    ],
    commands: ["ping 8.8.8.8", "traceroute 8.8.8.8", "ip addr show"],
  },
  {
    n: 1,
    title: "สถาปัตยกรรมเครือข่ายและ Topology",
    titleEn: "Network Architecture & Topology",
    figure: "topology",
    summary:
      "องค์ประกอบและสถาปัตยกรรมเครือข่าย รูปแบบ Topology มาตรฐาน และการออกแบบเอกสารเครือข่ายด้วย Packet Tracer และ Draw.io",
    objectives: [
      "อธิบายองค์ประกอบ 5 ประการของเครือข่ายและบทบาทของแต่ละส่วน",
      "จำแนกสถาปัตยกรรม Client-Server, Peer-to-Peer และ Distributed ได้",
      "ระบุและเขียน Topology แบบ Bus, Star, Ring, Mesh, Tree และ Hybrid ได้",
      "ออกแบบ Topology พร้อมแผน IP และป้ายชื่ออุปกรณ์ได้",
    ],
    sections: [
      {
        h: "องค์ประกอบและสถาปัตยกรรมเครือข่าย",
        p: "เครือข่ายประกอบด้วยข้อความ ผู้ส่ง ผู้รับ สื่อการส่ง และโปรโตคอล สถาปัตยกรรมกำหนดวิธีเชื่อมต่อและการทำงานของอุปกรณ์",
        bullets: [
          "Client-Server: เซิร์ฟเวอร์ให้บริการ เช่น Web, DNS, DHCP ส่วนไคลเอนต์เป็นผู้ขอบริการ",
          "Peer-to-Peer (P2P): อุปกรณ์ทำหน้าที่ทั้งให้บริการและรับบริการต่อกันได้",
          "Distributed/Cloud: รวมทรัพยากรหลายที่ไว้ด้วยกันเพื่อความพร้อมใช้งานและการขยายระบบ",
        ],
      },
      {
        h: "รูปแบบ Topology",
        p: "Topology แบ่งเป็น Physical และ Logical แต่ละแบบให้ข้อดีและข้อจำกัดที่ต่างกัน",
        bullets: [
          "Bus: ใช้สายร่วมกัน ประหยัดแต่เกิดการชนและแก้ไขยากเมื่อสายขาด",
          "Star: ใช้ฮับหรือสวิตช์ตรงกลาง เชื่อมง่ายแต่จุดกลางเป็นจุดเสี่ยง",
          "Ring: ต่อวงกลม ใช้ token หรือ dual ring อย่างใน FDDI",
          "Mesh: เชื่อมต่อหลายเส้น เสถียรสูงแต่ค่าใช้จ่ายสูง",
          "Tree และ Hybrid: ผสมแบบ star กับ bus เหมาะกับองค์กรใหญ่",
        ],
      },
      {
        h: "การออกแบบและเอกสารเครือข่าย",
        p: "การออกแบบที่ดีต้องมีแผนที่อยู่ IP ป้ายชื่อ และผังโครงข่ายที่ชัดเจน",
        bullets: [
          "ใช้ Packet Tracer จำลองการเชื่อมต่อและตรวจสอบการทำงานของโครงข่าย",
          "ใช้ Draw.io วาดผัง Topology พร้อมป้ายชื่ออุปกรณ์และเส้นทาง",
          "จัดทำแผน IP/subnet และทะเบียนอุปกรณ์เพื่อการดูแลรักษาระบบ",
        ],
      },
    ],
    terms: [
      ["Node", "อุปกรณ์ที่เชื่อมเข้าเครือข่าย"],
      ["Link", "ช่องทางเชื่อมต่อระหว่าง Node"],
      ["Topology", "รูปแบบการเชื่อมต่อของอุปกรณ์"],
      ["Broadcast domain", "ขอบเขตที่สัญญาณ broadcast ส่งไปถึง"],
    ],
    commands: ["ping -c 4 8.8.8.8", "ip addr show"],
  },
  {
    n: 2,
    title: "IP Addressing & Subnetting",
    titleEn: "IP Addressing & Subnetting",
    figure: "subnet",
    summary:
      "โครงสร้างที่อยู่ IPv4/IPv6 การแปลงฐานสองฐานสิบ CIDR การคำนวณ Subnet และการออกแบบแผน IP ด้วย VLSM",
    objectives: [
      "อธิบายโครงสร้าง IPv4 (32 บิต) และ IPv6 (128 บิต)",
      "แปลงที่อยู่ระหว่างฐานสิบ ฐานสอง และ CIDR ได้",
      "คำนวณ Subnet Mask, Network, Broadcast และจำนวน host ได้",
      "ออกแบบแผน IP ด้วย Subnetting และ VLSM ได้",
    ],
    sections: [
      {
        h: "ที่อยู่ IP และการเข้ารหัส",
        p: "ที่อยู่ IPv4 ยาว 32 บิต แบ่งเป็น 4 อเวจ (octet) ส่วน IPv6 ยาว 128 บิต รองรับจำนวนอุปกรณ์มหาศาล",
        bullets: [
          "IPv4 แบ่งเป็นที่อยู่แบบ private (10/8, 172.16/12, 192.168/16) และ public",
          "IPv6 เขียนแบบ hex แยกด้วยโครงสร้างขยายและย่อ (::) ได้",
          "Interface แต่ละอันมีที่อยู่ IP, subnet mask และ default gateway ประกอบกัน",
        ],
      },
      {
        h: "Subnetting และ CIDR",
        p: "Subnetting ช่วยแบ่งเครือข่ายใหญ่เป็นเครือข่ายย่อยเพื่อจัดการทราฟฟิกและความปลอดภัย",
        bullets: [
          "Network address คือที่อยู่แรกของ subnet และ Broadcast เป็นที่อยู่สุดท้าย",
          "จำนวน host ที่ใช้ได้ = 2^(32-prefix) - 2",
          "CIDR เช่น /24 หมายถึง subnet mask 255.255.255.0",
          "VLSM ช่วยใช้ที่อยู่อย่างคุ้มค่าตามขนาดของแต่ละเครือข่าย",
        ],
      },
      {
        h: "การออกแบบแผน IP",
        p: "แผน IP ที่ดีต้องออกเลขตามขนาดโครงข่ายและบันทึกไว้เป็นเอกสาร",
        bullets: [
          "เรียงลำดับจากเครือข่ายที่ใช้ host มากที่สุดก่อนเพื่อประหยัดที่อยู่",
          "กำหนด gateway, DNS และ DHCP ให้สอดคล้องกัน",
          "ตรวจสอบการคำนวณด้วยเครื่องมือ ipcalc หรือสคริปต์ Python",
        ],
      },
    ],
    terms: [
      ["Subnet Mask", "ตัวแยกส่วน network และ host ของที่อยู่ IP"],
      ["CIDR", "การเขียน prefix เช่น /24 แทน subnet mask"],
      ["Gateway", "ประตูเชื่อมออกจากเครือข่ายท้องถิ่น"],
      ["Broadcast", "ที่อยู่ที่ส่งถึงทุกอุปกรณ์ใน subnet"],
    ],
    commands: ["ipcalc 192.168.1.0/24", "python3 ipcalc.py 192.168.1.10/26"],
  },
  {
    n: 3,
    title: "Ethernet, MAC, ARP, TCP/IP Analysis",
    titleEn: "Ethernet, MAC, ARP & TCP/IP Analysis",
    figure: "ethernet",
    summary:
      "โครงสร้างเฟรม Ethernet ที่อยู่ MAC กลไก ARP และการจับวิเคราะห์แพ็กเก็ตด้วย Wireshark/tcpdump",
    objectives: [
      "อธิบายโครงสร้าง Ethernet frame และที่อยู่ MAC",
      "อธิบายกลไก ARP และการแก้การชน (CSMA/CD)",
      "จับและวิเคราะห์แพ็กเก็ตด้วย Wireshark และ tcpdump",
      "อธิบายการห่อข้อมูล (encapsulation) ของ TCP/IP",
    ],
    sections: [
      {
        h: "Ethernet และ MAC Address",
        p: "Ethernet เป็นมาตรฐาน IEEE 802.3 ที่ใช้กันอย่างแพร่หลายในท้องถิ่น ทำงานที่ชั้น Data Link",
        bullets: [
          "เฟรมประกอบด้วย Preamble, ที่อยู่ปลายทาง/ต้นทาง, EtherType, ข้อมูล และ FCS",
          "MAC address ยาว 48 บิต กำหนดโดยผู้ผลิตและไม่ซ้ำกัน",
          "MTU มาตรฐานของ Ethernet คือ 1500 ไบต์",
        ],
      },
      {
        h: "ARP และ Address Resolution",
        p: "ARP แปลงที่อยู่ IP ให้เป็นที่อยู่ MAC เพื่อส่งในท้องถิ่น",
        bullets: [
          "เมื่อต้องส่งไปยัง IP ใหม่ โฮสต์จะ broadcast ใบ ARP request",
          "เจ้าของ IP ตอบด้วย ARP reply ที่ให้ MAC ของตน",
          "ผลลัพธ์ถูกเก็บใน ARP cache ชั่วคราวเพื่อลดการส่งซ้ำ",
        ],
      },
      {
        h: "การวิเคราะห์แพ็กเก็ตด้วย Wireshark",
        p: "เครื่องมือจับแพ็กเก็ตช่วยให้เห็นการทำงานจริงในภาคสนาม",
        bullets: [
          "ใช้ display filter เช่น arp, tcp, http เพื่อโฟกัสข้อมูล",
          "อ่านรายละเอียดแต่ละชั้นตั้งแต่ Frame ถึง Application",
          "บันทึกผลวิเคราะห์เป็นรายงานพร้อมหลักฐานการ capture",
        ],
      },
    ],
    terms: [
      ["Frame", "หน่วยข้อมูลชั้น Data Link"],
      ["MAC Address", "ที่อยู่ฮาร์ดแวร์ 48 บิตของ NIC"],
      ["ARP", "โปรโตคอลแปลง IP เป็น MAC"],
      ["MTU", "ขนาด frame สูงสุดที่รับได้"],
    ],
    commands: ["ip neigh show", "tcpdump -i eth0 arp -n", "tshark -i eth0 -Y arp"],
  },
  {
    n: 4,
    title: "VLAN & Trunk Configuration",
    titleEn: "VLAN & Trunk Configuration",
    figure: "vlan",
    summary:
      "แนวคิด VLAN การแยก broadcast domain การกำหนดค่า access และ trunk (802.1Q) และการทดสอบบน Packet Tracer",
    objectives: [
      "อธิบาย VLAN และข้อดี เช่น การแยก broadcast และความปลอดภัย",
      "อธิบายความต่างระหว่าง access port และ trunk port",
      "กำหนดค่า VLAN และ trunk 802.11Q บน Packet Tracer ได้",
      "ออกแบบ VLAN ให้เหมาะกับโครงสร้างหน่วยงาน",
    ],
    sections: [
      {
        h: "VLAN พื้นฐาน",
        p: "VLAN แบ่งสวิตช์เดียวเป็นหลายเครือข่ายลอจิกัลเพื่อจำกัดการกระจาย broadcast",
        bullets: [
          "แต่ละ VLAN มีสเปกของตนเองและต้องมีที่อยู่ IP ต่างกัน",
          "VLAN ช่วยลดทราฟฟิก broadcast และเพิ่มความปลอดภัยตามหน่วยงาน",
          "ต้องกำหนด VLAN บนสวิตช์ให้ตรงกันทุกตัว",
        ],
      },
      {
        h: "Trunk และ 802.1Q",
        p: "Trunk พาข้อมูลหลาย VLAN ผ่านลิงก์เดียวโดยแท็กเพื่อระบุ VLAN",
        bullets: [
          "802.1Q ใส่ tag 4 ไบต์ในส่วนหัวของเฟรม",
          "Native VLAN ไม่มี tag และมักใช้ VLAN 1 หรือกำหนดเอง",
          "Access port ใช้เชื่อมอุปกรณ์ปลายทางแบบ VLAN เดียว",
        ],
      },
      {
        h: "การกำหนดค่าและทดสอบ",
        p: "ทดสอบด้วย ping และ display เพื่อยืนยันว่า VLAN ทำงานถูกต้อง",
        bullets: [
          "สร้าง VLAN และกำหนดชื่อให้สอดคล้องกับหน่วยงาน",
          "กำหนด access/trunk และอนุญาต VLAN ที่ต้องการ",
          "ทดสอบการเชื่อมต่อภายในและระหว่าง VLAN",
        ],
      },
    ],
    terms: [
      ["VLAN", "เครือข่ายลอจิกัลที่แยกบน switch"],
      ["Trunk", "ลิงก์ที่พาข้อมูลหลาย VLAN"],
      ["Access port", "พอร์ตเชื่อมอุปกรณ์ปลายทาง VLAN เดียว"],
      ["Native VLAN", "VLAN ที่ไม่มี tag ใน trunk"],
    ],
    commands: ["show vlan brief", "show interfaces trunk"],
  },
  {
    n: 5,
    title: "Inter-VLAN, Static Routing & OSPF",
    titleEn: "Inter-VLAN, Static Routing & OSPF",
    figure: "routing",
    summary:
      "การรัวต์ต่อระหว่าง VLAN ด้วย router-on-a-stick หรือ L3 switch การกำหนดค่า Static Routing และ OSPF พื้นฐาน",
    objectives: [
      "อธิบายการรัวต์ต่อแบบ Inter-VLAN ด้วย sub-interface และ L3 switch",
      "กำหนดค่า Static Routing และ default route ได้",
      "อธิบายและกำหนดค่า OSPF พื้นฐานได้",
      "ตรวจสอบ routing table และแก้ไขปัญหาการเชื่อมต่อได้",
    ],
    sections: [
      {
        h: "Inter-VLAN Routing",
        p: "เพื่อให้ VLAN สื่อสารกันได้ ต้องมีตัวรัวต์ต่อทำหน้าที่ gateway ระหว่าง subnet",
        bullets: [
          "Router-on-a-stick ใช้ sub-interface ต่อ VLAN ผ่าน trunk",
          "Layer-3 switch ทำ routing ได้ด้วยตัวเองในความเร็วสูง",
          "แต่ละ VLAN ต้องมี gateway ที่ตรงกับ subnet",
        ],
      },
      {
        h: "Static Routing",
        p: "Static route กำหนดเส้นทางเอง เหมาะกับเครือข่ายเล็กหรือเส้นทางคงที่",
        bullets: [
          "เขียนเส้นทางด้วย network, mask และ next-hop",
          "Default route (0.0.0.0/0) ใช้เมื่อไม่พบเส้นทางที่เจาะจง",
          "ข้อดีคือควบคุมง่าย ข้อเสียคือแก้ไขยากเมื่อโครงข่ายเปลี่ยน",
        ],
      },
      {
        h: "Dynamic Routing: OSPF",
        p: "OSPF เป็น link-state protocol ที่นับถือ hop และคำนวณเส้นทางที่ดีที่สุด",
        bullets: [
          "ใช้ cost เป็น metric โดยอิงความเร็วของลิงก์",
          "แบ่งเป็น area เพื่อลดภาระการคำนวณ",
          "ตรวจสอบเพื่อนบ้านด้วยคำสั่ง show ip ospf neighbor",
        ],
      },
    ],
    terms: [
      ["Gateway", "ประตูเชื่อมระหว่างเครือข่าย"],
      ["Static route", "เส้นทางที่กำหนดเอง"],
      ["OSPF", "โปรโตคอล link-state สำหรับ routing"],
      ["Metric", "ค่าที่ใช้ตัดสินใจเลือกเส้นทาง"],
    ],
    commands: ["show ip route", "show ip ospf neighbor"],
  },
  {
    n: 6,
    title: "TCP & UDP Socket Programming",
    titleEn: "TCP & UDP Socket Programming",
    figure: "socket",
    summary:
      "แนวคิด Socket API การเขียนโปรแกรมลูกข่าย/เซิร์ฟเวอร์แบบ TCP และ UDP ด้วย Python พร้อมการทดสอบด้วย Wireshark",
    objectives: [
      "อธิบายการทำงานของ Socket API และที่อยู่/port",
      "เขียนโปรแกรม TCP client/server ด้วย Python",
      "เขียนโปรแกรม UDP client/server",
      "ทดสอบและวัดประสิทธิภาพการสื่อสารได้",
    ],
    sections: [
      {
        h: "Socket API พื้นฐาน",
        p: "Socket เป็นจุดสิ้นสุดของการเชื่อมต่อที่โปรแกรมใช้เรียก network stack ของ OS",
        bullets: [
          "ที่อยู่ socket = IP address + port number",
          "ฟังก์ชันหลัก: socket, bind, listen, accept, connect, send, recv",
          "อาจเป็นแบบ blocking หรือ non-blocking ตามการใช้งาน",
        ],
      },
      {
        h: "TCP Socket",
        p: "TCP ให้การเชื่อมต่อแบบ connection-oriented และการันตีลำดับข้อมูล",
        bullets: [
          "เซิร์ฟเวอร์ bind และ listen ที่ port ที่กำหนด",
          "ลูกข้า connect แล้วส่ง/รับข้อมูลผ่าน stream",
          "ปิดการเชื่อมต่อด้วย close ทั้งสองฝ่าย",
        ],
      },
      {
        h: "UDP Socket",
        p: "UDP เป็น connectionless ให้ความเร็วและ overhead ต่ำแต่ไม่การันตีข้อมูล",
        bullets: [
          "ใช้ sendto และ recvfrom แทน connect",
          "เหมาะกับ DNS, เกมสด และสตรีมมิ่ง",
          "ต้องจัดการการสูญหายของข้อมูลในระดับแอปพลิเคชันเอง",
        ],
      },
    ],
    terms: [
      ["Socket", "จุดสิ้นสุดการเชื่อมต่อของโปรแกรม"],
      ["Port", "หมายเลขช่องบริการบนโฮสต์"],
      ["Bind", "ผูก socket กับที่อยู่และพอร์ต"],
      ["Listen", "รอรับการเชื่อมต่อเข้า"],
    ],
    commands: ["python3 tcp_server.py", "python3 tcp_client.py 127.0.0.1"],
  },
];