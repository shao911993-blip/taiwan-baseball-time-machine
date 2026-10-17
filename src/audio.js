/* Local, embedded background audio. Preferences are separate from temporary
   pauses for video playback or a hidden browser tab. */
const museumMusic=(()=>{
  const audio=new Audio('{{AUDIO:liang-island}}');audio.loop=true;audio.preload='none';
  let prefs={enabled:true,volume:.18};try{const saved=JSON.parse(localStorage.getItem('museum-music')||'null');if(saved&&typeof saved.enabled==='boolean')prefs.enabled=saved.enabled;if(Number.isFinite(saved?.volume))prefs.volume=Math.max(0,Math.min(1,saved.volume));}catch{}
  audio.volume=prefs.volume;
  let entered=false,pending=false,error=false;
  const blockers=new Set(),controls=[];
  const save=()=>{try{localStorage.setItem('museum-music',JSON.stringify(prefs));}catch{}};
  const render=()=>controls.forEach(root=>{
    const toggle=root.querySelector('[data-music-toggle]');toggle.setAttribute('aria-pressed',String(prefs.enabled));toggle.textContent=prefs.enabled?'關閉音樂':'播放音樂';
    root.querySelector('summary').setAttribute('aria-label',`背景音樂${prefs.enabled?'開啟':'關閉'}，開啟音量設定`);
    root.querySelector('summary').textContent=prefs.enabled?'♫':'♩';
    root.querySelector('input').value=Math.round(prefs.volume*100);
    root.querySelector('output').textContent=Math.round(prefs.volume*100)+'%';
    root.querySelector('[data-music-status]').textContent=error?'音訊載入失敗，點播放重試':!prefs.enabled?'音樂已關閉':blockers.size?'影片播放中，音樂暫停':document.hidden?'分頁暫停中':audio.paused?'等待播放':'循環播放中';
  });
  const sync=()=>{
    if(!entered||!prefs.enabled||blockers.size||document.hidden){audio.pause();render();return;}
    if(!pending&&audio.paused){pending=true;audio.play().then(()=>{error=false;}).catch(e=>{error=e.name!=='NotAllowedError';}).finally(()=>{pending=false;if(!prefs.enabled||blockers.size||document.hidden)audio.pause();render();});}
    render();
  };
  const mount=parent=>{
    const root=document.createElement('details');root.className='music-control';
    root.innerHTML='<summary title="背景音樂設定">♫</summary><div class="music-panel"><b>亮島之歌</b><small>軍中歌詞版 · 背景音樂</small><button type="button" data-music-toggle aria-pressed="true">關閉音樂</button><label>音量 <output>18%</output><input type="range" min="0" max="100" step="1" value="18" aria-label="背景音樂音量"></label><span data-music-status role="status"></span><a href="https://www.youtube.com/watch?v=lur5Mehs59g" target="_blank" rel="noopener noreferrer">音樂來源 ↗</a></div>';
    parent.append(root);controls.push(root);
    root.querySelector('[data-music-toggle]').addEventListener('click',()=>{entered=true;prefs.enabled=!prefs.enabled;error=false;save();sync();});
    root.querySelector('input').addEventListener('input',e=>{prefs.volume=Number(e.target.value)/100;audio.volume=prefs.volume;save();render();});
  };
  mount($('.nav-actions'));
  const actions=document.createElement('div');actions.className='ex-head-actions';const close=$('#ex-close');close.before(actions);mount(actions);actions.append(close);
  for(const selector of ['#enter-btn','#intro-ticket','#find-team'])$(selector).addEventListener('click',()=>{entered=true;sync();});
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('pointerdown',e=>controls.forEach(root=>{if(root.open&&!root.contains(e.target))root.open=false;}));
  audio.addEventListener('error',()=>{error=true;render();});audio.addEventListener('playing',render);audio.addEventListener('pause',render);
  render();
  return {audio,hold(reason){blockers.add(reason);sync();},release(reason){blockers.delete(reason);sync();}};
})();
