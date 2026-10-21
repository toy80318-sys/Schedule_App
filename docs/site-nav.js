(() => {
  'use strict';
  if (new URLSearchParams(location.search).get('embed') === '1') return;
  const page = location.pathname.split('/').pop() || 'index.html';
  const pages = [
    ['library.html', '자료실'], ['all-images.html', '전체 이미지'],
    ['oil-art.html', '통합 유화'], ['lighting-sets.html', '배경·조명'],
    ['single-flowers.html', '꽃 개화'], ['scene-loops.html', '배경별 루프'],
    ['oil-sources.html', 'PNG·추가 소스'], ['editor.html', '에디터'], ['index.html', '전시 보기']
  ];
  const bar = document.createElement('div');
  bar.id = 'maze-site-nav';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', '자료실 공통 메뉴');
  const links = document.createElement('div'); links.className = 'maze-nav-links';
  for (const [file, label] of pages) {
    const a = document.createElement('a'); a.href = file; a.textContent = label;
    if (file === page) a.setAttribute('aria-current', 'page');
    links.append(a);
  }
  const share = document.createElement('button');
  share.type = 'button'; share.textContent = '링크 복사';
  share.onclick = async () => {
    try { await navigator.clipboard.writeText(location.href); share.textContent = '복사 완료'; }
    catch { share.textContent = '주소창의 링크를 복사해 주세요'; }
  };
  bar.append(links, share); document.body.prepend(bar);
  document.body.classList.add('maze-has-nav');
  if (page === 'editor.html') document.body.classList.add('maze-editor-page');
  if (page === 'player.html') document.body.classList.add('maze-player-page');
  const size = () => document.documentElement.style.setProperty('--maze-nav-height', bar.offsetHeight + 'px');
  new ResizeObserver(size).observe(bar); size();
})();
