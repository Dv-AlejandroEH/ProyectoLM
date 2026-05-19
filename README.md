# ProyectoLM

## Formulario conectado a Google Sheets

La página usa un formulario propio en [index.html](index.html) y la lógica está en [js/script.js](js/script.js). Al enviar, el formulario hace `POST` a un Web App de Google Apps Script y guarda una fila en tu Google Sheet.

### Qué ya está configurado

- `window.APPS_SCRIPT_URL` apunta a tu Web App.
- `window.GOOGLE_FORM_URL` apunta a tu Google Form.
- Si el `POST` falla, el enlace abre el formulario de Google como respaldo.

### Cómo probarlo

1. Abre [index.html](index.html) en el navegador.
2. Rellena nombre, título y mensaje.
3. Pulsa `Guardar en la cápsula`.
4. Comprueba que la fila aparece en la hoja vinculada.

### Si quieres cambiar la URL

Edita el bloque final de [index.html](index.html) y sustituye estas dos constantes:

- `window.APPS_SCRIPT_URL`
- `window.GOOGLE_FORM_URL`

### XML de memes

Si quieres regenerar [memes.xml](memes.xml) desde tu hoja fija, usa este comando desde la raíz del proyecto:

```bash
node scripts/generate_memes_xml.js
```

Si quieres forzar otra hoja, también puedes pasar la URL manualmente.

La hoja predeterminada es:

```text
https://docs.google.com/spreadsheets/d/1dH6BeIADAy4VdQhiIt9P32BTimvN8CRTQmM7F9wuCmY/edit?gid=789914438#gid=789914438
```

Ejemplo con una hoja normal de Google Sheets:

```bash
node scripts/generate_memes_xml.js "https://docs.google.com/spreadsheets/d/ID/edit#gid=0" memes.xml
```

Si prefieres una URL CSV publicada, también sirve.