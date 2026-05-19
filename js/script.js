// Lógica de envío del formulario de la cápsula
// Configura estas URLs desde index.html si las tienes:
// - window.APPS_SCRIPT_URL: URL del Web App de Google Apps Script que recibe POST JSON
// - window.GOOGLE_FORM_URL: URL del Google Form (fallback)
window.APPS_SCRIPT_URL = window.APPS_SCRIPT_URL || '';
window.GOOGLE_FORM_URL = window.GOOGLE_FORM_URL || '';

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('formulario-mensaje');
	const successEl = document.getElementById('formulario-exito');
	const googleLink = document.getElementById('google-form-link');

	if (googleLink && window.GOOGLE_FORM_URL) {
		googleLink.href = window.GOOGLE_FORM_URL;
	}

	form?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const nombre = document.getElementById('nombre').value.trim();
		const titulo = document.getElementById('titulo').value.trim();
		const mensaje = document.getElementById('mensaje').value.trim();
		const imagenUrl = document.getElementById('imagen-url').value.trim();

		const payload = {
			nombre,
			titulo,
			mensaje,
			imagenUrl,
			fecha: new Date().toISOString().slice(0,10)
		};

		// Mostrar feedback inmediato en la UI
		successEl.hidden = false;
		form.reset();

		// Intentar enviar al Apps Script si está configurado.
		// Usamos text/plain + mode no-cors para evitar el preflight CORS que rompe la petición.
		if (window.APPS_SCRIPT_URL) {
			try {
				await fetch(window.APPS_SCRIPT_URL, {
					method: 'POST',
					mode: 'no-cors',
					headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
					body: JSON.stringify(payload)
				});
				successEl.hidden = false;
				return;
			} catch (err) {
				console.error('Error enviando a Apps Script:', err);
				alert('No se pudo guardar en el servidor remoto. Se abrirá el formulario de Google como respaldo.');
			}
		}

		// Fallback: abrir Google Form (si existe) para que el usuario envíe manualmente
		if (window.GOOGLE_FORM_URL) {
			window.open(window.GOOGLE_FORM_URL, '_blank', 'noopener');
		}
	});
});

/*
Apps Script (ejemplo) para desplegar como Web App que reciba POST JSON y añada una fila a una Sheet:

function doPost(e) {
  try {
	var data = JSON.parse(e.postData.contents);
	var ss = SpreadsheetApp.openById('<<SHEET_ID>>');
	var sheet = ss.getSheets()[0];
	sheet.appendRow([data.nombre||'', data.titulo||'', data.mensaje||'', data.imagenUrl||'', data.fecha||new Date()]);
	return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
	return ContentService.createTextOutput(JSON.stringify({status:'error', message: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

Pasos de despliegue:
1. En Google Apps Script crear proyecto nuevo, pegar `doPost` y reemplazar `<<SHEET_ID>>` por tu ID de hoja.
2. Deploy → New deployment → Web app → Ejecutar como: Me; Who has access: Anyone.
3. Copiar la URL y ponerla en `window.APPS_SCRIPT_URL` en `index.html` antes de `js/script.js`.

*/
