# LizardJudge Univalle

[![vue](https://img.shields.io/badge/vue-2.7.16-blue.svg?style=flat-square)](https://github.com/vuejs/vue)
[![vuex](https://img.shields.io/badge/vuex-3.6.2-blue.svg?style=flat-square)](https://vuex.vuejs.org/)
[![element-ui](https://img.shields.io/badge/element--ui-2.15.14-blue.svg?style=flat-square)](https://github.com/ElemeFE/element)
[![iview](https://img.shields.io/badge/iview-2.14.3-blue.svg?style=flat-square)](https://github.com/iview/iview)
[![katex](https://img.shields.io/badge/katex-0.16.45-blue.svg?style=flat-square)](https://katex.org/)
[![licencia](https://img.shields.io/badge/licencia-MIT-green.svg?style=flat-square)](http://opensource.org/licenses/MIT)

> Frontend de **LizardJudge Univalle**, plataforma de juez en línea para la **Universidad Privada del Valle (UPV) — sede La Paz, Bolivia**.

Permite a estudiantes resolver problemas de programación, participar en concursos y consultar rankings; y a los docentes administrar problemas, anuncios y servidores de evaluación.

---

## Tabla de contenidos

- [Equipo](#equipo)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Puesta en marcha](#puesta-en-marcha)
  - [Windows (PowerShell)](#windows-powershell)
  - [Linux / macOS (Bash)](#linux--macos-bash)
- [Comandos disponibles](#comandos-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Contribuir](#contribuir)
- [Atribución](#atribución)
- [Licencia](#licencia)

---

## Equipo

| Rol | Integrante |
|---|---|
| Scrum Master + Desarrollador | [Benjamin Saenz](https://github.com/BenjaminSM04) |
| Desarrolladora (UI) | [Brisa Criales](https://github.com/BrisaCriales) |
| Desarrolladora (UI) | [Abigail Aranda](https://github.com/AbigailAranda) |
| Desarrolladora (UI) | [Brenda Challco](https://github.com/brendachallco7-spec) |

La gestión de tareas se lleva en el [Project board del repositorio](https://github.com/users/BenjaminSM04/projects/1), organizado por sprints con campos de Prioridad, Talla y Estimación en minutos.

---

## Stack tecnológico

- **Framework:** Vue.js 2.7
- **Estado:** Vuex 3.6
- **UI:** Element UI 2.15 + iView 2.14
- **Gráficos:** ECharts 3.8 (`vue-echarts`)
- **Editor de texto enriquecido:** Simditor (con soporte Markdown)
- **Editor de código:** CodeMirror
- **Fórmulas matemáticas:** KaTeX (renderizado de LaTeX)
- **Internacionalización:** vue-i18n (idioma por defecto: español de Latinoamérica `es-LA`; incluye `en-US`, `zh-CN`, `zh-TW`)
- **HTTP:** Axios
- **Bundler:** Webpack 3 con DllReferencePlugin para builds rápidos

---

## Requisitos previos

- **Node.js**: versión recomendada **8.x – 16.x** (los scripts usan `--openssl-legacy-provider` para mantener compatibilidad con Webpack 3 en Node 17+).
- **npm**: versión 3 o superior.
- **Backend de OnlineJudge** corriendo en alguna URL accesible (variable de entorno `TARGET`).
- **Git** y conexión a internet para descargar dependencias.

---

## Puesta en marcha

### Windows (PowerShell)

```powershell
# 1. Clonar el repositorio
git clone https://github.com/BenjaminSM04/PS2B2026-JuezVirtual_frontend.git
cd PS2B2026-JuezVirtual_frontend

# 2. Instalar dependencias
npm install

# 3. Construir el bundle DLL (solo la primera vez o al actualizar dependencias listadas en build/webpack.dll.conf.js)
$env:NODE_ENV = "development"
npm run build:dll

# 4. Apuntar al backend del juez
$env:TARGET = "http://localhost:8000"   # reemplazar por la URL real del backend

# 5. Levantar el servidor de desarrollo (con hot reload en http://localhost:8080)
npm run dev
```

### Linux / macOS (Bash)

```bash
# 1. Clonar el repositorio
git clone https://github.com/BenjaminSM04/PS2B2026-JuezVirtual_frontend.git
cd PS2B2026-JuezVirtual_frontend

# 2. Instalar dependencias
npm install

# 3. Construir el bundle DLL (solo la primera vez o al actualizar build/webpack.dll.conf.js)
export NODE_ENV=development
npm run build:dll

# 4. Apuntar al backend del juez
export TARGET=http://localhost:8000   # reemplazar por la URL real del backend

# 5. Levantar el servidor de desarrollo (http://localhost:8080)
npm run dev
```

---

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo con hot reload en `http://localhost:8080` |
| `npm start` | Alias de `npm run dev` |
| `npm run build` | Genera el bundle de producción en `dist/` |
| `npm run build:dll` | Reconstruye el bundle DLL (ejecutar al cambiar `build/webpack.dll.conf.js`) |
| `npm run lint` | Corre ESLint sobre `src/` (archivos `.js` y `.vue`) |

---

## Estructura del proyecto

```
src/
├── pages/
│   ├── admin/         Panel de administración (problemas, concursos, anuncios, configuración)
│   └── oj/            Panel del estudiante (home, problemas, concursos, rankings, envíos, perfil)
├── i18n/              Traducciones (es-LA por defecto, en-US, zh-CN, zh-TW)
├── plugins/           Plugins de Vue (KaTeX, filtros, etc.)
├── store/             Stores de Vuex
├── styles/            Estilos globales (Less)
├── utils/             Utilidades compartidas (API, validaciones, constantes)
└── assets/            Imágenes, logos e íconos
```

---

## Contribuir

Este proyecto es desarrollado por el equipo académico de la materia para la UPV — La Paz. Si formas parte del equipo:

1. Crea una rama desde `main` con un nombre descriptivo (`personalizacion-xxx`, `bug-xxx`, `feature-xxx`).
2. Asegúrate de que `npm run lint` pase antes de abrir el Pull Request.
3. Solicita revisión de al menos un compañero antes de hacer merge.
4. Mantén commits pequeños y con mensajes claros en español.

Las tareas asignadas a cada sprint se encuentran en el [Project board](https://github.com/users/BenjaminSM04/projects/1).

---

## Atribución

LizardJudge Univalle es un **fork** del proyecto [OnlineJudgeFE](https://github.com/QingdaoU/OnlineJudgeFE) desarrollado originalmente por el equipo de [QingdaoU](https://github.com/QingdaoU). Conserva la misma licencia MIT del proyecto original. Agradecimientos a sus autores por proporcionar la base sobre la cual se construye esta personalización para la UPV.

El backend recomendado para esta plataforma es [QingdaoU/OnlineJudge](https://github.com/QingdaoU/OnlineJudge).

---

## Licencia

Distribuido bajo licencia [MIT](http://opensource.org/licenses/MIT).
