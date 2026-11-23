# เอกสารประกอบระบบ Network-D

## 1. Software Description | ชื่อและรายละเอียดระบบ

**ชื่อระบบ:** Network-D (เครือข่ายดี)

**คำอธิบายโดยย่อ:**  
Network-D คือโปรแกรมจำลองสำหรับการศึกษาระบบเครือข่ายคอมพิวเตอร์และการสื่อสารข้อมูล รวมเว็บไซต์คอร์สเรียนบน Next.js เข้ากับแดชบอร์ด iPerf3/tcpdump ที่เขียนด้วย Python รองรับทั้งเนื้อหาบทเรียน การทดลองปฏิบัติ และเครื่องมือวัดประสิทธิภาพเครือข่ายแบบเรียลไทม์

**คุณสมบัติหลัก:**
- คอร์สเรียนเครือข่าย 12 สัปดาห์ พร้อมสไลด์เต็มจอ การขีดเขียนทับภาพ และนำทางด้วยแป้นพิมพ์
- แดชบอร์ด iPerf3: สร้างคำสั่งทดสอบแบนด์วิดท์ (client & server) ดูกราฟเรียลไทม์ผ่าน Server-Sent Events (SSE) และเก็บประวัติการทดสอบ
- แดชบอร์ด tcpdump: จับแพ็กเก็ต แสดงอัตราแพ็กเก็ตต่อวินาที (pps) และเก็บประวัติการจับ
- เครื่องมือเครือข่าย: ออกแบบโทโพโลยี traceroute เครื่องคำนวณซับเน็ต
- ห้องทดลองและการประเมินผล: แบบฝึกหัด คู่มือให้คะแนน แดชบอร์ดสำหรับผู้ดูแลระบบ

**สแต็กเทคโนโลยี:**
- Frontend: Next.js 15 (App Router), React 19
- Backend Dashboard: Python 3 (stdlib only, ไม่ต้องพึ่งไลบรารีของบุคคลที่สาม)
- เครื่องมือภายนอก: iperf3, tcpdump/WinDump, scapy
- รันผ่าน Docker / Docker Compose หรือติดตั้งต้นทางบน macOS และ Windows

**พอร์ตที่ใช้:**
| พอร์ต | บริการ |
|-------|--------|
| 3000 | Next.js frontend (dev และ production) |
| 8765 | Python iPerf3/tcpdump dashboard |

---

## 2. System Architecture | สถาปัตยกรรมระบบ

ระบบประกอบด้วยสองส่วนหลักที่ทำงานอิสระต่อกัน:

```
+---------------------+                    +---------------------------+
|   Next.js Frontend  |                    |   Python Dashboard        |
|  (port 3000)        |                    |  (port 8765)              |
|                     |                    |                           |
|  - App Router pages |                    |  - ThreadingHTTPServer    |
|  - React components |                    |  - REST API endpoints     |
|  - Course data      |                    |  - Server-Sent Events (SSE)|
|                     |                    |  - iperf3 / tcpdump runner|
+---------------------+                    +---------------------------+
         |                                         |
         +------------ HTTP fetch -----------------+
                          (json API)
```

### 2.1 Python Dashboard (`server.py`)
ใช้มอดูลมาตรฐานของ Python เท่านั้น (`http.server`, `threading`, `subprocess`, `queue`, ฯลฯ) ทำหน้าที่:
- รับคำสั่งจาก UI ผ่าน REST API (`/api/start`, `/api/stop`, `/api/results`, ฯลฯ)
- เปิดกระบวนการ `iperf3` หรือ `tcpdump` ย่อย และสตรีมเอาต์พุตกลับไปยังเบราว์เซอร์ผ่าน SSE
- แยกวิเคราะห์ข้อมูล throughput ต่อช่วงเวลาและส่งเป็นจุดข้อมูลสำหรับวาดกราฟเรียลไทม์
- บันทึกผลการทดสอบลงไฟล์ JSON (`results.json`, `tcpdump_results.json`) สูงสุด 100 รายการล่าสุด
- ระบบตรวจสอบสิทธิ์แบบง่าย (username/password แฮชด้วย SHA-256,	session cookie)

