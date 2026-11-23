// Device catalog and cable types for the Packet Tracer-style designer.

export const DEVICES = [
  {
    type: "pc",
    name: "คอมพิวเตอร์ (PC)",
    nameEn: "Workstation",
    layer: "L1–L7",
    role: "อุปกรณ์ปลายทางของผู้ใช้",
    desc:
      "เครื่องคอมพิวเตอร์ของผู้ใช้ที่เป็นต้นทางหรือปลายทางของข้อมูล ทำงานครบทุกชั้นของโมเดล OSI/TCP-IP " +
      "โดย NIC จัดกรอบที่ L2, Network Stack จัดการ IP ที่ L3 และแอปพลิเคชันอยู่ที่ L7 โดยทั่วไปเชื่อมเข้าสู่ Switch ด้วยสาย UTP",
  },
  {
    type: "laptop",
    name: "โนตบุ๊ก (Laptop)",
    nameEn: "Laptop",
    layer: "L1–L7",
    role: "อุปกรณ์ปลายทางแบบเคลื่อนที่",
    desc:
      "อุปกรณ์ปลายทางที่เคลื่อนที่ได้ มักเชื่อมต่อแบบไร้สายผ่าน Access Point โดยใช้ Wi-Fi (802.11) " +
      "และรองรับการเปลี่ยนตำแหน่ง (roaming) ระหว่าง AP ได้",
  },
  {
    type: "server",
    name: "เซิร์ฟเวอร์ (Server)",
    nameEn: "Server",
    layer: "L1–L7",
    role: "ผู้ให้บริการบนเครือข่าย",
    desc:
      "ให้บริการร่วมบนเครือข่าย เช่น Web, DNS, DHCP, File, Database หรือ Email มี NIC และที่อยู่ IP คงที่ (Static) " +
      "ทำงานต่อเนื่องเพื่อตอบคำขอจาก Client จึงต้องการความเสถียรและความปลอดภัยสูง",
  },
  {
    type: "switch",
    name: "สวิตช์ (Switch)",
    nameEn: "Switch",
    layer: "L2 (หรือ L3)",
    role: "เชื่อมโครงข่ายท้องถิ่น",
    desc:
      "ส่ง Frame ตาม MAC Address โดยอ้างอิง CAM/MAC table แยก Collision Domain ออกจากกันในแต่ละพอร์ต " +
      "รองรับ VLAN, STP และ Link Aggregation ส่วน Layer-3 Switch ยังสามารถทำหน้าที่รัวต์ต่อ (routing) ได้",
  },
  {
    type: "router",
    name: "เราเตอร์ (Router)",
    nameEn: "Router",
    layer: "L3",
    role: "รัวต์ต่อระหว่างเครือข่าย",
    desc:
      "ส่งแพ็กเก็ตตาม IP Address ระหว่างเครือข่ายต่าง ๆ ด้วย Routing Table ทั้งแบบ Static และ Dynamic (RIP, OSPF, BGP) " +
      "ทำหน้าที่ Default Gateway และ NAT ระหว่างเครือข่าย LAN กับ WAN",
  },
  {
    type: "hub",
    name: "ฮับ (Hub)",
    nameEn: "Hub",
    layer: "L1",
    role: "กระจายสัญญาณแบบ Broadcast",
    desc:
      "ส่งสัญญาณออกทุกพอร์ตแบบ Broadcast ทำให้เกิดการ ชน (Collision) และใช้แบบ Half-duplex " +
      "เป็นอุปกรณ์ชั้น Physical ที่ไม่มี MAC table จึงถูก Switch แทนที่ในงานสมัยใหม่",
  },
  {
    type: "ap",
    name: "จุดเชื่อมต่อไร้สาย (AP)",
    nameEn: "Access Point",
    layer: "L2",
    role: "เชื่อมอุปกรณ์ Wi-Fi เข้าสู่เครือข่าย",
    desc:
      "เชื่อมอุปกรณ์ไร้สาย (Wi-Fi 802.11) เข้าสู่เครือข่ายแบบใช้สาย ใช้ CSMA/CA ควบคุมการเข้าถึงช่องสัญญาณ " +
      "กำหนด SSID และรหัสผ่าน WPA2/WPA3 พร้อมช่วย Roaming ระหว่าง AP",
  },
  {
    type: "firewall",
    name: "ไฟร์วอลล์ (Firewall)",
    nameEn: "Firewall",
    layer: "L3–L7",
    role: "ตัวกรองความปลอดภัย",
    desc:
      "ตรวจและกรองทราฟฟิกตามนโยบาย (ACL) ระหว่างเครือข่ายที่ไว้ใจได้และไม่ไว้ใจได้ เช่น LAN ↔ Internet " +
      "ป้องกันการเข้าถึงที่ไม่ได้รับอนุญาตและบันทึก Log เพื่อการตรวจสอบย้อนหลัง",
  },
  {
    type: "modem",
    name: "โมเด็ม (Modem)",
    nameEn: "Modem",
    layer: "L1",
    role: "แปลงสัญญาณดิจิทัล–อนาล็อก",
    desc:
      "แปลงสัญญาณดิจิทัลเป็นอนาล็อกและกลับกัน (ASK/FSK/PSK/QAM) เพื่อส่งผ่านสื่อ เช่น สายโทรศัพท์ สายโคแอกเซียล หรือใยแก้ว " +
      "เป็นตัวเชื่อมต่อระหว่างเครือข่ายท้องถิ่นกับผู้ให้บริการ (ISP)",
  },
  {
    type: "cloud",
    name: "อินเทอร์เน็ต/คลาวด์",
    nameEn: "Internet / Cloud",
    layer: "WAN",
    role: "เครือข่ายภายนอก",
    desc:
      "แทนเครือข่ายภายนอก (Internet, ISP, WAN หรือ Cloud) ที่เชื่อมต่อหลายเครือข่ายเข้าด้วยกัน " +
      "ใช้ในการจำลองการเชื่อมต่อออกนอกองค์กรและการสื่อสารระยะไกล",
  },
];

