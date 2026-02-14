# RifaApp - Planning

## Resumen del proyecto

Aplicacion web para gestionar rifas populares. Permite administrar una rifa activa con multiples premios, gestionar vendedores, registrar ventas de boletos y realizar sorteos en vivo premio por premio.

## Stack tecnologico

| Capa | Tecnologia |
|------|-----------|
| Backend | Laravel 12 |
| Frontend | React 18 + Vite (via Inertia.js) |
| CSS | Tailwind CSS + DaisyUI |
| Base de datos | MySQL |
| Notificaciones Email | Laravel Mail |
| Notificaciones WhatsApp | EvolutionAPI |
| Deploy | Coolify (auto-deploy) |

## Arquitectura

- **Inertia.js** como puente entre Laravel y React (sin API REST separada)
- Laravel maneja rutas, controladores, middleware y validacion
- React renderiza las vistas recibiendo datos como props desde Laravel
- Autenticacion con Laravel Breeze (adaptado a Inertia + React)

## Modelo de datos

### raffles (Rifas)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | bigint PK | |
| name | string | Nombre de la rifa |
| description | text nullable | Descripcion opcional |
| ticket_price | decimal(10,2) | Precio por boleto |
| total_numbers | int | Cantidad total de numeros (ej: 1000) |
| status | enum: draft, active, completed | Solo una puede estar "active" |
| created_at | timestamp | |
| updated_at | timestamp | |

### prizes (Premios)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | bigint PK | |
| raffle_id | FK raffles | |
| name | string | Nombre del premio |
| description | text nullable | |
| image | string nullable | Ruta de la imagen |
| sort_order | int default 0 | Orden de visualizacion |
| winning_number | int nullable | Numero ganador (se llena en sorteo) |
| drawn_at | timestamp nullable | Fecha/hora del sorteo |
| created_at | timestamp | |
| updated_at | timestamp | |

### sellers (Vendedores)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | bigint PK | |
| user_id | FK users | Relacion con auth |
| name | string | |
| phone | string nullable | |
| commission_pct | decimal(5,2) default 0 | Porcentaje de comision |
| is_active | boolean default true | |
| created_at | timestamp | |
| updated_at | timestamp | |

### tickets (Boletos vendidos)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | bigint PK | |
| raffle_id | FK raffles | |
| seller_id | FK sellers | Vendedor que lo vendio |
| number | int | Numero del boleto |
| buyer_name | string | Nombre del comprador |
| buyer_email | string nullable | |
| buyer_phone | string nullable | |
| contact_method | enum: email, whatsapp | Metodo preferido de contacto |
| notified_at | timestamp nullable | Cuando se envio la notificacion |
| created_at | timestamp | |
| updated_at | timestamp | |

**Constraint:** unique(raffle_id, number) - un numero no se vende dos veces en la misma rifa.

### users (Laravel default + role)

| Campo | Tipo | Notas |
|-------|------|-------|
| ... | ... | Campos default de Laravel |
| role | enum: admin, seller | Rol del usuario |

### draws (Historial de sorteos)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | bigint PK | |
| raffle_id | FK raffles | |
| prize_id | FK prizes | |
| ticket_id | FK tickets | |
| winning_number | int | Numero ganador |
| drawn_at | timestamp | Momento del sorteo |
| created_at | timestamp | |

## Roles y permisos

### Admin
- Gestionar rifas (crear, editar, activar, completar)
- Gestionar premios (CRUD completo)
- Gestionar vendedores (CRUD completo)
- Vender boletos
- Realizar sorteos
- Ver dashboard con estadisticas
- Configurar EvolutionAPI

### Vendedor
- Ver la rifa activa
- Vender boletos (solo de la rifa activa)
- Ver sus propias ventas
- Ver premios

## Modulos e implementacion

### Fase 1: Fundacion
1. **Setup del proyecto** - Laravel + Breeze Inertia React + DaisyUI
2. **Auth y roles** - Login, registro deshabilitado (admin crea vendedores), middleware de roles
3. **Layout base** - Sidebar admin, navbar, theme DaisyUI

### Fase 2: CRUD principal
4. **Gestion de rifas** - Crear, editar, cambiar estado. Validar que solo una este activa
5. **Gestion de premios** - CRUD con upload de imagen, ordenamiento, asociados a rifa
6. **Gestion de vendedores** - CRUD, crear usuario asociado con rol seller

### Fase 3: Ventas
7. **Venta de boletos** - Interfaz para seleccionar numeros, registrar comprador, asignar vendedor
8. **Vista de numeros** - Grid/tabla visual de numeros: disponibles, vendidos, ganadores
9. **Notificaciones** - Enviar email y/o WhatsApp via EvolutionAPI al vender

### Fase 4: Sorteo
10. **Pagina publica de premios** - Vista sin auth, muestra premios de la rifa activa
11. **Sistema de sorteo** - Seleccionar premio, sortear numero aleatorio entre vendidos, registrar ganador
12. **Pantalla de sorteo** - Animacion visual del numero ganador

### Fase 5: Dashboard y pulido
13. **Dashboard admin** - Boletos vendidos/disponibles, recaudacion, ranking vendedores
14. **Dashboard vendedor** - Mis ventas, mi comision

## Pagina publica

- Ruta: `/rifa` o `/` (configurable)
- Sin autenticacion
- Muestra: nombre de la rifa, premios con imagenes, precio del boleto
- Opcionalmente: numeros ganadores ya sorteados

## Integracion EvolutionAPI

- Configuracion almacenada en `.env`
- Variables: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`
- Service en `app/Services/EvolutionApiService.php`
- Endpoint usado: enviar mensaje de texto con el numero de boleto asignado
- Se invoca tras registrar una venta exitosa

## Flujo del sorteo

```
Admin selecciona premio pendiente
    -> Click "Sortear"
    -> Backend: SELECT random de tickets vendidos que NO estan en draws
    -> Se muestra animacion con el numero ganador
    -> Se registra en draws + se actualiza prizes.winning_number
    -> Opcion de notificar al ganador
    -> Se repite con el siguiente premio
```

## Rutas principales

```
# Auth
GET/POST  /login
POST      /logout

# Admin
GET       /dashboard
GET       /raffles (index, create, edit)
GET       /prizes (index, create, edit)
GET       /sellers (index, create, edit)
GET       /tickets (index, create) -- venta de boletos
GET       /draw -- pantalla de sorteo
GET       /settings -- config EvolutionAPI

# Vendedor
GET       /my-sales
GET       /sell -- vender boletos

# Publico
GET       /rifa -- premios de la rifa activa
```
