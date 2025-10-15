# Aplicacion de Control de Gastos Personales

Esta aplicacion movil multiplataforma permite registrar, consultar y gestionar gastos personales de forma sencilla para apoyar mejores decisiones financieras.

---
## Desarrolladores
- Yenner Snyder Alayon Benavides
- Jonathan Andres Garcia Rodriguez

## Novedades 2025-10-15
- Dashboard movil ahora consume resumenes, categorias y transacciones reales desde el backend (`/api/reports/*`, `/api/transactions`).
- Pantalla **Nuevo gasto** habilita el alta de transacciones y recarga el dashboard automaticamente.
- Flujo de autenticacion renovado con cabecera curva, inputs/botones tipo pill y toggles de visibilidad para contrasenas.
- `TextField` soporta `enableVisibilityToggle` para mostrar/ocultar contrasenas con icono de ojo.

## Caracteristicas principales
- Registro de ingresos y egresos.
- Consulta detallada de transacciones y reportes por categoria o periodo.
- Funcionamiento offline con sincronizacion cuando vuelve la red.
- Interfaz enfocada en la facilidad de uso.

---
## Stack tecnologico
- **Frontend:** React Native (Expo)
- **Backend:** Node.js con API REST
- **Base de datos:** MySQL (ajustable a otros motores)
- **Gestion del proyecto:** Azure DevOps (Boards, Repos, Pipelines)

---
## Documentacion del proyecto
- [Descargar PDF del proyecto](documentacionProyecto/ProyectoControlDeGastosMovil.pdf)
- [Descargar Mockups del proyecto](documentacionProyecto/YenAndGestion.pdf)
- [Mockups en Figma](https://www.figma.com/proto/GUuX644yU323xV8B2oIi97/YenAndGestion?node-id=7020-3430&t=yTJJadWKho8JGoTF-1)

---
## Instalacion y ejecucion

### Backend
1. `cd backend`
2. `npm install`
3. Configura `backend/.env` a partir de `backend/.env.example` (credenciales de DB, JWT, etc.).
4. `npm start` para levantar la API (puerto por defecto 3000).

### Frontend (Expo)
1. `cd frontend`
2. `npm install`
3. Define la URL del backend antes de iniciar Expo (ajusta la IP a tu red local):
   - **Windows (CMD/PowerShell)**
     ```
     set EXPO_PUBLIC_API_URL=http://192.168.1.3:3000/api
     npx expo start --clear
     ```
   - **Mac/Linux**
     ```
     export EXPO_PUBLIC_API_URL=http://192.168.1.3:3000/api
     npx expo start --clear
     ```
   (Opcional) Documenta las variables en `.env` o `app.json` si manejas multiples entornos.

---
## Notas adicionales
- Mantenga la base de datos sincronizada con cambios de modelos actualizando `database/db_node.sql`.
- Siga las convenciones descritas en `AGENTS.md` (commits, PRs, pruebas).
- Pendiente migrar el placeholder de `npm test` a Jest + Supertest para automatizar las validaciones.