### 2.2 Next.js Frontend (`app/`)
ใช้ Next.js 15 App Router จัดการหน้าเว็บทั้งหมด:
- `app/page.js` — หน้าแรก แสดงบทเรียน หัวข้อปฏิบัติการ โครงงาน และผลลัพธ์ที่คาดหวัง (CLO)
- `app/lessons/[n]/` — สไลด์บทเรียนแบบเต็มจอ พร้อมวาด/ขีดเขียนทับ
- `app/iperf/` — หน้าทดสอบ iPerf3 พร้อมตัวสร้างคำสั่งและกราฟเรียลไทม์
- `app/tcpdump/` — หน้าจับแพ็กเก็ต tcpdump
- `app/scapy/`, `app/traceroute/`, `app/topology/`, `app/practical/`, `app/assessment/`, `app/admin/` — หน้าย่อยตามฟีเจอร์
- `app/api/` — Route handler สำหรับข้อมูลคอร์สและระบบ

### 2.3 โครงสร้างไดเรกทอรีโครงการ
```
network-d/
├── app/                # Next.js 15 App Router (หน้าเว็บ, API routes)
├── components/         # React คอมโพเนนต์ร่วม (แผนภูมิ, แถบนำทาง, ไอคอนอุปกรณ์)
├── lib/                # ยูทิลิตี้ร่วมและข้อมูลคอร์ส (auth, course-data, topology)
├── public/             # ทรัพยากร静止 (รูปภาพ)
├── static/             # ไฟล์ static ของเซิร์ฟเวอร์ Python (index.html, login.html)
├── server.py           # เซิร์ฟเวอร์แดชบอร์ด iPerf3/tcpdump (Python)
├── Dockerfile          # อิมเมจ Docker สำหรับแดชบอร์ด Python
├── docker-compose.yml  # กำหนดบริการ dashboard และ web
├── package.json        # ตั้งค่าโครงการ Node.js
├── start.sh / start.bat# สクリปต์เริ่มระบบ (macOS/Linux, Windows)
└── results.json        # ไฟล์เก็บประวัติผลการทดสอบ (ตัวอย่าง)
```

---

## 3. Source Code | ตัวอย่างหรือสำเนารหัสต้นฉบับ

### 3.1 เซิร์ฟเวอร์ Python (`server.py`) — จุดเริ่มต้นและฟังก์ชันสำคัญ

```python
#!/usr/bin/env python3
"""iPerf3 Dashboard - local web UI to build, run and graph iperf3 commands in realtime.

Stdlib only. No third-party dependencies.
"""

import hashlib
import json
import os
import queue
import re
import secrets
import shutil
import subprocess
import threading
import time
import uuid
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = os.environ.get("IPERF_HOST", "127.0.0.1")
PORT = int(os.environ.get("IPERF_PORT", "8765"))
IPERF_BIN = os.environ.get("IPERF_BIN", "iperf3")
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
RESULTS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "results.json")
MAX_RESULTS = 100

AUTH_USER = os.environ.get("AUTH_USER", "admin")
AUTH_PASS_HASH = os.environ.get("AUTH_PASS_HASH")
if not AUTH_PASS_HASH:
    default_pass = os.environ.get("AUTH_PASS", "changeme")
    AUTH_PASS_HASH = hashlib.sha256(default_pass.encode()).hexdigest()
SESSION_TTL = int(os.environ.get("SESSION_TTL", "86400"))

_sessions = {}
_lock = threading.Lock()
_results_lock = threading.Lock()
_auth_sessions = {}
_auth_lock = threading.Lock()
```

ฟังก์ชันเริ่มเซสชันการทดสอบ iPerf3 / tcpdump:

```python
def start_session(argv, mode="iperf"):
    """Launch iperf3/tcpdump with argv (list, no shell) and return a session id."""
    binary = IPERF_BIN if mode == "iperf" else TCPDUMP_BIN
    if not shutil.which(binary) and not os.path.isabs(binary):
        raise FileNotFoundError(
            f"'{binary}' not found. Install it or set the env var."
        )
    _purge()
    if mode == "iperf":
        argv = _ensure_interval(list(argv))
    else:
        argv = _ensure_live_tcpdump(list(argv))
    sid = uuid.uuid4().hex
    q = queue.Queue()
    proc = subprocess.Popen(
        [binary] + argv,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    info = {"proc": proc, "queue": q}
    with _lock:
        _sessions[sid] = info
    # ... อ่านเอาต์พุตแบบเรียลไทม์ ผ่านเธรด reader และส่งผ่าน SSE
    return sid
```

