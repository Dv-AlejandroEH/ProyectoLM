# ProyectoLM

## Formulario con Google Forms

El formulario local fue reemplazado por Google Forms.

### 1) Crear y preparar tu formulario

1. Crea un formulario en Google Forms con los campos que necesites.
2. Si necesitas imágenes, usa un campo de texto tipo **URL de imagen** (no subida de archivo).
3. Evita el campo de "subir archivo" si quieres enviar desde el formulario personalizado de esta web.
2. En Google Forms, abre **Respuestas** y vincúlalo a una hoja de cálculo de Google Sheets.
3. Copia:
	- URL pública del formulario (para abrir en pestaña nueva).
	- URL de inserción (embed) desde **Enviar > <> Insertar HTML**.

### 2) Configurar este proyecto

En `script.js`, dentro de `GOOGLE_FORM_CONFIG`, pega tus enlaces:

- `formViewUrl`: URL pública del formulario.
- `embedUrl`: URL del iframe de Google Forms.

### 3) Análisis anual con IA (siguiente paso)

Como cada respuesta queda en Google Sheets con fecha, luego puedes:

1. Leer filas por año desde una API (Google Sheets API o Apps Script).
2. Enviar los textos a tu IA integrada por API.
3. Pedir que detecte el tema más repetido por cada año.