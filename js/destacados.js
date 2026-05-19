// Carga 'memes.xml' y rellena el carrusel en la página Destacados
let todosLosMemes = [];
let memesActuales = [];
const HOY = '2026-05-19'; // Fecha de hoy
let usuarioActual = null;

// Obtener o generar ID de usuario
function obtenerUsuarioID() {
    let userID = localStorage.getItem('userID');
    if (!userID) {
        userID = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userID', userID);
    }
    return userID;
}

// Verificar si usuario ya votó este meme
function yaVoto(memeID) {
    const votos = JSON.parse(localStorage.getItem('votos') || '{}');
    return votos[memeID]?.includes(usuarioActual) || false;
}

// Guardar voto del usuario
function guardarVoto(memeID) {
    const votos = JSON.parse(localStorage.getItem('votos') || '{}');
    if (!votos[memeID]) {
        votos[memeID] = [];
    }
    if (!votos[memeID].includes(usuarioActual)) {
        votos[memeID].push(usuarioActual);
        localStorage.setItem('votos', JSON.stringify(votos));
        return true;
    }
    return false;
}

async function cargarMemesDesdeXML(ruta = '/memes.xml') {
    try {
        const resp = await fetch(ruta);
        if (!resp.ok) throw new Error('No se pudo cargar ' + ruta);
        const text = await resp.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const nodes = Array.from(xml.getElementsByTagName('meme'));
        return nodes.map(n => ({
            id: n.getAttribute('id') || '',
            src: (n.getElementsByTagName('src')[0] || {}).textContent || '',
            alt: (n.getElementsByTagName('alt')[0] || {}).textContent || '',
            usuario: (n.getElementsByTagName('usuario')[0] || {}).textContent || 'Anónimo',
            fecha: (n.getElementsByTagName('fecha')[0] || {}).textContent || '',
            likes: parseInt((n.getElementsByTagName('likes')[0] || {}).textContent || '0'),
            votable: ((n.getElementsByTagName('votable')[0] || {}).textContent || 'false').toLowerCase() === 'true'
        })).filter(m => m.src && m.fecha === HOY); // Solo memes de hoy
    } catch (e) {
        console.error('Error leyendo XML:', e);
        return [];
    }
}

function poblarCarrusel(memes, n = 5) {
    const carouselInner = document.querySelector('.carousel-inner');
    if (!carouselInner) return;
    carouselInner.innerHTML = '';
    
    // Ordenar por likes descendentes y tomar los primeros n
    const topMemes = [...memes].sort((a, b) => b.likes - a.likes).slice(0, n);
    
    if (topMemes.length === 0) {
        carouselInner.innerHTML = '<div class="carousel-item active"><div class="d-flex align-items-center justify-content-center" style="height: 400px; background: var(--fondo);"><p>No hay memes destacados por hoy</p></div></div>';
        return;
    }
    
    topMemes.forEach((m, idx) => {
        const div = document.createElement('div');
        div.className = 'carousel-item' + (idx === 0 ? ' active' : '');
        
        const img = document.createElement('img');
        img.src = m.src;
        img.alt = m.alt || '';
        img.className = 'd-block w-100';
        
        const caption = document.createElement('div');
        caption.className = 'carousel-caption';
        caption.innerHTML = `
            <p><strong>${m.usuario}</strong> · ${m.likes} ❤️</p>
            <small>${formatearFecha(m.fecha)}</small>
        `;
        
        div.appendChild(img);
        div.appendChild(caption);
        carouselInner.appendChild(div);
    });
}

