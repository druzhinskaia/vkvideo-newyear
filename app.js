const catalogue = [
  { id:'olivier-19', audience:'ambient', title:'Оливье XIX века. Самый первый рецепт', author:'Шеф-повар Василий Емельяненко', genre:'Рецепт', seconds:1337, image:'frame-olivier', owner:'-129435925', video:'456240690' },
  { id:'mandarins-forward', audience:'friends', title:'Новый год не с родителями', author:'Уральские Пельмени', genre:'Юмор', seconds:454, image:'frame-parents', owner:'-19232159', video:'456250223', hash:'224145a615a339a711' },
  { id:'santa-summer', audience:'family', title:'Дед Мороз и лето', author:'Союзмультфильм', genre:'Мультфильм', seconds:1166, image:'frame-ded-moroz', owner:'23893368', video:'456239832', hash:'8ca5a611a1cbff84' },
  { id:'new-year-fireworks', audience:'guests', title:'Новогодний салют', author:'Уральские Пельмени', genre:'Юмор', seconds:323, image:'frame-salute', owner:'178203904', video:'456242170', hash:'d5bae5d4cb060e57' },
  { id:'winter-fairytale', audience:'family', title:'Новогодняя сказка', author:'Союзмультфильм', genre:'Мультфильм', seconds:985, image:'frame-fairytale', owner:'-65205704', video:'456239376', hash:'ad5348ddab94fc27' },
];

const labels = { ambient:'Под оливье', friends:'Сегодня не пью', family:'Бабушка одобрит', guests:'Пока гости едут' };
const homeMode = document.body.classList.contains('video-home');
const cardCount = homeMode ? 6 : 3;
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
const previewFrame = byId('preview-frame');
const searchInput = byId('home-search-input');
const searchToggle = byId('home-search-toggle');
const genreButtons = [...document.querySelectorAll('[data-feed-genre]')];
const favorites = loadFavorites();
let showingFavorites = false;
let feedGenre = '';
let offset = 0;
const scenarioCards = Object.entries(labels).map(([audience, label]) => createScenarioCard(audience, label));

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

function durationLabel(seconds) {
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
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

function createScenarioCard(audience, label) {
  const card = byId('scenario-card').content.cloneNode(true);
  const select = card.querySelector('.scenario-select');
  const video = card.querySelector('.scenario-video');
  const title = card.querySelector('.scenario-video-title');
  const duration = card.querySelector('.duration');
  const cover = card.querySelector('img');
  const representative = catalogue.find(item => item.audience === audience);
  let featured;

  select.querySelector('span').textContent = label;
  select.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    feedGenre = '';
    setChoice('audience', audience);
    setChoice('length', 'midnight');
    resetResults();
    goToResults();
  });
  video.addEventListener('click', () => {
    if (featured) showPreview(featured);
  });
  byId('scenario-grid').append(card);
  return {
    update(selected, remaining) {
      select.setAttribute('aria-pressed', String(audience === selected));
      featured = catalogue.find(item => item.audience === audience && item.seconds <= remaining * 60);
      video.disabled = !featured;
      title.textContent = featured?.title ?? 'Нет подходящего видео';
      duration.textContent = featured ? durationLabel(featured.seconds) : '';
      if (featured) {
        video.setAttribute('aria-label', 'Смотреть: ' + featured.title);
        cover.src = './assets/' + featured.image + '.webp';
      } else {
        video.removeAttribute('aria-label');
        cover.src = './assets/' + representative.image + '.webp';
      }
    },
  };
}

function updateShowcase() {
  const remaining = minutesLeft();
  scenarioCards.forEach(card => card.update(chosen('audience'), remaining));
  byId('hero-status').textContent = 'До полуночи ' + remaining + ' мин. Подборки обновлены.';
  document.querySelectorAll('[data-demo-time]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.demoTime === clockInput.value));
  });
}

function searchQuery() {
  return searchInput?.value.trim().toLocaleLowerCase('ru') ?? '';
}

function calculateResults() {
  if (showingFavorites) return catalogue.filter(item => favorites.has(item.id));
  const query = searchQuery();
  if (query) {
    return catalogue.filter(item => [item.title, item.author, item.genre]
      .some(value => value.toLocaleLowerCase('ru').includes(query)));
  }
  const length = chosen('length');
  const audience = chosen('audience');
  const limit = length === 'midnight' ? minutesLeft() * 60 : length === 'evening' ? Infinity : Number(length) * 60;
  return catalogue.filter(item => (audience === 'all' || item.audience === audience) &&
    (!feedGenre || item.genre === feedGenre) && item.seconds <= limit);
}

