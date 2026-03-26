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
async function analizarSimilitudVisualDeepAI(memes, callback) {
    const API_KEY = "7ea72207-f953-4128-b963-f24958cfd71b";
    const endpoint = "https://api.deepai.org/api/image-similarity";
    const n = memes.length;
    // Matriz de similitud (distancias)
    let dist = Array.from({length: n}, () => Array(n).fill(Infinity));

    // Comparar cada par de memes (solo una vez por par)
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            try {
                const formData = new FormData();
                formData.append('image1', memes[i].imagen);
                formData.append('image2', memes[j].imagen);
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { 'api-key': API_KEY },
                    body: formData
                });
                const result = await response.json();
                // DeepAI devuelve un campo 'distance' (menor = más similar)
                const distance = result.output_distance || 1.0;
                dist[i][j] = dist[j][i] = distance;
            } catch (e) {
                dist[i][j] = dist[j][i] = 1.0;
            }
        }
    }

    // Agrupar memes similares (umbral de similitud)
    const threshold = 0.25; // Puedes ajustar este valor
    let grupos = [];
    let asignado = Array(n).fill(false);
    for (let i = 0; i < n; i++) {
        if (asignado[i]) continue;
        let grupo = [i];
        asignado[i] = true;
        for (let j = 0; j < n; j++) {
            if (!asignado[j] && dist[i][j] < threshold) {
                grupo.push(j);
                asignado[j] = true;
            }
        }
        grupos.push(grupo);
    }

    // Tomar un meme representativo de cada grupo
    const memesRepresentativos = grupos.map(grupo => memes[grupo[0]]);
    callback(memesRepresentativos);
}

// Mostrar los 5 memes más populares en el carrusel automáticamente

// === INICIO: Mostrar los 5 memes más populares, uno por tema detectado por IA, en el carrusel ===
// === INICIO: Mostrar los 5 memes más populares, uno por tema detectado por Hugging Face, en el carrusel ===
// === INICIO: Mostrar los 5 memes más populares, uno por tema detectado por ml5.js, en el carrusel ===
// Esperar a que todo esté cargado (incluyendo ml5.js) antes de ejecutar la lógica principal
window.onload = function() {
    obtenerMemesDeSheet(memes => {
        analizarSimilitudVisualDeepAI(memes, memesRepresentativos => {
            // Mostrar hasta 5 memes representativos en el carrusel
            const topMemes = memesRepresentativos.slice(0, 5);
            const carouselInner = document.querySelector('.carousel-inner');
            if (!carouselInner) return;
            carouselInner.innerHTML = "";
            topMemes.forEach((meme, idx) => {
                const div = document.createElement('div');
                div.className = 'carousel-item' + (idx === 0 ? ' active' : '');
                const img = document.createElement('img');
                img.src = meme.imagen;
                img.alt = meme.texto || `Meme ${idx+1}`;
                img.className = 'd-block w-100';
                div.appendChild(img);
                // Texto descriptivo
                const temaTexto = document.createElement('div');
                temaTexto.className = 'carousel-caption d-block';
                temaTexto.innerHTML = `<h5>MEME REPRESENTATIVO</h5>`;
                div.appendChild(temaTexto);
                carouselInner.appendChild(div);
            });
            // También actualizar memes.xml automáticamente
            actualizarMemesXML(topMemes);
        });
    });
};
// === FIN: Mostrar los 5 memes más populares, uno por tema detectado por ml5.js, en el carrusel ===
// === FIN: Mostrar los 5 memes más populares, uno por tema detectado por Hugging Face, en el carrusel ===
// === FIN: Mostrar los 5 memes más populares, uno por tema detectado por IA, en el carrusel ===
// === FIN: Código para obtener memes de Google Sheets y analizar similitud visual con Gemini ===
const enlaceCapsula = document.querySelector('.nav-link[href="#capsula"]');
const enlaceInicio = document.querySelector('.nav-link[href="#inicio"]');
const enlacesNavegacion = document.querySelectorAll('.navbar-nav .nav-link');
const mainPrincipal = document.getElementById('main-principal');
const mainCapsula = document.getElementById('main-capsula');
const botonIrFormulario = document.querySelector('.portada .boton[href="#formulario"]');
const seccionFormulario = document.getElementById('formulario');
const enlaceGoogleForm = document.getElementById('google-form-link');
const avisoGoogleForm = document.getElementById('google-form-aviso');
const formularioMensaje = document.getElementById('formulario-mensaje');
const mensajeExitoFormulario = document.getElementById('formulario-exito');

const GOOGLE_FORM_CONFIG = {
    formViewUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdpL39X5-qyO-p9DOdWZ1S7u5StJhQSiig4EFsq7L5T8sNKsg/viewform',
    formResponseUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdpL39X5-qyO-p9DOdWZ1S7u5StJhQSiig4EFsq7L5T8sNKsg/formResponse',
    entryIds: {
        nombre: 'entry.1307221215',
        titulo: 'entry.1676916107',
        mensaje: 'entry.1375260118',
        imagenUrl: 'entry.1254066565'
    }
};

