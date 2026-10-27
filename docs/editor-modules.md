# 에디터 기능별 수정 위치

- `procedural-garden.js`: 시드 기반 PCG 배치 규칙, 소재 선택, 영역·밀도·군집 분포, 꽃·풀·돌 생성, 교체 범위 계산.
- `procedural-ui.js` / `procedural.css`: 첫 화면의 PCG 설정, 영역 드래그, 비파괴 미리보기, 생성·갱신·설정 불러오기.
- `app.js`: 배치 데이터, 선택 상태, 실행 취소·다시 실행, 저장과 전시 연결. 밀도 변경도 이곳에서 한 번만 이력에 기록합니다.
- `group-density.js`: 그룹·대상 이미지 범위, 10% 개수 계산, 무작위 제거·추가. 화면 없이 테스트할 수 있는 계산 모듈입니다.
- `group-density-ui.js`: 그룹과 대상 이미지 선택, 밀도 버튼, 수량 표시. 선택 그룹 밖에는 적용하지 않습니다.
- `editor-layout.js`: 그룹 / 배치·편집 / 배경·색상 / 효과·공간 / 소스·저장의 도구 배치 목록. 기존 DOM을 이동하므로 버튼의 이벤트와 입력값을 유지합니다.
- `editor-layout.css`: 도구 탭, 접이식 기능 묶음, 반응형 화면.
- 기존 색보정·블러·다운로드는 각각 `background-grade-ui.js`, `focus-blur-ui.js`, `source-download.js`에서 수정합니다.

도구를 추가할 때 `editor-layout.js`의 해당 분류에 기존 요소 ID를 등록하세요. 배치·저장 데이터 형식은 UI 배치 모듈에서 변경하지 않습니다.

검증: `node tests/group-density.test.cjs`, `node tests/editor-layout.test.cjs` 및 전체 `tests/*.test.cjs`. 화면 검수에서는 대상 이미지 외 요소 보존, 실행 취소, 저장·불러오기, 색보정·블러 패널, PNG/Unity 내보내기 진입을 확인합니다.

그룹 만들기·해제, 대상별 밀도, A/B/C/D 스타일 라이브러리, 그룹 파일 저장, 자동 군집 배치, 저장 그룹 색상 혼합은 모두 `groups` 탭에 등록합니다. Unity 전달은 `unityDelivery` 영역으로 분리해 소스·저장 탭에서 유지합니다.

PCG 설정은 생성된 일반 오브젝트의 `procedural.params`에 저장됩니다. 그룹을 선택하고 설정을 불러오면 같은 시드로 재생성할 수 있습니다. 새 꽃밭 추가가 기본이고, 기존 꽃·풀·돌 교체는 사용자가 체크한 경우에만 적용합니다. 배경·후경·대기 요소를 유지하며, 실제 변경과 실행 취소 기록은 `app.js`의 `applyProcedural`이 담당합니다.

곡선 PCG는 `procedural-curves.js`의 보간·영역 판정·호 길이 계산을 가이드와 배치 계산에서 함께 사용합니다. `shape`, `points`, `smooth`, `spacing`, `spread`, `planting`을 레시피에 저장합니다. 닫힌 곡선은 내부에, 열린 라인은 간격·흩어짐에 따라 심으며 꽃만/풀·잎만도 지원합니다. 제어점 조작은 배치 데이터를 바꾸지 않고, 생성·갱신 시에만 한 번의 실행 취소 이력을 만듭니다.

- `flower-shape-catalog.js` registers 12 AI-generated transparent silhouettes without changing the canonical V05 set. `flower-shapes.js` chooses same-species, same-theme and same-color forms and preserves planted roots; the editor bridge adds one undo step. `flower-shapes-ui.js` exposes selected/all flower variation, the source comparison gallery and the existing verified ZIP exporter. New PCG beds recommend all 27 V05-compatible flower sources per theme; saved asset IDs remain unchanged.

- `procedural-layers.js` stores up to 12 independent PCG lines/regions and combines them into one normal editable group with a 1,600-object limit. Explicit material lists preserve empty selections. Each line retains its own seed, element IDs, curve points and rules; legacy single-line groups remain readable. `procedural-ui.js` owns the line manager, individual material checkboxes and editable guides.