จุดเริ่มต้นของเซิร์ฟเวอร์:

```python
def main():
    ThreadingHTTPServer.allow_reuse_address = True
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"iPerf3 Dashboard running at http://{HOST}:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        httpd.shutdown()

if __name__ == "__main__":
    main()
```

### 3.2 หน้าแรก Next.js (`app/page.js`)

```jsx
import Link from "next/link";
import { COURSE, PROJECT, OUTCOMES, WEEKS, PRACTICALS } from "@/lib/course-data";

export default function Home() {
  return (
    <div className="course">
      <section className="hero">
        <h1>{COURSE.titleTh}</h1>
        <p className="sub">
          {COURSE.title} — หลักสูตรปฏิบัติ {COURSE.weeks} สัปดาห์ ...
        </p>
      </section>
      {/* แสดงบทเรียน หัวข้อปฏิบัติการ โครงงาน และ CLO */}
    </div>
  );
}
```

### 3.3 คอมโพเนนต์กราฟเรียลไทม์ (`components/LineChart.js`)

```jsx
export default function LineChart({ data }) {
  // วาดกราฟเส้นแสดง throughput (bits/sec) ตามเวลาจริงจากข้อมูลที่ส่งมาผ่าน SSE
}
```

รหัสต้นฉบับฉบับสมบูรณ์อยู่ในไฟล์ `server.py` (633 บรรทัด) และไดเรกทอรี `app/` ของโครงการนี้

---

## 4. Screenshot | ภาพหน้าจอระบบ

เนื่องจากเป็นเอกสารตัวอักษร ไม่มีไฟล์ภาพจริงแนบมาด้วย สามารถถ่ายภาพหน้าจอได้ดังนี้เมื่อรันระบบ:

| หน้าจอ | คำอธิบาย | วิธีถ่ายภาพ |
|--------|-----------|-------------|
| หน้าแรก (`http://localhost:3000`) | แสดงสรุปคอร์ส บทเรียน และหัวข้อปฏิบัติการ | เปิดเบราว์เซอร์ที่พอร์ต 3000 แล้วกด `PrtSc` |
| แดชบอร์ด iPerf3 (`http://localhost:8765`) | ตัวสร้างคำสั่ง iperf3 พร้อมกราฟเรียลไทม์ | เปิดเบราว์เซอร์ที่พอร์ต 8765 login แล้วถ่ายภาพ |
| หน้าจับแพ็กเก็ต tcpdump | แสดงรายการอินเทอร์เฟซและอัตราแพ็กเก็ตต่อวินาที | เข้าเมนู tcpdump ในแอปหลักแล้วถ่ายภาพ |
| สไลด์บทเรียน | สไลด์เต็มจอพร้อมเครื่องมือวาด/ขีดเขียน | เข้า `/lessons/[n]` แล้วกด `F` สำหรับเต็มจอ |

แนะนำให้บันทึกภาพเป็นไฟล์ PNG/JPEG และวางไว้ในโฟลเดอร์ `docs/screenshots/` ต่อไป

---

## 5. User Interface | หน้าจอและการทำงาน

### 5.1 หน้าแรก (Home)
แสดงชื่อคอร์ส คำอธิบายหลักสูตร รายการบทเรียน 12 เรื่อง หัวข้อปฏิบัติการประกอบตารางเครื่องมือและผลลัพธ์ที่คาดหวัง และข้อมูลโครงงานบูรณาการ

### 5.2 บทเรียน (Lessons)
- แต่ละบทมีสไลด์หลายหน้า รองรับการนำทางด้วยแป้นพิมพ์ (`←`/`→`, `Space`, `Home`, `End`, `Esc`)
- กด `F` เพื่อสลับเต็มจอ กด `D` เพื่อสลับโหมดขีดเขียนทับภาพ
- มีตัวเลือกเล่นสไลด์อัตโนมัติทุก 5 วินาที

