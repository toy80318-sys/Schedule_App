(() => {
  if (document.getElementById('image-preview')) return;
  const style = document.createElement('style');
  style.textContent = `
    [data-image-preview]{cursor:zoom-in}
    [data-image-preview]:focus-visible{outline:3px solid #30bba7;outline-offset:4px}
    #image-preview{box-sizing:border-box;width:96vw;max-width:1800px;height:92dvh;max-height:96dvh;padding:16px;border:1px solid #65716d;border-radius:12px;background:#15201e;color:white}
    #image-preview::backdrop{background:rgba(0,0,0,.85)}
    #image-preview[open]{display:flex;flex-direction:column;gap:12px}
    #image-preview .preview-bar{display:flex;align-items:center;justify-content:space-between;gap:16px}
    #image-preview .preview-title{margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 17px/1.4 system-ui}
    #image-preview button{flex-shrink:0;padding:8px 16px;border:1px solid #99aaa4;border-radius:7px;background:#29473f;color:white;font:16px system-ui;cursor:pointer}
    #image-preview .preview-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;background:conic-gradient(#3b4543 25%,#303936 0 50%,#3b4543 0 75%,#303936 0) 0/24px 24px}
    #image-preview img{display:block;width:100%;height:100%;object-fit:contain}
    #image-preview .preview-sprite{flex:none;width:min(calc(92dvh - 100px),85vw);max-width:100%;max-height:100%;background-repeat:no-repeat}
    #image-preview [hidden]{display:none!important}
    @media print{#image-preview{display:none!important}}
  `;
  document.head.append(style);
  const dialog = document.createElement('dialog');
  dialog.id = 'image-preview';
  dialog.setAttribute('aria-labelledby', 'image-preview-title');
  dialog.innerHTML = '<div class="preview-bar"><h2 class="preview-title" id="image-preview-title"></h2><button type="button" aria-label="확대 이미지 닫기">닫기 ×</button></div><div class="preview-stage"><img hidden alt=""><div class="preview-sprite" hidden role="img"></div></div>';
  document.body.append(dialog);
  const title = dialog.querySelector('h2');
  const image = dialog.querySelector('img');
  const sprite = dialog.querySelector('.preview-sprite');
  let previousOverflow = '';
  function open(target) {
    title.textContent = target.getAttribute('alt') || target.getAttribute('aria-label') || '이미지 크게 보기';
    image.hidden = target.tagName !== 'IMG';
    sprite.hidden = !image.hidden;
    if (!image.hidden) {
      const link = target.closest('a');
      const original = link && /^(https?:|file:)$/.test(link.protocol) && /\.(png|jpe?g|webp|gif|avif|svg)([?#].*)?$/i.test(link.href);
      image.alt = title.textContent;
      image.src = target.getAttribute('data-original-src') || (original ? link.href : target.currentSrc || target.src);
    } else {
      const css = getComputedStyle(target);
      for (const key of ['backgroundImage', 'backgroundPosition', 'backgroundSize', 'backgroundColor', 'filter']) sprite.style[key] = css[key];
      const bounds = target.getBoundingClientRect();
      sprite.style.aspectRatio = `${bounds.width} / ${bounds.height}`;
      sprite.setAttribute('aria-label', title.textContent);
    }
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
  }
  document.querySelectorAll('main img, main [role="img"]').forEach(target => {
    if (target.getAttribute('data-image-navigation') === 'true') return;
    target.dataset.imagePreview = '';
    target.tabIndex = 0;
    target.title = '클릭하여 크게 보기 · Enter 키로도 열 수 있습니다';
  });
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-image-preview]');
    if (!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open(target);
  });
  document.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-image-preview]')) {
      event.preventDefault();
      open(event.target);
    }
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    image.removeAttribute('src');
  });
})();
