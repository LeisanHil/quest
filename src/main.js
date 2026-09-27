import './styles.css';
import { quest } from './quest-data.js';

const app = document.querySelector('#app');
const blank = { page: 'welcome', step: 0, riddle: false, place: false };
let state = { ...blank, ...JSON.parse(localStorage.getItem('polina-quest') || '{}') };
const save = (next) => { state = { ...state, ...next }; localStorage.setItem('polina-quest', JSON.stringify(state)); render(); };
const clean = (text) => text.trim().toLocaleLowerCase('ru').replace(/ё/g, 'е').replace(/\s+/g, ' ');
const correct = (answer, answers) => answers.map(clean).includes(clean(answer));
const card = (content) => `<div class="glow"></div><section class="card">${content}</section>`;
const feedback = (text, bad = false) => { const node = document.querySelector('.feedback'); node.textContent = text; node.className = `feedback ${bad ? 'bad' : ''}`; };
const meter = () => `<div class="meter"><span>Этап ${state.step + 1} из ${quest.stages.length}</span><i style="width:${(state.step + 1) / quest.stages.length * 100}%"></i></div>`;

function render() {
  if (state.page === 'welcome') app.innerHTML = card(`<p class="eyebrow">девичник · ${quest.dateLabel}</p><div class="star">✦</div><h1>${quest.title}</h1><p class="lead">${quest.subtitle}</p><button class="primary" data-action="rules">Открыть квест <b>→</b></button><p class="note">Тебя ждут ${quest.stages.length} места, загадки и один особенный финал.</p>`);
  else if (state.page === 'rules') app.innerHTML = card(`<p class="eyebrow">перед началом</p><h2>Несколько честных правил</h2><ol><li>Иди по порядку: следующая подсказка откроется после предыдущей.</li><li>Гуглить можно — иногда это часть поиска.</li><li><strong>Не пользуйся искусственным интеллектом.</strong> Этот квест — для твоих открытий.</li><li><strong>Не подглядывай в код страницы.</strong> Там только техническая магия.</li><li>Разреши геолокацию, когда сайт попросит: она подтвердит нужное место.</li></ol><button class="primary" data-action="start">Окей, поняла <b>→</b></button>`);
  else if (state.page === 'final') app.innerHTML = card(`<p class="eyebrow">финал квеста</p><div class="star">♥</div><h1>${quest.final.title}</h1><p class="lead">${quest.final.message}</p><a class="primary" href="${quest.final.prizeUrl}" target="_blank" rel="noopener">Открыть подарок <b>↗</b></a><button class="reset" data-action="restart">Пройти квест ещё раз</button>`);
  else renderStep();
}
function renderStep() {
  const s = quest.stages[state.step];
  if (!state.riddle) app.innerHTML = card(`${meter()}<p class="eyebrow">загадка ${state.step + 1}</p><h2>${s.riddleTitle}</h2><p class="riddle">${s.riddle}</p>${form('riddle', 'Напиши, что ты думаешь', 'Проверить ответ')}`);
  else if (!state.place) app.innerHTML = card(`${meter()}<p class="eyebrow">место найдено?</p><h2>${s.locationPrompt}</h2><p class="lead">Когда окажешься на месте, подтверди его. Радиус проверки — ${s.radiusMeters} метров.</p><button class="primary" data-action="location">Я на месте <b>⌖</b></button><p class="feedback"></p><p class="note">Геолокация используется только в браузере и никуда не отправляется.</p>`);
  else app.innerHTML = card(`${meter()}<p class="eyebrow">ты на нужной точке ✦</p><h2>Последний штрих</h2><p class="riddle">${s.locationQuestion}</p>${form('code', 'Введи ответ', 'Открыть дальше')}`);
}
function form(kind, placeholder, button) { return `<form data-form="${kind}"><label>Твой ответ<input name="answer" autocomplete="off" required placeholder="${placeholder}"></label><button class="primary">${button} <b>→</b></button><p class="feedback"></p></form>`; }
function distance(a, b, c, d) { const r = x => x * Math.PI / 180, R = 6371000, x = r(c-a), y = r(d-b); return 2*R*Math.atan2(Math.sqrt(Math.sin(x/2)**2 + Math.cos(r(a))*Math.cos(r(c))*Math.sin(y/2)**2), Math.sqrt(1-(Math.sin(x/2)**2 + Math.cos(r(a))*Math.cos(r(c))*Math.sin(y/2)**2))); }
function locate() {
  const s = quest.stages[state.step];
  if (s.latitude === null) return feedback('Координаты этой точки ещё не настроены.', true);
  if (!navigator.geolocation) return feedback('Этот браузер не поддерживает геолокацию.', true);
  feedback('Определяем твоё местоположение…');
  navigator.geolocation.getCurrentPosition(({coords}) => {
    const d = distance(coords.latitude, coords.longitude, s.latitude, s.longitude);
    d <= s.radiusMeters ? save({ place: true }) : feedback(`Пока не совсем: до точки примерно ${Math.round(d)} м. Проверь место и попробуй ещё раз.`, true);
  }, e => feedback(e.code === 1 ? 'Разреши доступ к геолокации в настройках браузера.' : 'Не удалось определить местоположение. Попробуй ещё раз.', true), { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
}
app.addEventListener('click', e => { const a = e.target.closest('[data-action]')?.dataset.action; if (a === 'rules') save({page:'rules'}); if (a === 'start') save({page:'quest',step:0,riddle:false,place:false}); if (a === 'location') locate(); if (a === 'restart') save(blank); });
app.addEventListener('submit', e => { e.preventDefault(); const s = quest.stages[state.step], answer = new FormData(e.target).get('answer'), kind = e.target.dataset.form; if (kind === 'riddle') correct(answer, s.riddleAnswers) ? save({riddle:true}) : feedback('Пока не то. Вслух подумай о деталях загадки и попробуй ещё раз.', true); else if (correct(answer, s.codeAnswers)) { const next=state.step+1; save(next === quest.stages.length ? {page:'final'} : {step:next,riddle:false,place:false}); } else feedback('Ответ не совпал. Осмотрись ещё раз и посчитай внимательнее.', true); });
render();
