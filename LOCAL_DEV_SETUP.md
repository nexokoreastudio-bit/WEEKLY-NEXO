# 로컬 개발: main(8080) + develop(8090) 동시 작업

main은 8080, develop은 8090에서 각각 보고 싶을 때 아래처럼 **폴더 두 개**로 나누어 쓰면 됩니다.

---

## 1. 폴더 구성

같은 브랜치를 한 폴더에서 두 포트로 동시에 보여줄 수는 없으므로, **저장소를 두 번 클론**해서 씁니다.

| 폴더 | 브랜치 | 포트 | 용도 |
|------|--------|------|------|
| `WEEKLY-NEXO` (현재 폴더) | **main** | **8080** | 메인(프로덕션) 로컬 확인 |
| `WEEKLY-NEXO-develop` (새 폴더) | **develop** | **8090** | 개발 작업 + 개발자 배포 미리보기 |

---

## 2. 한 번만 할 설정

### develop 전용 폴더 만들기

```bash
# 현재 WEEKLY-NEXO가 있는 상위 폴더로 이동 후
cd /Users/nexo_jo/Desktop/Nexo_workspace

# 같은 저장소를 다른 이름으로 한 번 더 클론
git clone https://github.com/nexokoreastudio-bit/WEEKLY-NEXO.git WEEKLY-NEXO-develop

cd WEEKLY-NEXO-develop
git checkout develop
```

이제:

- **WEEKLY-NEXO** → 여기서는 `main`만 사용 (8080)
- **WEEKLY-NEXO-develop** → 여기서는 `develop`만 사용 (8090)

---

## 3. 매일 로컬에서 띄우기

### main 로컬 (8080)

```bash
cd /Users/nexo_jo/Desktop/Nexo_workspace/WEEKLY-NEXO
git checkout main
git pull origin main
npm run serve:8080
```

브라우저: **http://localhost:8080**

### develop 로컬 (8090)

```bash
cd /Users/nexo_jo/Desktop/Nexo_workspace/WEEKLY-NEXO-develop
git checkout develop
git pull origin develop
npm run serve:8090
```

브라우저: **http://localhost:8090**

두 터미널을 열어서 위 두 개를 각각 실행하면, 8080은 main, 8090은 develop 내용을 동시에 볼 수 있습니다.

---

## 4. develop 작업 후 → 개발자 배포 모드로 보기

develop에서 수정한 뒤 **원격 develop**에 푸시하면, Netlify **브랜치 배포**로 개발자용 URL에서 확인할 수 있습니다.

```bash
cd /Users/nexo_jo/Desktop/Nexo_workspace/WEEKLY-NEXO-develop
git add .
git commit -m "원하는 커밋 메시지"
git push origin develop
```

- Netlify에서 **Branch deploys**가 켜져 있으면  
  예: `https://develop--weekly-nexo.netlify.app` 같은 주소로 배포됩니다.
- 해당 URL이 “개발자 배포 모드”로 보는 주소입니다.

---

## 5. 요약

| 하고 싶은 일 | 어디서 | 포트 / URL |
|--------------|--------|-------------|
| main 내용 로컬로 보기 | WEEKLY-NEXO 폴더, `main` 브랜치 | `npm run serve:8080` → http://localhost:8080 |
| develop 내용 로컬로 보기 | WEEKLY-NEXO-develop 폴더, `develop` 브랜치 | `npm run serve:8090` → http://localhost:8090 |
| develop을 개발자 배포로 보기 | develop 푸시 후 | Netlify 브랜치 배포 URL (예: develop--weekly-nexo.netlify.app) |

이렇게 하면 main은 8080 로컬, develop은 8090 로컬로 작업하고, develop만 푸시해서 개발자 배포 모드로 볼 수 있습니다.
