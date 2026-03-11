"""
FastAPI backend for shape detection and UI generation.
POST /detect-shapes  → returns detected shapes
POST /generate-ui    → converts canvas drawing into a web UI image via Gemini
"""

import base64
import io
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from PIL import Image
from google import genai
from google.genai import types

from shape_detector import detect_shapes

logger = logging.getLogger("magicui")

# ── Gemini client (initialized once at startup) ───────────────

GEMINI_MODEL = "gemini-3-pro-image-preview"

gemini_client: genai.Client | None = None


@asynccontextmanager
async def lifespan(application: FastAPI):
    global gemini_client
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        gemini_client = genai.Client(api_key=api_key)
        logger.info("Gemini client initialized (model=%s)", GEMINI_MODEL)
    else:
        logger.warning("GEMINI_API_KEY not set — /generate-ui will be unavailable")
    yield
    gemini_client = None


app = FastAPI(title="MagicUI Shape Detector", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS", "GET"],
    allow_headers=["*"],
)


class Point(BaseModel):
    x: float
    y: float


class Stroke(BaseModel):
    points: list[Point]
    color: str = "#000000"
    width: float = 2.0


class DetectRequest(BaseModel):
    strokes: list[Stroke]
    canvas_width: int = Field(default=1920, ge=1, le=10000)
    canvas_height: int = Field(default=1080, ge=1, le=10000)


class DetectResponse(BaseModel):
    shapes: list[dict]


@app.post("/detect-shapes", response_model=DetectResponse)
def detect(req: DetectRequest):
    stroke_points = [[{"x": p.x, "y": p.y} for p in s.points] for s in req.strokes]
    stroke_colors = [s.color for s in req.strokes]
    stroke_widths = [s.width for s in req.strokes]

    shapes = detect_shapes(
        strokes=stroke_points,
        canvas_w=req.canvas_width,
        canvas_h=req.canvas_height,
        stroke_colors=stroke_colors,
        stroke_widths=stroke_widths,
    )
    return DetectResponse(shapes=shapes)


@app.get("/health")
def health():
    return {"status": "ok"}


# ── Gemini UI generation ──────────────────────────────────────

GENERATE_UI_PROMPT = (
    "You are a professional web designer. The attached image is a hand-drawn "
    "wireframe sketch on a canvas. Convert it into a high-quality, modern, "
    "polished web user interface mockup image. Interpret the shapes as UI "
    "components: rectangles as cards, buttons or input fields; circles as "
    "avatars or icons; triangles as arrows or decorative elements; text-like "
    "scribbles as headings or paragraphs. Use a clean design system with "
    "consistent spacing, subtle shadows, rounded corners, and a professional "
    "color palette. The output should look like a real website screenshot."
)


class GenerateUIRequest(BaseModel):
    image: str = Field(..., description="Base64-encoded PNG of the canvas drawing")


class GenerateUIResponse(BaseModel):
    image: str = Field(..., description="Base64-encoded PNG of the generated UI")
    description: str = ""


@app.post("/generate-ui", response_model=GenerateUIResponse)
async def generate_ui(req: GenerateUIRequest):
    if not gemini_client:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY not configured")

    # Decode the incoming canvas image
    try:
        img_bytes = base64.b64decode(req.image)
        canvas_image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data")

    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[GENERATE_UI_PROMPT, canvas_image],
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
            ),
        )
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        raise HTTPException(status_code=502, detail=f"Gemini API error: {exc}")

    generated_b64 = ""
    description = ""

    for part in response.parts:
        if part.text is not None:
            description += part.text
        elif part.inline_data is not None:
            # inline_data.data may be raw bytes or base64-encoded
            raw = part.inline_data.data
            if isinstance(raw, str):
                raw = base64.b64decode(raw)
            result_image = Image.open(io.BytesIO(raw)).convert("RGB")
            buf = io.BytesIO()
            result_image.save(buf, format="PNG")
            generated_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    if not generated_b64:
        raise HTTPException(status_code=502, detail="Gemini did not return an image")

    return GenerateUIResponse(image=generated_b64, description=description)
