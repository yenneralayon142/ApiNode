# Aplicacion de Control de Gastos Personales

Esta aplicacion movil multiplataforma permite registrar, consultar y gestionar gastos personales de forma sencilla para apoyar mejores decisiones financieras.

---
## Desarrolladores
- Yenner Snyder Alayon Benavides
- Jonathan Andres Garcia Rodriguez

## Caracteristicas principales
- Registro de ingresos y egresos.
- Consulta detallada de transacciones.
- Reportes de gastos por categoria y periodo.
- Funcionamiento offline con sincronizacion cuando vuelve la red.
- Interfaz enfocada en la facilidad de uso.

---
## Stack tecnologico
- **Frontend:** React Native (Expo)
- **Backend:** Node.js con API REST
- **Base de datos:** PostgreSQL, MongoDB o MySQL
- **Gestion del proyecto:** Azure DevOps (Boards, Repos, Pipelines)

---
## Documentacion del proyecto
- [Descargar PDF del proyecto](documentacionProyecto/ProyectoControlDeGastosMovil.pdf)
- [Descargar Mockups del proyecto](documentacionProyecto/YenAndGestion.pdf)
- [Ver mockups en Figma](https://www.figma.com/proto/GUuX644yU323xV8B2oIi97/YenAndGestion?node-id=7020-3430&t=yTJJadWKho8JGoTF-1)

---
## Instalacion y ejecucion

### Backend
1. `cd backend`
2. `npm install`
3. Configure las variables de entorno en `backend/.env` usando `backend/.env.example` como referencia.
4. `npm start` para levantar la API (por defecto en el puerto 3000).

### Frontend (Expo)
1. `cd frontend`
2. `npm install`
3. Cree un archivo `.env` (opcional) para las URL del backend y ajustelas dentro de `app.json` o usando `expo-constants` segun sea necesario.
4. `npx expo start` para abrir el bundler y elegir `a` (Android), `w` (web) o escanear el QR con Expo Go.

---
## Notas adicionales
- Mantenga la base de datos sincronizada con los cambios de modelos actualizando `database/db_node.sql`.
- Siga las convenciones de commits descritas en `AGENTS.md`.
- Las futuras secciones de pruebas se habilitaran cuando Jest y Supertest esten configurados.