function marcarEnlaceActivo(enlaceActivo) {
    enlacesNavegacion.forEach(function (enlace) {
        enlace.classList.remove('active');
        enlace.removeAttribute('aria-current');
    });

    if (enlaceActivo) {
        enlaceActivo.classList.add('active');
        enlaceActivo.setAttribute('aria-current', 'page');
    }
}

function mostrarMainCapsula() {
    mainPrincipal.hidden = true;
    mainCapsula.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarMainPrincipal() {
    mainPrincipal.hidden = false;
    mainCapsula.hidden = true;
}

enlaceCapsula?.addEventListener('click', function (evento) {
    evento.preventDefault();
    mostrarMainCapsula();
});

enlaceInicio?.addEventListener('click', function () {
    mostrarMainPrincipal();
});

enlacesNavegacion.forEach(function (enlace) {
    enlace.addEventListener('click', function () {
        marcarEnlaceActivo(enlace);
    });
});

botonIrFormulario?.addEventListener('click', function (evento) {
    evento.preventDefault();
    mostrarMainPrincipal();
    marcarEnlaceActivo(enlaceInicio);

    seccionFormulario?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

function configurarFormularioGoogle() {
    const tieneLink = GOOGLE_FORM_CONFIG.formViewUrl.trim() !== '';
    const tieneFormResponse = GOOGLE_FORM_CONFIG.formResponseUrl.trim() !== '';
    const entries = GOOGLE_FORM_CONFIG.entryIds;

    const camposMapeados = Object.values(entries).filter(function (entryId) {
        return entryId && entryId.trim() !== '';
    }).length;

    const tieneEntradasConfiguradas = camposMapeados > 0;

    if (tieneLink) {
        enlaceGoogleForm.href = GOOGLE_FORM_CONFIG.formViewUrl;
    } else {
        enlaceGoogleForm.hidden = true;
    }

    if (formularioMensaje && tieneFormResponse && tieneEntradasConfiguradas) {
        formularioMensaje.action = GOOGLE_FORM_CONFIG.formResponseUrl;
        formularioMensaje.target = 'google-form-dummy-target';

        if (entries.nombre) {
            formularioMensaje.querySelector('#nombre').name = entries.nombre;
        }
        if (entries.titulo) {
            formularioMensaje.querySelector('#titulo').name = entries.titulo;
        }
        if (entries.mensaje) {
            formularioMensaje.querySelector('#mensaje').name = entries.mensaje;
        }
        if (entries.imagenUrl) {
            formularioMensaje.querySelector('#imagen-url').name = entries.imagenUrl;
        }

        formularioMensaje.addEventListener('submit', function () {
            if (!mensajeExitoFormulario) {
                return;
            }

            mensajeExitoFormulario.hidden = false;
            window.setTimeout(function () {
                mensajeExitoFormulario.hidden = true;
            }, 6000);
        });

        avisoGoogleForm.textContent = 'Formulario conectado con Google Forms. Campos sincronizados: nombre, tema, descripción y URL de imagen.';
        avisoGoogleForm.hidden = false;
    } else if (formularioMensaje) {
        if (mensajeExitoFormulario) {
            mensajeExitoFormulario.hidden = true;
        }

        formularioMensaje.addEventListener('submit', function (evento) {
            evento.preventDefault();
            if (GOOGLE_FORM_CONFIG.formViewUrl) {
                window.open(GOOGLE_FORM_CONFIG.formViewUrl, '_blank', 'noopener');
            }
        });

        avisoGoogleForm.textContent = 'Faltan los IDs entry.* para guardar directo. De momento, al enviar se abre Google Forms.';
        avisoGoogleForm.hidden = false;
    }
}

function loadXMLDoc() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            myFunction(this);
        }
    };
    xmlhttp.open("GET", "memes.xml", true);
    xmlhttp.send();
}

function myFunction(xml) {
    var i;
    var xmlDoc = xml.responseXML;
    var x = xmlDoc.getElementsByTagName("meme");
    var imagenesCarrusel = document.querySelectorAll('img[data-xml-id]');
    
    for (i = 0; i < x.length; i++) {
        var id = x[i].getAttribute("id");
        var src = x[i].getElementsByTagName("src")[0].childNodes[0].nodeValue;
        var alt = x[i].getElementsByTagName("alt")[0].childNodes[0].nodeValue;
        
        var imagen = document.querySelector('img[data-xml-id="' + id + '"]');
        if (imagen) {
            imagen.src = src;
            imagen.alt = alt;
        }
    }
}

loadXMLDoc();
configurarFormularioGoogle();