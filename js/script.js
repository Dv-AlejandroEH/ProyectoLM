// Actualiza el archivo memes.xml con los memes representativos
function actualizarMemesXML(memes) {
    // Construir el XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<memes>\n';
    memes.forEach((meme, idx) => {
        xml += `    <meme id="meme${idx+1}">\n`;
        xml += `        <src>${meme.imagen}</src>\n`;
        xml += `        <alt>${meme.texto || 'Meme representativo'}</alt>\n`;
        xml += `    </meme>\n`;
    });
    xml += '</memes>\n';

    // Guardar el XML usando descarga automática (frontend puro)
    const blob = new Blob([xml], {type: 'application/xml'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'memes.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
// === INICIO: Código para obtener memes de Google Sheets y analizar similitud visual con Gemini ===
const SHEET_ID = "1dH6BeIADAy4VdQhiIt9P32BTimvN8CRTQmM7F9wuCmY";
const SHEET_NAME = "Respuestas de formulario 1";
const GOOGLE_SHEETS_API_KEY = "AIzaSyBdYbfnpY-sLYAYtZDmQC2mPV4ElNsWGB8";
const GEMINI_API_KEY = "AIzaSyAuhmZih8nICQbphRfmQWWuC6Ord-rJH3s";

function obtenerMemesDeSheet(callback) {
    const RANGE = `${SHEET_NAME}!A1:Z1000`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(RANGE)}?key=${GOOGLE_SHEETS_API_KEY}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const headers = data.values[0];
            const imagenCol = headers.findIndex(h => h.toLowerCase().includes("imagen"));
            const textoCol = headers.findIndex(h => h.toLowerCase().includes("alt") || h.toLowerCase().includes("texto") || h.toLowerCase().includes("meme"));
            const memes = data.values.slice(1).map(row => ({
                imagen: row[imagenCol],
                texto: textoCol !== -1 ? row[textoCol] : ""
            })).filter(m => m.imagen);
            callback(memes);
        })
        .catch(err => {
            console.error("Error leyendo Google Sheets:", err);
        });
}





// Analiza la similitud de memes usando DeepAI image-similarity API y agrupa los más parecidos
// Script mínimo: carga 'memes.xml' y rellena el carrusel con las imágenes listadas.

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