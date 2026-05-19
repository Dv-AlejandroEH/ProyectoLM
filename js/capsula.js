let fechaObjetivoContador;
let intervaloContador;
let capsulaAbierta = false;
let suspenseActivo = false;
let suspenseNivelActual = 0;

// Función original de cuenta regresiva
function iniciarCuentaRegresiva(fechaLimite, idContenedor) {
  fechaObjetivoContador = new Date(fechaLimite);

  const actualizarContador = () => {
	const ahora = new Date();
  const diferencia = fechaObjetivoContador - ahora;

    if (diferencia > 0 && diferencia <= 3000) {
      const segundosRestantes = Math.ceil(diferencia / 1000);
      activarSuspenseVisual(segundosRestantes);
    }

	if (diferencia <= 0) {
    document.getElementById(idContenedor).innerHTML = "¡Evento iniciado!";
    limpiarSuspenseVisual();
    abrirCapsulaConAnimacion();
    clearInterval(intervaloContador);
	  return;
	}

	const segundos = Math.floor((diferencia / 1000) % 60);
	const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
	const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
	const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
	const anos = Math.floor(dias / 365);

	document.getElementById(idContenedor).textContent = 
	  `${anos} años ${dias % 365} días ${horas} horas ${minutos} minutos ${segundos} segundos`;
  };

  clearInterval(intervaloContador);
  actualizarContador();
  intervaloContador = setInterval(actualizarContador, 1000);
}
iniciarCuentaRegresiva('2100-01-01', 'time');

function abrirCapsulaConAnimacion() {
  if (capsulaAbierta) {
    return;
  }

  capsulaAbierta = true;

  const mainDefault = document.getElementById('default');
  const mainAbierta = document.getElementById('abierta');
  const contador = document.getElementById('time');

  if (contador) {
    contador.classList.add('time-burst');
    contador.textContent = 'ABRIENDO CAPSULA...';
  }

  document.body.classList.add('capsula-opening');
  crearParticulasApertura();

  if (mainDefault) {
    mainDefault.classList.remove('suspense-mode');
    mainDefault.classList.add('capsula-explode');
  }

  setTimeout(() => {
    if (mainDefault) {
      mainDefault.classList.remove('visible');
      mainDefault.classList.add('oculto');
      mainDefault.classList.remove('capsula-explode');
    }

    if (mainAbierta) {
      mainAbierta.classList.remove('oculto');
      mainAbierta.classList.add('visible');
      mainAbierta.classList.add('capsula-reveal');

      const bloques = mainAbierta.querySelectorAll('.search-section, .filters-section, .tendencias-section, .timeline-section, .gallery-section');
      bloques.forEach((bloque, index) => {
        bloque.classList.remove('reveal-pop');
        bloque.style.animationDelay = `${0.15 + index * 0.14}s`;
        // Fuerza reflow para reiniciar la animación cuando se vuelve a abrir.
        void bloque.offsetWidth;
        bloque.classList.add('reveal-pop');
      });

      mainAbierta.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    document.body.classList.remove('capsula-opening');
  }, 1200);
}

function crearParticulasApertura() {
  const overlay = document.createElement('div');
  overlay.className = 'opening-overlay';

  const ring = document.createElement('div');
  ring.className = 'opening-ring';
  overlay.appendChild(ring);

  const ring2 = document.createElement('div');
  ring2.className = 'opening-ring opening-ring-second';
  overlay.appendChild(ring2);

  for (let i = 0; i < 48; i++) {
    const sparkle = document.createElement('span');
    sparkle.className = 'opening-spark';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.setProperty('--dx', `${-140 + Math.random() * 280}px`);
    sparkle.style.setProperty('--dy', `${-120 + Math.random() * 240}px`);
    sparkle.style.animationDelay = `${Math.random() * 0.45}s`;
    sparkle.style.animationDuration = `${0.9 + Math.random() * 0.9}s`;
    overlay.appendChild(sparkle);
  }

  for (let i = 0; i < 10; i++) {
    const trail = document.createElement('span');
    trail.className = 'opening-trail';
    trail.style.left = `${35 + Math.random() * 30}%`;
    trail.style.top = `${35 + Math.random() * 30}%`;
    trail.style.setProperty('--tx', `${-220 + Math.random() * 440}px`);
    trail.style.setProperty('--ty', `${-160 + Math.random() * 320}px`);
    trail.style.animationDelay = `${0.1 + Math.random() * 0.45}s`;
    overlay.appendChild(trail);
  }

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
  }, 2100);
}



