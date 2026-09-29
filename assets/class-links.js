document.addEventListener('DOMContentLoaded',()=>{
  const list=document.querySelector('.lesson-list');
  if(!list)return;
  const topBack=document.querySelector('.topbar .back');
  if(topBack&&/index-v2\.html/.test(topBack.getAttribute('href')||''))topBack.setAttribute('href','../index.html');
  if(topBack)topBack.textContent='← Главная';

  const normalize=s=>(s||'').toLowerCase().replace(/ё/g,'е').replace(/→/g,'').replace(/\s+/g,' ').trim();
  const inferType=(title,href,section)=>{
    const s=normalize(title+' '+href+' '+section);
    if(/игра|game|детектив/.test(s))return 'Игра';
    if(/диагност|сам\.раб|самостоятель|контроль|демоверс|вариант/.test(s))return 'Диагностика';
    if(/тренаж|практик/.test(s))return 'Тренажёр';
    if(/повтор/.test(s))return 'Повторение';
    return 'Урок';
  };
  const items=[];
  list.querySelectorAll('details').forEach(section=>{
    const category=section.querySelector('summary')?.textContent.trim()||'Материалы';
    section.querySelectorAll('a[href]').forEach((a,i)=>{
      const title=a.textContent.replace(/→/g,'').trim();
      if(!title)return;
      const href=a.getAttribute('href');
      const num=(title.match(/№\s*(\d+)/)||[])[1]||'';
      items.push({title,href,category,type:inferType(title,href,category),num,order:items.length});
    });
  });
  if(!items.length)return;

  const isOge=/ОГЭ/i.test(document.title)||/ОГЭ/i.test(document.querySelector('.eyebrow')?.textContent||'');
  if(isOge)items.sort((a,b)=>(+(a.num||999))-(+(b.num||999))||a.order-b.order);

  const keyFav='urock:favorites',keyRecent='urock:recent';
  const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const pageTitle=document.querySelector('.grade-title')?.textContent.trim()||document.title;

  const tools=document.createElement('section');tools.className='catalog-tools';
  const search=document.createElement('input');search.className='catalog-search';search.type='search';search.placeholder='Найти тему на этой странице…';search.setAttribute('aria-label','Поиск по материалам');
  const filters=document.createElement('div');filters.className='filter-row';
  const count=document.createElement('div');count.className='catalog-count';
  const grid=document.createElement('section');grid.className='catalog-grid';grid.setAttribute('aria-label','Материалы');
  tools.append(search,filters,count);list.parentNode.insertBefore(tools,list);list.parentNode.insertBefore(grid,list);list.classList.add('enhanced');

  let active='Все';
  const cats=isOge?['Все',...Array.from(new Set(items.filter(x=>x.num).map(x=>'№'+x.num))),'Диагностика']:
    ['Все',...Array.from(new Set(items.map(x=>x.category))),...Array.from(new Set(items.map(x=>x.type))).filter(x=>x!=='Урок')];
  Array.from(new Set(cats)).forEach((name,idx)=>{const b=document.createElement('button');b.type='button';b.className='filter-chip'+(idx===0?' active':'');b.textContent=name;b.onclick=()=>{active=name;filters.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));render()};filters.appendChild(b)});

  function addRecent(item){let r=read(keyRecent).filter(x=>x.href!==item.href);r.unshift({title:item.title,href:item.href,source:pageTitle});write(keyRecent,r.slice(0,8));}
  function toggleFav(item,btn){let f=read(keyFav);const ix=f.findIndex(x=>x.href===item.href);if(ix>=0)f.splice(ix,1);else f.unshift({title:item.title,href:item.href,source:pageTitle});write(keyFav,f.slice(0,50));btn.classList.toggle('on',ix<0);btn.textContent=ix<0?'★':'☆';}
  function render(){const q=normalize(search.value);const favs=read(keyFav);const visible=items.filter(x=>{
      const matchQ=!q||normalize(x.title+' '+x.category+' '+x.type).includes(q);
      const matchF=active==='Все'||x.category===active||x.type===active||(x.num&&active==='№'+x.num)||(active==='Диагностика'&&x.type==='Диагностика');
      return matchQ&&matchF;
    });
    grid.innerHTML='';count.textContent='Материалов: '+visible.length;
    if(!visible.length){grid.innerHTML='<div class="empty-state">Ничего не найдено. Попробуйте другой фильтр или более короткий запрос.</div>';return;}
    visible.forEach(item=>{const card=document.createElement('a');const typeClass={'Урок':'type-lesson','Тренажёр':'type-trainer','Повторение':'type-review','Диагностика':'type-diagnostic','Игра':'type-game'}[item.type]||'type-lesson';card.className='lesson-card '+typeClass;card.href=item.href;card.target='_blank';card.rel='noopener';card.innerHTML='<span class="badge">'+item.type+'</span><h3></h3><div class="meta"></div>';card.querySelector('h3').textContent=item.title;card.querySelector('.meta').textContent=isOge?(item.num?'Задание №'+item.num+' · ':'')+item.category:item.category;
      const fav=document.createElement('button');fav.type='button';fav.className='fav-btn'+(favs.some(x=>x.href===item.href)?' on':'');fav.textContent=favs.some(x=>x.href===item.href)?'★':'☆';fav.title='В избранное';fav.onclick=e=>{e.preventDefault();e.stopPropagation();toggleFav(item,fav)};card.appendChild(fav);card.addEventListener('click',()=>addRecent(item));grid.appendChild(card)});
  }
  search.addEventListener('input',render);render();
});
