import type { FamilyTree } from "../../model/FamilyTree";
import { nullPosition, type Position } from "../../model/FundamentalData";
import type { Person } from "../../model/Person";
import type {
  HorizontalTextInformation,
  VerticalTextInformation,
} from "../../components/TextInformation";


interface RectPosition {
  top: number,
  bottom: number,
  left: number,
  right: number
}

const lineWidth = 1;

function drawNames(
  ctx: CanvasRenderingContext2D,
  persons: Map<number, Person>,
  rect: RectPosition
) {
  const offset = 7;
  for (const [, person] of persons) {
 
    const width = person.getWidth();
    const height = person.getHeight();
    const center = person.getPosition();
    const x = center.x - width / 2;
    const y = center.y - height / 2;

    if (x > rect.right || x + width < rect.left || y > rect.bottom || y + height < rect.top) {
      continue
    }

    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.strokeStyle = "rgb(136, 136, 136)";
    ctx.rect(x - offset, y - offset, width + 2 * offset, height + 2 * offset);
    ctx.fill();
    ctx.stroke();

    person.draw(ctx);
  }
}

interface Horizontal {
  x1: number;
  x2: number;
  y: number;
  isDouble: boolean;
}

interface Vertical {
  y1: number;
  y2: number;
  x: number;
  isDouble: boolean;
}

function drawHorizontal(ctx: CanvasRenderingContext2D, line: Horizontal) {
  if (line.isDouble) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3 * lineWidth;
    ctx.moveTo(line.x1, line.y);
    ctx.lineTo(line.x2, line.y);
    ctx.stroke();

    ctx.clearRect(
      Math.min(line.x1, line.x2),
      line.y - lineWidth / 2,
      Math.abs(line.x1 - line.x2),
      lineWidth
    );
  } else {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = lineWidth;
    ctx.moveTo(line.x2, line.y);
    ctx.lineTo(line.x1, line.y);
    ctx.stroke();
  }
}

function drawVertical(ctx: CanvasRenderingContext2D, line: Vertical) {
  const y1 = Math.min(line.y1, line.y2);
  const y2 = Math.max(line.y1, line.y2);

  if (line.isDouble) {
    if (y2 - y1 > 4 * lineWidth) {
      ctx.clearRect(
        line.x - (lineWidth * 9) / 2,
        y1 + 2 * lineWidth,
        9 * lineWidth,
        y2 - y1 - 4 * lineWidth
      );
    }

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3 * lineWidth;
    ctx.moveTo(line.x, y1);
    ctx.lineTo(line.x, y2);
    ctx.stroke();

    ctx.clearRect(line.x - lineWidth / 2, y1, lineWidth, y2 - y1);
  } else {
    if (y2 - y1 > 4 * lineWidth) {
      ctx.clearRect(
        line.x - (lineWidth * 7) / 2,
        y1 + 2 * lineWidth,
        7 * lineWidth,
        y2 - y1 - 4 * lineWidth
      );
    }

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = lineWidth;
    ctx.moveTo(line.x, y1);
    ctx.lineTo(line.x, y2);
    ctx.stroke();
  }
}

