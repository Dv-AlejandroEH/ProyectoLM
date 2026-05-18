// Carga 'memes.xml' y rellena el carrusel en la página Destacados
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
            alt: (n.getElementsByTagName('alt')[0] || {}).textContent || ''
        })).filter(m => m.src);
    } catch (e) {
        console.error('Error leyendo XML:', e);
        return [];
    }
}

function poblarCarrusel(memes, n = 5) {
    const carouselInner = document.querySelector('.carousel-inner');
    if (!carouselInner) return;
    carouselInner.innerHTML = '';
    memes.slice(0, n).forEach((m, idx) => {
        const div = document.createElement('div');
        div.className = 'carousel-item' + (idx === 0 ? ' active' : '');
        const img = document.createElement('img');
        img.src = m.src;
        img.alt = m.alt || '';
        img.className = 'd-block w-100';
        div.appendChild(img);
        carouselInner.appendChild(div);
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    const memes = await cargarMemesDesdeXML('/memes.xml');
    if (!memes.length) return;
    poblarCarrusel(memes, 5);
});