// Variables globales
let todosLosMemes = [];
let memesFiltrados = [];
let filtroAnoValue = '';
let filtroMesValue = '';

// Nombres de meses
const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Cargar datos del XML al inicializar la página
document.addEventListener('DOMContentLoaded', function() {
  inicializarCustomSelects();
  cargarMemesDelXML();
});

// Inicializar custom selects
function inicializarCustomSelects() {
  const selects = document.querySelectorAll('.custom-select');
  
  selects.forEach(selectElement => {
    const trigger = selectElement.querySelector('.select-trigger');
    const options = selectElement.querySelectorAll('.select-option');
    
    // Abrir/cerrar dropdown
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      // Cerrar otros selects
      document.querySelectorAll('.custom-select').forEach(s => {
        if (s !== selectElement) {
          s.classList.remove('active');
        }
      });
      selectElement.classList.toggle('active');
    });
    
    // Seleccionar opción
    options.forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation();
        const value = this.getAttribute('data-value');
        const text = this.textContent;
        
        trigger.textContent = text;
        selectElement.setAttribute('data-value', value);
        
        // Actualizar variables globales
        if (selectElement.id === 'selectAno') {
          filtroAnoValue = value;
        } else if (selectElement.id === 'selectMes') {
          filtroMesValue = value;
        }
        
        selectElement.classList.remove('active');
        actualizarTimeline();
      });
    });
  });
  
  // Cerrar cuando se hace click fuera
  document.addEventListener('click', function() {
    document.querySelectorAll('.custom-select').forEach(s => {
      s.classList.remove('active');
    });
  });
}

// Cargar memes del archivo XML
function cargarMemesDelXML() {
  fetch('/memes.xml')
    .then(response => response.text())
    .then(xml => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');
      const memes = xmlDoc.getElementsByTagName('meme');
      
      todosLosMemes = [];
      for (let i = 0; i < memes.length; i++) {
        const meme = {
          id: memes[i].getAttribute('id'),
          src: memes[i].getElementsByTagName('src')[0].textContent,
          alt: memes[i].getElementsByTagName('alt')[0].textContent,
          usuario: memes[i].getElementsByTagName('usuario')[0].textContent,
          fecha: memes[i].getElementsByTagName('fecha')[0].textContent,
          likes: parseInt(memes[i].getElementsByTagName('likes')[0].textContent)
        };
        todosLosMemes.push(meme);
      }
      
      // Ordenar por fecha
      todosLosMemes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      memesFiltrados = [...todosLosMemes];
      
      // Mostrar datos iniciales
      actualizarTimeline();
    })
    .catch(error => console.error('Error al cargar XML:', error));
}

// Buscar por usuario
function buscarPorUsuario() {
  const nombreUsuario = document.getElementById('buscarUsuario').value.toLowerCase().trim();
  
  if (nombreUsuario === '') {
    alert('Por favor, ingresa un nombre de usuario');
    return;
  }
  
  memesFiltrados = todosLosMemes.filter(meme => 
    meme.usuario.toLowerCase().includes(nombreUsuario)
  );
  
  if (memesFiltrados.length === 0) {
    alert(`No se encontraron memes del usuario "${nombreUsuario}"`);
    memesFiltrados = [...todosLosMemes];
  }
  
  // Limpiar filtros de año y mes
  filtroAnoValue = '';
  filtroMesValue = '';
  document.getElementById('selectAno').setAttribute('data-value', '');
  document.getElementById('selectAno').querySelector('.select-trigger').textContent = 'Todos los años';
  document.getElementById('selectMes').setAttribute('data-value', '');
  document.getElementById('selectMes').querySelector('.select-trigger').textContent = 'Todos los meses';
  
  actualizarTimeline();
}

