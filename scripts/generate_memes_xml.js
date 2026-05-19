#!/usr/bin/env node
// Uso: node scripts/generate_memes_xml.js [CSV_PUB_URL|SHEET_URL] [output_path] [gid]
// Ejemplos:
// node scripts/generate_memes_xml.js "https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=0"
// node scripts/generate_memes_xml.js "https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0" memes.xml 0

const fs = require('fs');
const path = require('path');

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dH6BeIADAy4VdQhiIt9P32BTimvN8CRTQmM7F9wuCmY/edit?gid=789914438#gid=789914438';

const inputUrl = process.argv[2] || DEFAULT_SHEET_URL;
const outPath = process.argv[3] ? path.resolve(process.argv[3]) : path.resolve(__dirname, '..', 'memes.xml');
const gid = process.argv[4] || '789914438';

function toCsvUrl(value, sheetGid) {
  if (!value) {
    throw new Error('Debes indicar una URL de Google Sheets o una URL CSV publicada.');
  }

  if (/\bID\b/i.test(value) || /SHEET_ID/i.test(value)) {
    throw new Error('La URL tiene un placeholder. Sustituye ID o SHEET_ID por el ID real de tu hoja.');
  }

  if (/output=csv|format=csv/i.test(value)) {
    return value;
  }

  const sheetMatch = value.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/([^/]+)/i);
  if (sheetMatch) {
    const sheetId = sheetMatch[1];
    const resolvedGid = (() => {
      const gidMatch = value.match(/gid=(\d+)/i);
      return gidMatch ? gidMatch[1] : sheetGid;
    })();
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${resolvedGid}`;
  }

  return value;
}

const csvUrl = toCsvUrl(inputUrl, gid);

async function fetchText(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Error fetching ' + url + ': ' + resp.status);
  return await resp.text();
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (!lines.length) return [];
  const headers = lines[0].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(h => h.replace(/^"|"$/g, '').trim());
  const rows = lines.slice(1).map(line => {
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = cols[i] || '');
    return obj;
  });
  return rows;
}

function normalizeText(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function firstValue(row, keys) {
  const entries = Object.entries(row);
  for (const key of keys) {
    const normalizedKey = normalizeText(key);
    for (const [rowKey, rowValue] of entries) {
      if (normalizeText(rowKey) === normalizedKey && rowValue !== undefined && rowValue !== null && String(rowValue).trim() !== '') {
        return String(rowValue).trim();
      }
    }
  }
  return '';
}

function timestampToDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function looksLikeDate(value) {
  if (!value) return false;
  const v = String(value).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(v) || /^\d{1,2}\/\d{1,2}\/\d{4}/.test(v);
}

function looksLikeImage(value) {
  if (!value) return false;
  const v = String(value).trim().toLowerCase();
  return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:image/');
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildXML(memes) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<memes>'];
  for (const m of memes) {
    lines.push(`    <meme id="${xmlEscape(m.id)}">`);
    lines.push(`        <src>${xmlEscape(m.src)}</src>`);
    lines.push(`        <alt>${xmlEscape(m.alt)}</alt>`);
    lines.push(`        <usuario>${xmlEscape(m.usuario)}</usuario>`);
    lines.push(`        <fecha>${xmlEscape(m.fecha)}</fecha>`);
    lines.push(`        <likes>${xmlEscape(m.likes)}</likes>`);
    lines.push(`        <votable>${xmlEscape(m.votable)}</votable>`);
    lines.push('    </meme>');
  }
  lines.push('</memes>');
  return lines.join('\n');
}

(async () => {
  try {
    console.log('Descargando CSV desde', csvUrl);
    const text = await fetchText(csvUrl);
    const rows = parseCSV(text);
    const memes = rows.map((r, idx) => {
      const marcaTemporal = firstValue(r, ['marca temporal', 'timestamp']);
      const nombreUsuario = firstValue(r, ['nombre de usuario', 'usuario', 'user', 'nombre']);
      const tema = firstValue(r, ['tema', 'titulo', 'título', 'caption']);
      const descripcionOpcional = firstValue(r, ['descripción (opcional)', 'descripcion (opcional)', 'descripcion']);
      const imagenEnlace = firstValue(r, ['imagen (enlace)', 'imagen enlace', 'imagen', 'image', 'src', 'url', 'link']);

      // Caso estándar (Google Form):
      // marcaTemporal=date, nombreUsuario=user, tema=titulo, descripcion=text, imagenEnlace=imagen
      let src = imagenEnlace;
      let alt = firstValue(r, ['alt']) || descripcionOpcional || tema;
      let usuario = nombreUsuario || 'Anónimo';
      let fechaRaw = firstValue(r, ['fecha']) || marcaTemporal;

      // Caso desplazado (carga por Apps Script antiguo):
      // marcaTemporal=user, nombreUsuario=titulo, tema=mensaje, descripcion=imagen, imagenEnlace=fecha
      if (looksLikeDate(imagenEnlace) && looksLikeImage(descripcionOpcional)) {
        src = descripcionOpcional;
        alt = nombreUsuario || tema || 'Sin título';
        usuario = marcaTemporal || 'Anónimo';
        fechaRaw = imagenEnlace;
      }

      return {
        id: firstValue(r, ['id', 'ID']) || ('meme_sheet_' + Date.now() + '_' + idx),
        src,
        alt,
        usuario,
        fecha: timestampToDate(fechaRaw),
        likes: parseInt(firstValue(r, ['likes', 'me gusta']) || '0', 10) || 0,
        votable: (String(firstValue(r, ['votable', 'votado']) || 'true')).toLowerCase() === 'true'
      };
    }).filter(m => m.src);

    if (!memes.length) {
      throw new Error('El CSV se descargó pero no se encontró ninguna columna de imagen válida. Revisa los encabezados de la hoja.');
    }

    const xml = buildXML(memes);
    fs.writeFileSync(outPath, xml, 'utf8');
    console.log('Archivo generado en', outPath);
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
})();