export const CABLES = [
  {
    type: "user-lan",
    name: "User LAN",
    nameTh: "น้ำเงิน",
    color: "#3ea6ff",
    role: "เชื่อมโครงข่ายผู้ใช้งาน",
    desc:
      "เชื่อมอุปกรณ์ผู้ใช้ เช่น PC, โนตบุ๊ก และ AP เข้ากับสวิตช์ใน VLAN ของผู้ใช้ " +
      "มักใช้สาย UTP หมวด Cat5e/Cat6 รองรับ 1–10 Gbps และเป็นทราฟฟิกปกติของพนักงาน",
  },
  {
    type: "uplink",
    name: "Uplink / Trunk",
    nameTh: "เหลือง",
    color: "#e3b341",
    role: "เชื่อมระหว่างสวิตช์หรือไปยังแบ็คบोन",
    desc:
      "ใช้ระหว่างสวิตช์หรือไปยังเราเตอร์/ไฟร์วอลล์ ทำหน้าที่ทั้ง uplink และ trunk ที่พาข้อมูลหลาย VLAN พร้อม tag 802.1Q " +
      "มักใช้ใยแก้วเพื่อความเร็วสูงและระยะไกล",
  },
  {
    type: "mgmt",
    name: "Management Network",
    nameTh: "แดง",
    color: "#f85149",
    role: "เครือข่ายสำหรับจัดการอุปกรณ์",
    desc:
      "แยกจากทราฟฟิกผู้ใช้เพื่อความปลอดภัย ใช้จัดการตู้อุปกรณ์ เช่น OOB management, iLO/iDRAC, SNMP และ SSH " +
      "มักทำเป็น VLAN แยกต่างหากเพื่อจำกัดการเข้าถึง",
  },
  {
    type: "server",
    name: "Server Network",
    nameTh: "เขียว",
    color: "#3fb950",
    role: "เชื่อมเซิร์ฟเวอร์และระบบที่เมนต์",
    desc:
      "เชื่อมเซิร์ฟเวอร์แอปพลิเคชัน ฐานข้อมูล และระบบจัดเก็บข้อมูล " +
      "ต้องการความเร็วสูงและความเสถียรสูง มักแยกเป็นโครงข่ายหรือ VLAN เฉพาะเพื่อลดการรบกวนและ latency",
  },
  {
    type: "console",
    name: "Console / Management",
    nameTh: "ขาว",
    color: "#ffffff",
    role: "สายคอนซูลสำหรับตั้งค่าและกู้คืน",
    desc:
      "สาย console (rollover) เชื่อมเข้าพอร์ต console ของอุปกรณ์ เพื่อตั้งค่าและ�ู้คืนเมื่อเครือข่ายล่ม " +
      "ทำงานแบบ out-of-band ที่อัตรา baud เช่น 9600 และไม่ต้องใช้ IP",
  },
  {
    type: "wan",
    name: "WAN / Internet",
    nameTh: "ส้ม",
    color: "#f08a5d",
    role: "เชื่อมออกไปยังเครือข่ายภายนอก",
    desc:
      "เชื่อมออกไปยังเครือข่ายพื้นที่กว้าง (WAN) หรืออินเทอร์เน็ตผ่านผู้ให้บริการ (ISP) และโมเด็ม " +
      "โดยผ่านไฟร์วอลล์และ NAT เพื่อควบคุมทราฟฟิกเข้าออกขององค์กร",
  },
];

