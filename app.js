const catalogue = [
  { id:'snow-tram', audience:'family', title:'Трамвай на Северную', genre:'Семейная анимация · 6+', minutes:18, image:'street', description:'Маленькое путешествие по городу, где перед Новым годом трамваи меняют маршрут.' },
  { id:'paper-stars', audience:'family', title:'Бумажные звёзды', genre:'Короткометражка · 0+', minutes:14, image:'window', description:'Бабушка и внучка собирают украшения к празднику из старых бумажных открыток.' },
  { id:'forest-letter', audience:'family', title:'Письмо из зимнего леса', genre:'Сказка · 6+', minutes:9, image:'cabin', description:'В канун праздника смотритель леса получает самое необычное письмо.' },
  { id:'winter-post', audience:'family', title:'Снежная почта', genre:'Анимация · 0+', minutes:7, image:'street', description:'История о письме, которое успевает к полуночи благодаря маленьким помощникам.' },
  { id:'cocoa', audience:'family', title:'Какао на троих', genre:'Семейная история · 0+', minutes:4, image:'window', description:'Тёплая миниатюра об одном зимнем вечере дома.' },
  { id:'old-town', audience:'family', title:'Праздник в старом городе', genre:'Семейная комедия · 6+', minutes:27, image:'street', description:'Соседи устраивают праздник, когда главная городская ёлка исчезает.' },
  { id:'extra-minute', audience:'family', title:'Один огонёк', genre:'Анимация · 0+', minutes:1, image:'cabin', description:'Минутная зарисовка о том, как зимний пейзаж оживает от света в окне.' },
  { id:'station', audience:'family', title:'Билет на зимнюю станцию', genre:'Семейное кино · 6+', minutes:78, image:'street', description:'Большая зимняя история о неожиданной поездке и новых друзьях.' },
  { id:'holiday-trivia', audience:'friends', title:'Зимний блиц', genre:'Новогоднее шоу · 12+', minutes:17, image:'cabin', description:'Две команды отвечают на вопросы о зимних фильмах и праздничных привычках.' },
  { id:'delivery', audience:'friends', title:'Заказ на полночь', genre:'Короткая комедия · 12+', minutes:12, image:'street', description:'Перед самым праздником курьер пытается доставить коробку загадочному адресату.' },
  { id:'bad-toasts', audience:'friends', title:'Тост без репетиции', genre:'Импровизация · 12+', minutes:8, image:'window', description:'Комики придумывают новогодние тосты по подсказкам зрителей.' },
  { id:'guess', audience:'friends', title:'Угадай зимний фильм', genre:'Викторина · 6+', minutes:5, image:'cabin', description:'Пять быстрых раундов по зимним киноисториям.' },
  { id:'night', audience:'friends', title:'Всё как в кино', genre:'Вечернее шоу · 12+', minutes:24, image:'street', description:'Гости студии обсуждают неожиданные традиции из новогоднего кино.' },
  { id:'montage', audience:'friends', title:'Пять секунд до тоста', genre:'Мини-комедия · 12+', minutes:1, image:'window', description:'Короткая сценка о последней попытке вспомнить тост.' },
  { id:'comedy-trip', audience:'friends', title:'Компания в сборе', genre:'Комедия · 12+', minutes:63, image:'cabin', description:'Друзья договариваются о встрече, и всё идёт не по расписанию.' },
  { id:'snow-window', audience:'ambient', title:'Окно в декабрь', genre:'Зимние виды · 0+', minutes:20, image:'cabin', description:'Тихие зимние виды с мягким светом из окон лесного дома.' },
  { id:'amber-light', audience:'ambient', title:'Свет на кухне', genre:'Вечерние зарисовки · 0+', minutes:13, image:'window', description:'Рассеянный свет, горячий чай и спокойный ритм зимнего вечера.' },
  { id:'midnight-street', audience:'ambient', title:'Улицы под снегом', genre:'Прогулка · 0+', minutes:10, image:'street', description:'Ночная прогулка по небольшому городу без диалогов.' },
  { id:'fire-glow', audience:'ambient', title:'Тёплая пауза', genre:'Фоновое видео · 0+', minutes:6, image:'window', description:'Спокойная зарисовка со свечой и мягким зимним светом.' },
  { id:'pinewood', audience:'ambient', title:'Тишина в ельнике', genre:'Природа · 0+', minutes:29, image:'cabin', description:'Снег и редкие огни вдалеке. Можно включить фоном за столом.' },
  { id:'falling-snow', audience:'ambient', title:'Первая снежинка', genre:'Миниатюра · 0+', minutes:1, image:'street', description:'Короткая зимняя зарисовка на последнюю минуту перед полуночью.' },
  { id:'winter-room', audience:'ambient', title:'Длинный зимний вечер', genre:'Фоновое видео · 0+', minutes:90, image:'window', description:'Долгий спокойный фон для разговоров или приготовления ужина.' },
];

