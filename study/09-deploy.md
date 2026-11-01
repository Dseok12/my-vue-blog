# Stage 9 — 배포: Oracle Cloud 무료 VM 에 이 프로젝트 올리기

> 전체 로드맵: [study/README.md](README.md) · 이전: [08 어떤 프로젝트든 만드는 법](08-build-any-project.md) · 관련: [06 백엔드 Level 7](06-backend.md), [07 Vue 심화 10장](07-vue-advanced.md)

**이 문서 하나만 따라 하면**, 지금 `frontend/` + `backend/` + MySQL 로 만든 이 앱을
**평생 무료**로 인터넷에 배포하고 HTTPS 주소까지 붙일 수 있다.

- 비용: **0원** (도메인을 산다면 연 1.5만 원 정도, 안 사도 됨)
- 소요 시간: 처음이면 2~3시간
- 결과물: `https://내주소` 로 접속되는, 재배포해도 이미지가 안 날아가는 실제 서비스

> 이 방식은 [06 백엔드](06-backend.md) Level 7(PM2 + Nginx + VPS)을 그대로 실습하는 것이다.
> 관리형 서비스(Render, Vercel 등)와 달리 **서버 한 대를 직접 다루므로** 배우는 게 많다.

---

## 0. 전체 그림

```
                 인터넷
                   │  https://내주소
                   ▼
        ┌────────────────────────┐
        │   Oracle Cloud VM      │   Ubuntu 22.04, 평생 무료
        │  ┌──────────────────┐  │
        │  │  Nginx (80/443)  │  │   ← HTTPS 종료, 리버스 프록시
        │  │   /      → dist  │  │   ← 프론트 빌드 결과 (정적 파일)
        │  │   /api   → :4000 │  │   ← 백엔드로 전달
        │  │   /uploads → 디스크 │  │   ← 업로드 이미지 직접 서빙
        │  └──────────────────┘  │
        │  ┌──────────────────┐  │
        │  │ Node (PM2) :4000 │  │   ← backend/  Express API
        │  └──────────────────┘  │
        │  ┌──────────────────┐  │
        │  │  MySQL 8 :3306   │  │   ← localhost 전용
        │  └──────────────────┘  │
        │   /opt/diary/backend/uploads/  ← 이미지가 진짜 디스크에 저장 (안 날아감)
        └────────────────────────┘
```

**한 대에서 프론트와 백을 같이 서빙한다.** 도메인이 하나뿐이라 CORS 문제가 아예 안 생긴다.

### 준비물

