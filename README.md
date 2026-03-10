# Canvas Studio (MagicUI)

An intelligent drawing application that combines freehand sketching with real-time shape detection. Draw anything on the canvas and watch your hand-drawn strokes get instantly recognized and converted into clean, vectorized geometric shapes using computer vision.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Tech Stack](https://img.shields.io/badge/FastAPI-0.115-green) ![Tech Stack](https://img.shields.io/badge/OpenCV-4.10-orange) ![Tech Stack](https://img.shields.io/badge/Tailwind_CSS-4.1-purple)

---

## Features

- **Freehand Drawing** — Sketch freely with a pen tool on a 2000×700 canvas
- **Real-time Shape Detection** — Strokes are analyzed via OpenCV and converted to clean SVG shapes (circles, ovals, rectangles, squares, triangles, polygons)
- **Live Split-View Preview** — Drawing canvas on the left, vectorized preview on the right with a draggable divider
- **Image Filters** — 6 filters (Original, Grayscale, Sepia, Invert, Vivid, Dream) applied to the preview
- **13-Color Palette** — Preset colors plus a custom color picker
- **Adjustable Brush Size** — 1px to 40px
- **Zoom Controls** — 25% to 400%
- **Eraser Tool** — Remove strokes with configurable size
- **Canvas Download** — Export your drawing as an image
- **Status Bar** — Live display of canvas dimensions, cursor position, active tool, and current color

---

## Tech Stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Frontend | React 19, Vite 6, Tailwind CSS 4, Redux Toolkit    |
| Backend  | FastAPI, Uvicorn, OpenCV (headless), NumPy, Pydantic |
| Comms    | REST API with Axios (debounced, with retry & cancel) |

---

## Prerequisites

- **Node.js** (v18+ recommended) & **npm**
- **Python 3.10+** & **pip**

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/MagicUI.git
cd MagicUI
```

### 2. Start the Backend

```bash
cd Backend

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

The API server starts at **http://localhost:8000**.  
Interactive API docs are available at **http://localhost:8000/docs**.

### 3. Start the Frontend

Open a **new terminal**:

```bash
cd UI

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app opens at **http://localhost:5173**.

---

## API Reference

### `POST /detect-shapes`

Accepts an array of strokes and returns detected geometric shapes.

**Request body:**

```json
{
  "strokes": [
    {
      "points": [{ "x": 100, "y": 150 }, { "x": 101, "y": 151 }],
      "color": "#e74c3c",
      "width": 6.0
    }
  ],
  "canvas_width": 2000,
  "canvas_height": 700
}
```

**Response:**

```json
{
  "shapes": [
    { "type": "circle", "center": { "x": 500, "y": 350 }, "radius": 45.5 },
    { "type": "rectangle", "center": { "x": 1000, "y": 300 }, "width": 150, "height": 100, "angle": 0 },
    { "type": "triangle", "vertices": [[100, 200], [150, 300], [50, 300]], "center": { "x": 100, "y": 233 } }
  ]
}
```

**Detected shape types:** circle, oval, rectangle, square, triangle, polygon

### `GET /health`

Returns `{"status": "ok"}` — useful for readiness checks.

---

## Project Structure

```
MagicUI/
├── Backend/
│   ├── main.py               # FastAPI app, CORS config, /detect-shapes endpoint
│   ├── shape_detector.py     # OpenCV shape detection logic
│   └── requirements.txt      # Python dependencies
├── UI/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js        # Vite + Tailwind + SVGR config
│   └── src/
│       ├── App.jsx           # Root component
│       ├── store.js          # Redux store
│       ├── components/
│       │   └── canvas/
│       │       ├── DrawingCanvas.jsx   # Main drawing surface
│       │       ├── PreviewPane.jsx     # Vectorized shape preview
│       │       ├── SplitView.jsx       # Side-by-side layout
│       │       ├── PaneDivider.jsx     # Draggable divider
│       │       ├── Toolbar.jsx         # Drawing controls
│       │       ├── TitleBar.jsx        # App header
│       │       └── StatusBar.jsx       # Canvas info bar
│       ├── constants/
│       │   └── canvasConstants.js      # Colors, sizes, defaults
│       └── hooks/
│           ├── useCanvas.js            # Canvas drawing logic
│           ├── useDivider.js           # Panel resize logic
│           └── useShapeDetection.js    # API calls with debounce
└── README.md
```

---

## How It Works

1. You draw freehand strokes on the **Drawing Canvas**.
2. After a 400 ms debounce, the strokes are sent to the FastAPI backend.
3. The backend rasterizes the strokes with OpenCV, finds contours, and classifies each shape by vertex count and circularity.
4. Detected shapes are returned as JSON and rendered as an **SVG overlay** on the Preview Pane.

---

## Available Scripts

### Frontend (`UI/`)

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Start Vite dev server      |
| `npm run build`   | Production build           |
| `npm run preview` | Preview production build   |
| `npm run lint`    | Run ESLint                 |

### Backend (`Backend/`)

| Command                          | Description                       |
| -------------------------------- | --------------------------------- |
| `uvicorn main:app --reload`      | Start FastAPI with hot-reload     |
| `python main.py`                 | Start server directly             |

---

## License

This project is for educational and personal use.