export const DEVICE_MAP = Object.fromEntries(DEVICES.map((d) => [d.type, d]));
export const CABLE_MAP = Object.fromEntries(CABLES.map((c) => [c.type, c]));

export const CONNECTORS = [
  {
    category: "twisted-pair",
    categoryName: "สายคู่บิดเกลียว / LAN",
    categoryNameEn: "Twisted Pair / Ethernet",
    icon: "🔌",
    color: "#3ea6ff",
    items: [
      {
        id: "rj45",
        name: "RJ-45",
        nameTh: "RJ-45",
        desc: "หัวต่อมาตรฐานยอดนิยมสำหรับสาย LAN (เช่น Cat5e, Cat6, Cat6A) มี 8 ขา รองรับการส่งข้อมูลและจ่ายไฟผ่านสาย (PoE)",
        icon: "▣",
      },
      {
        id: "rj45-coupler",
        name: "RJ-45 Coupler",
        nameTh: "ตัวต่อตรง RJ-45",
        desc: "ตัวเชื่อมแบบตัวเมีย-ตัวเมีย สำหรับต่อเพิ่มความยาวสาย LAN โดยไม่ต้องย้ำหัวใหม่ (มีทั้งแบบทั่วไปและแบบกันน้ำ IP67 สำหรับงานภายนอกอาคาร)",
        icon: "⬚",
      },
      {
        id: "keystone",
        name: "Keystone Jack",
        nameTh: "เต้ารับ LAN (Keystone)",
        desc: "เต้ารับตัวเมียสำหรับติดตั้งบน Faceplate หรือ Patch Panel",
        icon: "⬛",
      },
    ],
  },
  {
    category: "fiber",
    categoryName: "สายไฟเบอร์ออปติก",
    categoryNameEn: "Fiber Optic",
    icon: "💡",
    color: "#f08a5d",
    items: [
      {
        id: "sc",
        name: "SC",
        nameTh: "SC (Subscriber Connector)",
        desc: "หัวต่อแบบสี่เหลี่ยม Push-Pull เสียบและดึงง่าย นิยมใช้มากในงาน FTTH และระบบเครือข่ายทั่วไป",
        icon: "▭",
      },
      {
        id: "lc",
        name: "LC",
        nameTh: "LC (Lucent Connector)",
        desc: "ขนาดเล็กกว่า SC ครึ่งหนึ่ง นิยมใช้ใน Switch และ transceiver ความหนาแน่นสูง",
        icon: "▮",
      },
      {
        id: "st",
        name: "ST",
        nameTh: "ST",
        desc: "หัวต่อแบบหมุนเกลียวหรือล็อก (มักพบในระบบเก่าหรืองานเฉพาะทาง)",
        icon: "⬤",
      },
      {
        id: "fc",
        name: "FC",
        nameTh: "FC",
        desc: "หัวต่อแบบหมุนเกลียวหรือล็อก (มักพบในระบบเก่าหรืองานเฉพาะทาง)",
        icon: "⭘",
      },
    ],
  },
  {
    category: "coaxial",
    categoryName: "สายโคแอกเชียล",
    categoryNameEn: "Coaxial Cable",
    icon: "📡",
    color: "#3fb950",
    items: [
      {
        id: "bnc",
        name: "BNC",
        nameTh: "BNC Connector",
        desc: "นิยมใช้กับสัญญาณวิดีโอหรือระบบเครือข่าย/กล้องวงจรปิดแบบอนาล็อกรุ่นเก่า",
        icon: "⬤",
      },
      {
        id: "f-type",
        name: "F-Type",
        nameTh: "F-Type Connector",
        desc: "นิยมใช้กับสาย RG-6 ในระบบเคเบิลทีวีหรือสัญญาณ RF",
        icon: "⬤",
      },
    ],
  },
];

export const CONNECTOR_MAP = Object.fromEntries(
  CONNECTORS.flatMap((cat) => cat.items.map((item) => [item.id, { ...item, category: cat.category, categoryName: cat.categoryName, categoryColor: cat.color }]))
);