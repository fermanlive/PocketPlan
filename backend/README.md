# PocketPlan Backend

API REST para gestión de finanzas personales.

## Endpoints

### Items (dentro de categorías)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/month-data/:monthId/categories/:categoryId` | Obtener categoría |
| POST | `/api/month-data/:monthId/categories/:categoryId/items` | Crear item |
| PUT | `/api/month-data/:monthId/categories/:categoryId/items/:itemId` | Actualizar item |
| DELETE | `/api/month-data/:monthId/categories/:categoryId/items/:itemId` | Eliminar item |

### Subcategorías
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/subcategories` | Listar todas |
| GET | `/api/subcategories/category/:categoriaPadreId` | Por categoría padre |
| GET | `/api/subcategories/:id` | Obtener una |
| POST | `/api/subcategories` | Crear |
| PUT | `/api/subcategories/:id` | Actualizar |
| DELETE | `/api/subcategories/:id` | Eliminar |

### Datos del mes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/month-data` | Listar todos |
| GET | `/api/month-data/:id` | Obtener por ID |
| GET | `/api/month-data/year/:year` | Por año |
| GET | `/api/month-data/year/:year/month/:month` | Por año/mes |

## Ejemplos con curl

### Items

**Crear item:**
```bash
curl -X POST http://localhost:4000/api/month-data/2025-11/categories/vivienda/items \
  -H "Content-Type: application/json" \
  -d '{"name": "nombre", "amount": 1000, "icon": "Icon"}'
```

**Actualizar item:**
```bash
curl -X PUT http://localhost:4000/api/month-data/2025-11/categories/vivienda/items/vivienda-1 \
  -H "Content-Type: application/json" \
  -d '{"name": "nombre", "amount": 2000}'
```

**Eliminar item:**
```bash
curl -X DELETE http://localhost:4000/api/month-data/2025-11/categories/vivienda/items/vivienda-1
```

### Subcategorías

**Crear subcategoría:**
```bash
curl -X POST http://localhost:4000/api/subcategories \
  -H "Content-Type: application/json" \
  -d '{"id": "nuevo-id", "name": "Nombre", "icon": "Icon", "categoriaPadreId": "vivienda"}'
```

**Actualizar subcategoría:**
```bash
curl -X PUT http://localhost:4000/api/subcategories/nuevo-id \
  -H "Content-Type: application/json" \
  -d '{"name": "Nuevo nombre", "icon": "NewIcon"}'
```

**Eliminar subcategoría:**
```bash
curl -X DELETE http://localhost:4000/api/subcategories/nuevo-id
```

### Datos del mes

**Obtener todos los datos:**
```bash
curl http://localhost:4000/api/month-data
```

**Obtener por ID:**
```bash
curl http://localhost:4000/api/month-data/2025-11
```

**Obtener por año:**
```bash
curl http://localhost:4000/api/month-data/year/2025
```

**Obtener por año y mes:**
```bash
curl http://localhost:4000/api/month-data/year/2025/month/11
```

## Iniciar servidor

```bash
npm start
```

El servidor corre en el puerto 4000.
