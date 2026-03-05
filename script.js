const enlaceCapsula = document.querySelector('.nav-link[href="#capsula"]');
const enlaceInicio = document.querySelector('.nav-link[href="#inicio"]');
const enlacesNavegacion = document.querySelectorAll('.navbar-nav .nav-link');
const mainPrincipal = document.getElementById('main-principal');
const mainCapsula = document.getElementById('main-capsula');
const botonIrFormulario = document.querySelector('.portada .boton[href="#formulario"]');
const seccionFormulario = document.getElementById('formulario');

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