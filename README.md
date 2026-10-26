# 제주 메이즈랜드 유화 정원

2026-10-27 v64: 네 시간대 정원의 꽃에 좌우 방향과 약 ±10° 이내의 각도 차이를 섞습니다. 줄기 하단의 심어진 위치, 크기·색상·레이어는 유지합니다. **꽃 방향 다양하게** 버튼은 선택한 꽃에 적용하고, 선택한 꽃이 없으면 전체 꽃에 적용합니다. 변경은 한 번에 실행 취소할 수 있습니다. 편집한 저장본은 자동으로 덮어쓰지 않으며, 새 시간대 시안에는 방향 차이를 기본 적용합니다. PNG 원본은 유지하고 배치의 회전·좌우 반전으로 표현합니다.

2026-10-27 v63: 에디터 상단의 **화면 전체 파티클 뿌리기**로 현재 배경 조명의 입자 72개를 벽면 전체에 추가합니다. 크기·불투명도·위치가 자연스럽게 달라지고, 한 그룹으로 선택되어 수정할 수 있습니다. 한 번의 실행 취소로 배치를 되돌립니다. 기존 배치와 저장 파일 형식을 유지하며 전시 보기와 Unity 전달에 일반 PNG 객체로 포함됩니다. 움직임을 새로 생성하는 기능은 아닙니다.

공유 자료실: https://toy80318-sys.github.io/Schedule_App/library.html
전체 이미지·소스: https://toy80318-sys.github.io/Schedule_App/all-images.html#gardens
배경별 루프: https://toy80318-sys.github.io/Schedule_App/scene-loops.html

2026-10-22 v37: 기존 로컬 전체 보기의 12개 섹션을 공개 페이지로 연결했습니다. 큰 HTML에 들어 있던 이미지는 외부 WebP 미리보기로 분리하고 원본 PNG 링크를 유지했습니다. 공통 이동 메뉴와 링크 복사, 시간대·요소 필터를 제공합니다. `?embed=1`에서는 공통 메뉴를 숨겨 기존 삽입 화면을 유지합니다.

구름 8종의 기존 60초 단색·알파 루프와 꽃 16종·나비 8종의 생성 입력은 Supabase `jeju-maze-v14/release-20261022-v37`에 있습니다. 새 꽃·나비 루프는 생성 전입니다. 개화 영상 16종은 검토본이며 F05 금잔화 A는 키 배경 불합격입니다. Drive PNG 시퀀스 3,088장은 자료실에서 연결하고 알파 잔여·버전 차이를 표시합니다. 웹 게시 완료는 영상 품질 승인이나 Unity 실장비 검증을 뜻하지 않습니다.

전시용 보기: https://toy80318-sys.github.io/Schedule_App/
편집기: https://toy80318-sys.github.io/Schedule_App/editor.html
PNG 다운로드: https://toy80318-sys.github.io/Schedule_App/oil-gallery.html

GitHub Pages의 main /docs 폴더를 게시합니다. 기존 Sites 에디터 주소도 유지합니다. Supabase public Storage의 jeju-maze-v14 버킷에서 이미지를 제공합니다.
아임웹 코드 위젯에 IMWEB_EMBED.html 내용을 붙여 넣으세요. theme은 sunset/day/night/morning입니다.
버킷에는 조명 적용 원본 PNG 96개, 배경·통합시안 4096px 8개, WebP 표시용 이미지 104개, Unity ZIP 4개, PNG 상태 목록 1개가 있습니다.
화면은 WebP, 다운로드와 Unity 패키지는 원본 PNG입니다. 꽃·잎·풀·현무암·구름·나비·새의 조명을 시간대별로 맞췄습니다.
개화 검토 동영상은 별도 `single-flowers.html` 페이지에서 제공합니다. 편집기의 전시는 봉오리/만개 PNG 상태 미리보기입니다. 실제 Unity 실행·터치 장비 검증은 별도입니다.
브라우저에는 공개 이미지 URL만 포함하며 Supabase 비밀 키는 사용하지 않습니다.
