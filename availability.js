// ============================================================
// /api/availability.js
// Función serverless (Vercel) que lee los calendarios iCal de
// Booking y Airbnb de la casa pedida, los combina, y devuelve
// la lista de fechas ocupadas en JSON.
//
// Se usa así desde el sitio: GET /api/availability?house=bruna
//                            GET /api/availability?house=marea
//
// Los links de Booking/Airbnb NO están escritos acá: se leen de
// variables de entorno (configuradas en el panel de Vercel), para
// no dejarlos expuestos en el código. Ver README.md para el paso
// a paso de dónde cargarlos.
// ============================================================

const ICAL_SOURCES = {
  bruna: [
    process.env.BOOKING_ICAL_BRUNA,
    process.env.AIRBNB_ICAL_BRUNA,
  ],
  marea: [
    process.env.BOOKING_ICAL_MAREA,
    process.env.AIRBNB_ICAL_MAREA,
  ],
};

// Parser simple de ICS: extrae los rangos DTSTART/DTEND de cada
// VEVENT. Booking y Airbnb marcan cada reserva como un evento de
// "día completo" (formato YYYYMMDD), que es justo lo que
// necesitamos para pintar el calendario.
function parseIcsToDateRanges(icsText) {
  const ranges = [];
  const events = icsText.split("BEGIN:VEVENT").slice(1);

  for (const block of events) {
    const dtStartMatch = block.match(/DTSTART[^:]*:(\d{8})/);
    const dtEndMatch = block.match(/DTEND[^:]*:(\d{8})/);
    if (!dtStartMatch || !dtEndMatch) continue;

    const start = toDate(dtStartMatch[1]);
    const end = toDate(dtEndMatch[1]);
    if (start && end) ranges.push({ start, end });
  }
  return ranges;
}

function toDate(yyyymmdd) {
  const y = parseInt(yyyymmdd.slice(0, 4), 10);
  const m = parseInt(yyyymmdd.slice(4, 6), 10) - 1;
  const d = parseInt(yyyymmdd.slice(6, 8), 10);
  const date = new Date(Date.UTC(y, m, d));
  return isNaN(date.getTime()) ? null : date;
}

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

// Expande un rango {start, end} a un array de fechas "YYYY-MM-DD"
// ocupadas. El check-out (end) NO se marca ocupado: esa noche
// vuelve a estar libre para el próximo huésped.
function expandRange(start, end) {
  const days = [];
  const d = new Date(start);
  while (d < end) {
    days.push(fmt(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  const house = (req.query.house || "").toLowerCase();
  const sources = ICAL_SOURCES[house];

  if (!sources) {
    res.status(400).json({ error: "Parámetro 'house' inválido. Usá 'bruna' o 'marea'." });
    return;
  }

  const validSources = sources.filter(Boolean);
  if (validSources.length === 0) {
    res.status(500).json({ error: "No hay links de calendario configurados para esta casa en el servidor." });
    return;
  }

  try {
    const occupied = new Set();

    await Promise.all(
      validSources.map(async (url) => {
        const response = await fetch(url, {
          headers: { "User-Agent": "AlojamientosMDQ-Sync/1.0" },
        });
        if (!response.ok) return; // si un canal falla, seguimos con el resto
        const text = await response.text();
        const ranges = parseIcsToDateRanges(text);
        ranges.forEach(({ start, end }) => {
          expandRange(start, end).forEach((day) => occupied.add(day));
        });
      })
    );

    res.status(200).json({
      house,
      occupied: Array.from(occupied).sort(),
      sourcesRead: validSources.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(502).json({ error: "No se pudo leer alguno de los calendarios en este momento.", detail: String(err) });
  }
}