### 5.3 iPerf3 Dashboard
- ผู้ใช้สร้างคำสั่ง iperf3 (client/server, TCP/UDP, ระยะเวลา, อินเทอร์วาล) ผ่านฟอร์มบนเว็บ
- กดเริ่มการทดสอบ ระบบจะสตรีมผลลัพธ์แบบเรียลไทม์ผ่าน SSE และวาดกราฟ bits/sec ตามเวลา
- เมื่อสิ้นสุดการทดสอบ ระบบจะบันทึกสถิติ (duration, total MB, avg Mbps) ลง `results.json`

### 5.4 tcpdump Dashboard
- เลือกอินเทอร์เฟซเครือข่ายจากรายการที่ `tcpdump -D` คืนมา
- เริ่มจับแพ็กเก็ต แสดงจำนวนแพ็กเก็ตและอัตราต่อวินาที (pps) แบบเรียลไทม์
- บันทึกประวัติการจับลง `tcpdump_results.json`

### 5.5 เครื่องมืออื่น ๆ
- **Topology Designer:** ออกแบบแผนผังเครือข่ายและเชื่อมต่ออุปกรณ์
- **Traceroute / Subnet Calculator:** ตรวจสอบเส้นทางและคำนวณซับเน็ต
- **Scapy Runner:** สร้างและส่งแพ็กเก็ตทดสอบด้วย Scapy
- **Practical & Assessment:** แบบฝึกหัดปฏิบัติและเกณฑ์การให้คะแนน
- **Admin:** แดชบอร์ดสำหรับผู้ดูแลระบบจัดการผู้ใช้และข้อมูล

### 5.6 การตรวจสอบสิทธิ์
แดชบอร์ด Python (พอร์ต 8765) ต้อง login ก่อนใช้งาน เริ่มต้น username `admin` รหัสผ่าน `changeme` (แนะนำเปลี่ยนผ่านตัวแปรสภาพแวดล้อม `AUTH_USER` และ `AUTH_PASS`)

---

## 6. Development Evidence | หลักฐานการพัฒนาและประวัติเวอร์ชัน

### ประวัติการจัดเก็บใน Git (เวอร์ชันหลัก)
| เวอร์ชัน | Commit | รายละเอียด |
|---------|--------|-------------|
| Initial | `459349d` | Initial commit |
| V1.0 เริ่มโครงการ | `4cd9172` | start project V1.0 |
| ML pipeline / blog | `e3a7212` | EngineAI V1.0, ML pipeline, Next.js blog |
| Data engineering platform | `cb6c54f` | add DataAir data engineering platform |
| ปัจจุบัน | `17f9020` | chore: stop tracking data-engineering-platform (moved to its own repo) |

### หลักฐานการพัฒนา
- **ต้นทะเบียนโค้ด:** ไฟล์ `server.py` (Python), `app/` (Next.js/React), `components/`, `lib/`
- **สคริปต์ติดตั้ง:** `install-macos.sh`, `install-windows.ps1`, `start.sh`, `start.bat`
- **ไฟล์กำหนดค่าการสร้าง:** `Dockerfile`, `docker-compose.yml`, `package.json`
- **ไฟล์ผลลัพธ์ตัวอย่าง:** `results.json`, `data/iperf_results.json`, `data/tcpdump_results.json`, `data/scapy_results.json`
- **โลโก้ระบบ:** `logo.svg`
- **เอกสารคำแนะนำ:** `README.md`

### วิธีตรวจสอบประวัติการพัฒนา
```bash
cd /Users/maaeyeng/network-d
git log --oneline
git show <commit-id>
```

---

## 7. Ownership Declaration | คำรับรองความเป็นเจ้าของ

ข้าพเจ้าในฐานะผู้พัฒนาระบบ Network-D ขอรับรองว่า

1. ระบบ Network-D ทั้งหมด รวมถึงรหัสต้นฉบับ (source code) เอกสารประกอบ รูปภาพ และทรัพย์สินดิจิทัลอื่น ๆ ที่อยู่ในโครงการนี้ เป็นผลงานที่ข้าพเจ้าพัฒนาขึ้นด้วยตนเอง หรือได้รับอนุญาตให้ใช้ภายใต้เงื่อนไขที่เหมาะสมแล้ว

