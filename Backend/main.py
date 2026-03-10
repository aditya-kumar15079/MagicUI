"""
FastAPI backend for shape detection.
POST /detect-shapes with stroke data → returns detected shapes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from shape_detector import detect_shapes

app = FastAPI(title="MagicUI Shape Detector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
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
    canvas_width: int = Field(default=2000, ge=1, le=10000)
    canvas_height: int = Field(default=700, ge=1, le=10000)


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