게임 모드는 기존 `exhibitionTab` / `exhibitionFrame`과 `jeju-exhibition-*` 메시지를 그대로 사용합니다. `app.js`는 편집 준비와 이미지 추가가 끝난 뒤 현재 `E.project()`를 iframe으로 전달하고, 편집 복귀나 브라우저 비활성 시 게임 실행을 중단하도록 알립니다. 꽃잎 흩날림·살랑임·터치 상태는 `player.js`의 일시적인 게임 상태이며 에디터 객체·실행 취소·저장 JSON을 바꾸지 않습니다. 에디터의 드래그·선택 입력 경로에는 게임 반응을 추가하지 않습니다. 새 개화 영상은 포함하지 않습니다. 연결 회귀 검사는 `node tests/editor-game-bridge.test.cjs`로 실행합니다.

게임 분위기 v82는 `player.js`에서 앞·초점면·뒤의 세 깊이 입자, 제한된 구름 이동, 뿌리를 고정한 꽃·풀의 서로 다른 흔들림을 처리합니다. `player.html`의 `#atmosphereControls`는 `#viewport` 안의 `#stage` 바깥에 두어 독립 화면과 iframe 모두에서 보이고 꽃 터치 입력과 분리됩니다. `atmosphereRichness`·`atmosphereFocus`·`atmosphereWind`는 게임 실행 설정이며 에디터 배치·PNG 원본·저장 JSON을 변경하지 않습니다. `build_player_embed.py`로 같은 조절판과 의존성을 iframe 템플릿에 재현하며 `tests/game-embed.test.cjs`에서 구조와 버전 일치를 확인합니다. 실제 개화 애니메이션은 별도 제작 범위입니다.

밝은 배경 전용 v83은 `set-review-catalog.js`가 선택 목록·배경 카드·원본 링크를 최신 4종으로 등록하고 `backgroundReplacements`에 삭제된 등록 URL의 정확한 대응표를 만듭니다. `app.js`는 자동 복원·파일/저장본 불러오기·배경 API·실행 취소에서 이를 사용하며 사용자 배경 URL은 추측하지 않습니다. 시작 교체는 새 이미지 준비와 이전 작업 백업 커밋을 확인한 뒤 진행합니다. 실패 복구 경로만 이전 URL을 그대로 보존합니다.


## 배경 기준 추상 유화 꽃 v83

`scene-flower-catalog.js`는 통합 장면 4장을 참고해 제작한 꽃 48종(12종 × 4형태)을 등록합니다. 기존 120종 원본과 저장 배치는 유지하며, 이전 형태 12종의 ID는 새 A형 원본으로 연결합니다. PCG 추천은 새 형태를 우선하고 조명이 반전되지 않도록 원본 방향을 사용합니다. `flower-shapes.html`에서 기준 장면·4형태·원본을 비교하고 에디터 ZIP으로 내려받을 수 있습니다. 새 소스는 정지 이미지이며 기존 개화 영상을 연결하지 않습니다.

`atmosphere84-catalog.js`는 새로 생성한 구름 4종·프리즘 나비 4종·빛 입자 4종의 온전한 RGBA 원본을 등록합니다. 에디터의 “구름·나비·빛 12종” 탭과 `atmosphere-assets.html` 비교 페이지에서 확인할 수 있습니다. 기존 배경과 저장 배치에는 자동 추가하지 않으며 새 개화·비행 애니메이션은 포함하지 않습니다.

## 5초 움직임 루프 v85

`atmosphere85-catalog.js`는 검수 승인된 12종의 새 ID만 추가합니다. 원본 V84 `src/file/sha256`을 유지하므로 PNG 다운로드는 중복 없이 보존됩니다. `frames`는 480×480 원본 150장이고 `loopVideo`는 게임용 알파 WebM입니다. 에디터는 `previewFrames`의 128×128 150장만 예열하여 12종 전체의 디코딩 픽셀을 112.5MiB로 제한합니다. 미배치된 v85 캐시의 Blob을 해제하고 진행 중 예열을 취소하며, 이전 비동기 작업이 새 캐시를 덮거나 되살리지 못하게 토큰을 확인합니다. PNG 내보내기는 미리보기를 우회하고 480 프레임을 읽습니다. `atmosphere-loops.html`에서 보색 MP4·투명 WebM과 생성 영상 움직임을 주기화한 파생 경로를 구분해 확인할 수 있습니다.