function drawLines(ctx: CanvasRenderingContext2D, familyTree: FamilyTree) {
  const verticals: Vertical[] = [];
  const offset = 7;
  const margin = 20;

  const marriages = familyTree.getMarriageMap();

  for (const [id] of marriages) {
    const parents = familyTree.findSpousesOfMarriage(id);
    const children = familyTree.findChildrenOfMarriage(id);
    const adoptedChildren = familyTree.findAdoptedChildrenOfMarriage(id);

    const upper = {
      x1: 0,
      x2: 0,
      y: 0,
    };

    const lower =
      children.length + adoptedChildren.length > 0
        ? {
            x:
              (children.reduce((acc, p) => acc + p.getX(), 0) +
                adoptedChildren.reduce((acc, p) => acc + p.getX(), 0)) /
              (children.length + adoptedChildren.length),
            y:
              Math.min(
                ...children.map((p) => p.getY() - p.getHeight() / 2),
                ...adoptedChildren.map(
                  (p) => p.getY() - p.getHeight() / 2 - margin / 2
                )
              ) - margin,
          }
        : nullPosition();

    if (parents.length === 2) {
      upper.y = Math.max(...parents.map((p) => p.getY()));
      const sorted = parents.sort((p1, p2) => p1.getX() - p2.getX());
      const maxTopY = Math.max(sorted[0].getTopY(), sorted[1].getTopY());
      const minBottomY = Math.min(
        sorted[0].getBottomY(),
        sorted[1].getBottomY()
      );

      if (
        minBottomY - maxTopY > 5 &&
        sorted[1].getLeftX() - sorted[0].getRightX() > 2 * offset + 5
      ) {
        const h: Horizontal = {
          y: (minBottomY + maxTopY) / 2,
          x1: sorted[0].getRightX() + offset,
          x2: sorted[1].getLeftX() - offset,
          isDouble: true,
        };
        upper.x1 = h.x1;
        upper.x2 = h.x2;
        upper.y = h.y;
        drawHorizontal(ctx, h);
      } else if (sorted[1].getLeftX() - sorted[0].getRightX() > 2 * margin) {
        if (sorted[0].getY() > sorted[1].getY()) {
          const h1: Horizontal = {
            y: sorted[0].getY(),
            x1: sorted[0].getRightX() + offset,
            x2: sorted[1].getLeftX() - margin,
            isDouble: true,
          };
          const v: Vertical = {
            x: sorted[1].getLeftX() - margin,
            y1: sorted[0].getY(),
            y2: sorted[1].getY(),
            isDouble: true,
          };
          const h2: Horizontal = {
            y: sorted[1].getY(),
            x1: sorted[1].getLeftX() - margin,
            x2: sorted[1].getLeftX() - offset,
            isDouble: true,
          };
          verticals.push(v);
          upper.x1 = h1.x1;
          upper.x2 = h1.x2;
          drawHorizontal(ctx, h1);
          drawHorizontal(ctx, h2);
        } else {
          const h1: Horizontal = {
            y: sorted[0].getY(),
            x1: sorted[0].getRightX() + offset,
            x2: sorted[0].getRightX() + margin,
            isDouble: true,
          };
          const v: Vertical = {
            x: sorted[0].getRightX() + margin,
            y1: sorted[0].getY(),
            y2: sorted[1].getY(),
            isDouble: true,
          };
          const h2: Horizontal = {
            y: sorted[1].getY(),
            x1: sorted[0].getRightX() + margin,
            x2: sorted[1].getLeftX() - offset,
            isDouble: true,
          };
          upper.x1 = h2.x1;
          upper.x2 = h2.x2;
          verticals.push(v);
          drawHorizontal(ctx, h1);
          drawHorizontal(ctx, h2);
        }
      } else {
        if (sorted[0].getY() > sorted[1].getY()) {
          const h1: Horizontal = {
            y: sorted[0].getY(),
            x1: sorted[0].getRightX() + offset,
            x2: sorted[1].getRightX() + margin,
            isDouble: true,
          };
          const v: Vertical = {
            x: sorted[1].getRightX() + margin,
            y1: sorted[0].getY(),
            y2: sorted[1].getY(),
            isDouble: true,
          };
          const h2: Horizontal = {
            y: sorted[1].getY(),
            x1: sorted[1].getRightX() + margin,
            x2: sorted[1].getRightX() + offset,
            isDouble: true,
          };
          upper.x1 = h1.x1;
          upper.x2 = h1.x2;
          verticals.push(v);
          drawHorizontal(ctx, h1);
          drawHorizontal(ctx, h2);
        } else {
          const h1: Horizontal = {
            y: sorted[0].getY(),
            x1: sorted[0].getLeftX() - offset,
            x2: sorted[0].getLeftX() - margin,
            isDouble: true,
          };
          const v: Vertical = {
            x: sorted[0].getLeftX() - margin,
            y1: sorted[0].getY(),
            y2: sorted[1].getY(),
            isDouble: true,
          };
          const h2: Horizontal = {
            y: sorted[1].getY(),
            x1: sorted[0].getLeftX() - margin,
            x2: sorted[1].getLeftX() - offset,
            isDouble: true,
          };
          upper.x1 = h2.x1;
          upper.x2 = h2.x2;
          verticals.push(v);
          drawHorizontal(ctx, h1);
          drawHorizontal(ctx, h2);
        }
      }
    }

    const childrenX = [
      ...children.map((p) =>
        p.getAdoptedParentMarriageId() === undefined
          ? p.getX()
          : p.getX() - margin / 3
      ),
      ...adoptedChildren.map((p) =>
        p.getParentMarriageId() === undefined ? p.getX() : p.getX() + margin / 3
      ),
    ];

    const leftChildrenX = Math.min(...childrenX);
    const rightChildrenX = Math.max(...childrenX);

    if (parents.length > 0 && children.length + adoptedChildren.length > 0) {
      const isDouble = children.length === 0 && adoptedChildren.length === 1;
      if (parents.length === 1) {
        const parentX = parents[0].getX();
        const parentLowerY = parents[0].getBottomY();
        if (parentLowerY + margin > lower.y) {
          const midX = (parentX + lower.x) / 2;
          const v1: Vertical = {
            x: parentX,
            y1: parentLowerY + offset,
            y2: parentLowerY + margin,
            isDouble: isDouble,
          };
          const h1: Horizontal = {
            y: parentLowerY + margin,
            x1: parentX,
            x2: midX,
            isDouble: isDouble,
          };
          const v2: Vertical = {
            x: midX,
            y1: parentLowerY + margin,
            y2: lower.y,
            isDouble: isDouble,
          };
          const h2: Horizontal = {
            y: lower.y,
            x1: midX,
            x2: lower.x,
            isDouble: isDouble,
          };
          drawHorizontal(ctx, h1);
          drawHorizontal(ctx, h2);
          verticals.push(v1, v2);
        } else {
          const v: Vertical = {
            x: parentX,
            y1: parentLowerY + offset,
            y2: lower.y,
            isDouble: isDouble,
          };
          if (parentX < leftChildrenX) {
            const h: Horizontal = {
              y: lower.y,
              x1: parentX,
              x2: leftChildrenX,
              isDouble: isDouble,
            };
            drawHorizontal(ctx, h);
          } else if (parentX > rightChildrenX) {
            const h: Horizontal = {
              y: lower.y,
              x1: parentX,
              x2: rightChildrenX,
              isDouble: isDouble,
            };
            drawHorizontal(ctx, h);
          }
          verticals.push(v);
        }
      } else if (upper.y < lower.y) {
        const leftUpperX = Math.min(upper.x1, upper.x2);
        const rightUpperX = Math.max(upper.x1, upper.x2);
        const maxLeftX = Math.max(leftUpperX, leftChildrenX);
        const minRightX = Math.min(rightUpperX, rightChildrenX);
        if (minRightX - maxLeftX > 5) {
          const midX = (minRightX + maxLeftX) / 2;
          const v: Vertical = {
            x: midX,
            y1: upper.y,
            y2: lower.y,
            isDouble: isDouble,
          };
          verticals.push(v);
        } else {
          const upperX = (upper.x1 + upper.x2) / 2;
          const v: Vertical = {
            x: upperX,
            y1: upper.y,
            y2: lower.y,
            isDouble: isDouble,
          };
          if (
            Math.abs(upperX - leftChildrenX) < Math.abs(upperX - rightChildrenX)
          ) {
            const h: Horizontal = {
              y: lower.y,
              x1: upperX,
              x2: leftChildrenX,
              isDouble: isDouble,
            };
            drawHorizontal(ctx, h);
            verticals.push(v);
          } else {
            const h: Horizontal = {
              y: lower.y,
              x1: upperX,
              x2: rightChildrenX,
              isDouble: isDouble,
            };
            drawHorizontal(ctx, h);
            verticals.push(v);
          }
        }
      } else {
        const upperX = (upper.x1 + upper.x2) / 2;
        const midX = (lower.x + upperX) / 2;
        if (Math.abs(midX - lower.x) > offset) {
          const v1: Vertical = {
            x: upperX,
            y1: upper.y,
            y2: upper.y + margin,
            isDouble: isDouble,
          };
          const h1: Horizontal = {
            y: upper.y + margin,
            x1: upperX,
            x2: midX,
            isDouble: isDouble,
          };
          const v2: Vertical = {
            x: midX,
            y1: upper.y + margin,
            y2: lower.y - margin,
            isDouble: isDouble,
          };
          const h2: Horizontal = {
            y: lower.y - margin,
            x1: midX,
            x2: lower.x,
            isDouble: isDouble,
          };
          const v3: Vertical = {
            x: lower.x,
            y1: lower.y - margin,
            y2: lower.y,
            isDouble: isDouble,
          };
          drawHorizontal(ctx, h1);
          drawHorizontal(ctx, h2);
          verticals.push(v1, v2, v3);
        } else {
          const sign = upperX > lower.x ? -1 : 1;
          const v1: Vertical = {
            x: upperX,
            y1: upper.y,
            y2: upper.y + margin,
            isDouble: isDouble,
          };
          const h1: Horizontal = {
            y: upper.y + margin,
            x1: upperX,
            x2: upperX - sign * margin,
            isDouble: isDouble,
          };
          const v2: Vertical = {
            x: upperX - sign * margin,
            y1: upper.y + margin,
            y2: lower.y - margin,
            isDouble: isDouble,
          };
          const h2: Horizontal = {
            y: lower.y - margin,
            x1: upperX - sign * margin,
            x2: lower.x,
            isDouble: isDouble,
          };
          const v3: Vertical = {
            x: lower.x,
            y1: lower.y - margin,
            y2: lower.y,
            isDouble: isDouble,
          };
          drawHorizontal(ctx, h1);
          drawHorizontal(ctx, h2);
          verticals.push(v1, v2, v3);
        }
      }
    }

    if (children.length + adoptedChildren.length > 1) {
      const longh: Horizontal = {
        y: lower.y,
        x1: leftChildrenX,
        x2: rightChildrenX,
        isDouble: false,
      };
      drawHorizontal(ctx, longh);
    }

    for (const c of children) {
      const v: Vertical = {
        x:
          c.getAdoptedParentMarriageId() === undefined
            ? c.getX()
            : c.getX() - margin / 3,
        y1: lower.y,
        y2: c.getTopY() - offset,
        isDouble: false,
      };
      verticals.push(v);
    }

    for (const c of adoptedChildren) {
      const v: Vertical = {
        x:
          c.getParentMarriageId() === undefined
            ? c.getX()
            : c.getX() + margin / 3,
        y1: lower.y,
        y2: c.getTopY() - offset,
        isDouble: true,
      };
      verticals.push(v);
    }
  }

  for (const v of verticals) {
    drawVertical(ctx, v);
  }
}

