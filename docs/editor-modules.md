# 에디터 기능별 수정 위치

- `app.js`: 배치 데이터, 선택 상태, 실행 취소·다시 실행, 저장과 전시 연결. 밀도 변경도 이곳에서 한 번만 이력에 기록합니다.
- `group-density.js`: 그룹·대상 이미지 범위, 10% 개수 계산, 무작위 제거·추가. 화면 없이 테스트할 수 있는 계산 모듈입니다.
- `group-density-ui.js`: 그룹과 대상 이미지 선택, 밀도 버튼, 수량 표시. 선택 그룹 밖에는 적용하지 않습니다.
- `editor-layout.js`: 선택·밀도 / 배치·변형 / 배경·색상 / 효과·공간 / 소스·저장의 도구 배치 목록. 기존 DOM을 이동하므로 버튼의 이벤트와 입력값을 유지합니다.
- `editor-layout.css`: 도구 탭, 접이식 기능 묶음, 반응형 화면.
- 기존 색보정·블러·다운로드는 각각 `background-grade-ui.js`, `focus-blur-ui.js`, `source-download.js`에서 수정합니다.

도구를 추가할 때 `editor-layout.js`의 해당 분류에 기존 요소 ID를 등록하세요. 배치·저장 데이터 형식은 UI 배치 모듈에서 변경하지 않습니다.

검증: `node tests/group-density.test.cjs`, `node tests/editor-layout.test.cjs` 및 전체 `tests/*.test.cjs`. 화면 검수에서는 대상 이미지 외 요소 보존, 실행 취소, 저장·불러오기, 색보정·블러 패널, PNG/Unity 내보내기 진입을 확인합니다.