const labels = { family:'Всей семьёй', friends:'С друзьями', ambient:'Фоном' };
const cardCount = 3;
const firstMinute = 22 * 60 + 30;
const minuteAtMidnight = 24 * 60;
const storageKey = 'vkvideo-newyear-favorites-v1';
const byId = id => document.getElementById(id);
const filters = byId('filters');
const clockInput = byId('demo-time');
const board = byId('results');
const more = byId('more');
const favoriteMode = byId('favorite-mode');
const preview = byId('preview');
const previewVideo = byId('preview-video');
const favorites = loadFavorites();
let showingFavorites = false;
let offset = 0;
let featuredItem;

function loadFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return new Set(Array.isArray(stored) ? stored.filter(id => catalogue.some(item => item.id === id)) : []);
  } catch {
    return new Set();
  }
}

function chosen(name) {
  return filters.elements.namedItem(name).value;
}

function setChoice(name, value) {
  filters.elements.namedItem(name).value = value;
}

function timeLabel(minute) {
  const pad = value => String(value).padStart(2, '0');
  return pad(Math.floor(minute / 60)) + ':' + pad(minute % 60);
}

function minutesLeft() {
  return minuteAtMidnight - firstMinute - Number(clockInput.value);
}

function adjustClock() {
  const clockTime = timeLabel(firstMinute + Number(clockInput.value));
  byId('demo-time-label').textContent = clockTime;
  byId('hero-clock').textContent = timeLabel(minutesLeft()) + ':00';
  clockInput.setAttribute('aria-valuetext', clockTime);
  updateShowcase();
}

function updateShowcase() {
  const audience = chosen('audience');
  const remaining = minutesLeft();
  featuredItem = catalogue.find(item => item.audience === audience && item.minutes <= remaining);
  const featured = byId('hero-preview');
  featured.hidden = !featuredItem;
  if (featuredItem) {
    byId('hero-result-title').textContent = featuredItem.title;
    byId('hero-result-label').textContent = 'Подойдёт по времени · ' + featuredItem.minutes + ' мин';
    byId('hero-poster').src = './assets/' + featuredItem.image + '.webp';
    featured.setAttribute('aria-label', 'Смотреть превью: ' + featuredItem.title);
  }
  byId('hero-status').textContent = 'До полуночи ' + remaining + ' мин. ' +
    (featuredItem ? featuredItem.title : 'Нет подходящего ролика.');
  document.querySelectorAll('[data-hero-audience]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.heroAudience === audience));
  });
  document.querySelectorAll('[data-demo-time]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.demoTime === clockInput.value));
  });
}

function calculateResults() {
  if (showingFavorites) return catalogue.filter(item => favorites.has(item.id));
  const length = chosen('length');
  const limit = length === 'midnight' ? minutesLeft() : length === 'evening' ? Infinity : Number(length);
  const items = catalogue.filter(item => item.audience === chosen('audience') && item.minutes <= limit);
  if (length === 'evening') return items.sort((first, second) => second.minutes - first.minutes);
  return items;
}

function showPreview(item) {
  byId('preview-title').textContent = item.title;
  byId('preview-description').textContent = item.description + ' В прототипе доступен короткий демонстрационный фрагмент.';
  previewVideo.poster = './assets/' + item.image + '.webp';
  previewVideo.src = './assets/' + item.image + '.mp4';
  preview.showModal();
  previewVideo.play().catch(() => {
    // If autoplay is unavailable, the native controls still allow playback.
  });
}

function updateFavoriteButton(button, item) {
  const active = favorites.has(item.id);
  button.setAttribute('aria-pressed', String(active));
  button.setAttribute('aria-label', (active ? 'Убрать из избранного: ' : 'В избранное: ') + item.title);
}

