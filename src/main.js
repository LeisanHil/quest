import { quest } from './quest-data.js';

const app = document.querySelector('#app');
const basePath = new URL('../', import.meta.url).pathname;
const questPath = `${basePath}quest/`;
const historyPath = `${questPath}history/`;
const empty = { page: 'rules', step: 0, riddle: false, place: false };
let state;
try { state = { ...empty, ...JSON.parse(localStorage.getItem('polina-quest') || '{}') }; } catch { state = { ...empty }; }
const save = (next) => { state = { ...state, ...next }; localStorage.setItem('polina-quest', JSON.stringify(state)); render(); };
const go = (path) => { window.history.pushState({}, '', new URL(path, location.origin + basePath)); render(); };
const clean = (text) => text.trim().toLocaleLowerCase('ru').replace(/ё/g, 'е').replace(/\s+/g, ' ');
const correct = (answer, answers) => answers.map(clean).includes(clean(answer));
const card = (content, wide = false) => `<div class="glow"></div><section class="card ${wide ? 'card--wide' : ''}">${content}</section>`;
const feedback = (text, bad = false) => { const node = document.querySelector('.feedback'); node.textContent = text; node.className = `feedback ${bad ? 'bad' : ''}`; };
const backHome = '<button class="back-home" data-action="home">← О квесте</button>';

function landing() {
  app.innerHTML = `<section class="landing-hero" aria-labelledby="landing-title">
    <p class="landing-kicker">Полина, есть одно дело…</p>
    <h1 id="landing-title">Может,<br>прогуляемся?</h1>
    <button class="landing-action" data-action="enter" aria-label="Начать квест — открыть дело">
      <span>Открыть дело</span>
      <span class="landing-action__seal" aria-hidden="true">↗</span>
    </button>
  </section>`;
}
function rules() {
  app.innerHTML = card(`${backHome}<p class="eyebrow">перед началом</p><h2>Несколько честных правил</h2><ol><li>Иди по порядку: следующая подсказка откроется после предыдущей.</li><li>Гуглить можно — иногда это часть поиска.</li><li><strong>Не пользуйся искусственным интеллектом.</strong> Этот квест — для твоих открытий.</li><li><strong>Не подглядывай в код страницы.</strong> Там только техническая магия.</li><li>Разреши геолокацию, когда сайт попросит: она подтвердит нужное место.</li></ol><button class="primary" data-action="start">Окей, поняла <b>→</b></button>`, true);
}
function final() {
  app.innerHTML = card(`${backHome}<p class="eyebrow">финал квеста</p><div class="star">♥</div><h1>${quest.final.title}</h1><p class="lead">${quest.final.message}</p>${quest.final.prizeUrl ? `<a class="primary" href="${quest.final.prizeUrl}" target="_blank" rel="noopener">Открыть подарок <b>↗</b></a>` : '<p class="note">Подарок появится здесь совсем скоро.</p>'}<button class="reset" data-action="restart">Пройти квест ещё раз</button>`);
}
function previousButton() { return state.step ? '<button class="history-button" data-action="history">Посмотреть предыдущие загадки</button>' : ''; }
function step() {
  const s = quest.stages[state.step];
  if (!state.riddle) app.innerHTML = card(`${backHome}<p class="eyebrow">следующая загадка</p><h2>${s.riddleTitle}</h2><p class="riddle">${s.riddle}</p>${form('riddle', 'Напиши, что ты думаешь', 'Проверить ответ')}${previousButton()}`);
  else if (!state.place) app.innerHTML = card(`${backHome}<p class="eyebrow">место найдено?</p><h2>${s.locationPrompt}</h2><p class="lead">Когда окажешься на месте, подтверди его. Радиус проверки — ${s.radiusMeters} метров.</p><button class="primary" data-action="location">Я на месте <b>⌖</b></button><p class="feedback"></p><p class="note">Геолокация используется только в браузере и никуда не отправляется.</p><button class="reset" data-action="riddle">← Вернуться к загадке</button>${previousButton()}`);
  else app.innerHTML = card(`${backHome}<p class="eyebrow">ты на нужной точке ✦</p><h2>Последний штрих</h2><p class="riddle">${s.locationQuestion}</p>${form('code', 'Введи ответ', 'Открыть дальше')}<button class="reset" data-action="riddle">← Вернуться к загадке</button>${previousButton()}`);
}
function renderHistory() {
  const seen = quest.stages.slice(0, state.step);
  app.innerHTML = card(`${backHome}<p class="eyebrow">твои находки</p><h2>Предыдущие загадки</h2><div class="history-list">${seen.map((item, index) => `<article><span>Загадка ${index + 1}</span><h3>${item.riddleTitle}</h3><p>${item.riddle}</p></article>`).join('')}</div><button class="primary" data-action="current">Вернуться к текущей загадке <b>→</b></button>`, true);
}
function form(kind, placeholder, button) { return `<form data-form="${kind}"><label>Твой ответ<input name="answer" autocomplete="off" required placeholder="${placeholder}"></label><button class="primary">${button} <b>→</b></button><p class="feedback"></p></form>`; }
function distance(a,b,c,d) { const r=x=>x*Math.PI/180,R=6371000,x=r(c-a),y=r(d-b),z=Math.sin(x/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(y/2)**2; return 2*R*Math.atan2(Math.sqrt(z),Math.sqrt(1-z)); }
function locate() { const s=quest.stages[state.step]; if(!navigator.geolocation) return feedback('Этот браузер не поддерживает геолокацию.',true); feedback('Определяем твоё местоположение…'); navigator.geolocation.getCurrentPosition(({coords})=>{const d=distance(coords.latitude,coords.longitude,s.latitude,s.longitude); d<=s.radiusMeters?save({place:true}):feedback(`Пока не совсем: до точки примерно ${Math.round(d)} м. Проверь место и попробуй ещё раз.`,true);},e=>feedback(e.code===1?'Разреши доступ к геолокации в настройках браузера.':'Не удалось определить местоположение. Попробуй ещё раз.',true),{enableHighAccuracy:true,timeout:15000,maximumAge:10000}); }
function render() { const onLanding = location.pathname === basePath; app.classList.toggle('app-shell--landing', onLanding); document.title = onLanding ? 'Может, прогуляемся?' : 'Квест для Полины'; if (onLanding) return landing(); if (location.pathname === historyPath) return renderHistory(); if (state.page === 'rules') return rules(); if (state.page === 'final') return final(); step(); }
app.addEventListener('click', e => { const a=e.target.closest('[data-action]')?.dataset.action; if(a==='enter') go('quest/'); if(a==='home') go(''); if(a==='start') save({page:'quest',step:0,riddle:false,place:false}); if(a==='location') locate(); if(a==='riddle') save({riddle:false,place:false}); if(a==='history') go('quest/history/'); if(a==='current') go('quest/'); if(a==='restart') save(empty); });
app.addEventListener('submit',e=>{e.preventDefault();const s=quest.stages[state.step],answer=new FormData(e.target).get('answer'),kind=e.target.dataset.form;if(kind==='riddle')correct(answer,s.riddleAnswers)?save({riddle:true}):feedback('Пока не то. Вслух подумай о деталях загадки и попробуй ещё раз.',true);else if(correct(answer,s.codeAnswers)){const next=state.step+1;save(next===quest.stages.length?{page:'final'}:{step:next,riddle:false,place:false});}else feedback('Ответ не совпал. Осмотрись ещё раз и посчитай внимательнее.',true);});
addEventListener('popstate',render); render();