function poblarGrid(memes) {
    const grid = document.getElementById('memesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (memes.length === 0) {
        grid.innerHTML = '<p class="no-results">No hay memes para mostrar hoy.</p>';
        return;
    }
    
    memes.forEach((m) => {
        const card = document.createElement('div');
        card.className = 'meme-card';
        
        let bottonLike = '';
        if (m.votable) {
            const yavoto = yaVoto(m.id);
            const claseDeshabilitado = yavoto ? 'btn-like-votado' : '';
            const textoBoton = yavoto ? '✓ Ya votaste' : '<span class="likes-count">' + m.likes + '</span> ❤️';
            bottonLike = `
                <button class="btn-like ${claseDeshabilitado}" data-id="${m.id}" ${yavoto ? 'disabled' : ''}>
                    ${textoBoton}
                </button>
            `;
        }
        
        card.innerHTML = `
            <div class="meme-image-container">
                <img src="${m.src}" alt="${m.alt}" class="meme-image" loading="lazy">
                <div class="meme-overlay">
                    ${bottonLike}
                </div>
            </div>
            <div class="meme-info">
                <h4 class="meme-user">👤 ${m.usuario}</h4>
                <p class="meme-date">📅 ${formatearFecha(m.fecha)}</p>
                <p class="meme-alt">${m.alt}</p>
                ${!m.votable ? '<p class="badge-no-votable">❌ No votable</p>' : ''}
            </div>
        `;
        grid.appendChild(card);
        
        // Agregar evento al botón de like solo si es votable
        if (m.votable) {
            const btnLike = card.querySelector('.btn-like');
            btnLike?.addEventListener('click', (e) => {
                if (e.target.disabled) return;
                
                // Guardar voto
                const votoGuardado = guardarVoto(m.id);
                if (votoGuardado) {
                    // Actualizar likes
                    const countEl = e.target.querySelector('.likes-count');
                    if (countEl) {
                        countEl.textContent = parseInt(countEl.textContent) + 1;
                    }
                    
                    // Cambiar botón
                    e.target.classList.add('btn-like-votado', 'liked');
                    e.target.innerHTML = '✓ Ya votaste';
                    e.target.disabled = true;
                    
                    // Actualizar carrusel
                    actualizarMemesEnCarrusel();
                    
                    setTimeout(() => e.target.classList.remove('liked'), 300);
                }
            });
        }
    });
}

function actualizarMemesEnCarrusel() {
    poblarCarrusel(todosLosMemes, 5);
}

function actualizarEstadisticas(memes) {
    const stats = {
        total: memes.length,
        likes: memes.reduce((sum, m) => sum + m.likes, 0),
        usuarios: new Set(memes.map(m => m.usuario)).size,
        topMeme: memes.length > 0 ? memes.sort((a, b) => b.likes - a.likes)[0].usuario : 'N/A'
    };
    
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-likes').textContent = stats.likes;
    document.getElementById('stat-users').textContent = stats.usuarios;
    document.getElementById('stat-trending').textContent = stats.topMeme;
}

function formatearFecha(fecha) {
    if (!fecha) return 'Fecha desconocida';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function poblarFiltros(memes) {
    const filterUser = document.getElementById('filterUser');
    const usuarios = [...new Set(memes.map(m => m.usuario))].sort();
    
    usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario;
        option.textContent = usuario;
        filterUser.appendChild(option);
    });
}

function filtrarYOrdenar() {
    const usuario = document.getElementById('filterUser').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Filtrar por usuario
    let memes = todosLosMemes.filter(m => usuario === '' || m.usuario === usuario);
    
    // Ordenar
    switch(sortBy) {
        case 'likes-desc':
            memes.sort((a, b) => b.likes - a.likes);
            break;
        case 'likes-asc':
            memes.sort((a, b) => a.likes - b.likes);
            break;
        case 'date-new':
            memes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            break;
        case 'date-old':
            memes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            break;
        case 'name-asc':
            memes.sort((a, b) => a.alt.localeCompare(b.alt));
            break;
    }
    
    memesActuales = memes;
    poblarGrid(memes);
    actualizarEstadisticas(memes);
}

function resetFiltros() {
    document.getElementById('filterUser').value = '';
    document.getElementById('sortBy').value = 'likes-desc';
    filtrarYOrdenar();
}

