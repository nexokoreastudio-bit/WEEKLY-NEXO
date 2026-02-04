# 발행물 작성 시 참조할 워크스페이스 자료

워크스페이스(`Nexo_workspace`) 안의 여러 프로젝트 내용을 참고해 **매주 목요일 발행물**을 만들 수 있습니다.

---

## 📁 참조할 폴더/프로젝트 위치

현재 워크스페이스 기준 경로: **`/Users/nexo_jo/Desktop/Nexo_workspace/`**

| 프로젝트 | 경로 | 참조용도 |
|---------|------|----------|
| **Nexo_Content_Hub** | `Nexo_Content_Hub/` | 전자칠판 활용법·쇼츠 기획서 → 발행물 **본문·업데이트·핵심 메시지** |
| **넥소 업무** | `넥소 업무/` | NEXO & CRM(영상 자막·문서), NEXO & SMMT(공동구매), 노원지구협력업체(K-AI 프로모션) → **CRM·공동구매·협력업체 소식** |
| **Nexo_web_bro_1** | `Nexo_web_bro_1/` | 넥소 웹사이트(제품, 매뉴얼, 리소스) → **제품 소개·기능·이미지** |
| **Gukpul** | `Gukpul/` | 국풀/교육 콘텐츠·이미지 → **교육 활용 사례·스크린샷** |
| **WEEKLY-NEXO** | `WEEKLY-NEXO/` | 전자신문 본 프로젝트. 발행물 데이터는 `js/editions-data.js` |

---

## 📌 Nexo_Content_Hub → 발행물로 쓰는 방법

Content Hub에는 **쇼츠/영상 기획서**가 날짜·주제별로 들어 있습니다. 이걸 그대로 발행물의 “이번 호 소식”이나 “활용 팁”으로 옮기면 됩니다.

### 폴더 구조 예시

```
Nexo_Content_Hub/
├── 2026-01-14_전자칠판 활용법 3_쇼츠/
│   └── 1_기획/전자칠판 활용법 3_기획서.md   ← 고급 활용 팁 3가지
├── 2026-01-14_전자칠판 활용편 4_쇼츠/
│   └── 1_기획/전자칠판 활용편 4_기획서.md   ← 외부 자료 불러오기·실시간 판서
├── 2026-01-14_전자칠판의활용법2_쇼츠/
├── 2026-01-14_전판 법 1_쇼츠/
└── 기획서_템플릿.md
```

### 기획서 → 발행물 필드 매핑

| 기획서 항목 | editions-data.js 필드 |
|-------------|------------------------|
| **제목** / **핵심 메시지** | `title`, `headline`, `subHeadline` |
| **목적** / **본문** | `content.main` (HTML 가능) |
| **컨텐츠 구조 (본문)** | `content.features` 배열, 또는 `updates[]` |
| **생성일** | 발행 목요일과 맞추어 `id`, `date` 결정 |

### 활용 예시 (전자칠판 활용법 3)

- **기획서**: "화면 캡처 후 주석 달기", "무선 화면 공유", "분할 화면·위젯"
- **발행물**:  
  - `updates[]`에 "소프트웨어: 화면 캡처 후 주석", "소프트웨어: 무선 화면 공유" 등 추가  
  - `content.main`에 같은 내용을 문단으로 요약

### 활용 예시 (전자칠판 활용편 4)

- **기획서**: "PDF·웹·이미지 한 번에 불러오기", "실시간 판서·공유"
- **발행물**:  
  - 헤드라인/서브라인: "어떤 자료든 전자칠판에서 즉시 불러와 판서하고, 현장에서 바로 공유하세요"  
  - `content.main`에 위 메시지 + 구체적 사용법 1~2문단

---

## 📌 Nexo_web_bro_1 → 발행물로 쓰는 방법

- **index.html / product.html / manual.html / resources.html / video.html**  
  → 제품 소개 문구, 기능 설명, 매뉴얼 요약을 복사해 `content.main`이나 `content.features`에 넣기
- **images/**  
  → 필요한 이미지는 WEEKLY-NEXO의 `assets/images/`에 복사한 뒤, `editions[].images[]`에 `filename`만 지정

---

## 📌 발행물 하나 만드는 순서 (참조 활용)

1. **발행 목요일 정하기**  
   예: 2026-02-12 → `id: "2026-02-12"`, `date: "2026년 2월 12일 목요일"`

2. **참조할 자료 정하기**  
   - 이번 주에는 Content Hub의 “전자칠판 활용법 3” + “활용편 4”만 쓴다 등

3. **기획서/웹 문구 요약**  
   - 핵심 메시지 → `headline`, `subHeadline`  
   - 목적+본문 → `content.main` (필요하면 `<p>`, `<strong>`, `<ul>` 사용)  
   - 3~5개 키워드 → `content.features[]`  
   - 새 기능/소식 → `updates[]` (category, version, description, date)

4. **이미지**  
   - WEEKLY-NEXO `assets/images/`에 있는 파일만 사용  
   - `images[]`에 최대 3개, `filename`, `alt`, `caption` 지정

5. **editions-data.js 수정**  
   - `EDITIONS_DATA.editions` 배열 **맨 앞**에 새 객체 추가  
   - 저장 후 브라우저에서 해당 호 선택해서 확인

6. **미리 만들기·자동 오픈**  
   - `id`를 미래 목요일로 두면, 그날 전에는 목록에 안 보이고, 해당 목요일이 지나면 자동 공개됨 (HOW_TO_ADD_EDITION.md 참고)

---

## 💡 Cursor AI 활용 예시

채팅에서 이렇게 요청하면, 참조 자료를 반영해 발행물 초안을 만들어 줄 수 있습니다.

- "Nexo_Content_Hub의 전자칠판 활용법 3, 활용편 4 기획서 참고해서 2026년 2월 12일 발행분 추가해줘"
- "Nexo_web_bro_1 제품 페이지 내용 참고해서 이번 주 발행물 content.main 써줘"

이 문서(`REFERENCE_CONTENT_FOR_EDITIONS.md`)와 `HOW_TO_ADD_EDITION.md`를 함께 참고하면, 워크스페이스 자료를 활용한 발행물 작성이 가능합니다.
