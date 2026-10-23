(() => {
  'use strict';
  if (new URLSearchParams(location.search).get('embed') === '1') return;
  const page = location.pathname.split('/').pop() || 'index.html';
  const pages = [
    ['index.html', '메인'], ['library.html', '자료실'], ['abstract-world-v44.html', '추상 유화 전체'], ['all-images.html', '전체 이미지'],
    ['oil-art.html', '통합 유화'], ['layers.html', '요소 분리·합성'], ['lighting-sets.html', '배경·조명'],
    ['oil-sources.html', 'PNG·추가 소스'], ['editor.html', '에디터'], ['old.html', '올드']
  ];
  const oldPages = ['all-images-old.html', 'abstract-flowers-v43.html', 'single-flowers.html', 'scene-loops.html',
    'generation-v38.html', 'generation-v40.html', 'production.html', 'ambient-loops.html', 'ambient-inplace.html', 'cloud-sample.html'];
  const isOld = oldPages.includes(page) || /-archive\.html$/.test(page);
  const bar = document.createElement('div');
  bar.id = 'maze-site-nav';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', '자료실 공통 메뉴');
  const links = document.createElement('div'); links.className = 'maze-nav-links';
  for (const [file, label] of pages) {
    const a = document.createElement('a'); a.href = file; a.textContent = label;
    if (file === page || file === 'old.html' && isOld) a.setAttribute('aria-current', 'page');
    links.append(a);
  }
  const share = document.createElement('button');
  share.type = 'button'; share.textContent = '링크 복사';
  share.onclick = async () => {
    try { await navigator.clipboard.writeText(location.href); share.textContent = '복사 완료'; }
    catch { share.textContent = '주소창의 링크를 복사해 주세요'; }
  };
  bar.append(links, share); document.body.prepend(bar);
  if (isOld) {
    const notice = document.createElement('aside'); notice.className = 'maze-old-notice';
    const label = document.createElement('strong'); label.textContent = '올드 · 이전 버전';
    const text = document.createElement('p'); text.textContent = '이전 제작·검토 기록입니다. 최신 이미지와 에디터는 현재 버전 메뉴에서 확인하세요.';
    const old = document.createElement('a'); old.href = 'old.html'; old.textContent = '올드 목록';
    const latest = document.createElement('a'); latest.href = 'abstract-world-v44.html'; latest.textContent = '최신 버전 보기 →';
    notice.append(label, text, old, latest); bar.after(notice);
  }
  document.body.classList.add('maze-has-nav');
  if (page === 'editor.html') document.body.classList.add('maze-editor-page');
  if (page === 'player.html') document.body.classList.add('maze-player-page');
  const size = () => document.documentElement.style.setProperty('--maze-nav-height', bar.offsetHeight + 'px');
  new ResizeObserver(size).observe(bar); size();
})();
