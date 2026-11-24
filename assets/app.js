/**
 * Общий модуль навигации, геодезических расчетов (WGS-84 -> ECEF -> ENU)
 * и справочных данных для системы управления БПЛА (7 этапов).
 */

const STAGES = [
  { id: 0, href: 'index.html', short: 'Архитектура', title: 'Главная: Система и ИИ' },
  { id: 1, href: 'stage1.html', short: 'Этап 1', title: 'Подготовка данных и ПО' },
  { id: 2, href: 'stage2.html', short: 'Этап 2', title: 'Генерация траектории' },
  { id: 3, href: 'stage3.html', short: 'Этап 3', title: 'Управление полетом' },
  { id: 4, href: 'stage4.html', short: 'Этап 4', title: 'Обнаружение объектов' },
  { id: 5, href: 'stage5.html', short: 'Этап 5', title: 'Создание карты (SLAM)' },
  { id: 6, href: 'stage6.html', short: 'Этап 6', title: 'Изменение координат' },
  { id: 7, href: 'stage7.html', short: 'Этап 7', title: 'Решения, NDVI и Итоги' },
];

const KAZAKHSTAN_REGIONS = {
  akmola: {
    name: 'Акмолинская область — Агрополигон Шортанды (пшеница)',
    lat: 51.668,
    lon: 71.015,
    alt: 392,
    areaHa: 145,
    windDefault: 5.4,
    obstacles: [
      { id: 'OBS-1', name: 'Опора ЛЭП-110кВ', dLat: 0.0014, dLon: 0.0022, radiusM: 45, heightM: 28, type: 'powerline' },
      { id: 'OBS-2', name: 'Лесополоса (береза)', dLat: -0.0012, dLon: -0.0018, radiusM: 55, heightM: 16, type: 'forest' },
      { id: 'OBS-3', name: 'Метеомачта / Вышка связи', dLat: 0.0005, dLon: -0.0026, radiusM: 35, heightM: 34, type: 'tower' }
    ]
  },
  almaty: {
    name: 'Алматинская область — Илийский агрополигон (орошаемые поля)',
    lat: 43.585,
    lon: 77.025,
    alt: 618,
    areaHa: 112,
    windDefault: 4.1,
    obstacles: [
      { id: 'OBS-1', name: 'Водонапорная башня', dLat: 0.0011, dLon: 0.0015, radiusM: 38, heightM: 24, type: 'tower' },
      { id: 'OBS-2', name: 'Склад ГСМ и ангар', dLat: -0.0015, dLon: 0.0019, radiusM: 50, heightM: 14, type: 'building' },
      { id: 'OBS-3', name: 'Линия орошения / ЛЭП', dLat: 0.0008, dLon: -0.0022, radiusM: 42, heightM: 20, type: 'powerline' }
    ]
  }
};

function renderHeader(activeStage) {
  const header = document.getElementById('app-header');
  if (!header) return;

  const pillsHtml = STAGES.map(st => {
    let cls = 'step-pill';
    if (st.id === activeStage) cls += ' active';
    else if (st.id < activeStage && st.id > 0) cls += ' done';
    return `
      <a class="${cls}" href="${st.href}" title="${st.title}">
        <span class="step-num">${st.id === 0 ? '⌂' : st.id}</span>
        <span>${st.short}</span>
      </a>
    `;
  }).join('');

  header.innerHTML = `
    <div class="header-inner">
      <div class="header-top">
        <a href="index.html" class="brand">
          <div class="brand-icon">ИСУ</div>
          <div>
            <div>Интеллектуальная система управления БПЛА</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 400;">
              Проектирование 7-этапной системы • ИИ + EKF + SLAM + NDVI
            </div>
          </div>
        </a>
        <div class="header-meta">
          <span class="badge">Регион: Казахстан (Агромониторинг)</span>
          <span class="badge badge-green">Этап ${activeStage === 0 ? 'Обзор' : activeStage + ' из 7'}</span>
        </div>
      </div>
      <nav class="pipeline-nav" aria-label="Навигация по этапам">
        ${pillsHtml}
      </nav>
    </div>
  `;
}

function renderStageFooter(activeStage) {
  const el = document.getElementById('stage-footer');
  if (!el) return;

  const prev = activeStage > 0 ? STAGES[activeStage - 1] : null;
  const next = activeStage < STAGES.length - 1 ? STAGES[activeStage + 1] : null;

  const prevBtn = prev
    ? `<a href="${prev.href}" class="btn">← Назад: ${prev.short} (${prev.title})</a>`
    : `<span></span>`;

  const nextBtn = next
    ? `<a href="${next.href}" class="btn btn-primary btn-lg">Перейти далее: ${next.short} — ${next.title} →</a>`
    : `<a href="index.html" class="btn btn-success btn-lg">↺ Вернуться к архитектуре системы (Главная)</a>`;

  el.innerHTML = `
    <div class="stage-footer-nav">
      <div>${prevBtn}</div>
      <div>${nextBtn}</div>
    </div>
  `;
}

function renderSiteFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <div>
      Веб-приложение по теме «Проектирование интеллектуальных систем управления» • 7-этапная архитектура БПЛА, ИИ (CNN-LSTM-EKF, YOLOv8, SLAM, Fuzzy Logic) и анализ NDVI
    </div>
  `;
}

function initPage(activeStage) {
  renderHeader(activeStage);
  renderStageFooter(activeStage);
  renderSiteFooter();
}

// Геодезические преобразования WGS-84 -> ECEF -> ENU (Этап 6 и др.)
const WGS84_A = 6378137.0;
const WGS84_F = 1 / 298.257223563;
const WGS84_E2 = WGS84_F * (2 - WGS84_F);

function deg2rad(d) {
  return (d * Math.PI) / 180;
}

function wgs84ToEcef(latDeg, lonDeg, altM) {
  const lat = deg2rad(latDeg);
  const lon = deg2rad(lonDeg);
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const N = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);
  const X = (N + altM) * cosLat * Math.cos(lon);
  const Y = (N + altM) * cosLat * Math.sin(lon);
  const Z = (N * (1 - WGS84_E2) + altM) * sinLat;
  return { X, Y, Z };
}

function wgs84ToEnu(latDeg, lonDeg, altM, refLatDeg, refLonDeg, refAltM) {
  const p = wgs84ToEcef(latDeg, lonDeg, altM);
  const r = wgs84ToEcef(refLatDeg, refLonDeg, refAltM);
  const dx = p.X - r.X;
  const dy = p.Y - r.Y;
  const dz = p.Z - r.Z;

  const lat0 = deg2rad(refLatDeg);
  const lon0 = deg2rad(refLonDeg);
  const sinLat = Math.sin(lat0);
  const cosLat = Math.cos(lat0);
  const sinLon = Math.sin(lon0);
  const cosLon = Math.cos(lon0);

  const E = -sinLon * dx + cosLon * dy;
  const N = -sinLat * cosLon * dx - sinLat * sinLon * dy + cosLat * dz;
  const U = cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz;
  return { E, N, U, ecef: p };
}

// Хелпер для Chart.js с темной темой
function chartDefaults() {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = 'rgba(38, 54, 89, 0.65)';
  Chart.defaults.font.family = "'Inter', sans-serif";
}
