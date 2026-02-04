# 매거진(기사)과 쌤 도구함 추가 가이드

리뉴얼로 추가된 **매거진(articles)** 과 **NEXO 쌤 도구함(tools)** 을 호별로 넣는 방법입니다.

---

## 📌 개요

- **매거진**: 칼럼/뉴스 형태의 읽을거리. 메인 본문 아래 2~3단 그리드로 표시됩니다.
- **쌤 도구함**: 수업용 위젯(예: 5분 타이머)과 다운로드 자료(엑셀, PDF)를 사이드바에 표시합니다.
- 두 필드 모두 **선택**입니다. 없으면 해당 섹션은 안 나오고, 기존 발행분과 호환됩니다.

---

## 📄 매거진 (articles)

### 데이터 형식

```javascript
"articles": [
  {
    "type": "column",   // "column" | "news"
    "title": "기사 제목",
    "author": "작성자명",
    "content": "<p>HTML 본문. <strong>강조</strong> 가능.</p>",
    "tags": ["태그1", "태그2"]
  }
]
```

| 필드 | 필수 | 설명 |
|------|------|------|
| type | ✅ | `column`(칼럼) 또는 `news`(뉴스). 스타일만 다르게 표시됨. |
| title | ✅ | 기사 제목 |
| author | 선택 | 작성자 (예: 넥소 에디터) |
| content | ✅ | 본문. HTML 사용 가능. |
| tags | 선택 | 문자열 배열. 카드 하단에 태그로 표시됨. |

### 예시

```javascript
{
  "type": "column",
  "title": "전자칠판, 이렇게 쓰면 수업이 달라진다",
  "author": "넥소 에디터",
  "content": "<p>많은 선생님들이...</p><p>두 번째 문단.</p>",
  "tags": ["전자칠판", "수업 활용", "팁"]
}
```

---

## 🧰 쌤 도구함 (tools)

### 1) 위젯 (type: 'widget')

클릭 시 모달이 열리고, **이름(name)**에 따라 동작이 정해집니다.

| name | 동작 |
|------|------|
| `timer` | 5분 집중 타이머 (시작/일시정지/리셋) |
| 그 외 | "이 도구는 준비 중입니다" 메시지 |

```javascript
{
  "type": "widget",
  "name": "timer",
  "title": "5분 집중 타이머",
  "icon": "⏰"
}
```

### 2) 다운로드 (type: 'download')

클릭 시 **url**에 있는 파일을 다운로드합니다. 파일이 없으면 "자료 준비 중" 안내만 표시됩니다.

```javascript
{
  "type": "download",
  "title": "상담 일지 양식",
  "url": "assets/downloads/상담일지양식.xlsx",
  "fileType": "XLSX"
}
```

- **url**: `assets/downloads/` 아래 실제 파일 경로. 파일이 있어야 다운로드됨.
- **fileType**: 표시용 (예: XLSX, PDF). 선택.

**실제 파일 준비**: `DOWNLOAD_FILES_GUIDE.md` 참고.

---

## 📂 넣는 위치

`js/editions-data.js`에서 해당 호(edition) 객체 안에 `articles`, `tools` 배열을 추가합니다.

```javascript
{
  "id": "2026-02-12",
  "date": "2026년 2월 12일 목요일",
  // ... 기존 필드 ...
  "images": [ /* ... */ ],
  "articles": [ /* 위 형식으로 1개 이상 */ ],
  "tools": [ /* 위 형식으로 1개 이상 */ ]
}
```

- 새 호 추가 시: `HOW_TO_ADD_EDITION.md` 절차대로 만든 뒤, 같은 호 객체에 `articles`, `tools`만 더 넣으면 됩니다.
- 기존 호에 추가: 해당 호 객체 맨 아래(다른 배열 다음)에 `,` 붙이고 `"articles": [...]`, `"tools": [...]` 추가.

---

## 🔗 관련 문서

- **다운로드 파일 준비**: `DOWNLOAD_FILES_GUIDE.md`
- **발행분 추가 전체**: `HOW_TO_ADD_EDITION.md`
- **리뉴얼 계획/범위**: `RENEWAL_PLAN.md`
