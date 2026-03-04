# PocketPlan

App de finanzas personales orientada a usuarios colombianos (montos en COP).

- **Frontend:** Next.js 16 — puerto `3000`
- **Backend:** Express.js — puerto `4000`
- **Base de datos:** MongoDB Atlas (fallback a JSON local)

---

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/install/) instalados.

---

## Ejecución con Docker (recomendado)

### 1. Configura las variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y completa los valores:

```env
password_mongo=TU_PASSWORD_DE_MONGODB_ATLAS
JWT_SECRET=pocketplan_jwt_secret_2026_fermanlive_secure_key_x9q2
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 2. Levanta los servicios

```bash
docker compose up --build
```

La primera vez descarga las imágenes base y construye los contenedores. Las siguientes veces puedes omitir `--build`:

```bash
docker compose up
```

### 3. Accede a la aplicación

| Servicio  | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3000      |
| Backend   | http://localhost:4000      |
| Health    | http://localhost:4000/health |

### 4. Detener los servicios

```bash
docker compose down
```

---

## Otros comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver logs solo del backend
docker compose logs -f backend

# Reconstruir solo un servicio
docker compose up --build backend

# Ejecutar en segundo plano
docker compose up -d

# Ver estado de los contenedores
docker compose ps
```

---

## Desarrollo local (sin Docker)

### Backend

```bash
cd backend
npm install
npm run dev      # puerto 4000, recarga automática con nodemon
```

El backend requiere un archivo `backend/.env`:

```env
password_mongo=TU_PASSWORD
JWT_SECRET=pocketplan_jwt_secret_2026_fermanlive_secure_key_x9q2
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # puerto 3000
```

Comandos adicionales:

```bash
npm run build          # build de producción
npm run lint           # ESLint
npm run lint -- --fix  # auto-corregir errores de lint
npx tsc --noEmit       # verificar tipos sin compilar
```

---

## Estructura del proyecto

```
PocketPlan/
├── backend/          # Express.js REST API
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── middleware/
│   ├── data/
│   │   ├── mock.json
│   │   └── subcategories.json
│   └── Dockerfile
├── frontend/         # Next.js 16 App Router
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```
