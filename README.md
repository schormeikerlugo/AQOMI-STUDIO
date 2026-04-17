# AQOMI Studios

![AQOMI Studios](public/images/git/01Home.jpeg)

**AQOMI Studios** es una agencia creativa de diseño y branding de élite — clasificada como el estudio #1 en Canadá y #8 en Norteamérica en Clutch. Construimos marcas que el mundo no puede ignorar. Con más de 3,500 identidades de marca entregadas en 40 países, abordamos cada obstáculo de diseño como un problema a resolver en lugar de una limitación. Nos especializamos en identidades visuales de alta fidelidad, experiencias digitales inmersivas y estrategia de marca.

## 🚀 Tecnologías Utilizadas

Este proyecto es una Aplicación de Una Sola Página (Single Page Application - SPA) de alto rendimiento, construida sin frameworks pesados para garantizar la máxima velocidad y un control preciso sobre cada píxel y animación.

- **HTML5**: Estructurado de forma semántica y divido en "partials" (fragmentos) para permitir la carga dinámica de contenido.
- **CSS3 (Vanilla)**: Utiliza un robusto sistema de diseño manejado con variables CSS (tokens), estructuras modernas (Grid/Flexbox), micro-animaciones fluidas, *glassmorphism* (efecto cristal) y diseño adaptativo a dispositivos móviles.
- **JavaScript (Vanilla ES6)**: Cuenta con un enrutador SPA personalizado que incluye *lifecycle hooks* (métodos de ciclo de vida como `onPageActivate`, `registerCleanup`), observadores de intersección (Intersection Observers) para revelar elementos al desplazar, inyección dinámica de HTML a través de `pageLoader.js`, lógica interactiva en el cursor y fondos degradados (mesh gradients) con tecnología WebGL.
- **Vite**: Herramienta de compilación ultrarrápida configurada con `vite-plugin-compression` (Gzip y Brotli) para optimizar drásticamente la capacidad de producción.

## 📁 Estructura del Proyecto

```text
├── public/
│   ├── images/
│   │   ├── git/                # Imágenes de demostración para el README
│   │   └── logos/              # Logotipos de clientes en formato SVG
│   ├── partials/
│   │   ├── components/         # Componentes HTML reutilizables (nav, footer, etc.)
│   │   └── pages/              # Fragmentos HTML para cada vista de la SPA
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── css/
│   │   ├── animations.css      # Keyframes y lógica de transiciones
│   │   ├── components.css      # Estilos para componentes específicos
│   │   ├── layout.css          # Estructuras globales (grid/flex)
│   │   ├── responsive.css      # Media queries para adaptación móvil/tableta
│   │   ├── tokens.css          # Variables CSS base (colores, tipografías)
│   │   └── pages.css           # Refinamientos estéticos por cada vista
│   └── js/
│       ├── main.js             # Punto de entrada principal e inicialización
│       ├── pageLoader.js       # Inyección dinámica de los partials HTML
│       ├── router.js           # Enrutador personalizado SPA
│       ├── meshGradient.js     # Motor de renderizado del fondo WebGL
│       ├── cursor.js           # Lógica del cursor interactivo oculto/visible
│       ├── reveals.js          # Observadores de intersección por scroll
│       └── ...                 # Módulos extra (carrusel, componentes varios)
├── index.html                  # Core (shell) principal de la aplicación
├── package.json                # Dependencias del proyecto
└── vite.config.js              # Configuración de Vite y Compresión
```

## 📸 Galería del Proyecto

| Inicio (Home) | El Porqué (The Why) |
| --- | --- |
| ![Inicio](public/images/git/01Home.jpeg) | ![El Porqué](public/images/git/02The_why.jpeg) |

| Trabajo (Work) | Detalle de Trabajo (Work Project) |
| --- | --- |
| ![Trabajo](public/images/git/03Work.jpeg) | ![Detalle de Trabajo](public/images/git/04Work_proyect.jpeg) |

| Industrias (Industries) | Servicios (Services) |
| --- | --- |
| ![Industrias](public/images/git/05Industries.jpeg) | ![Servicios](public/images/git/06Services.jpeg) |

| El Estudio (Studio) | Carrera (Careers) |
| --- | --- |
| ![El Estudio](public/images/git/07Studio.jpeg) | ![Carrera](public/images/git/08Careers.jpeg) |

---

&copy; 2026 AQOMI Studios. Todos los derechos reservados.