function showPreview(item) {
  byId('preview-title').textContent = item.title;
  byId('preview-description').textContent = item.author + ' · ' + durationLabel(item.seconds);
  byId('video-original').href = 'https://vkvideo.ru/video' + item.owner + '_' + item.video;
  const params = new URLSearchParams({ oid:item.owner, id:item.video, hd:'2', autoplay:'1' });
  if (item.hash) params.set('hash', item.hash);
  previewFrame.title = 'VK Видео — ' + item.title;
  preview.showModal();
  previewFrame.src = 'https://vkvideo.ru/video_ext.php?' + params;
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
  card.querySelector('.duration').textContent = durationLabel(item.seconds);
  card.querySelector('.video-genre').textContent = item.author + ' · ' + item.genre;
  card.querySelector('.video-title').textContent = item.title;
  const open = card.querySelector('.video-open');
  open.setAttribute('aria-label', 'Смотреть: ' + item.title);
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
  const query = searchQuery();
  message.textContent = showingFavorites
    ? 'Сохраните ролик сердечком, и он появится здесь.'
    : query ? 'По этому запросу ничего не найдено.' : 'На это время нет подходящих роликов.';
  const action = document.createElement('button');
  action.className = 'button line-button';
  action.type = 'button';
  action.textContent = showingFavorites ? 'Вернуться к подбору' : query ? 'Сбросить поиск' : 'Показать на весь вечер';
  action.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (!showingFavorites && !query) setChoice('length', 'evening');
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
    length === 'evening' ? 'весь вечер' : 'до ' + length + ' мин';
  const audienceLabel = labels[chosen('audience')] ?? 'Все сценарии';
  const query = searchQuery();
  const genreTitle = genreButtons.find(button => feedGenre && button.dataset.feedGenre === feedGenre)?.textContent;
  genreButtons.forEach(button => {
    const active = !showingFavorites && !query && button.dataset.feedGenre === feedGenre;
    button.setAttribute('aria-pressed', String(active));
  });
  byId('result-title').textContent = showingFavorites ? 'Избранное' :
    query ? 'Результаты поиска' : genreTitle ?? (homeMode ? 'Лента видео' : 'Что можно включить');
  byId('result-context').textContent = showingFavorites ? 'Сохранено: ' + favorites.size :
    query || genreTitle ? 'Найдено: ' + items.length : audienceLabel + ' · ' + durationLabel + ' · найдено: ' + items.length;
  byId('favorite-count').textContent = favorites.size;
  favoriteMode.setAttribute('aria-pressed', String(showingFavorites));
  more.hidden = showingFavorites || items.length <= cardCount;
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

function goToResults() {
  byId('result-title').focus({ preventScroll:true });
  byId('picker').scrollIntoView({ block:'start' });
}

function showMobileSearch(expanded) {
  searchToggle.setAttribute('aria-expanded', String(expanded));
  searchToggle.setAttribute('aria-label', expanded ? 'Закрыть поиск' : 'Открыть поиск');
  document.body.classList.toggle('search-expanded', expanded);
}

genreButtons.forEach(button => {
  button.addEventListener('click', () => {
    feedGenre = button.dataset.feedGenre;
    if (searchInput) searchInput.value = '';
    setChoice('audience', 'all');
    setChoice('length', 'evening');
    resetResults();
    if (feedGenre) goToResults();
  });
});
searchToggle?.addEventListener('click', () => {
  const expanded = searchToggle.getAttribute('aria-expanded') === 'true';
  showMobileSearch(!expanded);
  if (!expanded) searchInput.focus();
});
searchInput?.addEventListener('keydown', event => {
  if (event.key === 'Escape' && searchToggle?.getAttribute('aria-expanded') === 'true') {
    showMobileSearch(false);
    searchToggle.focus();
  }
});
filters.addEventListener('change', () => {
  if (searchInput) searchInput.value = '';
  feedGenre = '';
  resetResults();
});
byId('home-search')?.addEventListener('submit', event => {
  event.preventDefault();
  feedGenre = '';
  if (searchToggle) showMobileSearch(false);
  resetResults();
  goToResults();
});
searchInput?.addEventListener('search', resetResults);
byId('home-favorites')?.addEventListener('click', () => {
  if (!showingFavorites) favoriteMode.click();
  goToResults();
});
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
document.querySelectorAll('[data-demo-time]').forEach(button => {
  button.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    feedGenre = '';
    setChoice('length', 'midnight');
    clockInput.value = button.dataset.demoTime;
    resetResults();
  });
});
byId('preview-close').addEventListener('click', () => preview.close());
preview.addEventListener('close', () => {
  previewFrame.removeAttribute('src');
});
function revealCaseNote() {
  const sectionId = location.hash.slice(1);
  if (homeMode && (sectionId === 'research' || sectionId === 'experiment')) {
    location.replace('case.html#' + sectionId);
    return;
  }
  const section = byId(sectionId);
  if (section?.matches('.case-notes details')) section.open = true;
}

window.addEventListener('hashchange', revealCaseNote);
revealCaseNote();
byId('result-title').tabIndex = -1;
render();

