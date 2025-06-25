import { FamilyTree } from "../../model/FamilyTree";
import type { Person } from "../../model/Person";
import { Spot } from "../../model/Spot";

interface RectPosition {
  top: number;
  bottom: number;
  left: number;
  right: number;
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
    const x = person.getLeftX();
    const y = person.getTopY();

    if (
      x > rect.right ||
      x + width < rect.left ||
      y > rect.bottom ||
      y + height < rect.top
    ) {
      continue;
    }

    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    const color = FamilyTree.setting.nameBackgroundColor;
    ctx.fillStyle = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.5)`;
    ctx.strokeStyle = FamilyTree.setting.nameBorderColor;
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
  color: string;
}

function drawHorizontal(ctx: CanvasRenderingContext2D, ...lines: Horizontal[]) {
  for (const line of lines) {
    if (line.isDouble) {
      ctx.beginPath();
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
      ctx.lineWidth = lineWidth;
      ctx.moveTo(line.x2, line.y);
      ctx.lineTo(line.x1, line.y);
      ctx.stroke();
    }
  }
}

function drawVertical(ctx: CanvasRenderingContext2D, line: Vertical) {
  const y1 = Math.min(line.y1, line.y2);
  const y2 = Math.max(line.y1, line.y2);
  ctx.strokeStyle = line.color;

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
    ctx.lineWidth = lineWidth;
    ctx.moveTo(line.x, y1);
    ctx.lineTo(line.x, y2);
    ctx.stroke();
  }
}

interface ChildProperties {
  isAdopted: boolean;
  centerX: number;
  topY: number;
  leftX: number;
  rightX: number;
}

function drawLines(ctx: CanvasRenderingContext2D, familyTree: FamilyTree) {
  const verticals: Vertical[] = [];
  const offset = 7;
  const margin = 20;
  const padding = 5;

  const marriages = familyTree.getMarriageMap();

  for (const [id] of marriages) {
    const color = FamilyTree.setting.useColorList
      ? familyTree.getLineColorOfId(id)
      : "#000000";
    ctx.strokeStyle = color;

    const parents = familyTree.findSpousesOfMarriage(id);
    const unsortedChildrenProps: ChildProperties[] = [];

    for (const child of familyTree.findChildrenOfMarriage(id)) {
      const hasAdoptedParentMarriage =
        child.getAdoptedParentMarriageId() !== undefined;
      const childProps: ChildProperties = {
        isAdopted: false,
        topY: child.getTopY() - offset,
        centerX: hasAdoptedParentMarriage
          ? child.getCenterX() - margin / 3
          : child.getCenterX(),
        leftX: child.getLeftX() - offset,
        rightX: child.getRightX() + offset,
      };
      unsortedChildrenProps.push(childProps);
    }

    for (const child of familyTree.findAdoptedChildrenOfMarriage(id)) {
      const hasParentMarriage = child.getParentMarriageId() !== undefined;
      const childProps: ChildProperties = {
        isAdopted: true,
        topY: child.getTopY() - margin / 2 - offset,
        centerX: hasParentMarriage
          ? child.getCenterX() + margin / 3
          : child.getCenterX(),
        leftX: child.getLeftX() - offset,
        rightX: child.getRightX() + offset,
      };
      unsortedChildrenProps.push(childProps);
    }

    const childrenProps = unsortedChildrenProps.sort(
      (c1, c2) => c1.centerX - c2.centerX
    );

    parents.sort((p1, p2) => p1.getCenterX() - p2.getCenterX());

    const numChildren = childrenProps.length;
    const numParents = parents.length;

    if (numParents === 0) {
      const leftChildCenterX = childrenProps[0].centerX;
      const rightChildCenterX = childrenProps[numChildren - 1].centerX;

      const allChildrenTopY = Math.min(...childrenProps.map((c) => c.topY));
      const h: Horizontal = {
        isDouble: false,
        x1: leftChildCenterX,
        x2: rightChildCenterX,
        y: allChildrenTopY - margin,
      };
      drawHorizontal(ctx, h);

      for (const childprops of childrenProps) {
        const v: Vertical = {
          isDouble: childprops.isAdopted,
          x: childprops.centerX,
          y1: allChildrenTopY - margin,
          y2: childprops.topY,
          color: color,
        };
        verticals.push(v);
      }
    } else if (numParents === 1) {
      const parent = parents[0];
      const parentLeftX = parent.getLeftX() - offset;
      const parentRightX = parent.getRightX() + offset;
      const parentCenterX = parent.getCenterX();
      const parentBottomY = parent.getBottomY() + offset;

      if (numChildren === 1) {
        const childCenterX = childrenProps[0].centerX;
        const childTopY = childrenProps[0].topY;
        const isDouble = childrenProps[0].isAdopted;

        if (
          parentLeftX + padding < childCenterX &&
          childCenterX < parentRightX - padding &&
          childTopY > parentBottomY
        ) {
          //親一人、子一人、真下
          const v: Vertical = {
            isDouble: isDouble,
            x: childCenterX,
            y1: parentBottomY,
            y2: isDouble ? childTopY + margin / 2 : childTopY,
            color: color,
          };
          verticals.push(v);
        } else if (childTopY - margin > parentBottomY + margin) {
          //親一人、子一人、真下でないが垂直距離十分
          const v1: Vertical = {
            isDouble: isDouble,
            x: parentCenterX,
            y1: parentBottomY,
            y2: childTopY - margin,
            color: color,
          };
          const h: Horizontal = {
            isDouble: isDouble,
            x1: parentCenterX,
            x2: childCenterX,
            y: childTopY - margin,
          };
          const v2: Vertical = {
            isDouble,
            x: childCenterX,
            y1: childTopY - margin,
            y2: isDouble ? childTopY + margin / 2 : childTopY,
            color: color,
          };
          drawHorizontal(ctx, h);
          verticals.push(v1, v2);
        } else {
          if (childCenterX < parentCenterX) {
            //親一人、子一人、垂直距離が近すぎる又はこのほうが上、子が左
            const childRightX = childrenProps[0].rightX;
            const middleX = Math.min(
              (childCenterX + parentCenterX) / 2,
              childRightX + margin
            );

            const v1: Vertical = {
              isDouble: isDouble,
              x: parentCenterX,
              y1: parentBottomY,
              y2: parentBottomY + margin,
              color: color,
            };
            const h1: Horizontal = {
              isDouble: isDouble,
              x1: parentCenterX,
              x2: middleX,
              y: parentBottomY + margin,
            };
            const v2: Vertical = {
              isDouble: isDouble,
              x: middleX,
              y1: parentBottomY + margin,
              y2: childTopY - margin,
              color: color,
            };
            const h2: Horizontal = {
              isDouble: isDouble,
              x1: middleX,
              x2: childCenterX,
              y: childTopY - margin,
            };
            const v3: Vertical = {
              isDouble: isDouble,
              x: childCenterX,
              y1: childTopY - margin,
              y2: isDouble ? childTopY + margin / 2 : childTopY,
              color: color,
            };
            drawHorizontal(ctx, h1, h2);
            verticals.push(v1, v2, v3);
          } else {
            //親一人、子一人、垂直距離が近すぎる又は子のほうが上、子が右
            const childLeftX = childrenProps[0].leftX;
            const middleX = Math.max(
              (childCenterX + parentCenterX) / 2,
              childLeftX - margin
            );

            const v1: Vertical = {
              isDouble: isDouble,
              x: parentCenterX,
              y1: parentBottomY,
              y2: parentBottomY + margin,
              color: color,
            };
            const h1: Horizontal = {
              isDouble: isDouble,
              x1: parentCenterX,
              x2: middleX,
              y: parentBottomY + margin,
            };
            const v2: Vertical = {
              isDouble: isDouble,
              x: middleX,
              y1: parentBottomY + margin,
              y2: childTopY - margin,
              color: color,
            };
            const h2: Horizontal = {
              isDouble: isDouble,
              x1: middleX,
              x2: childCenterX,
              y: childTopY - margin,
            };
            const v3: Vertical = {
              isDouble: isDouble,
              x: childCenterX,
              y1: childTopY - margin,
              y2: isDouble ? childTopY + margin / 2 : childTopY,
              color: color,
            };
            drawHorizontal(ctx, h1, h2);
            verticals.push(v1, v2, v3);
          }
        }
      } else if (numChildren > 1) {
        const leftChildCenterX = childrenProps[0].centerX;
        const rightChildCenterX = childrenProps[numChildren - 1].centerX;
        const leftChildLeftX = childrenProps[0].leftX;
        const rightChildRightX = childrenProps[numChildren - 1].rightX;

        const allChildrenTopY = Math.min(...childrenProps.map((c) => c.topY));

        const middleChildX = (leftChildCenterX + rightChildCenterX) / 2;
        if (parentBottomY + margin < allChildrenTopY - margin) {
          if (
            leftChildCenterX + padding < parentRightX - padding &&
            parentLeftX + padding < rightChildCenterX - padding
          ) {
            //親一人、子複数、垂直距離十分、真下
            const middleX =
              (Math.max(leftChildCenterX, parentLeftX) +
                Math.min(rightChildCenterX, parentRightX)) /
              2;
            const v: Vertical = {
              isDouble: false,
              x: middleX,
              y1: parentBottomY,
              y2: allChildrenTopY - margin,
              color: color,
            };
            verticals.push(v);
          } else {
            if (middleChildX < parentCenterX) {
              //親一人、子複数、垂直距離十分、真下ではない、親が右
              const v: Vertical = {
                isDouble: false,
                y1: parentBottomY,
                y2: allChildrenTopY - margin,
                x: parentCenterX,
                color: color,
              };
              const h: Horizontal = {
                isDouble: false,
                x1: parentCenterX,
                x2: rightChildCenterX,
                y: allChildrenTopY - margin,
              };
              drawHorizontal(ctx, h);
              verticals.push(v);
            } else {
              //親一人、子複数、垂直距離十分、真下ではない、親が左
              const v: Vertical = {
                isDouble: false,
                y1: parentBottomY,
                y2: allChildrenTopY - margin,
                x: parentCenterX,
                color: color,
              };
              const h: Horizontal = {
                isDouble: false,
                x1: parentCenterX,
                x2: leftChildCenterX,
                y: allChildrenTopY - margin,
              };
              drawHorizontal(ctx, h);
              verticals.push(v);
            }
          }
        } else {
          if (middleChildX < parentCenterX) {
            //親一人、子複数、垂直距離が近すぎる又は子のほうが上、子が左
            const childX = Math.max(
              leftChildCenterX + padding,
              Math.min(parentLeftX - 2 * margin, rightChildCenterX - margin)
            );
            const middleX = Math.min(
              rightChildRightX + margin,
              parentLeftX - margin
            );
            const v1: Vertical = {
              isDouble: false,
              x: parentCenterX,
              y1: parentBottomY,
              y2: parentBottomY + margin,
              color: color,
            };
            const h1: Horizontal = {
              isDouble: false,
              x1: parentCenterX,
              x2: middleX,
              y: parentBottomY + margin,
            };
            const v2: Vertical = {
              isDouble: false,
              x: middleX,
              y1: parentBottomY + margin,
              y2: allChildrenTopY - 2 * margin,
              color: color,
            };
            const h2: Horizontal = {
              isDouble: false,
              x1: middleX,
              x2: childX,
              y: allChildrenTopY - 2 * margin,
            };
            const v3: Vertical = {
              isDouble: false,
              x: childX,
              y1: allChildrenTopY - 2 * margin,
              y2: allChildrenTopY - margin,
              color: color,
            };
            drawHorizontal(ctx, h1, h2);
            verticals.push(v1, v2, v3);
          } else {
            //親一人、子複数、垂直距離が近すぎる又は子のほうが上、子が右
            const childX = Math.min(
              rightChildCenterX - padding,
              Math.max(parentRightX + 2 * margin, leftChildCenterX + margin)
            );
            const middleX = Math.max(
              leftChildLeftX - margin,
              parentRightX + margin
            );
            const v1: Vertical = {
              isDouble: false,
              x: parentCenterX,
              y1: parentBottomY,
              y2: parentBottomY + margin,
              color: color,
            };
            const h1: Horizontal = {
              isDouble: false,
              x1: parentCenterX,
              x2: middleX,
              y: parentBottomY + margin,
            };
            const v2: Vertical = {
              isDouble: false,
              x: middleX,
              y1: parentBottomY + margin,
              y2: allChildrenTopY - 2 * margin,
              color: color,
            };
            const h2: Horizontal = {
              isDouble: false,
              x1: middleX,
              x2: childX,
              y: allChildrenTopY - 2 * margin,
            };
            const v3: Vertical = {
              isDouble: false,
              x: childX,
              y1: allChildrenTopY - 2 * margin,
              y2: allChildrenTopY - margin,
              color: color,
            };
            drawHorizontal(ctx, h1, h2);
            verticals.push(v1, v2, v3);
          }
        }

        const h: Horizontal = {
          isDouble: false,
          x1: leftChildCenterX,
          x2: rightChildCenterX,
          y: allChildrenTopY - margin,
        };
        drawHorizontal(ctx, h);

        for (const childProps of childrenProps) {
          const v: Vertical = {
            isDouble: childProps.isAdopted,
            x: childProps.centerX,
            y1: allChildrenTopY - margin,
            y2: childProps.isAdopted
              ? childProps.topY + margin / 2
              : childProps.topY,
            color: color,
          };
          verticals.push(v);
        }
      }
    } else {
      const [leftParent, rightParent] = parents.sort(
        (p1, p2) => p1.getCenterX() - p2.getCenterX()
      );

      const leftParentRightX = leftParent.getRightX() + offset;
      const leftParentTopY = leftParent.getTopY() - offset;
      const leftParentBottomY = leftParent.getBottomY() + offset;
      const leftParentCenterY = leftParent.getCenterY();

      const rightParentLeftX = rightParent.getLeftX() - offset;
      const rightParentTopY = rightParent.getTopY() - offset;
      const rightParentBottomY = rightParent.getBottomY() + offset;
      const rightParentCenterY = rightParent.getCenterY();

      const parentHorizontal: Horizontal = {
        isDouble: true,
        x1: 0,
        x2: 9,
        y: 0,
      };

      if (leftParentRightX + margin / 2 < rightParentLeftX - margin / 2) {
        const parentTopY = Math.max(leftParentTopY, rightParentTopY);
        const parentBottomY = Math.min(leftParentBottomY, rightParentBottomY);

        if (parentTopY + padding < parentBottomY - padding) {
          //二人の親の水平距離十分、垂直距離近い
          parentHorizontal.x1 = leftParentRightX;
          parentHorizontal.x2 = rightParentLeftX;
          parentHorizontal.y = (parentTopY + parentBottomY) / 2;
        } else {
          if (leftParentCenterY < rightParentCenterY) {
            //二人の親の水平距離十分、垂直距離遠い、左親が上
            const h: Horizontal = {
              isDouble: true,
              x1: leftParentRightX,
              x2: leftParentRightX + margin,
              y: leftParentCenterY,
            };
            const v: Vertical = {
              isDouble: true,
              x: leftParentRightX + margin,
              y1: leftParentCenterY,
              y2: rightParentCenterY,
              color: color,
            };
            parentHorizontal.x1 = leftParentRightX + margin;
            parentHorizontal.x2 = rightParentLeftX;
            parentHorizontal.y = rightParentCenterY;
            drawHorizontal(ctx, h);
            verticals.push(v);
          } else {
            //二人の親の水平距離十分、垂直距離遠い、左親が下
            const h: Horizontal = {
              isDouble: true,
              x1: rightParentLeftX,
              x2: rightParentLeftX - margin,
              y: rightParentCenterY,
            };
            const v: Vertical = {
              isDouble: true,
              x: rightParentLeftX - margin,
              y1: rightParentCenterY,
              y2: leftParentCenterY,
              color: color,
            };
            parentHorizontal.x1 = leftParentRightX;
            parentHorizontal.x2 = rightParentLeftX - margin;
            parentHorizontal.y = leftParentCenterY;
            drawHorizontal(ctx, h);
            verticals.push(v);
          }
        }
      } else {
        if (rightParentBottomY + margin / 2 < leftParentTopY - margin / 2) {
          //二人の親の水平距離が近すぎる、左親が十分に下
          const middleY = Math.max(
            (leftParentTopY + rightParentBottomY) / 2,
            leftParentTopY - margin
          );
          const h1: Horizontal = {
            isDouble: true,
            x1: rightParentLeftX,
            x2: rightParentLeftX - margin,
            y: rightParentCenterY,
          };
          const v1: Vertical = {
            isDouble: true,
            x: rightParentLeftX - margin,
            y1: rightParentCenterY,
            y2: middleY,
            color: color,
          };
          const h2: Horizontal = {
            isDouble: true,
            x1: rightParentLeftX - margin,
            x2: leftParentRightX + margin,
            y: middleY,
          };
          const v2: Vertical = {
            isDouble: true,
            x: leftParentRightX + margin,
            y1: middleY,
            y2: leftParentCenterY,
            color: color,
          };
          parentHorizontal.x1 = leftParentRightX;
          parentHorizontal.x2 = leftParentRightX + margin;
          parentHorizontal.y = leftParentCenterY;
          drawHorizontal(ctx, h1, h2);
          verticals.push(v1, v2);
        } else if (
          leftParentBottomY + margin / 2 <
          rightParentTopY - margin / 2
        ) {
          //二人の親の水平距離が近すぎる、左親が十分に上
          const middleY = Math.max(
            (leftParentTopY + rightParentBottomY) / 2,
            rightParentTopY - margin
          );
          const h1: Horizontal = {
            isDouble: true,
            x1: leftParentRightX,
            x2: leftParentRightX + margin,
            y: leftParentCenterY,
          };
          const v1: Vertical = {
            isDouble: true,
            x: leftParentRightX + margin,
            y1: leftParentCenterY,
            y2: middleY,
            color: color,
          };
          const h2: Horizontal = {
            isDouble: true,
            x1: leftParentRightX + margin,
            x2: rightParentLeftX - margin,
            y: middleY,
          };
          const v2: Vertical = {
            isDouble: true,
            x: rightParentLeftX - margin,
            y1: middleY,
            y2: rightParentCenterY,
            color: color,
          };
          parentHorizontal.x1 = rightParentLeftX - margin;
          parentHorizontal.x2 = rightParentLeftX;
          parentHorizontal.y = rightParentCenterY;
          drawHorizontal(ctx, h1, h2);
          verticals.push(v1, v2);
        } else {
          //二人の親の水平距離も垂直距離も近すぎる
          const parentBottomY = Math.max(leftParentBottomY, rightParentBottomY);
          const leftParentLeftX = leftParent.getLeftX() - offset;
          const rightParentRightX = rightParent.getRightX() + offset;

          const h1: Horizontal = {
            isDouble: true,
            x1: leftParentLeftX,
            x2: leftParentLeftX - margin,
            y: leftParentCenterY,
          };
          const v1: Vertical = {
            isDouble: true,
            x: leftParentLeftX - margin,
            y1: leftParentCenterY,
            y2: parentBottomY + margin,
            color: color,
          };
          parentHorizontal.x1 = leftParentLeftX - margin;
          parentHorizontal.x2 = rightParentRightX + margin;
          parentHorizontal.y = parentBottomY + margin;
          const v2: Vertical = {
            isDouble: true,
            x: rightParentRightX + margin,
            y1: parentBottomY + margin,
            y2: rightParentCenterY,
            color: color,
          };
          const h2: Horizontal = {
            isDouble: true,
            x1: rightParentRightX + margin,
            x2: rightParentRightX,
            y: rightParentCenterY,
          };
          drawHorizontal(ctx, h1, h2);
          verticals.push(v1, v2);
        }
      }

      drawHorizontal(ctx, parentHorizontal);

      const parentMiddleX = (parentHorizontal.x1 + parentHorizontal.x2) / 2;

      if (numChildren === 1) {
        const childCenterX = childrenProps[0].centerX;
        const childTopY = childrenProps[0].topY;
        const isDouble = childrenProps[0].isAdopted;

        if (
          parentHorizontal.x1 + padding < childCenterX &&
          childCenterX < parentHorizontal.x2 - padding
        ) {
          if (parentHorizontal.y + margin / 2 < childTopY - margin / 2) {
            //親二人、子一人、子が十分に下、真下
            const v: Vertical = {
              isDouble: isDouble,
              x: childCenterX,
              y1: parentHorizontal.y,
              y2: isDouble ? childTopY + margin / 2 : childTopY,
              color: color,
            };
            verticals.push(v);
          } else {
            if (childCenterX < parentMiddleX) {
              //親二人、子一人、子が十分に下でない、真下の左寄り
              const childRightX = childrenProps[0].rightX;
              const parentX = Math.min(
                childRightX + 2 * margin,
                parentHorizontal.x2 - padding
              );

              const v1: Vertical = {
                isDouble: isDouble,
                x: parentX,
                y1: parentHorizontal.y,
                y2: parentHorizontal.y + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: isDouble,
                x1: parentX,
                x2: childRightX + margin,
                y: parentHorizontal.y + margin,
              };
              const v2: Vertical = {
                isDouble: isDouble,
                x: childRightX + margin,
                y1: parentHorizontal.y + margin,
                y2: childTopY - margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: isDouble,
                x1: childRightX + margin,
                x2: childCenterX,
                y: childTopY - margin,
              };
              const v3: Vertical = {
                isDouble: isDouble,
                x: childCenterX,
                y1: childTopY - margin,
                y2: isDouble ? childTopY + margin / 2 : childTopY,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            } else {
              //親二人、子一人、子が十分に下でない、真下の右寄り
              const childLeftX = childrenProps[0].leftX;
              const parentX = Math.max(
                childLeftX - 2 * margin,
                parentHorizontal.x1 + padding
              );

              const v1: Vertical = {
                isDouble: isDouble,
                x: parentX,
                y1: parentHorizontal.y,
                y2: parentHorizontal.y + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: isDouble,
                x1: parentX,
                x2: childLeftX - margin,
                y: parentHorizontal.y + margin,
              };
              const v2: Vertical = {
                isDouble: isDouble,
                x: childLeftX - margin,
                y1: parentHorizontal.y + margin,
                y2: childTopY - margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: isDouble,
                x1: childLeftX - margin,
                x2: childCenterX,
                y: childTopY - margin,
              };
              const v3: Vertical = {
                isDouble: isDouble,
                x: childCenterX,
                y1: childTopY - margin,
                y2: isDouble ? childTopY + margin / 2 : childTopY,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            }
          }
        } else if (childCenterX <= parentHorizontal.x1 + padding) {
          const childRightX = childrenProps[0].rightX;

          if (
            childRightX + margin > leftParent.getLeftX() - offset &&
            leftParentBottomY > parentHorizontal.y
          ) {
            if (parentHorizontal.y + margin < childTopY - margin) {
              //親二人、子一人、子が十分に下、子はやや左
              const middleY =
                leftParentBottomY + margin / 2 < childTopY - margin / 2
                  ? Math.max(
                      childTopY - margin,
                      (childTopY + leftParentBottomY) / 2
                    )
                  : childTopY - margin;
              const parentX = Math.min(
                Math.max(parentHorizontal.x1 + margin, childRightX + margin),
                parentHorizontal.x2 - padding
              );

              const v1: Vertical = {
                isDouble: isDouble,
                x: parentX,
                y1: parentHorizontal.y,
                y2: middleY,
                color: color,
              };
              const h: Horizontal = {
                isDouble: isDouble,
                x1: parentX,
                x2: childCenterX,
                y: middleY,
              };
              const v2: Vertical = {
                isDouble: isDouble,
                x: childCenterX,
                y1: middleY,
                y2: isDouble ? childTopY + margin / 2 : childTopY,
                color: color,
              };
              drawHorizontal(ctx, h);
              verticals.push(v1, v2);
            } else {
              //親二人、子一人、子が十分に下でない、子はやや左
              const middleX = Math.max(leftParentRightX, childRightX) + margin;
              const parentX = Math.min(
                Math.max(parentHorizontal.x1 + margin, middleX + margin),
                parentHorizontal.x2 - padding
              );
              const v1: Vertical = {
                isDouble: isDouble,
                x: parentX,
                y1: parentHorizontal.y,
                y2: parentHorizontal.y + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: isDouble,
                x1: parentX,
                x2: middleX,
                y: parentHorizontal.y + margin,
              };
              const v2: Vertical = {
                isDouble: isDouble,
                x: middleX,
                y1: parentHorizontal.y + margin,
                y2: childTopY - margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: isDouble,
                x1: middleX,
                x2: childCenterX,
                y: childTopY - margin,
              };
              const v3: Vertical = {
                isDouble: isDouble,
                x: childCenterX,
                y1: childTopY - margin,
                y2: isDouble ? childTopY + margin / 2 : childTopY,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            }
          } else {
            const leftBottomY = Math.max(leftParentBottomY, parentHorizontal.y);
            const parentX = Math.min(
              Math.max(parentHorizontal.x1 + margin, childRightX + 2 * margin),
              parentHorizontal.x2 - padding
            );

            if (leftBottomY + margin / 2 < childTopY - margin / 2) {
              //親二人、子一人、子が十分に下、子は左
              const middleY = Math.max(
                childTopY - margin,
                (childTopY + leftBottomY) / 2
              );

              const v1: Vertical = {
                isDouble: isDouble,
                x: parentX,
                y1: parentHorizontal.y,
                y2: middleY,
                color: color,
              };
              const h: Horizontal = {
                isDouble: isDouble,
                x1: parentX,
                x2: childCenterX,
                y: middleY,
              };
              const v2: Vertical = {
                isDouble: isDouble,
                x: childCenterX,
                y1: middleY,
                y2: isDouble ? childTopY + margin / 2 : childTopY,
                color: color,
              };
              drawHorizontal(ctx, h);
              verticals.push(v1, v2);
            } else {
              //親二人、子一人、子が十分に下でない、子は左
              const v1: Vertical = {
                isDouble: isDouble,
                x: parentX,
                y1: parentHorizontal.y,
                y2: leftBottomY + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: isDouble,
                x1: parentX,
                x2: childRightX + margin,
                y: leftBottomY + margin,
              };
              const v2: Vertical = {
                isDouble: isDouble,
                x: childRightX + margin,
                y1: leftBottomY + margin,
                y2: childTopY - margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: isDouble,
                x1: childRightX + margin,
                x2: childCenterX,
                y: childTopY - margin,
              };
              const v3: Vertical = {
                isDouble: isDouble,
                x: childCenterX,
                y1: childTopY - margin,
                y2: isDouble ? childTopY + margin / 2 : childTopY,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            }
          }
        } else {
          const childLeftX = childrenProps[0].leftX;

          if (
            childLeftX - margin < rightParent.getRightX() + offset &&
            rightParentBottomY > parentHorizontal.y
          ) {
            if (parentHorizontal.y + margin < childTopY - margin) {
              //親二人、子一人、子が十分に下、子はやや右
              const middleY =
                rightParentBottomY + margin / 2 < childTopY - margin / 2
                  ? Math.max(
                      childTopY - margin,
                      (childTopY + rightParentBottomY) / 2
                    )
                  : childTopY - margin;
              const parentX = Math.max(
                Math.min(parentHorizontal.x2 - margin, childLeftX - margin),
                parentHorizontal.x1 + padding
              );

              const v1: Vertical = {
                isDouble: isDouble,
                x: parentX,
                y1: parentHorizontal.y,
                y2: middleY,
                color: color,
              };
              const h: Horizontal = {
                isDouble: isDouble,
                x1: parentX,
                x2: childCenterX,
                y: middleY,
              };
              const v2: Vertical = {
                isDouble: isDouble,
                x: childCenterX,
                y1: middleY,
                y2: isDouble ? childTopY + margin / 2 : childTopY,
                color: color,
              };
              drawHorizontal(ctx, h);
              verticals.push(v1, v2);
            } else {
              //親二人、子一人、子が十分に下でない、子はやや右
              const middleX = Math.min(rightParentLeftX, childLeftX) - margin;
              const parentX = Math.max(
                Math.min(parentHorizontal.x2 - margin, middleX - margin),
                parentHorizontal.x1 + padding
              );
              const v1: Vertical = {
                isDouble: isDouble,
                x: parentX,
                y1: parentHorizontal.y,
                y2: parentHorizontal.y + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: isDouble,
                x1: parentX,
                x2: middleX,
                y: parentHorizontal.y + margin,
              };
              const v2: Vertical = {
                isDouble: isDouble,
                x: middleX,
                y1: parentHorizontal.y + margin,
                y2: childTopY - margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: isDouble,
                x1: middleX,
                x2: childCenterX,
                y: childTopY - margin,
              };
              const v3: Vertical = {
                isDouble: isDouble,
                x: childCenterX,
                y1: childTopY - margin,
                y2: isDouble ? childTopY + margin / 2 : childTopY,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            }
          } else {
            const rightBottomY = Math.max(
              rightParentBottomY,
              parentHorizontal.y
            );
            const parentX = Math.max(
              Math.min(parentHorizontal.x2 - margin, childLeftX - 2 * margin),
              parentHorizontal.x1 + padding
            );

            if (rightBottomY + margin / 2 < childTopY - margin / 2) {
              //親二人、子一人、子が十分に下、子は右
              const middleY = Math.max(
                childTopY - margin,
                (childTopY + rightBottomY) / 2
              );

              const v1: Vertical = {
                isDouble: isDouble,
                x: parentX,
                y1: parentHorizontal.y,
                y2: middleY,
                color: color,
              };
              const h: Horizontal = {
                isDouble: isDouble,
                x1: parentX,
                x2: childCenterX,
                y: middleY,
              };
              const v2: Vertical = {
                isDouble: isDouble,
                x: childCenterX,
                y1: middleY,
                y2: isDouble ? childTopY + margin / 2 : childTopY,
                color: color,
              };
              drawHorizontal(ctx, h);
              verticals.push(v1, v2);
            } else {
              //親二人、子一人、子が十分に下でない、子は右
              const v1: Vertical = {
                isDouble: isDouble,
                x: parentX,
                y1: parentHorizontal.y,
                y2: rightBottomY + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: isDouble,
                x1: parentX,
                x2: childLeftX - margin,
                y: rightBottomY + margin,
              };
              const v2: Vertical = {
                isDouble: isDouble,
                x: childLeftX - margin,
                y1: rightBottomY + margin,
                y2: childTopY - margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: isDouble,
                x1: childLeftX - margin,
                x2: childCenterX,
                y: childTopY - margin,
              };
              const v3: Vertical = {
                isDouble: isDouble,
                x: childCenterX,
                y1: childTopY - margin,
                y2: isDouble ? childTopY + margin / 2 : childTopY,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            }
          }
        }
      } else if (numChildren > 1) {
        const leftChildCenterX = childrenProps[0].centerX;
        const rightChildCenterX = childrenProps[numChildren - 1].centerX;
        const leftChildLeftX = childrenProps[0].leftX;
        const rightChildRightX = childrenProps[numChildren - 1].rightX;

        const allChildrenTopY = Math.min(...childrenProps.map((c) => c.topY));

        const childMiddleX = (leftChildCenterX + rightChildCenterX) / 2;

        const leftX = Math.max(leftChildCenterX, parentHorizontal.x1);
        const rightX = Math.min(rightChildCenterX, parentHorizontal.x2);
        if (leftX + offset < rightX - offset) {
          if (parentHorizontal.y + margin < allChildrenTopY - margin) {
            //親二人、子複数、子が十分に下、真下
            const v: Vertical = {
              isDouble: false,
              x: (leftX + rightX) / 2,
              y1: parentHorizontal.y,
              y2: allChildrenTopY - margin,
              color: color,
            };
            verticals.push(v);
          } else {
            if (childMiddleX < parentMiddleX) {
              //親二人、子複数、子が十分に下でない、真下の左寄り
              const middleX =
                childrenProps[numChildren - 1].topY - padding >
                parentHorizontal.y + margin
                  ? rightChildCenterX + margin
                  : rightChildRightX + margin;
              const parentX = Math.min(
                middleX + margin,
                parentHorizontal.x2 - padding
              );
              const childX = Math.max(rightChildCenterX - margin, childMiddleX);

              const v1: Vertical = {
                isDouble: false,
                x: parentX,
                y1: parentHorizontal.y,
                y2: parentHorizontal.y + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: false,
                x1: parentX,
                x2: middleX,
                y: parentHorizontal.y + margin,
              };
              const v2: Vertical = {
                isDouble: false,
                x: middleX,
                y1: parentHorizontal.y + margin,
                y2: allChildrenTopY - 2 * margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: false,
                x1: middleX,
                x2: childX,
                y: allChildrenTopY - 2 * margin,
              };
              const v3: Vertical = {
                isDouble: false,
                x: childX,
                y1: allChildrenTopY - 2 * margin,
                y2: allChildrenTopY - margin,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            } else {
              //親二人、子複数、子が十分に下でない、真下の右寄り
              const middleX =
                childrenProps[0].topY - padding > parentHorizontal.y + margin
                  ? leftChildCenterX - margin
                  : leftChildLeftX - margin;
              const parentX = Math.max(
                middleX - margin,
                parentHorizontal.x1 + padding
              );
              const childX = Math.min(leftChildCenterX + margin, childMiddleX);

              const v1: Vertical = {
                isDouble: false,
                x: parentX,
                y1: parentHorizontal.y,
                y2: parentHorizontal.y + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: false,
                x1: parentX,
                x2: middleX,
                y: parentHorizontal.y + margin,
              };
              const v2: Vertical = {
                isDouble: false,
                x: middleX,
                y1: parentHorizontal.y + margin,
                y2: allChildrenTopY - 2 * margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: false,
                x1: middleX,
                x2: childX,
                y: allChildrenTopY - 2 * margin,
              };
              const v3: Vertical = {
                isDouble: false,
                x: childX,
                y1: allChildrenTopY - 2 * margin,
                y2: allChildrenTopY - margin,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            }
          }
        } else if (childMiddleX < parentMiddleX) {
          const childX = Math.max(rightChildCenterX - margin, childMiddleX);
          const rightX =
            childrenProps[numChildren - 1].topY - padding >
            leftParentBottomY + margin
              ? rightChildCenterX
              : rightChildRightX;

          if (
            rightX + margin > leftParent.getLeftX() - offset &&
            leftParentBottomY > parentHorizontal.y
          ) {
            if (parentHorizontal.y + margin < allChildrenTopY - 2 * margin) {
              //親二人、子複数、子が十分に下、子はやや左
              const middleY =
                leftParentBottomY + margin / 2 <
                allChildrenTopY - margin - margin / 2
                  ? Math.max(
                      allChildrenTopY - 2 * margin,
                      (allChildrenTopY - margin + leftParentBottomY) / 2
                    )
                  : allChildrenTopY - 2 * margin;
              const parentX = Math.min(
                Math.max(
                  parentHorizontal.x1 + margin,
                  rightChildCenterX + margin
                ),
                parentHorizontal.x2 - padding
              );

              const v1: Vertical = {
                isDouble: false,
                x: parentX,
                y1: parentHorizontal.y,
                y2: middleY,
                color: color,
              };
              const h: Horizontal = {
                isDouble: false,
                x1: parentX,
                x2: childX,
                y: middleY,
              };
              const v2: Vertical = {
                isDouble: false,
                x: childX,
                y1: middleY,
                y2: allChildrenTopY - margin,
                color: color,
              };
              drawHorizontal(ctx, h);
              verticals.push(v1, v2);
            } else {
              //親二人、子複数、子が十分に下でない、子はやや左
              const childRightX =
                childrenProps[numChildren - 1].topY - padding >
                parentHorizontal.y + margin
                  ? rightChildCenterX
                  : rightChildRightX;
              const middleX = Math.max(leftParentRightX, childRightX) + margin;
              const parentX = Math.min(
                Math.max(parentHorizontal.x1 + margin, middleX + margin),
                parentHorizontal.x2 - padding
              );
              const v1: Vertical = {
                isDouble: false,
                x: parentX,
                y1: parentHorizontal.y,
                y2: parentHorizontal.y + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: false,
                x1: parentX,
                x2: middleX,
                y: parentHorizontal.y + margin,
              };
              const v2: Vertical = {
                isDouble: false,
                x: middleX,
                y1: parentHorizontal.y + margin,
                y2: allChildrenTopY - 2 * margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: false,
                x1: middleX,
                x2: childX,
                y: allChildrenTopY - 2 * margin,
              };
              const v3: Vertical = {
                isDouble: false,
                x: childX,
                y1: allChildrenTopY - 2 * margin,
                y2: allChildrenTopY - margin,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            }
          } else {
            const leftBottomY = Math.max(leftParentBottomY, parentHorizontal.y);
            const middleX =
              childrenProps[numChildren - 1].topY - padding >
              leftBottomY + margin
                ? rightChildCenterX + margin
                : rightChildRightX + margin;
            const parentX = Math.min(
              Math.max(parentHorizontal.x1 + margin, middleX + margin),
              parentHorizontal.x2 - padding
            );

            if (
              leftBottomY + margin / 2 <
              allChildrenTopY - margin - margin / 2
            ) {
              //親二人、子複数、子が十分に下、子は左
              const middleY = Math.max(
                allChildrenTopY - 2 * margin,
                (allChildrenTopY - margin + leftBottomY) / 2
              );

              const v1: Vertical = {
                isDouble: false,
                x: parentX,
                y1: parentHorizontal.y,
                y2: middleY,
                color: color,
              };
              const h: Horizontal = {
                isDouble: false,
                x1: parentX,
                x2: childX,
                y: middleY,
              };
              const v2: Vertical = {
                isDouble: false,
                x: childX,
                y1: middleY,
                y2: allChildrenTopY - margin,
                color: color,
              };
              drawHorizontal(ctx, h);
              verticals.push(v1, v2);
            } else {
              //親二人、子一人、子が十分に下でない、子は左
              const v1: Vertical = {
                isDouble: false,
                x: parentX,
                y1: parentHorizontal.y,
                y2: leftBottomY + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: false,
                x1: parentX,
                x2: middleX,
                y: leftBottomY + margin,
              };
              const v2: Vertical = {
                isDouble: false,
                x: middleX,
                y1: leftBottomY + margin,
                y2: allChildrenTopY - 2 * margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: false,
                x1: middleX,
                x2: childX,
                y: allChildrenTopY - 2 * margin,
              };
              const v3: Vertical = {
                isDouble: false,
                x: childX,
                y1: allChildrenTopY - 2 * margin,
                y2: allChildrenTopY - margin,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            }
          }
        } else {
          const childX = Math.min(leftChildCenterX + margin, childMiddleX);
          const leftX =
            childrenProps[0].topY - padding > rightParentBottomY + margin
              ? leftChildCenterX
              : leftChildLeftX;

          if (
            leftX - margin < rightParent.getRightX() + offset &&
            rightParentBottomY > parentHorizontal.y
          ) {
            if (parentHorizontal.y + margin < allChildrenTopY - 2 * margin) {
              //親二人、子複数、子が十分に下、子はやや右
              const middleY =
                rightParentBottomY + margin / 2 <
                allChildrenTopY - margin - margin / 2
                  ? Math.max(
                      allChildrenTopY - 2 * margin,
                      (allChildrenTopY - margin + rightParentBottomY) / 2
                    )
                  : allChildrenTopY - 2 * margin;
              const parentX = Math.max(
                Math.min(
                  parentHorizontal.x2 - margin,
                  leftChildCenterX - margin
                ),
                parentHorizontal.x1 + padding
              );

              const v1: Vertical = {
                isDouble: false,
                x: parentX,
                y1: parentHorizontal.y,
                y2: middleY,
                color: color,
              };
              const h: Horizontal = {
                isDouble: false,
                x1: parentX,
                x2: childX,
                y: middleY,
              };
              const v2: Vertical = {
                isDouble: false,
                x: childX,
                y1: middleY,
                y2: allChildrenTopY - margin,
                color: color,
              };
              drawHorizontal(ctx, h);
              verticals.push(v1, v2);
            } else {
              //親二人、子複数、子が十分に下でない、子はやや右
              const childLeftX =
                childrenProps[0].topY - padding > parentHorizontal.y + margin
                  ? leftChildCenterX
                  : leftChildLeftX;
              const middleX = Math.min(rightParentLeftX, childLeftX) - margin;
              const parentX = Math.max(
                Math.min(parentHorizontal.x2 - margin, middleX - margin),
                parentHorizontal.x1 + padding
              );
              const v1: Vertical = {
                isDouble: false,
                x: parentX,
                y1: parentHorizontal.y,
                y2: parentHorizontal.y + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: false,
                x1: parentX,
                x2: middleX,
                y: parentHorizontal.y + margin,
              };
              const v2: Vertical = {
                isDouble: false,
                x: middleX,
                y1: parentHorizontal.y + margin,
                y2: allChildrenTopY - 2 * margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: false,
                x1: middleX,
                x2: childX,
                y: allChildrenTopY - 2 * margin,
              };
              const v3: Vertical = {
                isDouble: false,
                x: childX,
                y1: allChildrenTopY - 2 * margin,
                y2: allChildrenTopY - margin,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            }
          } else {
            const rightBottomY = Math.max(
              rightParentBottomY,
              parentHorizontal.y
            );
            const middleX =
              childrenProps[0].topY - padding > rightBottomY + margin
                ? leftChildCenterX - margin
                : leftChildLeftX - margin;
            const parentX = Math.max(
              Math.min(parentHorizontal.x2 - margin, middleX - margin),
              parentHorizontal.x1 + padding
            );

            if (
              rightBottomY + margin / 2 <
              allChildrenTopY - margin - margin / 2
            ) {
              //親二人、子複数、子が十分に下、子は右
              const middleY = Math.max(
                allChildrenTopY - 2 * margin,
                (allChildrenTopY - margin + rightBottomY) / 2
              );

              const v1: Vertical = {
                isDouble: false,
                x: parentX,
                y1: parentHorizontal.y,
                y2: middleY,
                color: color,
              };
              const h: Horizontal = {
                isDouble: false,
                x1: parentX,
                x2: childX,
                y: middleY,
              };
              const v2: Vertical = {
                isDouble: false,
                x: childX,
                y1: middleY,
                y2: allChildrenTopY - margin,
                color: color,
              };
              drawHorizontal(ctx, h);
              verticals.push(v1, v2);
            } else {
              //親二人、子一人、子が十分に下でない、子は右
              const v1: Vertical = {
                isDouble: false,
                x: parentX,
                y1: parentHorizontal.y,
                y2: rightBottomY + margin,
                color: color,
              };
              const h1: Horizontal = {
                isDouble: false,
                x1: parentX,
                x2: middleX,
                y: rightBottomY + margin,
              };
              const v2: Vertical = {
                isDouble: false,
                x: middleX,
                y1: rightBottomY + margin,
                y2: allChildrenTopY - 2 * margin,
                color: color,
              };
              const h2: Horizontal = {
                isDouble: false,
                x1: middleX,
                x2: childX,
                y: allChildrenTopY - 2 * margin,
              };
              const v3: Vertical = {
                isDouble: false,
                x: childX,
                y1: allChildrenTopY - 2 * margin,
                y2: allChildrenTopY - margin,
                color: color,
              };
              drawHorizontal(ctx, h1, h2);
              verticals.push(v1, v2, v3);
            }
          }
        }

        const h: Horizontal = {
          isDouble: false,
          x1: leftChildCenterX,
          x2: rightChildCenterX,
          y: allChildrenTopY - margin,
        };
        drawHorizontal(ctx, h);

        for (const childProps of childrenProps) {
          const v: Vertical = {
            isDouble: childProps.isAdopted,
            x: childProps.centerX,
            y1: allChildrenTopY - margin,
            y2: childProps.isAdopted
              ? childProps.topY + margin / 2
              : childProps.topY,
            color: color,
          };
          verticals.push(v);
        }
      }
    }
  }

  for (const v of verticals) {
    drawVertical(ctx, v);
  }
}

function drawRuler(
  ctx: CanvasRenderingContext2D,
  rect: RectPosition,
  ticks: { height: number; text: string }[],
  scale: number,
  displayTicks: boolean
) {
  let majorTick = 1;
  let minorTick = 1;
  const minSize = 80;
  const multi = 10;
  while (true) {
    if (majorTick * multi * scale > minSize / 2.5) {
      break;
    }
    minorTick = majorTick;
    majorTick *= 5;
    if (majorTick * multi * scale > minSize) {
      break;
    }
    minorTick = majorTick;
    majorTick *= 2;
  }

  const minorGrid = minorTick * multi;
  const minorLeft = Math.ceil(rect.left / minorGrid);
  const minorRight = Math.floor(rect.right / minorGrid);
  const minorTop = Math.ceil(rect.top / minorGrid);
  const minorBottom = Math.floor(rect.bottom / minorGrid);

  ctx.lineWidth = 1 / scale;
  if (displayTicks) {
    for (let i = minorLeft; i <= minorRight; i++) {
      if ((i * minorTick) % majorTick === 0) {
        ctx.strokeStyle = "rgb(187, 187, 187)";
        ctx.setLineDash([10 / scale, 5 / scale]);
        ctx.beginPath();
        ctx.moveTo(i * minorGrid, rect.top);
        ctx.lineTo(i * minorGrid, rect.bottom);
        ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(187, 187, 187, 0.4)";
        ctx.setLineDash([3 / scale, 3 / scale]);
        ctx.beginPath();
        ctx.moveTo(i * minorGrid, rect.top);
        ctx.lineTo(i * minorGrid, rect.bottom);
        ctx.stroke();
      }
    }
  }
  for (let i = minorTop; i <= minorBottom; i++) {
    if ((i * minorTick) % majorTick === 0) {
      if (displayTicks) {
        ctx.strokeStyle = "rgb(187, 187, 187)";
        ctx.setLineDash([10 / scale, 5 / scale]);
        ctx.beginPath();
        ctx.moveTo(rect.left, i * minorGrid);
        ctx.lineTo(rect.right, i * minorGrid);
        ctx.stroke();
      }
      if (i > 0) {
        ticks.push({ height: i * minorGrid, text: `${i * minorTick}年` });
      } else {
        ticks.push({
          height: i * minorGrid,
          text: `前${-i * majorTick + 1}年`,
        });
      }
    } else {
      if (displayTicks) {
        ctx.strokeStyle = "rgba(187, 187, 187, 0.4)";
        ctx.setLineDash([3 / scale, 3 / scale]);
        ctx.beginPath();
        ctx.moveTo(rect.left, i * minorGrid);
        ctx.lineTo(rect.right, i * minorGrid);
        ctx.stroke();
      }
    }
  }

  ctx.setLineDash([]);
}

function drawSpots(
  ctx: CanvasRenderingContext2D,
  spots: Map<number, Spot>,
  scale: number
) {
  for (const [, spot] of spots) {
    spot.draw(ctx, scale);
  }
}

export function drawFamilyTree(
  ctx: CanvasRenderingContext2D,
  familyTree: FamilyTree,
  rectPosition: RectPosition,
  scale: number,
  displayTicks: boolean
) {
  const ticks: { height: number; text: string }[] = [];
  drawRuler(ctx, rectPosition, ticks, scale, displayTicks);
  drawLines(ctx, familyTree);
  drawNames(ctx, familyTree.getPersonMap(), rectPosition);
  drawSpots(ctx, familyTree.getSpots(), scale);
  return ticks;
}
