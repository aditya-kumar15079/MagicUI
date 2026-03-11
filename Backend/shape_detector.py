"""
Shape detection service using OpenCV contour analysis.
Receives raw stroke points, draws them onto a temporary image,
finds contours, and classifies them as geometric shapes.
"""

import math
import numpy as np
import cv2


def _points_to_image(points: list[dict], canvas_w: int, canvas_h: int, thickness: int = 3) -> np.ndarray:
    """Draw stroke points onto a blank binary image."""
    img = np.zeros((canvas_h, canvas_w), dtype=np.uint8)
    if len(points) < 2:
        return img
    pts = np.array([[int(p["x"]), int(p["y"])] for p in points], dtype=np.int32)
    cv2.polylines(img, [pts], isClosed=False, color=255, thickness=thickness)
    return img


def _classify_contour(contour: np.ndarray, img_area: float) -> dict | None:
    """Classify a single contour into a geometric shape."""
    area = cv2.contourArea(contour)
    if area < 100:  # too small — noise
        return None

    perimeter = cv2.arcLength(contour, True)
    if perimeter == 0:
        return None

    # Approximate polygon
    epsilon = 0.02 * perimeter
    approx = cv2.approxPolyDP(contour, epsilon, True)
    n_vertices = len(approx)

    # Circularity check
    circularity = (4 * math.pi * area) / (perimeter * perimeter) if perimeter > 0 else 0

    # Bounding shapes
    x, y, w, h = cv2.boundingRect(contour)
    aspect_ratio = w / h if h > 0 else 1

    if n_vertices == 3:
        return _make_triangle(approx, contour)
    elif n_vertices == 4:
        return _make_quadrilateral(approx, contour)
    elif n_vertices == 5:
        return _make_polygon(approx, contour, n_vertices)
    elif circularity > 0.7:
        return _make_ellipse_or_circle(contour)
    elif n_vertices > 5:
        # Could still be ellipse if high vertex count
        if circularity > 0.5:
            return _make_ellipse_or_circle(contour)
        return _make_polygon(approx, contour, n_vertices)

    return None


def _make_triangle(approx: np.ndarray, contour: np.ndarray) -> dict:
    pts = approx.reshape(-1, 2).tolist()
    cx = sum(p[0] for p in pts) / 3
    cy = sum(p[1] for p in pts) / 3
    return {
        "type": "triangle",
        "vertices": pts,
        "center": {"x": cx, "y": cy},
    }


def _make_quadrilateral(approx: np.ndarray, contour: np.ndarray) -> dict:
    rect = cv2.minAreaRect(contour)
    (cx, cy), (w, h), angle = rect
    # Ensure w >= h for consistency
    if w < h:
        w, h = h, w
        angle += 90

    aspect = max(w, h) / min(w, h) if min(w, h) > 0 else 1

    shape_type = "square" if aspect < 1.15 else "rectangle"

    return {
        "type": shape_type,
        "center": {"x": cx, "y": cy},
        "width": w,
        "height": h,
        "angle": angle,
    }


def _make_ellipse_or_circle(contour: np.ndarray) -> dict:
    if len(contour) < 5:
        # Fall back to min enclosing circle
        (cx, cy), radius = cv2.minEnclosingCircle(contour)
        return {
            "type": "circle",
            "center": {"x": float(cx), "y": float(cy)},
            "radius": float(radius),
        }

    ellipse = cv2.fitEllipse(contour)
    (cx, cy), (ma, MA), angle = ellipse
    # ma, MA are full axis lengths from fitEllipse
    a = MA / 2
    b = ma / 2
    if a < b:
        a, b = b, a
        angle += 90

    ratio = a / b if b > 0 else 1

    if ratio < 1.2:
        # Close enough to a circle
        radius = (a + b) / 2
        return {
            "type": "circle",
            "center": {"x": float(cx), "y": float(cy)},
            "radius": float(radius),
        }
    else:
        return {
            "type": "oval",
            "center": {"x": float(cx), "y": float(cy)},
            "rx": float(a),
            "ry": float(b),
            "angle": float(angle),
        }


def _make_polygon(approx: np.ndarray, contour: np.ndarray, n: int) -> dict:
    pts = approx.reshape(-1, 2).tolist()
    M = cv2.moments(contour)
    cx = M["m10"] / M["m00"] if M["m00"] != 0 else 0
    cy = M["m01"] / M["m00"] if M["m00"] != 0 else 0
    return {
        "type": "polygon",
        "vertices": pts,
        "sides": n,
        "center": {"x": cx, "y": cy},
    }


def detect_shapes(
    strokes: list[list[dict]],
    canvas_w: int = 1920,
    canvas_h: int = 1080,
    stroke_colors: list[str] | None = None,
    stroke_widths: list[float] | None = None,
) -> list[dict]:
    """
    Detect geometric shapes from a list of strokes.

    Each stroke is a list of {x, y} points.
    Returns a list of detected shape descriptors.
    """
    results = []

    for idx, points in enumerate(strokes):
        if len(points) < 3:
            continue

        thickness = 3
        if stroke_widths and idx < len(stroke_widths):
            thickness = max(2, int(stroke_widths[idx]))

        img = _points_to_image(points, canvas_w, canvas_h, thickness)

        # Dilate slightly to close gaps in hand-drawn strokes
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        img = cv2.dilate(img, kernel, iterations=2)

        contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours:
            continue

        # Take the largest contour (the main shape the user drew)
        contour = max(contours, key=cv2.contourArea)
        shape = _classify_contour(contour, canvas_w * canvas_h)

        if shape:
            # Attach color/width metadata
            if stroke_colors and idx < len(stroke_colors):
                shape["color"] = stroke_colors[idx]
            else:
                shape["color"] = "#000000"

            if stroke_widths and idx < len(stroke_widths):
                shape["strokeWidth"] = stroke_widths[idx]
            else:
                shape["strokeWidth"] = 2

            shape["strokeIndex"] = idx
            results.append(shape)

    return results
