const API_KEY = "37ef3cd5b668f532b94eaae29ac56827";
const API_BASE = "https://api.themoviedb.org/3";
const LANGUAGE = "es-ES";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const typeSelect = document.getElementById("typeSelect");
  const searchBtn = document.getElementById("searchBtn");
  const results = document.getElementById("results");
  const sugerenciasSection = document.getElementById("sugerencias");
  const genreBar = document.getElementById("genreBar");
  const genreInput = document.getElementById("genreInput");
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  let generosCargados = [];

  async function buscar() {
    const query = searchInput.value.trim();
    const tipo = typeSelect.value;
    const genre = genreInput ? genreInput.value : '';
    if (!query && !genre) return;
    let url = "";
    let params = `api_key=${API_KEY}&language=${LANGUAGE}`;
    if (query) params += `&query=${encodeURIComponent(query)}`;
    if (genre) params += `&with_genres=${genre}`;
    if (query) {
      if (tipo === "all") {
        url = `${API_BASE}/search/multi?${params}`;
      } else if (tipo === "movie") {
        url = `${API_BASE}/search/movie?${params}`;
      } else if (tipo === "tv") {
        url = `${API_BASE}/search/tv?${params}`;
      }
    } else {
      if (tipo === "all" || tipo === "movie") {
        url = `${API_BASE}/discover/movie?${params}`;
      } else if (tipo === "tv") {
        url = `${API_BASE}/discover/tv?${params}`;
      }
    }
    const res = await fetch(url);
    const data = await res.json();
    renderResults(data.results || []);
    sugerenciasSection.style.display = "none";
  }

  searchBtn.addEventListener("click", buscar);
  searchInput.addEventListener("keydown", e => { if (e.key === "Enter") buscar(); });

  function renderResults(items) {
    results.innerHTML = "";
    if (!items.length) {
      results.innerHTML = "<p>No se encontraron resultados.</p>";
      return;
    }
    items.forEach(item => {
      // Solo mostrar películas y series
      if (!item.poster_path || (!item.title && !item.name)) return;
      const titulo = item.title || item.name;
      const overview = item.overview ? item.overview.substring(0, 120) + (item.overview.length > 120 ? '...' : '') : "Sin descripción disponible.";
      const imagen = `https://image.tmdb.org/t/p/w300${item.poster_path}`;
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${imagen}" alt="${titulo}" />
        <div class="card-content">
          <div class="card-title">${titulo}</div>
          <div class="card-overview">${overview}</div>
        </div>
      `;
      card.addEventListener("click", () => mostrarDetalle(item));
      results.appendChild(card);
    });
  }

  // Mostrar sugerencias nuevamente si el input de búsqueda queda vacío
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() === "") {
      sugerenciasSection.style.display = "flex";
      results.innerHTML = "";
    }
  });

  // Hacer sugerencias clicables para mostrar ficha de detalle
  window.cargarSugerencias = async function() {
    const sugerencias = document.getElementById("sugerencias");
    sugerencias.innerHTML = "<div class='sugerencia-card'>Cargando sugerencias...</div>";
    sugerencias.style.display = "flex";
    try {
      // Sugerencias personalizadas (populares)
      const populares = await fetch(`${API_BASE}/movie/popular?api_key=${API_KEY}&language=${LANGUAGE}&page=1`).then(r => r.json());
      const estrenos = await fetch(`${API_BASE}/movie/now_playing?api_key=${API_KEY}&language=${LANGUAGE}&page=1`).then(r => r.json());
      let hayContenido = false;
      sugerencias.innerHTML = "";
      // Populares
      if (populares.results && populares.results.length) {
        hayContenido = true;
        sugerencias.innerHTML += `<h3 style='width:100%;color:#08d9d6;text-align:left;margin-bottom:0.5rem;'>Sugerencias para ti</h3>`;
        sugerencias.innerHTML += populares.results.slice(0, 5).map(p => `
          <div class="sugerencia-card" data-id="${p.id}" data-type="movie">
            <img src="https://image.tmdb.org/t/p/w300${p.poster_path}" alt="${p.title}" />
            <div class="titulo">${p.title}</div>
          </div>
        `).join("");
      }
      // Estrenos
      if (estrenos.results && estrenos.results.length) {
        hayContenido = true;
        sugerencias.innerHTML += `<h3 style='width:100%;color:#ff2e63;text-align:left;margin:1.2rem 0 0.5rem 0;'>Últimos estrenos</h3>`;
        sugerencias.innerHTML += estrenos.results.slice(0, 5).map(p => `
          <div class="sugerencia-card" data-id="${p.id}" data-type="movie">
            <img src="https://image.tmdb.org/t/p/w300${p.poster_path}" alt="${p.title}" />
            <div class="titulo">${p.title}</div>
          </div>
        `).join("");
      }
      // Si no hay contenido
      if (!hayContenido) {
        sugerencias.innerHTML = "<div class='sugerencia-card'>No hay sugerencias ni estrenos disponibles en este momento.</div>";
      }
      // Hacer sugerencias clicables
      sugerencias.querySelectorAll('.sugerencia-card[data-id]').forEach(card => {
        card.addEventListener('click', function() {
          mostrarDetalle({ id: this.getAttribute('data-id'), media_type: this.getAttribute('data-type') });
        });
      });
    } catch (e) {
      sugerencias.innerHTML = "<div class='sugerencia-card'>No se pudieron cargar las sugerencias. Intenta más tarde.</div>";
    }
    sugerencias.style.display = "flex";
  };

  // Modal de detalle
  const modal = document.getElementById("modalDetalle");
  const modalBody = document.getElementById("modalBody");
  const cerrarModal = document.getElementById("cerrarModal");

  async function mostrarDetalle(item) {
    const tipo = item.media_type || (item.title ? "movie" : "tv");
    let detalle = item;
    // Obtener detalles completos
    const url = `${API_BASE}/${tipo}/${item.id}?api_key=${API_KEY}&language=${LANGUAGE}&append_to_response=credits,images,videos,similar&include_image_language=es,en,null`;
    const res = await fetch(url);
    detalle = await res.json();
    console.log('URL de la API:', url);
    console.log('Respuesta completa:', detalle);

    // Tráiler de YouTube (prioriza 'Trailer', si no, muestra cualquier video de YouTube)
    let trailer = null;
    if (detalle.videos?.results?.length) {
      trailer = detalle.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer')
             || detalle.videos.results.find(v => v.site === 'YouTube')
             || null;
    }
    // Carrusel de imágenes - intentar backdrops primero, luego posters
    let imagenes = (detalle.images?.backdrops || []).slice(0, 8);
    console.log('Detalle de imágenes:', detalle.images); // Debug
    console.log('Backdrops disponibles:', imagenes.length);
    
    // Si no hay backdrops, intentar con posters
    if (imagenes.length === 0 && detalle.images?.posters) {
      imagenes = detalle.images.posters.slice(0, 8);
      console.log('Usando posters como alternativa:', imagenes.length);
    }
    
    // Guardar las URLs de las imágenes para navegación
    window.__imagenesActuales = imagenes.map(img => `https://image.tmdb.org/t/p/original${img.file_path}`);
    window.__imagenActualIndex = 0;
    // Actores principales
    const actores = (detalle.credits?.cast || []).slice(0, 8);
    // Similares
    const similares = (detalle.similar?.results || []).slice(0, 8);
    // Géneros
    const generos = (detalle.genres || []).map(g => `<span class="genero">${g.name}</span>`).join(' ');
    // Calificación en estrellas
    const estrellas = Math.round(detalle.vote_average ? detalle.vote_average / 2 : 0);
    const estrellasHtml = '<span class="estrellas">' + '★'.repeat(estrellas) + '<span class="estrellas-vacias">' + '★'.repeat(5 - estrellas) + '</span></span>';

    modalBody.innerHTML = `
      <div class="detalle-ficha">
        <div class="detalle-header">
          <img class="detalle-poster" src="${detalle.poster_path ? `https://image.tmdb.org/t/p/w400${detalle.poster_path}` : 'https://via.placeholder.com/400x600?text=Sin+imagen'}" alt="${detalle.title || detalle.name}">
          <div class="detalle-info">
            <h2 class="detalle-titulo">${detalle.title || detalle.name}</h2>
            <div class="detalle-meta">
              <span class="detalle-fecha">${detalle.release_date || detalle.first_air_date || ''}</span>
              <span class="detalle-calificacion">${estrellasHtml} <span class="num">${detalle.vote_average?.toFixed(1) || '-'}</span></span>
            </div>
            <div class="detalle-generos">${generos}</div>
            <p class="detalle-sinopsis">${detalle.overview || "Sinopsis no disponible."}</p>
          </div>
        </div>
        <div class="detalle-trailer">
          <h4>Tráiler</h4>
          ${trailer && trailer.key ? `<div class="trailer-embed"><iframe width="100%" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>` : '<p style="color:#bdbdbd;">No hay tráiler disponible.</p>'}
        </div>
        <div class="detalle-carrusel">
          <h4>Imágenes</h4>
          <div class="carrusel-imagenes">
            ${imagenes.length ? imagenes.map((img, index) => `<img src="https://image.tmdb.org/t/p/w500${img.file_path}" alt="img" class="carrusel-img" onclick="window.__abrirImagen && window.__abrirImagen(${index})">`).join('') : '<p style="color:#bdbdbd;">No hay imágenes de fondo disponibles para esta película.</p>'}
          </div>
        </div>
        <div class="detalle-actores">
          <h4>Reparto principal</h4>
          <div class="actores-lista">
            ${actores.length ? actores.map(a => `
              <div class="actor-card">
                <img src="${a.profile_path ? `https://image.tmdb.org/t/p/w185${a.profile_path}` : 'https://via.placeholder.com/80x120?text=Sin+foto'}" alt="${a.name}">
                <div class="actor-nombre">${a.name}</div>
                <div class="actor-personaje">${a.character}</div>
              </div>
            `).join('') : '<p style="color:#bdbdbd;">No hay reparto disponible.</p>'}
          </div>
        </div>
        <div class="detalle-similares">
          <h4>También te puede gustar</h4>
          <div class="similares-carrusel">
            ${similares.length ? similares.map(s => `
              <div class="sim-card" onclick="window.__abrirDetalleSimilar && window.__abrirDetalleSimilar(${s.id}, '${tipo}')">
                <img src="${s.poster_path ? `https://image.tmdb.org/t/p/w200${s.poster_path}` : 'https://via.placeholder.com/200x300?text=Sin+imagen'}" alt="${s.title || s.name}">
                <div class="sim-titulo">${s.title || s.name}</div>
              </div>
            `).join('') : '<p style="color:#bdbdbd;">No hay sugerencias.</p>'}
          </div>
        </div>
      </div>
    `;
    // Permitir abrir detalles de similares
    window.__abrirDetalleSimilar = (id, tipo) => {
      mostrarDetalle({ id, media_type: tipo });
    };
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
  cerrarModal.addEventListener("click", () => {
    modal.style.display = "none";
    modalBody.innerHTML = "";
    document.body.style.overflow = "auto";
  });
  window.addEventListener("click", e => {
    if (e.target === modal) {
      modal.style.display = "none";
      modalBody.innerHTML = "";
      document.body.style.overflow = "auto";
    }
  });

  // Cargar géneros desde la API y renderizar barra
  async function cargarGeneros() {
    const res = await fetch(`${API_BASE}/genre/movie/list?api_key=${API_KEY}&language=${LANGUAGE}`);
    const data = await res.json();
    generosCargados = data.genres || [];
    genreBar.innerHTML = '<button class="genre-btn selected" data-id="all">Todos</button>' +
      generosCargados.map(g => `<button class="genre-btn" data-id="${g.id}">${g.name}</button>`).join("");
    // Para el filtro de búsqueda avanzada
    if (genreInput) {
      genreInput.innerHTML = '<option value="">Género</option>' + generosCargados.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
    }
    // Eventos de click
    genreBar.querySelectorAll('.genre-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        genreBar.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        const id = this.getAttribute('data-id');
        if (id === "all") {
          sugerenciasSection.style.display = "flex";
          results.innerHTML = "";
        } else {
          buscarPorGenero(id);
        }
      });
    });
  }

  // Buscar películas por género
  async function buscarPorGenero(genreId) {
    // Ocultar sugerencias
    sugerenciasSection.style.display = "none";
    // Buscar películas populares del género
    const url = `${API_BASE}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&with_genres=${genreId}&sort_by=popularity.desc`;
    const res = await fetch(url);
    const data = await res.json();
    renderResults(data.results || []);
  }

  // Cargar géneros al iniciar
  cargarGeneros();

  // --- Toasts (notificaciones flotantes) ---
  function showToast(msg, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }



  // --- Skeleton loaders ---
  function showSkeletons(container, count = 5) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const sk = document.createElement('div');
      sk.className = 'card skeleton';
      sk.innerHTML = `<div style="height:320px;background:#23234a;border-radius:12px;"></div><div class="card-content"><div style="height:1.2rem;width:70%;background:#23234a;margin-bottom:0.5rem;border-radius:6px;"></div><div style="height:0.9rem;width:90%;background:#23234a;border-radius:6px;"></div></div>`;
      container.appendChild(sk);
    }
  }

  // --- Favoritos (Mi lista) ---
  function getFavoritos() {
    return JSON.parse(localStorage.getItem('favoritosFlixMoon') || '[]');
  }
  function setFavoritos(arr) {
    localStorage.setItem('favoritosFlixMoon', JSON.stringify(arr));
  }
  function toggleFavorito(item) {
    let favs = getFavoritos();
    const idx = favs.findIndex(f => f.id == item.id && (f.media_type || (f.title ? 'movie' : 'tv')) === (item.media_type || (item.title ? 'movie' : 'tv')));
    if (idx === -1) {
      favs.push(item);
      showToast('Agregado a Mi lista');
    } else {
      favs.splice(idx, 1);
      showToast('Eliminado de Mi lista');
    }
    setFavoritos(favs);
    renderResults(lastResults, true);
  }
  function isFavorito(item) {
    let favs = getFavoritos();
    return favs.some(f => f.id == item.id && (f.media_type || (f.title ? 'movie' : 'tv')) === (item.media_type || (item.title ? 'movie' : 'tv')));
  }
  // Mostrar Mi lista
  function mostrarMiLista() {
    const favs = getFavoritos();
    renderResults(favs, true);
    sugerenciasSection.style.display = "none";
    genreBar.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('selected'));
    showToast('Mostrando Mi lista');
  }
  // Botón Mi lista en header
  const btnMiLista = document.getElementById('btnMiLista');
  if (btnMiLista) {
    btnMiLista.onclick = mostrarMiLista;
  }

  // --- Mejorar renderResults para favoritos y miniaturas ---
  let lastResults = [];
  function renderResults(items, esFavoritos = false) {
    lastResults = items;
    results.innerHTML = "";
    if (!items.length) {
      results.innerHTML = esFavoritos ? "<p>No tienes favoritos en tu lista.</p>" : "<p>No se encontraron resultados.</p>";
      return;
    }
    items.forEach(item => {
      if (!item.poster_path && !item.poster) return;
      const titulo = item.title || item.name;
      const overview = item.overview ? item.overview.substring(0, 120) + (item.overview.length > 120 ? '...' : '') : "Sin descripción disponible.";
      const imagen = item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : (item.poster || 'https://via.placeholder.com/200x300?text=Sin+imagen');
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Ver detalles de ${titulo}`);
      card.innerHTML = `
        <img src="${imagen}" alt="Poster de ${titulo}" />
        <div class="card-content">
          <div class="card-title">${titulo}</div>
          <div class="card-overview">${overview}</div>
          <button class="fav-btn" title="Agregar a Mi lista">${isFavorito(item) ? '★' : '☆'}</button>
        </div>
      `;
      card.querySelector('.fav-btn').onclick = e => { e.stopPropagation(); toggleFavorito(item); };
      card.addEventListener("click", () => mostrarDetalle(item));
      card.addEventListener("keydown", e => { if (e.key === 'Enter') mostrarDetalle(item); });
      // Mini previsualización al hacer hover
      card.addEventListener('mouseenter', () => card.classList.add('hovered'));
      card.addEventListener('mouseleave', () => card.classList.remove('hovered'));
      results.appendChild(card);
    });
  }

  // Mostrar skeletons al buscar
  searchBtn.addEventListener("click", () => showSkeletons(results));
  searchInput.addEventListener("keydown", e => { if (e.key === "Enter") showSkeletons(results); });

  // Scroll to top button
  window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Modal de imagen
  const modalImagen = document.getElementById('modalImagen');
  const imagenGrande = document.getElementById('imagenGrande');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // Función para abrir imagen en modal
  window.__abrirImagen = function(index) {
    if (!window.__imagenesActuales || !window.__imagenesActuales[index]) return;
    
    window.__imagenActualIndex = index;
    imagenGrande.src = window.__imagenesActuales[index];
    modalImagen.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    actualizarBotonesNavegacion();
  };

  // Función para navegar entre imágenes
  function navegarImagen(direccion) {
    if (!window.__imagenesActuales || window.__imagenesActuales.length === 0) return;
    
    if (direccion === 'next') {
      window.__imagenActualIndex = (window.__imagenActualIndex + 1) % window.__imagenesActuales.length;
    } else {
      window.__imagenActualIndex = window.__imagenActualIndex === 0 ? 
        window.__imagenesActuales.length - 1 : window.__imagenActualIndex - 1;
    }
    
    imagenGrande.src = window.__imagenesActuales[window.__imagenActualIndex];
    actualizarBotonesNavegacion();
  }

  // Función para actualizar visibilidad de botones
  function actualizarBotonesNavegacion() {
    if (!window.__imagenesActuales || window.__imagenesActuales.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    }
  }

  // Eventos de navegación
  prevBtn.addEventListener('click', () => navegarImagen('prev'));
  nextBtn.addEventListener('click', () => navegarImagen('next'));

  // Cerrar modal de imagen al hacer clic fuera
  window.addEventListener('click', e => {
    if (e.target === modalImagen) {
      modalImagen.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  // Controles de teclado
  document.addEventListener('keydown', e => {
    if (modalImagen.style.display === 'flex') {
      if (e.key === 'Escape') {
        modalImagen.style.display = 'none';
        document.body.style.overflow = 'auto';
      } else if (e.key === 'ArrowLeft') {
        navegarImagen('prev');
      } else if (e.key === 'ArrowRight') {
        navegarImagen('next');
      }
    }
  });
});