2. รหัสต้นฉบับในไฟล์ `server.py`, `app/`, `components/`, `lib/` และไฟล์อื่น ๆ ในโครงการนี้ ได้รับการเขียนและบำรุงรักษาโดยผู้พัฒนาระบบนี้

3. เครื่องมือโอเพนซอร์สที่ใช้ภายในระบบ (เช่น Next.js, React, iperf3, tcpdump, scapy) เป็นทรัพย์สินของเจ้าของลิขสิทธิ์แต่ละราย และใช้ภายใต้สัญญาอนุญาตของแต่ละเครื่องมือ ไม่ได้อ้างความเป็นเจ้าของในส่วนดังกล่าว

4. เอกสารฉบับนี้จัดทำขึ้นเพื่อเป็นหลักฐานประกอบระบบ Network-D และข้าพเจ้าเป็นเจ้าของลิขสิทธิ์ในเอกสารนี้รวมถึงเนื้อหาที่ข้าพเจ้าแต่งขึ้นทั้งหมด

---

**ผู้จัดทำเอกสาร:** ผู้พัฒนาระบบ Network-D  
**วันที่จัดทำ:** 23 พฤศจิกายน 2567 (2026-11-23)  
**เวอร์ชันเอกสาร:** 1.0  
**ระบบ:** Network-D

---

## 8. ระบบออกแบบระบบเครือข่าย (Network System Design System) | เครื่องมือออกแบบโทโพโลยีเครือข่าย

### 8.1 ภาพรวม
ระบบออกแบบระบบเครือข่าย (Network Topology Designer) คือเครื่องมือลากแล้ววาง (drag-and-drop) สำหรับออกแบบและจำลองโครงข่ายคอมพิวเตอร์บนเว็บ ผู้ใช้สามารถวางอุปกรณ์เครือข่าย เชื่อมต่อด้วยสายประเภทต่างๆ กำหนดที่อยู่ IP/VLAN และบันทึกแบบจำลองโทโพโลยีได้ ระบบรองรับทั้งตัวอย่างสำเร็จรูปและการสร้างจากศูนย์

อยู่ในเส้นทาง: `/topology`  
โค้ดหลัก: `app/topology/page.js`, `lib/topology.js`, `lib/topology-examples.js`, `lib/topology-images.js`, `lib/topology-labs.js`, `components/DeviceIcon.js`

### 8.2 คลังอุปกรณ์ (Device Catalog)
ระบบมีอุปกรณ์เครือข่ายในคลัง ดังนี้:

| อุปกรณ์ | ชั้น OSI | บทบาท | คำอธิบาย |
|---------|---------|--------|-----------|
| PC / Workstation | L1–L7 | ปลายทางผู้ใช้ | ต้นทางหรือปลายทางของข้อมูล เชื่อมเข้าสวิตช์ด้วยสาย UTP |
| Laptop | L1–L7 | ปลายทางเคลื่อนที่ | เชื่อมไร้สายผ่าน Access Point (Wi-Fi 802.11) รองรับ roaming |
| Server | L1–L7 | ผู้ให้บริการ | Web, DNS, DHCP, File, Database, Email มี IP คงที่ (Static) |
| Switch | L2 (หรือ L3) | เชื่อมโครงข่ายท้องถิ่น | ส่ง Frame ตาม MAC Address รองรับ VLAN, STP, Link Aggregation |
| Router | L3 | รัวต์ต่อระหว่างเครือข่าย | ส่งแพ็กเก็ตตาม IP Address ทำหน้าที่ Default Gateway และ NAT |
| Hub | L1 | กระจายสัญญาณ Broadcast | ส่งออกทุกพอร์ต 半 duplex ถูกสวิตช์แทนที่ในงานสมัยใหม่ |
| Access Point | L2 | เชื่อมอุปกรณ์ Wi-Fi | ใช้ CSMA/CA กำหนด SSID WPA2/WPA3 รองรับ roaming |
| Firewall | L3–L7 | ตัวกรองความปลอดภัย | ตรวจกรองทราฟฟิกตาม ACL บันทึก Log |
| Modem | L1 | แปลงดิจิทัล–อนาล็อก | เชื่อมต่อ LAN กับ ISP |
| Cloud / Internet | WAN | เครือข่ายภายนอก | แทนอินเทอร์เน็ต ISP WAN Cloud |

