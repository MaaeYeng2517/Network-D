FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    iperf3 tcpdump iproute2 net-tools \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt* ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi
RUN pip install --no-cache-dir scapy 2>/dev/null || true

COPY logo.svg server.py /app/
COPY static /app/static

ENV IPERF_HOST=0.0.0.0
ENV IPERF_PORT=8765
LABEL org.opencontainers.image.title="Network-D" \
      org.opencontainers.image.description="Network-D แพลตฟอร์มเรียนรู้เครือข่าย 16 สัปดาห์: เว็บ Next.js บทเรียน + Dashboard Python สร้าง-รัน-กราฟ iperf3/tcpdump แบบ realtime SSE + Scapy runner. ใช้ Docker: docker run --rm -it --net=host --cap-add=NET_ADMIN --cap-add=NET_RAW -p 8765:8765 maae120617/network-d" \
      org.opencontainers.image.source="https://github.com/maae120617/network-d" \
      org.opencontainers.image.url="https://github.com/maae120617/network-d" \
      io.artifacthub.logo_url="https://raw.githubusercontent.com/maae120617/network-d/main/logo.svg" \
      io.artifacthub.description="Network-D แพลตฟอร์มเรียนรู้เครือข่าย 16 สัปดาห์: เว็บ Next.js บทเรียน + Dashboard Python สร้าง-รัน-กราฟ iperf3/tcpdump แบบ realtime SSE + Scapy runner. ใช้ Docker: docker run --rm -it --net=host --cap-add=NET_ADMIN --cap-add=NET_RAW -p 8765:8765 maae120617/network-d"

CMD ["python3", "server.py"]
