(()=>{let state=JSON.parse(localStorage.mjCacheProgress||'{"done":0,"total":42,"complete":false}');
const markup=()=>{let pct=state.total?Math.min(100,Math.round(state.done/state.total*100)):0;return`<div class="cache-progress" style="--cache-p:${pct}%"><span class="cache-progress-icon">${state.complete?'✓':'↓'}</span><div><b>${state.complete?'离线游戏已就绪':'正在缓存离线游戏'}</b><small>${state.complete?'200关可在无网络时游玩':`${state.done}/${state.total} 项 · ${pct}%`}</small></div><i><em></em></i></div>`};
const render=()=>{let list=document.querySelector('.level-choices'),old=document.querySelector('.cache-progress');if(old)old.outerHTML=markup();else if(list)list.insertAdjacentHTML('beforebegin',markup())};
navigator.serviceWorker?.addEventListener('message',event=>{if(event.data?.type!=='CACHE_PROGRESS')return;state=event.data;localStorage.mjCacheProgress=JSON.stringify(state);render()});
document.addEventListener('click',event=>{if(event.target.closest('#back'))setTimeout(()=>{render();navigator.serviceWorker?.ready.then(reg=>(reg.active||reg.waiting)?.postMessage({type:'GET_CACHE_PROGRESS'}))},0)},true);
navigator.serviceWorker?.ready.then(reg=>(reg.active||reg.waiting)?.postMessage({type:'GET_CACHE_PROGRESS'}));
})();