// Limpiar búsqueda
function limpiarBusqueda() {
  document.getElementById('buscarUsuario').value = '';
  filtroAnoValue = '';
  filtroMesValue = '';
  document.getElementById('selectAno').setAttribute('data-value', '');
  document.getElementById('selectAno').querySelector('.select-trigger').textContent = 'Todos los años';
  document.getElementById('selectMes').setAttribute('data-value', '');
  document.getElementById('selectMes').querySelector('.select-trigger').textContent = 'Todos los meses';
  memesFiltrados = [...todosLosMemes];
  actualizarTimeline();
}

// Actualizar timeline según filtros
function actualizarTimeline() {
  const ano = filtroAnoValue;
  const mes = filtroMesValue;
  
  let temporalFiltrados = [...memesFiltrados];
  
  if (ano) {
    temporalFiltrados = temporalFiltrados.filter(meme => 
      meme.fecha.startsWith(ano)
    );
  }
  
  if (mes) {
    temporalFiltrados = temporalFiltrados.filter(meme => 
      meme.fecha.substring(5, 7) === mes
    );
  }
  
  // Actualizar estadísticas
  actualizarEstadisticas(temporalFiltrados);
  
  // Actualizar timeline visual
  actualizarVisualizacionTimeline(temporalFiltrados);
  
  // Actualizar galería
  mostrarGaleria(temporalFiltrados);
}

// Actualizar estadísticas (tendencias)
function actualizarEstadisticas(memes) {
  // Total de memes
  document.getElementById('totalMemes').textContent = memes.length;
  
  if (memes.length === 0) {
    document.getElementById('usuarioMasActivo').textContent = '-';
    document.getElementById('promLikes').textContent = '0';
    document.getElementById('mesTendencia').textContent = '-';
    return;
  }
  
  // Usuario más activo
  const usuariosConteo = {};
  memes.forEach(meme => {
    usuariosConteo[meme.usuario] = (usuariosConteo[meme.usuario] || 0) + 1;
  });
  
  const usuarioMasActivo = Object.keys(usuariosConteo).reduce((a, b) => 
    usuariosConteo[a] > usuariosConteo[b] ? a : b
  );
  document.getElementById('usuarioMasActivo').textContent = usuarioMasActivo + ` (${usuariosConteo[usuarioMasActivo]})`;
  
  // Promedio de likes
  const promLikes = Math.round(memes.reduce((sum, m) => sum + m.likes, 0) / memes.length);
  document.getElementById('promLikes').textContent = promLikes;
  
  // Mes más popular
  const mesesConteo = {};
  memes.forEach(meme => {
    const mesNum = meme.fecha.substring(5, 7);
    const mesNombre = mesesNombres[parseInt(mesNum) - 1];
    mesesConteo[mesNombre] = (mesesConteo[mesNombre] || 0) + 1;
  });
  
  if (Object.keys(mesesConteo).length > 0) {
    const mesMasPopular = Object.keys(mesesConteo).reduce((a, b) => 
      mesesConteo[a] > mesesConteo[b] ? a : b
    );
    document.getElementById('mesTendencia').textContent = mesMasPopular;
  }
}