function toggleFavorite(button, item) {
  if (favorites.has(item.id)) favorites.delete(item.id);
  else favorites.add(item.id);
  try {
    localStorage.setItem(storageKey, JSON.stringify([...favorites]));
  } catch {
    // Browser storage is optional for this demonstration.
  }
  byId('favorite-count').textContent = favorites.size;
  if (showingFavorites) {
    render();
    favoriteMode.focus();
  } else {
    updateFavoriteButton(button, item);
  }
}

function renderCard(item) {
  const card = byId('video-card').content.cloneNode(true);
  const cover = card.querySelector('img');
  cover.src = './assets/' + item.image + '.webp';
  cover.loading = 'lazy';
  card.querySelector('.duration').textContent = item.minutes + ' мин';
  card.querySelector('.video-genre').textContent = item.genre;
  card.querySelector('.video-title').textContent = item.title;
  card.querySelector('.video-reason').textContent = item.description;
  const open = card.querySelector('.video-open');
  open.setAttribute('aria-label', 'Смотреть превью: ' + item.title);
  open.addEventListener('click', () => showPreview(item));
  const favorite = card.querySelector('.favorite');
  updateFavoriteButton(favorite, item);
  favorite.addEventListener('click', () => toggleFavorite(favorite, item));
  return card;
}

function renderEmpty() {
  const empty = document.createElement('div');
  empty.className = 'empty';
  const message = document.createElement('p');
  message.textContent = showingFavorites
    ? 'Сохраните ролик сердечком, и он появится здесь.'
    : 'Под эти параметры нет роликов. Попробуйте увеличить лимит времени.';
  const action = document.createElement('button');
  action.className = 'button line-button';
  action.type = 'button';
  action.textContent = showingFavorites ? 'Вернуться к подбору' : 'Показать ролики до 15 минут';
  action.addEventListener('click', () => {
    if (!showingFavorites) setChoice('length', '15');
    resetResults();
    byId('result-title').focus({ preventScroll:true });
  });
  empty.append(message, action);
  board.append(empty);
}

function render() {
  adjustClock();
  const items = calculateResults();
  const length = chosen('length');
  const durationLabel = length === 'midnight' ? 'до курантов ' + minutesLeft() + ' мин' :
    length === 'evening' ? 'целый вечер' : 'до ' + length + ' мин';
  byId('result-title').textContent = showingFavorites ? 'Избранное' : 'Что можно включить';
  byId('result-context').textContent = showingFavorites ? 'Сохранено: ' + favorites.size :
    labels[chosen('audience')] + ' · ' + durationLabel + ' · найдено: ' + items.length;
  byId('favorite-count').textContent = favorites.size;
  favoriteMode.setAttribute('aria-pressed', String(showingFavorites));
  more.hidden = showingFavorites;
  more.disabled = items.length <= cardCount;
  board.replaceChildren();
  if (items.length === 0) {
    renderEmpty();
    return;
  }
  const visible = showingFavorites ? items : items.slice(offset, offset + cardCount);
  board.append(...visible.map(renderCard));
}

function resetResults() {
  offset = 0;
  showingFavorites = false;
  render();
}

filters.addEventListener('change', resetResults);
clockInput.addEventListener('input', () => {
  if (chosen('length') === 'midnight' && !showingFavorites) resetResults();
  else adjustClock();
});
more.addEventListener('click', () => {
  const total = calculateResults().length;
  offset = offset + cardCount < total ? offset + cardCount : 0;
  render();
  const context = byId('result-context');
  context.textContent += ' · показано ' + (offset + 1) + '–' + Math.min(offset + cardCount, total);
});
favoriteMode.addEventListener('click', () => {
  offset = 0;
  showingFavorites = !showingFavorites;
  render();
});
document.querySelectorAll('[data-hero-audience]').forEach(button => {
  button.addEventListener('click', () => {
    setChoice('audience', button.dataset.heroAudience);
    resetResults();
  });
});
document.querySelectorAll('[data-demo-time]').forEach(button => {
  button.addEventListener('click', () => {
    setChoice('length', 'midnight');
    clockInput.value = button.dataset.demoTime;
    resetResults();
  });
});
byId('hero-preview').addEventListener('click', () => {
  if (featuredItem) showPreview(featuredItem);
});
byId('preview-close').addEventListener('click', () => preview.close());
preview.addEventListener('close', () => {
  previewVideo.pause();
  previewVideo.removeAttribute('src');
  previewVideo.load();
});
byId('result-title').tabIndex = -1;
render();
