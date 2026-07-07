import requests

# 1. 사용자 설정 정보 (본인의 정보로 변경하세요)
ZONE_ID = "YOUR_CLOUDFLARE_ZONE_ID"
API_TOKEN = "YOUR_CLOUDFLARE_API_TOKEN"
DOMAIN_NAME = "changesit.kjh9211.kr"  # 요청하신 서브 도메인 적용

# 2. 등록할 GitHub Pages 주소 목록 (A 레코드 및 AAAA 레코드)
dns_records = [
    # IPv4 (A 레코드)
    {"type": "A", "content": "185.199.108.153"},
    {"type": "A", "content": "185.199.109.153"},
    {"type": "A", "content": "185.199.110.153"},
    {"type": "A", "content": "185.199.111.153"},
    
    # IPv6 (AAAA 레코드)
    {"type": "AAAA", "content": "2606:50c0:8000::153"},
    {"type": "AAAA", "content": "2606:50c0:8001::153"},
    {"type": "AAAA", "content": "2606:50c0:8002::153"},
    {"type": "AAAA", "content": "2606:50c0:8003::153"}
]

# Cloudflare API 엔드포인트 및 헤더 설정
url = f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/dns_records"
headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

print(f"=== {DOMAIN_NAME}에 대한 GitHub Pages DNS 레코드(A 및 AAAA) 등록 시작 ===")

for record in dns_records:
    data = {
        "type": record["type"],
        "name": DOMAIN_NAME,
        "content": record["content"],
        "ttl": 3600,        # TTL 설정 (1시간, 자동을 원하면 1 입력)
        "proxied": False    # GitHub Pages는 프록시(주황색 구름)를 끄는 것이 안전합니다.
    }
    
    response = requests.post(url, json=data, headers=headers)
    result = response.json()
    
    if result.get("success"):
        print(f"[성공] {record['type']} 레코드 추가 완료: {record['content']}")
    else:
        errors = result.get("errors", [])
        error_msg = errors[0].get("message") if errors else "알 수 없는 오류"
        print(f"[실패] {record['type']} 레코드 ({record['content']}) 등록 실패 이유: {error_msg}")

print("=== 모든 레코드 등록 작업 완료 ===")