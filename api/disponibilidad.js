    // api/disponibilidad.js
// Esta función consulta a Google Calendar qué horas están libres.

export default async function handler(req, res) {
  // 1. Obtener la fecha solicitada (ej: "2026-11-15")
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Falta la fecha" });
  }

  try {
    // ---------------------------------------------------------
    // ⚠️ CONFIGURACIÓN DE GOOGLE (Esto se configura en Vercel)
    // ---------------------------------------------------------
    const API_KEY = process.env.GOOGLE_API_KEY; 
    const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID; // ej: "estudio.aura@gmail.com"

    // Definir el horario laboral (ej: 9am a 7pm)
    const startOfDay = `${date}T09:00:00-05:00`; // -05:00 es la zona horaria de Colombia
    const endOfDay = `${date}T19:00:00-05:00`;

    // 2. Llamar a la API de Google Calendar (FreeBusy)
    const url = `https://www.googleapis.com/calendar/v3/freeBusy?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeMin: startOfDay,
        timeMax: endOfDay,
        items: [{ id: CALENDAR_ID }]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // 3. Procesar los datos
    // Google nos devuelve los bloques OCUPADOS. Nosotros calculamos los LIBRES.
    const busySlots = data.calendars[CALENDAR_ID].busy;
    
    // Aquí generamos las horas disponibles (ej: cada 1 hora de 9am a 7pm)
    const availableSlots = [];
    let currentHour = 9;
    const endHour = 19; // 7 PM

    while (currentHour < endHour) {
      const slotStart = new Date(`${date}T${currentHour.toString().padStart(2, '0')}:00:00-05:00`);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // +1 hora

      // Verificar si este bloque choca con algún evento ocupado
      const isBusy = busySlots.some(busy => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return (slotStart < busyEnd && slotEnd > busyStart);
      });

      if (!isBusy) {
        // Formatear para mostrar en la página (ej: "09:00 AM")
        availableSlots.push(
          slotStart.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
        );
      }
      currentHour++;
    }

    // 4. Devolver las horas libres al frontend
    res.status(200).json({ availableSlots });

  } catch (error) {
    console.error("Error consultando Google Calendar:", error);
    res.status(500).json({ error: "Error al consultar la disponibilidad" });
  }
}