# AlojamientosMDQ — sitio web con calendario sincronizado

Este proyecto tiene 2 partes:

- **`public/index.html`** → el sitio que ve la gente (home + Casa Bruna + Casa Marea + calendario + reserva por WhatsApp).
- **`api/availability.js`** → un pequeño programa que corre en el servidor, lee los 4 calendarios (Booking y Airbnb de cada casa) y le dice al sitio qué fechas están ocupadas. Esto es lo que en el chat no se podía probar en vivo, pero acá sí funciona.

## Los 4 links de calendario (ya confirmados)

- Casa Bruna → Booking `...9ce78bb1-7690-4639-ae6c-f68d51bc9ef7` · Airbnb `.../1071230131755125537.ics...`
- Casa Marea → Booking `...6eccbab0-9a27-4921-8e27-ff23569dfd0f` · Airbnb `.../1311099233103776539.ics...`

Están cargados así en `.env.example`, listos para copiar en el paso 3 de abajo.

## Paso a paso para publicarlo (sin saber programar)

### 1. Crear una cuenta en Vercel (gratis)
Entrá a [vercel.com](https://vercel.com) → "Sign Up" → podés registrarte con tu email o con GitHub.

### 2. Subir este proyecto
La forma más simple sin usar la terminal:
1. Creá una cuenta gratis en [github.com](https://github.com) si no tenés.
2. Creá un repositorio nuevo (por ejemplo `alojamientosmdq-web`) y subí ahí **todos los archivos de esta carpeta** (arrastrándolos desde la web de GitHub, sección "Add file → Upload files").
3. En Vercel, click en "Add New… → Project", elegí ese repositorio de GitHub, y "Deploy".

### 3. Cargar los 4 links de calendario (paso importante)
En Vercel: **Project → Settings → Environment Variables**, y cargá estas 4, una por una (nombre y valor):

| Nombre | Valor |
|---|---|
| `BOOKING_ICAL_BRUNA` | (el link de Booking de Casa Bruna) |
| `AIRBNB_ICAL_BRUNA` | (el link de Airbnb de Casa Bruna) |
| `BOOKING_ICAL_MAREA` | (el link de Booking de Casa Marea) |
| `AIRBNB_ICAL_MAREA` | (el link de Airbnb de Casa Marea) |

Los valores exactos están en el archivo `.env.example` de esta carpeta (revisalos/confirmalos primero, ver aviso arriba). Después de cargarlos, hacé click en "Redeploy" para que tomen efecto.

### 4. Conectar tu dominio (alojamientosmdq.com.ar)
En Vercel: **Project → Settings → Domains** → escribí `alojamientosmdq.com.ar` → Vercel te va a mostrar 1 o 2 registros DNS para configurar.
Esos registros se cargan en el panel de Donweb, en la sección donde administrás el DNS del dominio (no hace falta tocar el hosting de WordPress, solo apuntar el dominio a Vercel). Si querés, cuando llegue este paso lo hacemos juntos y te digo exactamente dónde clickear en Donweb.

### 5. Listo
Una vez conectado el dominio, `alojamientosmdq.com.ar` va a mostrar este sitio nuevo, con el calendario leyendo la disponibilidad real de Booking y Airbnb cada vez que alguien entre.

---

## Notas técnicas (por si más adelante alguien más toca el código)
- El calendario se actualiza en el momento en que alguien abre la página (no hay que hacer nada manual).
- Si en el futuro cambiás de plataforma de reservas (por ejemplo agregás Vrbo), el patrón es el mismo: conseguir el link iCal y sumarlo como una fuente más en `api/availability.js`.
- Los links de calendario NUNCA quedan visibles en el código público del sitio — viven solo como variables de entorno en Vercel.