function drawRuler(ctx: CanvasRenderingContext2D, rect: RectPosition, ticks: {height: number, text: string}[], scale: number) {
  let tick = 1;
  const minSize = 80;
  const multi = 10;
  while(true) {
    if (tick * multi * scale > minSize / 2.5) {
      break;
    }
    tick *= 5;
    if (tick * multi * scale > minSize) {
      break;
    }
    tick *= 2;
  }
  const baseGrid = tick * multi;
  const left = Math.ceil(rect.left / baseGrid);
  const right = Math.floor(rect.right / baseGrid);
  const top = Math.ceil(rect.top / baseGrid);
  const bottom = Math.floor(rect.bottom / baseGrid);

  ctx.setLineDash([10 / scale, 5 / scale]);
  ctx.strokeStyle = "rgb(187, 187, 187)";
  ctx.lineWidth = 1 / scale

  for (let i = left; i <= right; i++) {
    ctx.beginPath();
    ctx.moveTo(i * baseGrid, rect.top);
    ctx.lineTo(i * baseGrid, rect.bottom);
    ctx.stroke();
  }

  for (let i = top; i <= bottom; i++) {
    ctx.beginPath();
    ctx.moveTo(rect.left, i * baseGrid);
    ctx.lineTo(rect.right, i * baseGrid);
    ctx.stroke();
    if (i > 0) {
      ticks.push({height: i * baseGrid, text:`${i * tick}年`})
    } else {
      ticks.push({height: i * baseGrid, text:`前${-i * tick + 1}年`})
    }
  }

  ctx.setLineDash([]);
}

export function drawFamilyTree(
  ctx: CanvasRenderingContext2D,
  familyTree: FamilyTree,
  rectPosition: RectPosition,
  scale: number,
  displayTicks: boolean
) {
  const ticks: {height: number, text: string}[] = [];
  if (displayTicks) {
    drawRuler(ctx, rectPosition, ticks, scale);
  }
  drawLines(ctx, familyTree);
  drawNames(ctx, familyTree.getPersonMap(), rectPosition);
  return ticks
}