### 8.3 ประเภทสายเคเบิลและหัวต่อ (Cable & Connector)

**ประเภทสาย (Cable Types):**
| สาย | สี | บทบาท | รายละเอียด |
|-----|----|--------|-------------|
| User LAN | น้ำเงิน | เชื่อมโครงข่ายผู้ใช้ | UTP Cat5e/Cat6 1–10 Gbps เชื่อม PC, โนตบุ๊ก, AP เข้าสวิตช์ |
| Uplink / Trunk | เหลือง | เชื่อมสวิตช์หรือแบ็คบอน | พาข้อมูลหลาย VLAN tag 802.1Q มักใช้ใยแก้ว |
| Management Network | แดง | เครือข่ายจัดการอุปกรณ์ | แยกจากทราฟฟิกผู้ใช้ OOB, iLO/iDRAC, SNMP, SSH |
| Server Network | เขียว | เชื่อมเซิร์ฟเวอร์และระบบหลังบ้าน | ความเร็วสูง เสถียรสูง แยก VLAN เฉพาะ |
| Console / Management | ขาว | สายคอนซูลตั้งค่าและกู้คืน | Rollover สาย console อัตรา baud 9600 ไม่ต้องใช้ IP |
| WAN / Internet | ส้ม | เชื่อมออกเครือข่ายภายนอก | ผ่าน ISP โมเด็ม ไฟร์วอลล์ NAT |

**หัวต่อ (Connectors):**
- **สายคู่บิดเกลียว (Twisted Pair / LAN):** RJ-45, RJ-45 Coupler, Keystone Jack
- **สายไฟเบอร์ออปติก (Fiber Optic):** SC, LC, ST, FC
- **สายโคแอกเชียล (Coaxial):** BNC, F-Type

### 8.4 ตัวอย่างโทโพโลยีสำเร็จรูป (Sample Topologies)
ระบบมีตัวอย่างโทโพโลยีแบ่งตามระดับความยาก (1 = เริ่มต้น, 2 = กลาง, 3 = ขั้นสูง):

| ตัวอย่าง | ระดับ | คำอธิบาย |
|----------|-------|-----------|
| หน้าเปล่า (เริ่มใหม่) | 1 | กระดานว่าง สร้างโครงข่ายด้วยตนเองตั้งแต่ต้น |
| PC ↔ Switch | 1 | การเชื่อมต่อพื้นฐานที่สุด คอมพิวเตอร์เชื่อมสวิตช์ด้วยสาย User LAN |
| Client – Switch – Server | 1 | เพิ่มเซิร์ฟเวอร์ ใช้ Server Network ให้บริการ Client |
| ตั้งค่าผ่าน Console | 1 | ใช้สาย Console ตั้งค่าหรือกู้คืนอุปกรณ์แบบ out-of-band |
| Switch – Router – WAN | 2 | เชื่อมเครือข่ายภายในออกอินเทอร์เน็ต ผ่าน Default Gateway |
| สองสวิตช์ + Trunk (VLAN) | 2 | เชื่อมสวิตช์สองตัวด้วย Uplink/Trunk พาข้อมูลหลาย VLAN |
| องค์กรครบวงจร (Firewall + WAN + VLAN + WiFi) | 3 | โครงข่ายองค์กรตัวอย่าง ครบเครื่องมือ |
| Bus Topology | 1 | อุปกรณ์ใช้สายร่วมกันหนึ่งเส้น (จำลองด้วย Hub) |
| Star Topology | 1 | อุปกรณ์ทุกตัวเชื่อมเข้าสวิตช์ตรงกลาง |
| Ring Topology | 2 | เชื่อมต่อเป็นวงกลม ข้อมูลเดินรอบวง |
| Mesh Topology | 3 | เชื่อมทุกโหนดถึงกันหลายเส้น ความทนทานสูงสุด |
| Tree Topology | 2 | โครงสร้างลำดับชั้น Core, Distribution, Access |
| Hybrid Topology | 3 | ผสมหลายแบบเข้าด้วยกัน |

