export function getBoundingBox(element) {
  if (!element) return null;
  const x = element.x || 0;
  const y = element.y || 0;
  const scaleX = element.scaleX || 1;
  const scaleY = element.scaleY || 1;
  let w = (element.width || 0) * scaleX;
  let h = (element.height || 0) * scaleY;
  
  if (!w || !h) {
    if (['kanban', 'table'].includes(element.type)) { w = 1000 * scaleX; h = 700 * scaleY; }
    else if (element.type === 'timeline') { w = 900 * scaleX; h = 600 * scaleY; }
  }

  // For arrows/lines that don't have width/height but have points
  if (element.points && element.points.length >= 4) {
    const px = element.points;
    return {
      minX: x + Math.min(px[0], px[2]),
      minY: y + Math.min(px[1], px[3]),
      maxX: x + Math.max(px[0], px[2]),
      maxY: y + Math.max(px[1], px[3]),
      centerX: x + (px[0] + px[2]) / 2,
      centerY: y + (px[1] + px[3]) / 2,
    };
  }

  if (['kanban', 'table', 'timeline'].includes(element.type)) {
    return {
      minX: x,
      minY: y - 56, // Adjust for the -top-14 floating header overlay
      maxX: x + w,
      maxY: y + h,
      centerX: x + w / 2,
      centerY: y + h / 2 - 28, // Shift center slightly up to match visual center
    };
  }

  return {
    minX: x,
    minY: y,
    maxX: x + w,
    maxY: y + h,
    centerX: x + w / 2,
    centerY: y + h / 2,
  };
}

export function getElementConnectionNodes(el) {
  if (!el) return null;
  const x = el.x || 0;
  let y = el.y || 0;
  const scaleX = el.scaleX || 1;
  const scaleY = el.scaleY || 1;
  let w = (el.width || 0) * scaleX;
  let h = (el.height || 0) * scaleY;
  
  if (!w || !h) {
    if (['kanban', 'table'].includes(el.type)) { w = 1000 * scaleX; h = 700 * scaleY; }
    else if (el.type === 'timeline') { w = 900 * scaleX; h = 600 * scaleY; }
  }

  if (['kanban', 'table', 'timeline'].includes(el.type)) {
    y -= 56; // Adjust for the -top-14 floating header overlay
  }

  return [
    { x: x + w / 2, y: y, dir: 'up' },         // Top
    { x: x + w, y: y + h / 2, dir: 'right' },  // Right
    { x: x + w / 2, y: y + h, dir: 'down' },   // Bottom
    { x: x, y: y + h / 2, dir: 'left' },       // Left
  ];
}

export function getSmartConnectorPoints(arrow, elements) {
  let startX = arrow.x;
  let startY = arrow.y;
  let endX = arrow.x + (arrow.points?.[2] || 0);
  let endY = arrow.y + (arrow.points?.[3] || 0);

  const startEl = arrow.startElementId ? elements[arrow.startElementId] : null;
  const endEl = arrow.endElementId ? elements[arrow.endElementId] : null;

  const startNodes = getElementConnectionNodes(startEl);
  const endNodes = getElementConnectionNodes(endEl);

  const getControlPoints = (start, end) => {
    // Generate CP based on direction and distance
    const dist = Math.max(30, Math.hypot(end.x - start.x, end.y - start.y) * 0.3);
    
    let cp1x = start.x; let cp1y = start.y;
    if (start.dir === 'up') cp1y -= dist;
    else if (start.dir === 'down') cp1y += dist;
    else if (start.dir === 'left') cp1x -= dist;
    else if (start.dir === 'right') cp1x += dist;
    else {
      // Fallback if no dir (e.g. for mouse position end node)
      if (Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
        cp1x += (end.x > start.x ? dist : -dist);
      } else {
        cp1y += (end.y > start.y ? dist : -dist);
      }
    }

    let cp2x = end.x; let cp2y = end.y;
    if (end.dir === 'up') cp2y -= dist;
    else if (end.dir === 'down') cp2y += dist;
    else if (end.dir === 'left') cp2x -= dist;
    else if (end.dir === 'right') cp2x += dist;
    else {
      if (Math.abs(start.x - end.x) > Math.abs(start.y - end.y)) {
        cp2x += (start.x > end.x ? dist : -dist);
      } else {
        cp2y += (start.y > end.y ? dist : -dist);
      }
    }

    return [start.x, start.y, cp1x, cp1y, cp2x, cp2y, end.x, end.y];
  };

  if (startNodes && endNodes) {
    let minDist = Infinity;
    let bestStart = startNodes[0];
    let bestEnd = endNodes[0];

    for (const sNode of startNodes) {
      for (const eNode of endNodes) {
        const dist = Math.hypot(sNode.x - eNode.x, sNode.y - eNode.y);
        if (dist < minDist) {
          minDist = dist;
          bestStart = sNode;
          bestEnd = eNode;
        }
      }
    }
    return getControlPoints(bestStart, bestEnd);
  }

  // Fallback if only one element is connected
  if (startNodes && !endNodes) {
    let minDist = Infinity;
    let bestStart = startNodes[0];
    for (const sNode of startNodes) {
      const dist = Math.hypot(sNode.x - endX, sNode.y - endY);
      if (dist < minDist) {
        minDist = dist;
        bestStart = sNode;
      }
    }
    return getControlPoints(bestStart, { x: endX, y: endY });
  }

  if (!startNodes && endNodes) {
    let minDist = Infinity;
    let bestEnd = endNodes[0];
    for (const eNode of endNodes) {
      const dist = Math.hypot(startX - eNode.x, startY - eNode.y);
      if (dist < minDist) {
        minDist = dist;
        bestEnd = eNode;
      }
    }
    return getControlPoints({ x: startX, y: startY }, bestEnd);
  }

  return [startX, startY, endX, endY];
}

export function simplifyPoints(points, epsilon = 2) {
  if (!points || points.length <= 4) return points;
  
  const pts = [];
  for (let i = 0; i < points.length; i += 2) {
    pts.push({ x: points[i], y: points[i + 1] });
  }

  const getSqSegDist = (p, p1, p2) => {
    let x = p1.x, y = p1.y, dx = p2.x - x, dy = p2.y - y;
    if (dx !== 0 || dy !== 0) {
      let t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) { x = p2.x; y = p2.y; }
      else if (t > 0) { x += dx * t; y += dy * t; }
    }
    dx = p.x - x; dy = p.y - y;
    return dx * dx + dy * dy;
  };

  const simplifyDPStep = (pts, first, last, sqTolerance, simplified) => {
    let maxSqDist = sqTolerance;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      let sqDist = getSqSegDist(pts[i], pts[first], pts[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }
    if (index > 0) {
      if (index - first > 1) simplifyDPStep(pts, first, index, sqTolerance, simplified);
      simplified.push(pts[index]);
      if (last - index > 1) simplifyDPStep(pts, index, last, sqTolerance, simplified);
    }
  };

  const sqTolerance = epsilon * epsilon;
  const last = pts.length - 1;
  const simplified = [pts[0]];
  simplifyDPStep(pts, 0, last, sqTolerance, simplified);
  simplified.push(pts[last]);

  const result = [];
  simplified.forEach(p => {
    result.push(p.x, p.y);
  });
  return result;
}
