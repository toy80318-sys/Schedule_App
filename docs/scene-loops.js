(() => {
  'use strict';
  const theme = document.getElementById('theme'), kind = document.getElementById('kind');
  const grid = document.getElementById('items'), message = document.getElementById('message');
  let data;
  const pause = () => grid.querySelectorAll('video').forEach(v => v.pause());
  const link = (label, href) => { const a = document.createElement('a'); a.textContent = label; a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; };
  function render() {
    pause(); grid.replaceChildren();
    const items = data.items.filter(i => (theme.value === 'all' || i.theme === theme.value) && (kind.value === 'all' || i.category === kind.value));
    const reference = document.getElementById('reference'); reference.replaceChildren();
    const scene = data.scenes.find(s => s.theme === theme.value);
    if (scene) {
      const details = document.createElement('details'); details.className = 'reference';
      const summary = document.createElement('summary'); summary.textContent = scene.name + ' · 통합 유화와 조명 기준 보기';
      const image = document.createElement('img'); image.src = scene.preview; image.alt = scene.name + ' 통합 유화'; image.loading = 'lazy';
      const p = document.createElement('p'); p.textContent = scene.lighting;
      details.append(summary, image, p, link('이 배경의 꽃·PNG 보기', 'lighting-sets.html#' + scene.backgroundId)); reference.append(details);
    }
    for (const item of items) {
      const card = document.createElement('article'); card.className = 'card';
      const title = document.createElement('h2'); title.textContent = item.id + ' · ' + item.name;
      const badge = document.createElement('span'); badge.className = 'badge' + (item.category === 'cloud' ? '' : ' pending');
      badge.textContent = item.category === 'cloud' ? '기존 60초 루프 · 검토용' : item.newRawVideo ? (item.rejected ? '불합격 · 재제작 승인 대기' : '새 영상 생성 · 검수·컨펌 전') : '입력 이미지 준비 · 새 영상 생성 전';
      const stage = document.createElement('div'); stage.className = 'stage';
      const media = document.createElement(item.category === 'cloud' ? 'video' : 'img');
      if (item.category === 'cloud') {
        media.src = item.alphaVideo; media.poster = item.sourceAlpha; media.controls = true; media.muted = true; media.loop = true; media.playsInline = true; media.preload = 'none'; media.setAttribute('aria-label', item.name + ' 구름 알파 루프');
      } else { media.src = item.preview; media.alt = item.name + (item.category === 'flower' ? ' 봉오리 생성 입력' : ' 루프 생성 입력'); media.loading = 'lazy'; }
      stage.append(media);
      const info = document.createElement('p'); info.className = 'small'; info.textContent = item.backgroundId + ' / ' + item.lightingId + ' · ' + item.lighting;
      const links = document.createElement('p'); links.className = 'links'; links.append(link('원본 입력 PNG', item.input));
      if (item.reviewURL) links.append(link('새 영상·검수 상태', item.reviewURL));
      if (item.category === 'cloud') {
        const toggle = document.createElement('button'); toggle.type = 'button'; toggle.textContent = '단색 영상으로 보기';
        toggle.onclick = () => { const solid = toggle.textContent === '단색 영상으로 보기'; media.pause(); media.src = solid ? item.solidVideo : item.alphaVideo; toggle.textContent = solid ? '알파 영상으로 보기' : '단색 영상으로 보기'; };
        links.append(link('단색 MP4', item.solidVideo), link('알파 WebM', item.alphaVideo));
        card.append(title, badge, stage, toggle, info, links);
      } else card.append(title, badge, stage, info, links);
      grid.append(card);
    }
    const ready = items.filter(i => i.category === 'cloud' || i.newRawVideo).length;
    document.getElementById('count').textContent = `${items.length}종 · 검토 영상 ${ready}종 / 입력만 ${items.length - ready}종`;
    message.textContent = scene ? scene.name + '에 맞는 라이팅의 소스입니다.' : '배경과 요소를 선택하면 필요한 소스만 볼 수 있습니다.';
    const url = new URL(location.href); url.searchParams.set('theme', theme.value); url.searchParams.set('kind', kind.value); history.replaceState(null, '', url);
  }
  document.getElementById('pause').onclick = pause;
  theme.onchange = kind.onchange = () => data && render();
  fetch('scene-loops-data.json').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(value => {
    data = value; const params = new URLSearchParams(location.search);
    if ([...theme.options].some(o => o.value === params.get('theme'))) theme.value = params.get('theme');
    if ([...kind.options].some(o => o.value === params.get('kind'))) kind.value = params.get('kind');
    render();
  }).catch(() => { message.textContent = '자료를 불러오지 못했습니다. 새로고침해 주세요.'; });
})();
