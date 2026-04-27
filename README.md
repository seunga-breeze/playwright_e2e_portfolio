# Playwright E2E 자동화 포트폴리오

이 프로젝트는 글로벌 e커머스 서비스 운영 환경에 적용한 자동화 아키텍처를 기반으로 구성한 포트폴리오 샘플입니다.
Playwright와 TypeScript로 구축한 대규모 e커머스 플랫폼의 E2E Test Automation Suite입니다.
다양한 국가를 병렬로 테스트합니다.

## 프로젝트 구조

```
├── api/
│   ├── ApiClient.ts          # 상품 API 호출용 HTTP 클라이언트
│   └── ProductFinder.ts      # 지역별 구매 가능 상품 동적 탐색
├── data/
│   ├── AU.json / UK.json     # 지역별 사이트 설정 및 테스트 데이터
│   ├── Checkout/             # 지역별 결제 폼 데이터 및 로케이터
│   ├── tradeIn/              # 지역별 트레이드인 기기 목록
│   └── naConfig.json         # 지역별 N/A 처리 테스트 목록 (스킵 리스트)
├── database/
│   ├── connection.ts         # 테스트 결과 저장 인터페이스 및 DB 연동 함수
│   └── reporter.ts           # 커스텀 Playwright 리포터 (onTestEnd / onEnd)
├── types/
│   └── config.ts             # 전체 프로젝트 설정 타입 정의 (ProjectConfig 등)
├── pages/                    # 페이지 오브젝트 모델 클래스
│   ├── BC.ts                 # 구매 설정(Buy Configuration) 페이지
│   ├── Cart.ts               # 장바구니 페이지
│   ├── Checkout/             # 지역별 결제 단계 분리
│   ├── PD.ts                 # 상품 상세 페이지
│   ├── PF.ts                 # 상품 찾기
│   ├── TradeIn/              # 트레이드인 팝업 플로우
│   ├── ProtectionPlan.ts     # 보호 플랜 부가 옵션
│   ├── InstallmentPlan.ts    # 할부 결제 옵션
│   └── ...
├── tests/e2e/
│   ├── Prod_BC_01.spec.ts        # 구매 설정 플로우
│   ├── Prod_Checkout_01.spec.ts  # E2E 결제
│   ├── Prod_Login_07.spec.ts     # 임시 이메일로 OTP 회원가입
│   └── Prod_PF_01.spec.ts        # 상품 찾기 → 장바구니
├── fixtures.ts               # 공유 테스트 픽스처 (페이지 오브젝트, 설정)
└── playwright.config.ts      # 멀티 프로젝트 설정 (지역별 프로젝트)
```

## 주요 설계 결정

- **데이터 기반 멀티 사이트 설정**
  각 지역(AU, UK 등)은 `data/` 하위에 독립적인 JSON 설정 파일을 갖습니다.
  `playwright.config.ts`가 런타임에 이를 읽어 지역당 하나의 Playwright 프로젝트를 생성하므로 코드 중복 없이 설정만으로 지역 차이를 처리합니다.

- **Fixture 기반 의존성 주입**
  모든 페이지 오브젝트와 사이트 설정은 `fixtures.ts`를 통해 제공됩니다.

- **조건부 테스트 로직**
  트레이드인, 보호 플랜, SIM, 할부 등 많은 기능은 모든 지역이나 상품에서 제공되지 않습니다.
  테스트는 실패 처리나 지역별 코드 중복 대신 가용성을 먼저 확인하고 분기 처리합니다.

- **API 기반 동적 상품 탐색**
  `ProductFinder.ts`가 테스트 실행 전 상품 API를 호출해 구매 가능한 상품을 실시간으로 탐색합니다.
  테스트 대상 제품의 Readiness를 확인합니다.

## 주요 테스트

- **Prod_BC_01** — 구매 설정
  GNB를 통해 상품 BC 페이지로 이동하고, 색상/용량 등 옵션을 선택한 뒤 트레이드인 및 보호 플랜을 조건부로 추가하고 장바구니에 담긴 상품을 검증합니다.

- **Prod_Login_07** — 회원가입
  브라우저 탭 두 개를 엽니다. 하나는 임시 이메일 서비스, 하나는 사이트용입니다.
  신규 계정을 생성하고 첫 번째 탭의 받은 편지함에서 OTP를 가져와 두 번째 탭에 입력한 뒤 로그인 상태를 검증합니다.

- **Prod_PF_01** — 상품 찾기
  GNB를 호버해 상품 찾기에 접근하고, 구매 가능한 상품의 구매 버튼을 클릭한 뒤 랜딩 페이지가 BC인지 PD인지 감지해 적응적으로 처리합니다.

- **Prod_Checkout_01** — E2E 결제
  PD 페이지에서 상품을 장바구니에 담고, 결제 페이지로 이동해 지역별 단계에 따라 연락처, 배송지, 청구 정보 등 전체 결제 폼을 입력합니다.

## 설치 및 실행

**1. 의존성 설치**
```bash
npm install
npx playwright install chrome
```

**2. 환경 변수 설정**
```bash
cp .env.example .env
```
`.env`를 열고 각 지역의 로그인 정보를 입력합니다:
```
AU_LOGIN_ID=your_username
AU_LOGIN_PW=your_password
UK_LOGIN_ID=your_username
UK_LOGIN_PW=your_password
```

**3. 테스트 실행**
```bash
# 전체 테스트 실행
npm test

# 특정 국가 병렬 수행 (AU, UK, workers = 4)
npx playwright test --project=AU --project=UK --workers=4

# 특정 테스트 파일 실행
npx playwright test tests/e2e/Prod_BC_01.spec.ts

# 태그로 실행
npx playwright test --grep @BC

# 헤디드 모드 실행 (비헤드리스)
npm run test:headed

# 실행 후 HTML 리포트 열기
npm run test:report
```

## 참고 사항

- 테스트는 기본적으로 비헤드리스 모드를 사용하지 않으며, Chrome 시크릿 모드에서 실행됩니다.
- 사이트 안정성을 반영하기 위해 테스트당 타임아웃은 15분으로 설정되어 있습니다.
- `naConfig.json` 스킵 리스트를 통해 특정 테스트를 테스트 코드 수정 없이 지역별로 N/A 처리할 수 있습니다.
