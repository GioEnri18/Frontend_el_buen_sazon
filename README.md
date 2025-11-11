# Frontend - Sistema de Reservas "El Buen Sazón"# React + TypeScript + Vite



Sistema de gestión de reservas para restaurante desarrollado con React + TypeScript + Vite.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## 🚀 CaracterísticasCurrently, two official plugins are available:



- ✅ **Página de Inicio**: Landing page con imagen hero y botón de reserva- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- ✅ **Sistema de Reservas**: Formulario completo con validaciones- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- ✅ **Dashboard Administrativo**: 

  - Estadísticas en tiempo real## React Compiler

  - Calendario de reservas

  - Gráficos de ocupaciónThe React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

  - Gestión de reservas del día

- ✅ **Gestión de Mesas**: CRUD completo con filtrosNote: This will impact Vite dev & build performances.

- ✅ **Gestión de Clientes**: Listado y búsqueda de clientes

- ✅ **Navegación**: Sistema de rutas con React Router## Expanding the ESLint configuration

- ✅ **Diseño Responsivo**: Adaptado para móviles y tablets

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

## 🛠 Tecnologías

```js

- **React 19** - Framework de UIexport default defineConfig([

- **TypeScript** - Tipado estático  globalIgnores(['dist']),

- **Vite** - Build tool y dev server  {

- **React Router DOM** - Navegación    files: ['**/*.{ts,tsx}'],

- **Axios** - Cliente HTTP    extends: [

- **React Hook Form** - Gestión de formularios      // Other configs...

- **date-fns** - Manejo de fechas

- **Recharts** - Gráficos y visualizaciones      // Remove tseslint.configs.recommended and replace with this

- **React Icons** - Iconos      tseslint.configs.recommendedTypeChecked,

      // Alternatively, use this for stricter rules

## 📋 Requisitos Previos      tseslint.configs.strictTypeChecked,

      // Optionally, add this for stylistic rules

- Node.js 18+      tseslint.configs.stylisticTypeChecked,

- Backend corriendo en `http://localhost:3000`

      // Other configs...

## 🚦 Instalación    ],

    languageOptions: {

### 1. Instalar dependencias      parserOptions: {

        project: ['./tsconfig.node.json', './tsconfig.app.json'],

\`\`\`bash        tsconfigRootDir: import.meta.dirname,

cd frontend      },

npm install      // other options...

\`\`\`    },

  },

### 2. Configurar URL del backend])

```

El frontend está configurado para conectarse a `http://localhost:3000/api`. Si tu backend está en otra URL, edita el archivo:

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

\`\`\`typescript

// src/services/api.ts```js

const API_URL = 'http://localhost:3000/api';// eslint.config.js

\`\`\`import reactX from 'eslint-plugin-react-x'

import reactDom from 'eslint-plugin-react-dom'

### 3. Iniciar el servidor de desarrollo

export default defineConfig([

\`\`\`bash  globalIgnores(['dist']),

npm run dev  {

\`\`\`    files: ['**/*.{ts,tsx}'],

    extends: [

El frontend estará disponible en: `http://localhost:5173`      // Other configs...

      // Enable lint rules for React

## 📁 Estructura del Proyecto      reactX.configs['recommended-typescript'],

      // Enable lint rules for React DOM

\`\`\`      reactDom.configs.recommended,

frontend/    ],

├── src/    languageOptions: {

│   ├── components/        # Componentes reutilizables      parserOptions: {

│   │   ├── Layout.tsx     # Layout principal con Navbar y Footer        project: ['./tsconfig.node.json', './tsconfig.app.json'],

│   │   ├── Navbar.tsx     # Barra de navegación        tsconfigRootDir: import.meta.dirname,

│   │   └── Footer.tsx     # Pie de página      },

│   ├── pages/            # Páginas de la aplicación      // other options...

│   │   ├── Home.tsx       # Página de inicio    },

│   │   ├── Reservar.tsx   # Formulario de reservas  },

│   │   ├── Dashboard.tsx  # Panel administrativo])

│   │   ├── Mesas.tsx      # Gestión de mesas```

│   │   └── Clientes.tsx   # Gestión de clientes
│   ├── services/         # Servicios de API
│   │   ├── api.ts         # Configuración de Axios
│   │   ├── mesas.service.ts
│   │   ├── clientes.service.ts
│   │   └── reservas.service.ts
│   ├── types/            # Tipos de TypeScript
│   │   └── index.ts       # Interfaces y tipos
│   ├── App.tsx           # Componente principal
│   ├── App.css           # Estilos globales
│   └── main.tsx          # Punto de entrada
├── package.json
└── vite.config.ts
\`\`\`

## 🎨 Páginas y Funcionalidades

### Home (`/`)
- Hero section con imagen de fondo
- Botón de "Reservar Ahora"
- Información del restaurante

### Reservar (`/reservar`)
- Formulario completo de reserva
- Validaciones en tiempo real
- Selección de mesa disponible
- Búsqueda o creación automática de cliente
- Mensajes de éxito/error

### Dashboard (`/dashboard`)
- **Estadísticas**: Total reservas, ocupación, mesas disponibles
- **Calendario**: Vista semanal de reservas
- **Gráficos**: 
  - Pie chart de disponibilidad
  - Bar chart de reservas por hora
- **Tabla**: Reservas del día con acciones

### Mesas (`/mesas`)
- Listado completo de mesas
- Filtros por estado y capacidad
- Búsqueda por número o ubicación
- Crear, editar, eliminar mesas
- Activar/desactivar mesas
- Duplicar mesas

### Clientes (`/clientes`)
- Listado de clientes
- Búsqueda por nombre, email o teléfono
- Vista de información completa

## 🔌 Conexión con el Backend

El frontend consume los siguientes endpoints del backend:

### Mesas
- `GET /api/mesas` - Listar mesas
- `POST /api/mesas` - Crear mesa
- `PATCH /api/mesas/:numero` - Actualizar mesa
- `DELETE /api/mesas/:numero` - Eliminar mesa

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/email/:email` - Buscar por email

### Reservas
- `GET /api/reservas` - Listar reservas
- `GET /api/reservas/dia` - Reservas del día
- `POST /api/reservas` - Crear reserva
- `PATCH /api/reservas/:id` - Actualizar reserva
- `PATCH /api/reservas/:id/cancelar` - Cancelar reserva

## 🎨 Paleta de Colores

- **Primario**: `#007bff` (Azul)
- **Éxito**: `#28a745` (Verde)
- **Peligro**: `#dc3545` (Rojo)
- **Advertencia**: `#ffc107` (Amarillo)
- **Fondo**: `#f8f9fa` (Gris claro)

## 🚀 Scripts Disponibles

\`\`\`bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run preview      # Preview del build de producción

# Calidad de código
npm run lint         # Ejecuta ESLint
\`\`\`

## 📱 Responsive Design

El frontend está optimizado para:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (< 768px)

## 🔐 Manejo de Errores

El sistema incluye:
- Validación de formularios con mensajes claros
- Manejo de errores de API
- Estados de carga (loading)
- Mensajes de éxito/error
- Confirmaciones antes de acciones destructivas

## 🐛 Troubleshooting

### Error de conexión con el backend
```
Verifica que el backend esté corriendo en http://localhost:3000
```

### Error de CORS
```
Asegúrate de que el backend tenga CORS habilitado para http://localhost:5173
```

### Dependencias faltantes
```bash
rm -rf node_modules package-lock.json
npm install
```

---

¡Tu frontend de reservas está listo para usar! 🎉