- 해외결제 가능한 카드 (본인 확인용. **과금되지 않는다.** Always Free 자원만 쓰면 0원)
- 이메일, 휴대폰
- 로컬 PC 터미널 (macOS/Linux 기본 터미널, Windows 는 PowerShell 또는 WSL)
- 이 저장소가 GitHub 에 올라가 있을 것 (https://github.com/Dseok12/my-vue-blog)

---

## Part 1 — Oracle Cloud 계정과 VM 만들기

### 1-1. 가입

1. https://www.oracle.com/kr/cloud/free/ → **무료로 시작하기**
2. 국가: **South Korea**, 이름/이메일 입력
3. 홈 리전(Region): **South Korea Central (Chuncheon)** 또는 **South Korea North (Seoul)**
   → 이 선택은 **나중에 못 바꾼다.** 한국 리전을 고른다.
4. 카드 등록 (해외결제 활성화된 카드여야 함. 체크카드도 됨). $0 승인 후 취소됨
5. 가입 완료까지 5~10분

> **"Upgrade to Paid" 안내가 떠도 무시한다.** Always Free 자원만 쓰면 영원히 0원이다.
> 유료로 올려도 Always Free 자원은 계속 무료다 (오히려 인스턴스 회수를 안 당해서 유리).

### 1-2. VM 인스턴스 생성

콘솔 로그인 → 좌측 메뉴 **Compute → Instances → Create Instance**

| 항목 | 선택 | 메모 |
| --- | --- | --- |
| Name | `diary-server` | 아무 이름 |
| Image | **Ubuntu 22.04** (Canonical Ubuntu) | Oracle Linux 아님 |
| Shape | **VM.Standard.A1.Flex** — OCPU **2**, Memory **12 GB** | ARM. 빌드가 넉넉함 |
| (A1 이 "out of capacity" 라면) | **VM.Standard.E2.1.Micro** | x86, 1GB RAM. 아래 1-5 참고 |
| SSH keys | **Generate a key pair for me** → 개인키(.key) 저장 | 이 파일 잃어버리면 접속 못 함 |
| Networking | 기본값 (새 VCN 자동 생성) | |
| Boot volume | 기본 (47GB 이상) | Always Free 는 총 200GB 까지 |

**Create** 클릭 → 2분 뒤 상태가 **Running** 이 되면 **Public IP 주소**를 복사한다 (예: `152.67.xxx.xxx`).

### 1-3. 방화벽 1 — Oracle 쪽 (Security List)

Oracle 은 기본적으로 80/443 을 막아 둔다. 열어 줘야 한다.

인스턴스 상세 화면 → **Primary VNIC → Subnet 클릭 → Security Lists → Default Security List → Add Ingress Rules**

두 개를 추가한다.

| Source CIDR | IP Protocol | Destination Port |
| --- | --- | --- |
| `0.0.0.0/0` | TCP | `80` |
| `0.0.0.0/0` | TCP | `443` |

(22 번 SSH 는 기본으로 열려 있다.)

### 1-4. SSH 접속

로컬 터미널에서:

```bash
# 내려받은 키 파일 권한을 잠근다 (안 하면 접속 거부됨)
chmod 600 ~/Downloads/ssh-key-*.key

# 접속 (ubuntu 가 기본 사용자)
ssh -i ~/Downloads/ssh-key-*.key ubuntu@152.67.xxx.xxx
```

`yes` 입력 후 프롬프트가 `ubuntu@diary-server:~$` 로 바뀌면 성공.

> 매번 긴 명령을 치기 싫으면 `~/.ssh/config` 에 등록한다.
> ```
> Host diary
>   HostName 152.67.xxx.xxx
>   User ubuntu
>   IdentityFile ~/Downloads/ssh-key-2026-01-01.key
> ```
> 이제 `ssh diary` 만 치면 된다.

### 1-5. (E2.1.Micro 를 쓰는 경우만) 스왑 추가

1GB RAM 으로는 `npm install` 중 멈춘다. 가상 메모리(스왑) 2GB 를 만든다.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h   # Swap: 2.0Gi 확인
```

또한 이 경우 **프론트엔드 빌드는 로컬 PC 에서 하고** `dist/` 만 서버로 올리는 게 안전하다 (Part 3-4 에 방법 있음).

---

## Part 2 — 서버 기본 세팅

SSH 로 접속한 상태에서 진행한다.

### 2-1. 패키지 업데이트와 방화벽 2 (우분투 쪽)

```bash
sudo apt update && sudo apt upgrade -y

# 우분투 자체 방화벽도 80/443/22 만 연다
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
sudo ufw status
```

> **Oracle 이미지의 함정:** 우분투에 `iptables` 규칙이 미리 박혀 있어서 `ufw` 만으로는
> 안 열릴 때가 있다. 나중에 사이트가 안 뜨면 이걸 실행한다.
> ```bash
> sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
> sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
> sudo netfilter-persistent save
> ```

### 2-2. Node.js 22 설치

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git
node -v   # v22.x
npm -v
```

### 2-3. MySQL 8 설치와 보안 설정

```bash
sudo apt install -y mysql-server
sudo systemctl enable --now mysql

# 보안 초기 설정 (대화형)
sudo mysql_secure_installation
```

`mysql_secure_installation` 응답 가이드:

| 질문 | 답 |
| --- | --- |
| VALIDATE PASSWORD component? | `n` (개인 프로젝트는 생략해도 됨) |
| Set root password? | `y` → 강한 비밀번호 입력 (메모) |
| Remove anonymous users? | `y` |
| Disallow root login remotely? | `y` |
| Remove test database? | `y` |
| Reload privilege tables? | `y` |

### 2-4. 앱 전용 DB 와 계정 만들기

**root 를 앱에서 직접 쓰지 않는다.** 이 앱만 쓸 계정을 따로 만든다.

```bash
sudo mysql
```

```sql
CREATE DATABASE my_vue_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'diary_app'@'localhost' IDENTIFIED BY '여기에_긴_비밀번호';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, REFERENCES
  ON my_vue_blog.* TO 'diary_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> `CREATE, DROP, ALTER, REFERENCES, INDEX` 를 준 이유: 이 프로젝트의 `npm run db:migrate` 가
> 테이블과 외래 키를 직접 만들기 때문이다. 마이그레이션을 한 번 돌린 뒤 보안을 더 조이고 싶으면
> `SELECT, INSERT, UPDATE, DELETE` 만 남기고 나머지를 `REVOKE` 해도 된다.

접속 확인:

```bash
mysql -u diary_app -p my_vue_blog -e "SELECT 1;"
```

### 2-5. Nginx 설치

```bash
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

브라우저에서 `http://152.67.xxx.xxx` 접속 → **Welcome to nginx!** 가 보이면 방화벽까지 정상.
안 보이면 2-1 의 `iptables` 명령을 실행한다.

---

## Part 3 — 앱 배포

### 3-1. 코드 내려받기

```bash
sudo mkdir -p /opt/diary
sudo chown ubuntu:ubuntu /opt/diary
git clone https://github.com/Dseok12/my-vue-blog.git /opt/diary
cd /opt/diary
```

> 비공개 저장소라면: GitHub → Settings → Developer settings → Personal access token 을 만들고
> `git clone https://<토큰>@github.com/Dseok12/my-vue-blog.git /opt/diary`

### 3-2. 백엔드 설정

```bash
cd /opt/diary/backend
npm ci --omit=dev
```

`.env` 파일을 만든다. (`.env.example` 을 복사해서 채운다)

```bash
cp .env.example .env
nano .env
```

`.env` 내용 — 아래처럼 채운다:

```bash
NODE_ENV=production
PORT=4000

# 자기 도메인/IP. 한 대에서 같이 서빙하므로 프론트와 같은 주소다.
# 도메인이 아직 없으면 http://152.67.xxx.xxx 로 시작하고, HTTPS 붙인 뒤 바꾼다.
CORS_ORIGIN=https://내주소
PUBLIC_BASE_URL=https://내주소

# Nginx 뒤에서 실행하므로 1 로 둔다. (없으면 모든 사용자가 127.0.0.1 로 보여서
# 로그인 시도 제한이 전체 사용자에게 한꺼번에 걸린다)
TRUST_PROXY=1

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=diary_app
DB_PASSWORD=2-4에서_정한_비밀번호
DB_NAME=my_vue_blog

# 반드시 새로 생성한다. 아래 명령의 출력을 붙여넣는다.
JWT_SECRET=여기에_랜덤값
JWT_EXPIRES_IN=7d
```

`JWT_SECRET` 생성:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**테이블을 만든다:**

```bash
npm run db:migrate
```

`[migrate] 완료` 같은 메시지가 나오면 성공. (`--fresh` 는 절대 쓰지 않는다 — 데이터가 다 지워진다.)

예시 데이터를 넣어 보고 싶으면 (선택):

```bash
npm run db:seed
```

**PM2 로 상시 실행:**

```bash
sudo npm install -g pm2

pm2 start src/server.js --name diary-api
pm2 logs diary-api --lines 20      # [api] ... 실행 중 / [db] 연결했습니다 확인 (Ctrl+C 로 빠져나옴)

# 서버 재부팅 시 자동 실행 등록
pm2 startup systemd -u ubuntu --hp /home/ubuntu
# 위 명령이 출력하는 sudo ... 줄을 복사해서 그대로 실행
pm2 save
```

동작 확인:

```bash
curl http://localhost:4000/api/health
# {"status":"ok","time":"..."}
```

### 3-3. 프론트엔드 빌드 (서버에서)

A1.Flex(RAM 6GB+) 를 쓰면 서버에서 바로 빌드한다.

```bash
cd /opt/diary/frontend
```

`.env.production` 을 만든다:

```bash
nano .env.production
```

```bash
VITE_APP_TITLE=나만의 다양한 diary
VITE_USE_MOCK=false
# 같은 도메인에서 서빙하므로 상대경로면 충분하다. Nginx 가 /api 를 백엔드로 넘긴다.
VITE_API_BASE_URL=/api
```

빌드:

```bash
npm ci
npm run build      # frontend/dist/ 생성
ls dist            # index.html, assets/ 확인
```

### 3-4. (E2.1.Micro 를 쓰는 경우) 로컬에서 빌드해 업로드

서버 대신 **내 PC** 의 프로젝트 폴더에서:

```bash
cd frontend
# .env.production 을 위와 동일하게 만든 뒤
npm run build
# dist 를 서버로 전송
rsync -avz -e "ssh -i ~/Downloads/ssh-key-*.key" dist/ ubuntu@152.67.xxx.xxx:/opt/diary/frontend/dist/
```

### 3-5. 정적 파일을 Nginx 가 읽을 수 있게

```bash
# uploads 폴더가 없으면 만든다 (multer 가 자동 생성하지만 권한 확인용)
mkdir -p /opt/diary/backend/uploads

# Nginx(www-data) 가 dist 와 uploads 를 읽도록 상위 폴더 실행권한을 준다
chmod 755 /opt /opt/diary /opt/diary/frontend /opt/diary/backend
```

---

## Part 4 — Nginx 리버스 프록시 설정

```bash
sudo nano /etc/nginx/sites-available/diary
```

아래를 붙여넣는다. `server_name` 만 자기 것으로 바꾼다 (도메인이 없으면 공인 IP 를 쓴다).

```nginx
server {
    listen 80;
    server_name 내주소;          # 예: diary.example.com  또는  152.67.xxx.xxx

    # 업로드 이미지 용량 한도 (앱은 10MB, 여유 있게)
    client_max_body_size 12M;

    # 1) 프론트엔드 — Vue 빌드 결과
    root /opt/diary/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA: 새로고침해도 라우터가 처리
    }

    # 정적 자산은 캐시를 길게
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 2) API — 백엔드로 전달
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3) 업로드 이미지 — 디스크에서 직접 서빙 (백엔드를 안 거쳐서 빠름)
    location /uploads/ {
        alias /opt/diary/backend/uploads/;
        expires 7d;
        add_header Cache-Control "public";
        access_log off;
    }
}
```

활성화하고 다시 로드:

```bash
sudo ln -s /etc/nginx/sites-available/diary /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t          # syntax is ok / test is successful
sudo systemctl reload nginx
```

이제 `http://내주소` 로 접속하면 앱이 뜬다. 회원가입 → 로그인 → 글 작성 → 이미지 업로드까지 해 본다.

---

## Part 5 — 도메인과 HTTPS

HTTP 만으로도 동작하지만, `localStorage` 토큰·보안상 HTTPS 가 필요하다.

### 5-1. 도메인 준비 (셋 중 하나)

| 방법 | 비용 | 방법 |
| --- | --- | --- |
| **직접 구입** (권장) | 연 1~2만 원 | 가비아, Cloudflare Registrar, Namecheap 등에서 `.com`/`.dev` 구입 |
| **DuckDNS** (무료) | 0원 | https://www.duckdns.org → `내이름.duckdns.org` 만들고 공인 IP 등록 |
| **IP 직접** | 0원 | 도메인 없이 `https` 는 못 붙인다. 도메인이 있어야 인증서가 나온다 |

도메인을 샀거나 DuckDNS 를 만들었으면, **A 레코드**가 VM 의 공인 IP 를 가리키게 한다.

```
유형: A    이름: @ (또는 diary)    값: 152.67.xxx.xxx    TTL: 자동
```

전파 확인 (몇 분~1시간):

```bash
dig +short 내도메인      # 152.67.xxx.xxx 가 나와야 함
```

### 5-2. Let's Encrypt 무료 인증서

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 내도메인
```

- 이메일 입력, 약관 `A`, 뉴스레터 `N`
- "redirect HTTP to HTTPS?" → **2 (Redirect)** 선택

certbot 이 Nginx 설정을 자동으로 고쳐 `listen 443 ssl` 과 인증서 경로를 넣어 준다.
인증서는 **90일마다 자동 갱신**된다 (`systemctl status certbot.timer` 로 확인).

### 5-3. 도메인 기준으로 환경변수 재조정

```bash
cd /opt/diary/backend
nano .env
# CORS_ORIGIN=https://내도메인
# PUBLIC_BASE_URL=https://내도메인
pm2 restart diary-api
```

프론트는 `VITE_API_BASE_URL=/api` 그대로면 다시 빌드할 필요 없다.

이제 `https://내도메인` 완성.

---

## Part 6 — 운영

### 6-1. 코드 수정 후 재배포 스크립트

`/opt/diary/deploy.sh` 를 만든다:

```bash
nano /opt/diary/deploy.sh
```

```bash
#!/usr/bin/env bash
set -e
cd /opt/diary

echo "▶ 코드 갱신"
git pull origin main

echo "▶ 백엔드"
cd backend
npm ci --omit=dev
npm run db:migrate          # 새 테이블/변경이 있으면 적용 (없으면 그냥 통과)
pm2 restart diary-api

echo "▶ 프론트엔드"
cd ../frontend
npm ci
npm run build

echo "▶ Nginx"
sudo nginx -t && sudo systemctl reload nginx

echo "✅ 배포 완료"
```

```bash
chmod +x /opt/diary/deploy.sh
```

앞으로는 로컬에서 코드를 고쳐 `git push` 한 뒤, 서버에서 `/opt/diary/deploy.sh` 한 줄이면 끝.

> E2.1.Micro(로컬 빌드) 방식이면 스크립트에서 프론트 부분을 빼고, 로컬에서 빌드 후 `rsync` 한다.

### 6-2. 자동 백업 (매일 새벽 3시)

```bash
mkdir -p /opt/diary/backups
crontab -e
```

맨 아래에 추가:

```cron
0 3 * * * mysqldump -u diary_app -p'DB비밀번호' --single-transaction my_vue_blog | gzip > /opt/diary/backups/db-$(date +\%F).sql.gz
5 3 * * * find /opt/diary/backups -name 'db-*.sql.gz' -mtime +14 -delete
```

**복구 연습을 한 번은 해 본다** (백업이 있어도 복구해 본 적 없으면 없는 것과 같다):

```bash
gunzip < /opt/diary/backups/db-2026-01-01.sql.gz | mysql -u diary_app -p my_vue_blog_test
```

업로드 이미지도 가끔 내 PC 로 받아 둔다:

```bash
rsync -avz -e "ssh -i ~/Downloads/ssh-key-*.key" ubuntu@내IP:/opt/diary/backend/uploads/ ./uploads-backup/
```

### 6-3. 인스턴스 회수 방지 (Always Free 무료 계정만)

Oracle 은 **7일간 CPU·네트워크·메모리 사용률이 모두 매우 낮은** 무료 인스턴스를 회수할 수 있다.
방문자가 적은 개인 프로젝트는 위험하다. 대응:

- **가장 확실:** 콘솔에서 **"Upgrade to Pay As You Go"** 로 전환. Always Free 자원은 계속 0원이고, 회수 대상에서 빠진다.
- **또는:** 외부 무료 모니터링(`cron-job.org`, `uptimerobot.com`)에서 5분마다 `https://내도메인/api/health` 를 호출하게 걸어 둔다.

### 6-4. 자주 쓰는 명령

```bash
pm2 status                    # 프로세스 상태
pm2 logs diary-api            # 실시간 로그
pm2 restart diary-api         # 재시작
sudo tail -f /var/log/nginx/error.log
sudo systemctl status mysql
df -h                         # 디스크 여유
free -h                       # 메모리
```

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| `http://IP` 접속이 아예 안 됨 | Oracle Security List 또는 우분투 iptables | Part 1-3, Part 2-1 의 iptables 명령 |
| Nginx "Welcome" 만 나옴 | `sites-enabled/default` 가 남아 있음 | `sudo rm /etc/nginx/sites-enabled/default && sudo systemctl reload nginx` |
| 화면은 뜨는데 로그인/목록이 안 됨 | 프론트가 mock 모드거나 API 주소 틀림 | `.env.production` 에 `VITE_USE_MOCK=false`, `VITE_API_BASE_URL=/api` 확인 후 재빌드 |
| API 가 502 Bad Gateway | 백엔드가 안 떠 있음 | `pm2 logs diary-api` 로 원인 확인 (대개 DB 접속 실패) |
| `[db] 연결하지 못했습니다` | `.env` 의 DB 정보 틀림 | `mysql -u diary_app -p my_vue_blog` 로 직접 접속 테스트 |
| 이미지 업로드는 되는데 안 보임 | `PUBLIC_BASE_URL` 미설정 또는 Nginx `/uploads` 경로 | `.env` 의 `PUBLIC_BASE_URL`, Nginx `alias` 경로 끝의 `/` 확인 |
| 새로고침하면 404 | Nginx SPA 설정 누락 | `location / { try_files $uri $uri/ /index.html; }` |
| `npm ci` 가 멈춤/killed | 메모리 부족 (E2.1.Micro) | Part 1-5 스왑 추가, 또는 로컬 빌드 |
| certbot 실패 | A 레코드 전파 전 / 80 포트 막힘 | `dig +short 도메인` 확인, 방화벽 80 확인 |
| 한글이 `?` 로 저장됨 | DB charset | `my_vue_blog` 를 `utf8mb4` 로 만들었는지 (Part 2-4) |
| 며칠 뒤 서버가 사라짐 | Oracle 무료 인스턴스 회수 | Part 6-3 |

---

## 완료 체크리스트

- [ ] `https://내도메인` 으로 접속되고 자물쇠(🔒) 표시가 뜬다
- [ ] 회원가입 → 로그아웃 → 재로그인이 된다
- [ ] 새로고침해도 로그인이 유지된다
- [ ] 다이어리를 쓰고, 이미지를 첨부하고, 이미지가 화면에 보인다
- [ ] `/opt/diary/deploy.sh` 로 재배포한 뒤에도 **기존 이미지가 그대로 있다**
- [ ] 서버를 재부팅해도 (`sudo reboot`) 앱이 다시 자동으로 뜬다
- [ ] `/opt/diary/backups/` 에 오늘 날짜 백업 파일이 생겼다 (하루 뒤 확인)
- [ ] `curl https://내도메인/api/health` 가 `{"status":"ok"}` 를 준다

여기까지 하면 **"만들 줄만 알고 배포는 못 하는"** 단계를 벗어난 것이다.
다음 프로젝트부터는 이 문서의 Part 3~6 만 반복하면 된다.

---

## 다음 단계

- **GitHub Actions 로 자동 배포** — `main` 에 push 하면 서버가 알아서 `deploy.sh` 실행
  ([06 백엔드](06-backend.md) Level 7-3 참고. `appleboy/ssh-action` 사용)
- **업로드를 오브젝트 스토리지로** — 서버를 여러 대로 늘리거나 VM 을 옮겨도 이미지가 유지됨
  ([06 백엔드](06-backend.md) Level 6-12, Cloudflare R2 무료 10GB)
- **모니터링** — UptimeRobot(무료)로 다운 감지 시 이메일 알림
- **보안 강화** — 기본 보안 헤더와 로그인 시도 제한은 이미 있다. Nginx 뒤에서는 `app.set('trust proxy', 1)` 을 켜야 요청 제한이 실제 IP 를 본다. 헤더를 더 늘리려면 `helmet` ([06 백엔드](06-backend.md) Level 5-1)