// Visualizar timeline
function actualizarVisualizacionTimeline(memes) {
  const timelineDiv = document.getElementById('timeline');
  
  if (memes.length === 0) {
    timelineDiv.innerHTML = '<p class="sin-resultados">No hay memes para mostrar</p>';
    return;
  }
  
  // Agrupar por año-mes
  const agrupados = {};
  memes.forEach(meme => {
    const fecha = new Date(meme.fecha);
    const ano = fecha.getFullYear();
    const mes = fecha.getMonth();
    const clave = `${ano}-${mes}`;
    
    if (!agrupados[clave]) {
      agrupados[clave] = {
        ano: ano,
        mes: mesesNombres[mes],
        memes: []
      };
    }
    agrupados[clave].memes.push(meme);
  });
  
  // Crear items de timeline
  let html = '';
  const claves = Object.keys(agrupados).sort();
  
  claves.forEach((clave, index) => {
    const grupo = agrupados[clave];
    const esIzquierda = index % 2 === 0;
    
    html += `
      <div class="timeline-item ${esIzquierda ? 'izquierda' : 'derecha'}">
        <div class="timeline-date">
          <strong>${grupo.mes} ${grupo.ano}</strong>
        </div>
        <div class="timeline-content">
          <div class="timeline-count">
            ${grupo.memes.length} meme${grupo.memes.length !== 1 ? 's' : ''}
          </div>
          <div class="timeline-users">
            ${grupo.memes.map(m => `<span class="user-badge">${m.usuario}</span>`).join('')}
          </div>
          <div class="timeline-likes">
            ❤️ ${grupo.memes.reduce((sum, m) => sum + m.likes, 0)} likes totales
          </div>
        </div>
      </div>
    `;
  });
  
  timelineDiv.innerHTML = html;
}

// Mostrar galería de memes
function mostrarGaleria(memes) {
  const gallery = document.getElementById('memesGallery');
  
  if (memes.length === 0) {
    gallery.innerHTML = '<p class="sin-resultados">No hay memes para mostrar</p>';
    return;
  }
  
  let html = '<div class="gallery-grid">';
  memes.forEach(meme => {
    const fecha = new Date(meme.fecha);
    const fechaFormato = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    
    html += `
      <div class="gallery-item">
        <div class="gallery-image">
          <img src="${meme.src}" alt="${meme.alt}" loading="lazy">
        </div>
        <div class="gallery-info">
          <p class="gallery-user">👤 ${meme.usuario}</p>
          <p class="gallery-date">📅 ${fechaFormato}</p>
          <p class="gallery-likes">❤️ ${meme.likes} likes</p>
          <p class="gallery-description">${meme.alt}</p>
        </div>
      </div>
    `;
  });
  html += '</div>';
  
  gallery.innerHTML = html;
}

// Reinicia la cuenta regresiva para que termine en 5 segundos.
function reducirContador() {
  if (capsulaAbierta) {
    return;
  }

  fechaObjetivoContador = new Date(Date.now() + 5000);
}

function activarSuspenseVisual(nivel) {
  if (capsulaAbierta) {
    return;
  }

  const nivelSeguro = Math.max(1, Math.min(3, nivel));

  if (suspenseNivelActual !== nivelSeguro) {
    suspenseNivelActual = nivelSeguro;
    document.body.setAttribute('data-suspense-level', String(suspenseNivelActual));
  }

  if (suspenseActivo) {
    return;
  }

  suspenseActivo = true;
  document.body.classList.add('capsula-suspense');

  const mainDefault = document.getElementById('default');
  if (mainDefault) {
    mainDefault.classList.add('suspense-mode');
  }

  const overlay = document.createElement('div');
  overlay.className = 'suspense-overlay';
  overlay.id = 'suspenseOverlay';
  document.body.appendChild(overlay);
}

function limpiarSuspenseVisual() {
  suspenseActivo = false;
  suspenseNivelActual = 0;
  document.body.classList.remove('capsula-suspense');
  document.body.removeAttribute('data-suspense-level');

  const mainDefault = document.getElementById('default');
  if (mainDefault) {
    mainDefault.classList.remove('suspense-mode');
  }

  const overlay = document.getElementById('suspenseOverlay');
  if (overlay) {
    overlay.remove();
  }
}