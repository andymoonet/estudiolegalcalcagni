(() => {
  const WA = '5491161610293';
  const waLink = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // encabezado sólido al bajar
  const header = $('.header');
  const onScroll = () => header.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menú celular
  const burger = $('.burger');
  if (burger) {
    const toggle = open => {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open);
    };
    burger.addEventListener('click', () => toggle(!document.body.classList.contains('menu-open')));
    $$('.mnav a').forEach(a => a.addEventListener('click', () => toggle(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  }

  // apariciones y contadores
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    $$('[data-count]', e.target).forEach(el => {
      const end = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now();
      const fmt = v => v.toFixed(dec).replace('.', ',');
      const tick = t => { const k = Math.min(1, (t - t0) / 1400); el.firstChild.textContent = fmt(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      if (!reduce) requestAnimationFrame(tick);
    });
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));

  // links de WhatsApp con mensaje armado
  $$('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });

  // video: carga YouTube recién al tocar play
  document.querySelectorAll('[data-yt]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${a.dataset.yt}?autoplay=1&rel=0`;
    f.title = 'Video de la Dra. Calcagni';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    a.replaceWith(f);
  }));

  // filtro de reseñas
  const rf = $('.rfilter');
  if (rf) rf.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', rf).forEach(x => x.setAttribute('aria-pressed', x === b));
    $$('.review').forEach(r => r.classList.toggle('hide', b.dataset.f !== 'todas' && r.dataset.area !== b.dataset.f));
  });

  // formulario de consulta
  const form = $('#cupon');
  if (form) {
    const topics = {
      familia: { name: 'Familia', docs: ['DNI y partida de matrimonio', 'Partidas de nacimiento de los hijos', 'Recibos de sueldo o ingresos', 'Acuerdos o mensajes previos'] },
      sucesiones: { name: 'Sucesiones', docs: ['Partida de defunción', 'Partidas que prueben el parentesco', 'Títulos de inmuebles o autos', 'Testamento, si existe'] },
      accidentes: { name: 'Accidentes', docs: ['Denuncia policial o de siniestro', 'Datos del seguro de cada parte', 'Fotos y datos de testigos', 'Certificados médicos y gastos'] },
      violencia: { name: 'Violencia de género', docs: ['Mensajes, audios o capturas', 'Fotos o certificados médicos', 'Denuncias anteriores, si las hay', 'DNI y partidas de los hijos'] },
      penal: { name: 'Penal', docs: ['Copia de la denuncia o citación', 'Mensajes, audios o capturas', 'Datos de testigos', 'Medidas judiciales vigentes'] },
      empresas: { name: 'Empresas', docs: ['Nómina y forma de contratación', 'Contratos vigentes', 'Juicios o reclamos en curso', 'Datos de la ART'] }
    };
    const nombre = $('#f-nombre'), msg = $('#f-msg'), modo = $('#f-modo');
    const docs = $('#docs'), docsT = $('#docs-t'), send = $('#enviar');
    const update = () => {
      const t = topics[$('input[name="tema"]:checked').value];
      docsT.textContent = `Para ${t.name}, tené a mano`;
      docs.innerHTML = t.docs.map(d => `<li>${d}</li>`).join('');
      const n = nombre.value.trim();
      const text = `Hola Dra. Calcagni, ${n ? 'soy ' + n + ' y ' : ''}quiero hacer una consulta sobre ${t.name.toLowerCase()}` + (modo && modo.value ? ` (${modo.value.toLowerCase()})` : '') + '.' + (msg.value.trim() ? `\n\n${msg.value.trim()}` : '');
      send.href = waLink(text);
    };
    form.addEventListener('input', update);
    form.addEventListener('submit', e => e.preventDefault());
    $$('[data-topic]').forEach(a => a.addEventListener('click', () => { const r = $('#t-' + a.dataset.topic); if (r) { r.checked = true; update(); } }));
    update();
  }

  // calculadora orientativa de despido (LCT arts. 245, 231, 232, 233, 123 y 156)
  const calc = $('#calc');
  if (calc) {
    const money = v => '$ ' + Math.round(v).toLocaleString('es-AR');
    const ing = $('#c-ing'), egr = $('#c-egr'), sue = $('#c-sue'), pre = $('#c-pre');
    const today = new Date(); egr.value = today.toISOString().slice(0, 10);
    const d = s => { const [y, m, dd] = s.split('-').map(Number); return new Date(y, m - 1, dd); };
    const days = (a, b) => Math.round((b - a) / 864e5);
    const run = () => {
      const out = $('#c-out');
      const sueldo = +String(sue.value).replace(/[^\d]/g, '');
      if (!ing.value || !egr.value || !sueldo) { out.hidden = true; return; }
      const a = d(ing.value), b = d(egr.value);
      if (b <= a) { out.hidden = true; return; }
      // antigüedad en años y meses
      let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
      if (b.getDate() < a.getDate()) months--;
      const years = Math.floor(months / 12), rest = months % 12;
      const prueba = months < 6;
      const yInd = prueba ? 0 : Math.max(1, years + (rest > 3 ? 1 : 0));
      const ind = sueldo * yInd;
      const sinPre = pre.value === 'no';
      const preMeses = prueba ? 0.5 : (years >= 5 ? 2 : 1);
      const preaviso = sinPre ? sueldo * preMeses : 0;
      const dim = new Date(b.getFullYear(), b.getMonth() + 1, 0).getDate();
      const integ = sinPre && !prueba ? sueldo / dim * (dim - b.getDate()) : 0;
      const sacPre = (preaviso + integ) / 12;
      const semStart = new Date(b.getFullYear(), b.getMonth() < 6 ? 0 : 6, 1);
      const sacProp = sueldo / 2 * Math.min(1, days(a > semStart ? a : semStart, b) / 182.5);
      const yearStart = new Date(b.getFullYear(), 0, 1);
      const vacDias = years < 5 ? 14 : years < 10 ? 21 : years < 20 ? 28 : 35;
      const vac = vacDias * (days(a > yearStart ? a : yearStart, b) / 365) * (sueldo / 25);
      const rows = [
        [`Indemnización por antigüedad (${yInd} ${yInd === 1 ? 'sueldo' : 'sueldos'})`, ind],
        [`Preaviso no otorgado${sinPre ? ` (${preMeses === 0.5 ? '15 días' : preMeses + (preMeses === 1 ? ' mes' : ' meses')})` : ''}`, preaviso],
        ['Integración del mes de despido', integ],
        ['Aguinaldo sobre preaviso e integración', sacPre],
        ['Aguinaldo proporcional', sacProp],
        ['Vacaciones no gozadas proporcionales', vac + vac / 12]
      ];
      const total = rows.reduce((s, r) => s + r[1], 0);
      $('#c-rows').innerHTML = rows.map(r => `<dt>${r[0]}</dt><dd>${money(r[1])}</dd>`).join('');
      $('#c-tot').textContent = money(total);
      $('#c-meta').textContent = `Antigüedad: ${years} ${years === 1 ? 'año' : 'años'} y ${rest} ${rest === 1 ? 'mes' : 'meses'}${prueba ? ' · período de prueba' : ''}`;
      $('#c-send').href = waLink(`Hola Dra. Calcagni, usé la calculadora de despido de la web.\n\nIngreso: ${a.toLocaleDateString('es-AR')}\nEgreso: ${b.toLocaleDateString('es-AR')}\nMejor sueldo: ${money(sueldo)}\nTotal estimado: ${money(total)}\n\n¿Podemos revisar mi caso?`);
      out.hidden = false;
    };
    sue.addEventListener('input', () => {
      const n = sue.value.replace(/[^\d]/g, '');
      sue.value = n ? (+n).toLocaleString('es-AR') : '';
    });
    calc.addEventListener('input', run);
    calc.addEventListener('submit', e => e.preventDefault());
    run();
  }
})();