window.addEventListener('DOMContentLoaded', async () => {
    usuarioActual = obtenerUsuarioID();
    
    todosLosMemes = await cargarMemesDesdeXML('/memes.xml');
    memesActuales = [...todosLosMemes];
    
    if (!todosLosMemes.length) {
        console.warn('No se cargaron memes de hoy');
        document.getElementById('memesGrid').innerHTML = '<p class="no-results">No hay memes de hoy.</p>';
        return;
    }
    
    // Inicializar componentes
    poblarCarrusel(todosLosMemes, 5);
    poblarGrid(todosLosMemes);
    poblarFiltros(todosLosMemes);
    actualizarEstadisticas(todosLosMemes);
    
    // Eventos de filtros
    document.getElementById('filterUser')?.addEventListener('change', filtrarYOrdenar);
    document.getElementById('sortBy')?.addEventListener('change', filtrarYOrdenar);
    document.getElementById('btnReset')?.addEventListener('click', resetFiltros);
});

function actualizarEstadisticas(memes) {
    const stats = {
        total: memes.length,
        likes: memes.reduce((sum, m) => sum + m.likes, 0),
        usuarios: new Set(memes.map(m => m.usuario)).size,
        topMeme: memes.length > 0 ? memes.sort((a, b) => b.likes - a.likes)[0].usuario : 'N/A'
    };
    
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-likes').textContent = stats.likes;
    document.getElementById('stat-users').textContent = stats.usuarios;
    document.getElementById('stat-trending').textContent = stats.topMeme;
}

function formatearFecha(fecha) {
    if (!fecha) return 'Fecha desconocida';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function poblarFiltros(memes) {
    const filterUser = document.getElementById('filterUser');
    const usuarios = [...new Set(memes.map(m => m.usuario))].sort();
    
    usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario;
        option.textContent = usuario;
        filterUser.appendChild(option);
    });
}

function filtrarYOrdenar() {
    const usuario = document.getElementById('filterUser').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Filtrar por usuario
    let memes = todosLosMemes.filter(m => usuario === '' || m.usuario === usuario);
    
    // Ordenar
    switch(sortBy) {
        case 'likes-desc':
            memes.sort((a, b) => b.likes - a.likes);
            break;
        case 'likes-asc':
            memes.sort((a, b) => a.likes - b.likes);
            break;
        case 'date-new':
            memes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            break;
        case 'date-old':
            memes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            break;
        case 'name-asc':
            memes.sort((a, b) => a.alt.localeCompare(b.alt));
            break;
    }
    
    memesActuales = memes;
    poblarGrid(memes);
    actualizarEstadisticas(memes);
}

function resetFiltros() {
    document.getElementById('filterUser').value = '';
    document.getElementById('sortBy').value = 'likes-desc';
    filtrarYOrdenar();
}

window.addEventListener('DOMContentLoaded', async () => {
    todosLosMemes = await cargarMemesDesdeXML('/memes.xml');
    memesActuales = [...todosLosMemes];
    
    if (!todosLosMemes.length) {
        console.warn('No se cargaron memes de hoy');
        document.getElementById('memesGrid').innerHTML = '<p class="no-results">No hay memes de hoy.</p>';
        return;
    }
    
    // Inicializar componentes
    poblarCarrusel(todosLosMemes, 5);
    poblarGrid(todosLosMemes);
    poblarFiltros(todosLosMemes);
    actualizarEstadisticas(todosLosMemes);
    
    // Eventos de filtros
    document.getElementById('filterUser')?.addEventListener('change', filtrarYOrdenar);
    document.getElementById('sortBy')?.addEventListener('change', filtrarYOrdenar);
    document.getElementById('btnReset')?.addEventListener('click', resetFiltros);
});

function poblarCarrusel(memes, n = 5) {
    const carouselInner = document.querySelector('.carousel-inner');
    if (!carouselInner) return;
    carouselInner.innerHTML = '';
    
    // Ordenar por likes descendentes y tomar los primeros n
    const topMemes = [...memes].sort((a, b) => b.likes - a.likes).slice(0, n);
    
    topMemes.forEach((m, idx) => {
        const div = document.createElement('div');
        div.className = 'carousel-item' + (idx === 0 ? ' active' : '');
        
        const img = document.createElement('img');
        img.src = m.src;
        img.alt = m.alt || '';
        img.className = 'd-block w-100';
        
        const caption = document.createElement('div');
        caption.className = 'carousel-caption';
        caption.innerHTML = `
            <p><strong>${m.usuario}</strong> · ${m.likes} ❤️</p>
            <small>${formatearFecha(m.fecha)}</small>
        `;
        
        div.appendChild(img);
        div.appendChild(caption);
        carouselInner.appendChild(div);
    });
}