### 8.5 ฟีเจอร์การออกแบบและการทำงาน
- **ลากและวางอุปกรณ์:** เลือกอุปกรณ์จากคลังด้านซ้ายแล้ววางบนกระดานออกแบบ
- **ต่อสายเชื่อมต่อ:** เลือกอุปกรณ์ต้นทางและปลายทางแล้วเลือกประเภทสาย
- **กำหนดค่าอุปกรณ์:** ตั้งที่อยู่ IP, subnet mask, gateway, VLAN สำหรับแต่ละโหนด
- **ดูตัวอย่างภาพจริง:** รองรับการแสดงภาพอุปกรณ์และสายจริงจาก `public/img/`
- **เชื่อมโยงกับห้องทดลอง:** แต่ละประเภทอุปกรณ์เชื่อมโยงกับหมายเลขห้องทดลองที่เกี่ยวข้องใน `lib/topology-labs.js`
- **บันทึกและเรียกใช้:** บันทึกแบบจำลองโทโพโลยีและเรียกกลับมาแก้ไขภายหลัง

### 8.6 โครงสร้างโค้ดของระบบออกแบบ
```
lib/topology.js         # คลังอุปกรณ์ ประเภทสาย หัวต่อ และแผนที่ข้อมูล
lib/topology-examples.js# ตัวอย่างโทโพโลยีสำเร็จรูป 12 แบบ
lib/topology-images.js  # เส้นทางภาพอุปกรณ์ สาย และหัวต่อจริง
lib/topology-labs.js    # เชื่อมโยงอุปกรณ์กับห้องทดลองปฏิบัติ
app/topology/page.js    # หน้าออกแบบโทโพโลยีหลัก (Next.js)
components/DeviceIcon.js# ไอคอน SVG ของอุปกรณ์เครือข่ายแต่ละชนิด
```

ตัวอย่างข้อมูลอุปกรณ์ในระบบออกแบบ (จาก `lib/topology.js`):

```js
export const DEVICES = [
  { type: "switch", name: "สวิตช์ (Switch)", layer: "L2 (หรือ L3)",
    role: "เชื่อมโครงข่ายท้องถิ่น",
    desc: "ส่ง Frame ตาม MAC Address โดยอ้างอิง CAM/MAC table รองรับ VLAN, STP และ Link Aggregation" },
  { type: "router", name: "เราเตอร์ (Router)", layer: "L3",
    role: "รัวต์ต่อระหว่างเครือข่าย",
    desc: "ส่งแพ็กเก็ตตาม IP Address ระหว่างเครือข่ายต่าง ๆ ด้วย Routing Table" },
  // ... อุปกรณ์อื่น ๆ
];
```

ตัวอย่างตัวอย่างโทโพโลยี (จาก `lib/topology-examples.js`):

```js
{
  id: "ex-enterprise",
  level: 3,
  title: "องค์กรครบวงจร (Firewall + WAN + VLAN + WiFi)",
  nodes: [
    { key: "isp", type: "cloud", ip: "203.0.113.1" },
    { key: "fw", type: "firewall", ip: "192.168.1.1", vlan: "1" },
    { key: "sw", type: "switch", ip: "192.168.1.2", vlan: "10" },
    { key: "srv", type: "server", ip: "10.0.0.10", vlan: "20" },
    { key: "ap", type: "ap", ip: "192.168.1.3", vlan: "30" },
  ],
  links: [
    { a: "isp", b: "fw", cable: "wan" },
    { a: "fw", b: "sw", cable: "uplink" },
    { a: "sw", b: "srv", cable: "server" },
    { a: "sw", b: "ap", cable: "user-lan" },
  ],
}
```

### 8.7 ความสัมพันธ์กับส่วนอื่นของระบบ
ระบบออกแบบเครือข่ายเชื่อมโยงกับฟีเจอร์อื่นใน Network-D ดังนี้:
- **iPerf3 Dashboard:** ทดสอบประสิทธิภาพแบนด์วิดท์บนโครงข่ายที่ออกแบบ
- **tcpdump Dashboard:** จับและวิเคราะห์แพ็กเก็ตบนลิงก์ที่ออกแบบไว้
- **Traceroute / Subnet Calculator:** ตรวจสอบเส้นทางและคำนวณซับเน็ต
- **Practical & Assessment:** เชื่อมโยงตัวอย่างโทโพโลยีกับห้องทดลองและเกณฑ์ให้คะแนน
