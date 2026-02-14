# RifaApp - Instrucciones para Claude Code

## Proyecto

Aplicacion web de gestion de rifas populares con Laravel 12 + Inertia.js + React 18 + DaisyUI.

## Comandos

- **Servidor dev:** `php artisan serve` (backend) + `npm run dev` (vite/frontend)
- **Migraciones:** `php artisan migrate`
- **Seed:** `php artisan db:seed`
- **Tests:** `php artisan test`
- **Build:** `npm run build`

## Estructura del proyecto

```
app/
  Http/
    Controllers/     # Controladores Inertia (devuelven Inertia::render)
    Middleware/       # RoleMiddleware para admin/seller
    Requests/         # Form Requests para validacion
  Models/             # Eloquent models
  Notifications/      # Email notifications
  Services/           # Logica de negocio (EvolutionAPI, DrawService, etc.)
resources/
  js/
    Components/       # Componentes React reutilizables
    Layouts/          # AdminLayout, PublicLayout
    Pages/            # Paginas Inertia (una por ruta)
      Admin/          # Dashboard, Raffles, Prizes, Sellers, Tickets, Draw, Settings
      Seller/         # MySales, Sell
      Public/         # Rifa (pagina publica de premios)
    hooks/            # Custom React hooks
    lib/              # Utilidades JS
  css/
    app.css           # Tailwind imports + config DaisyUI
database/
  migrations/
  seeders/
```

## Convenciones de codigo

### Backend (Laravel/PHP)
- Controladores devuelven `Inertia::render('NombrePagina', $props)`
- Validacion siempre en Form Requests, nunca en el controlador
- Logica de negocio compleja en Services (`app/Services/`)
- Nombres de modelos en singular ingles: `Raffle`, `Prize`, `Seller`, `Ticket`, `Draw`
- Migraciones descriptivas: `create_raffles_table`, `add_role_to_users_table`
- Relaciones Eloquent siempre definidas en ambos modelos
- Usar `$fillable` en modelos, nunca `$guarded = []`

### Frontend (React/JSX)
- Componentes en PascalCase: `PrizeCard.jsx`, `NumberGrid.jsx`
- Paginas Inertia en `resources/js/Pages/` siguiendo la estructura de rutas
- Usar `useForm` de Inertia para formularios
- Usar `usePage` de Inertia para acceder a props compartidas (auth, flash)
- Estilos con clases de Tailwind + componentes DaisyUI (btn, card, modal, table, etc.)
- NO usar styled-components ni CSS modules
- Archivos `.jsx` (no `.tsx`, no usamos TypeScript)

### General
- Idioma del codigo: ingles (variables, funciones, clases, commits)
- Idioma de la UI: espanol (textos, labels, mensajes, placeholders)
- No usar comentarios obvios ni docblocks innecesarios
- Preferir codigo simple y directo sobre abstracciones prematuras
- Un componente por archivo

## Base de datos

- Motor: MySQL
- DB name: `app_rifas`
- Ver PLANNING.md para el esquema completo
- Constraint importante: unique(raffle_id, number) en tickets
- Solo una rifa con status='active' a la vez (validar en backend)

## Roles

- `admin`: acceso total
- `seller`: solo vender boletos y ver sus ventas
- Middleware `role:admin` para rutas de admin
- Middleware `role:admin,seller` para rutas compartidas

## Integraciones externas

### EvolutionAPI (WhatsApp)
- Configuracion via `.env`: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`
- Service en `app/Services/EvolutionApiService.php`
- Usar HTTP client de Laravel (`Http::`)
- Manejar errores sin bloquear la venta (fire-and-forget o queue)

### Email
- Usar Laravel Mail con Mailables
- Configuracion SMTP estandar en `.env`

## DaisyUI

- Usar el theme system de DaisyUI para consistencia
- Componentes principales: `btn`, `card`, `modal`, `table`, `input`, `select`, `badge`, `alert`, `stats`, `drawer`
- Para el grid de numeros usar clases de Tailwind grid
- Responsive: mobile-first
- Themes habilitados: light, dark

## Cosas a evitar

- NO crear API REST separada (usamos Inertia, no SPA pura)
- NO instalar librerias extra sin justificacion
- NO usar TypeScript
- NO crear tests unitarios a menos que se pida explicitamente
- NO sobrecomplicar el sistema de permisos (solo 2 roles, middleware simple)
- NO usar broadcast/websockets (el sorteo es manual, no en tiempo real)