function poblarGrid(memes) {
    const grid = document.getElementById('memesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (memes.length === 0) {
        grid.innerHTML = '<p class="no-results">No se encontraron memes con los filtros aplicados.</p>';
        return;
    }
    
    memes.forEach((m) => {
        const card = document.createElement('div');
        card.className = 'meme-card';
        card.innerHTML = `
            <div class="meme-image-container">
                <img src="${m.src}" alt="${m.alt}" class="meme-image" loading="lazy">
                <div class="meme-overlay">
                    <button class="btn-like" data-id="${m.id}">
                        <span class="likes-count">${m.likes}</span> ❤️
                    </button>
                </div>
            </div>
            <div class="meme-info">
                <h4 class="meme-user">👤 ${m.usuario}</h4>
                <p class="meme-date">📅 ${formatearFecha(m.fecha)}</p>
                <p class="meme-alt">${m.alt}</p>
            </div>
        `;
        grid.appendChild(card);
        
        // Agregar evento al botón de like
        card.querySelector('.btn-like').addEventListener('click', (e) => {
            e.target.classList.add('liked');
            const countEl = e.target.querySelector('.likes-count');
            countEl.textContent = parseInt(countEl.textContent) + 1;
            setTimeout(() => e.target.classList.remove('liked'), 300);
        });
    });
}

function actualizarEstadisticas(memes) {
    const stats = {
        total: memes.length,
        likes: memes.reduce((sum, m) => sum + m.likes, 0),
        usuarios: new Set(memes.map(m => m.usuario)).size,
        topMeme: memes.length > 0 ? memes.sort((a, b) => b.likes - a.likes)[0].usuario : 'N/A'
    };
    
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-likes').textContent = stats.likes;
    document.getElementById('stat-users').textContent = stats.usuarios;
    document.getElementById('stat-trending').textContent = stats.topMeme;
}

function formatearFecha(fecha) {
    if (!fecha) return 'Fecha desconocida';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function poblarFiltros(memes) {
    const filterUser = document.getElementById('filterUser');
    const usuarios = [...new Set(memes.map(m => m.usuario))].sort();
    
    usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario;
        option.textContent = usuario;
        filterUser.appendChild(option);
    });
}

function filtrarYOrdenar() {
    const usuario = document.getElementById('filterUser').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Filtrar por usuario
    let memes = todosLosMemes.filter(m => usuario === '' || m.usuario === usuario);
    
    // Ordenar
    switch(sortBy) {
        case 'likes-desc':
            memes.sort((a, b) => b.likes - a.likes);
            break;
        case 'likes-asc':
            memes.sort((a, b) => a.likes - b.likes);
            break;
        case 'date-new':
            memes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            break;
        case 'date-old':
            memes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            break;
        case 'name-asc':
            memes.sort((a, b) => a.alt.localeCompare(b.alt));
            break;
    }
    
    memesActuales = memes;
    poblarGrid(memes);
    actualizarEstadisticas(memes);
}

function resetFiltros() {
    document.getElementById('filterUser').value = '';
    document.getElementById('sortBy').value = 'likes-desc';
    filtrarYOrdenar();
}

window.addEventListener('DOMContentLoaded', async () => {
    todosLosMemes = await cargarMemesDesdeXML('/memes.xml');
    memesActuales = [...todosLosMemes];
    
    if (!todosLosMemes.length) {
        console.warn('No se cargaron memes');
        return;
    }
    
    // Inicializar componentes
    poblarCarrusel(todosLosMemes, 5);
    poblarGrid(todosLosMemes);
    poblarFiltros(todosLosMemes);
    actualizarEstadisticas(todosLosMemes);
    
    // Eventos de filtros
    document.getElementById('filterUser')?.addEventListener('change', filtrarYOrdenar);
    document.getElementById('sortBy')?.addEventListener('change', filtrarYOrdenar);
    document.getElementById('btnReset')?.addEventListener('click', resetFiltros);
});
