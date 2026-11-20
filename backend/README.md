# Backend Peluquería El Dorado

API en Express + MySQL que usa los procedimientos almacenados de la base `PELUQUERIA`.

## Puesta en marcha

1. Base de datos (en MySQL Workbench):
   - Ejecuta tu script de tablas y procedimientos (guárdalo como `sql/01_esquema.sql`).
   - Ejecuta `sql/02_datos_iniciales.sql` (roles y un administrador inicial).
2. Configura `backend/.env` (copia de `.env.example`) con tu usuario y contraseña de MySQL.
3. Instala y arranca:

```bash
cd backend
npm install
npm run dev      # se reinicia solo al guardar cambios
```

La API queda en `http://localhost:4000` (es la `VITE_API_URL` del frontend).
Comprueba la conexión en `http://localhost:4000/health`.

## Rutas

| Grupo | Rutas |
|---|---|
| `/administrador` | `login`, `usuarios`, `roles`, `crear_administrador`, `update_admin`, `delete_administrador/:id`, `servicios_empleado/:id`, `asignar_servicios_empleado` |
| `/servicios` | `obtener_servicios`, `registrar_servicios`, `eliminar_servicio/:id` |
| `/subservicio` | `obtener_subservicios`, `registrar_subservicio`, `actualizar_subservicio/:id`, `eliminar_subservicio/:id` |
| `/ingreso` (asistencia) | `empleados`, `asistencia`, `entrada`, `reactivar`, `salida` |
| `/turnos` | `horarios-disponibles/:sub/:fecha`, `empleado-disponible/:sub`, `registrar-con-hora`, `estado/:id`, `por-telefono/:tel`, `pantalla`, `activos-hoy`, `turnos-por-fecha/:fecha`, `mis-turnos/:emp`, `mis-turnos-fecha/:emp/:desde/:hasta`, `iniciar-turno`, `finalizar-turno`, `completar-turno`, `cancelar-turno` |
| `/carta` | `GET` lista de páginas, `POST` subir páginas PNG (campo `paginas`), `DELETE` eliminar |

Las imágenes de la carta se guardan en `uploads/carta/` y se sirven en `/uploads/...`.
