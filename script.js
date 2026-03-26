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