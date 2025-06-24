import React, { useRef, useEffect, useState } from "react";
import { FamilyTree, FamilyTreeSetting } from "../../model/FamilyTree";
import { drawFamilyTree } from "./DrawFamilyTree";
import { type Position } from "../../model/FundamentalData";
import {
  getEmptyPersonData,
  Person,
  type PersonData,
} from "../../model/Person";
import ContextMenu from "../menu/ContextMenu";
import type { MarriageData } from "../../model/Marriage";
import PersonMenu from "../menu/PersonMenu";
import { UndoRedoList } from "../../model/UndoRedoList";
import Ticks from "./Ticks";
import { saveFamilyTree } from "../../components/saveData";
import { Spot, SpotData } from "../../model/Spot";
import SpotEditor from "../editor/SpotEditor";
import SpotMenu from "../menu/SpotMenu";
import "./Canvas.css";

export const State = {
  Usual: 0,
  SelectingSpouse: 1,
  SelectingChild: 2,
  SelectingParent: 3,
  SelectingBrother: 4,
  SelectingAdoptedChild: 5,
  SelectingAdoptedParent: 6,
  CancellingRelation: 7,
} as const;

export type State = (typeof State)[keyof typeof State];

function unscaledPosition(
  position: Position,
  offset: Position,
  scale: number
): Position {
  return {
    x: (position.x - offset.x) / scale,
    y: (position.y - offset.y) / scale,
  };
}

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

interface TitleProps {
  margin: number;
  title: string;
  setTitle: (newTitle: string) => void;
}

const Title: React.FC<TitleProps> = ({ margin, title, setTitle }) => {
  return (
    <input
      id="title"
      type="text"
      value={title}
      placeholder="タイトルを入力"
      onChange={(e) => setTitle(e.target.value)}
    />
  );
};

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [familyTree] = useState<FamilyTree>(
    new FamilyTree([], [], [], FamilyTree.setting)
  );
  const [title, setTitle] = useState<string>("家系図");

  const undoRedoListRef = useRef<UndoRedoList<FamilyTree>>(
    new UndoRedoList<FamilyTree>(
      100,
      () => {
        return new FamilyTree([], [], [], FamilyTree.setting);
      },
      (oldState: FamilyTree, newState: FamilyTree) => {
        oldState.load(newState, FamilyTree.setting);
      }
    )
  );

  const [updateTrigger, setUpdateTrigger] = useState(0);

  const offsetRef = useRef<Position>({ x: 0, y: 0 });
  const scaleRef = useRef(1);

  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1.0);
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const [isDragging, setIsDragging] = useState(false);
  const movingPerson = useRef<Person | undefined>(undefined);
  const dragStart = useRef({ x: 0, y: 0 });

  const [state, setState] = useState<State>(State.Usual);

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [personMenuVisible, setPersonMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<Position>({ x: 0, y: 0 });

  const [displayTicks, setDisplayTicks] = useState(true);
  const [displayGrid, setDisplayGrid] = useState(true);
  const [moveWithDesents, setMoveWithDescents] = useState(false);
  const movingDesentsRef = useRef<Person[]>([]);

  const margin = 50;
  const tickWidth = 100;
  const [ticks, setTicks] = useState<{ height: number; text: string }[]>([]);

  const canvasWidth = () => {
    return displayTicks
      ? windowWidth - margin - tickWidth
      : windowWidth - 2 * margin;
  };

  const canvasHeight = () => {
    return windowHeight - 2 * margin;
  };

  const selectedPerson = useRef<Person | undefined>(undefined);
  const selectedOffset = useRef<Position>({ x: 0, y: 0 });

  const movingSpot = useRef<Spot | undefined>(undefined);
  const [displaySpotEditor, setDisplaySpotEditor] = useState(false);

  const [displaySpotMenu, setDisplaySpotMenu] = useState(false);

  useEffect(() => {
    window.electronAPI?.onLoadData((path, content) => {
      loadFile(path, content, true);
    });
    window.electronAPI?.onLoadAndAddData((path, content) => {
      loadFile(path, content, false);
    });
    window.electronAPI?.onSendDataToMain((personData: PersonData) => {
      Person.formatData(personData);
      if (
        personData.id === -1 ||
        familyTree.findPersonById(personData.id) === undefined
      ) {
        personData.id = familyTree.getNextPersonId();
        familyTree.getPersonMap().set(personData.id, new Person(personData));
        familyTree.nextPersonIdCountUp();
      } else {
        const targetPerson = familyTree.findPersonById(personData.id);
        if (targetPerson !== undefined) {
          targetPerson.update(personData);
        }
      }
      save();
      forceUpdate();
    });
    window.electronAPI?.onSaveFamilyTree(() => {
      saveFamilyTree(familyTree);
    });
    window.electronAPI?.onUndo(() => {
      if (undoRedoListRef.current.canUndo()) {
        const undoData = undoRedoListRef.current.getUndoState();
        familyTree.load(undoData, FamilyTree.setting);
        setTitle(familyTree.getTitle());
        forceUpdate();
      }
    });
    window.electronAPI?.onRedo(() => {
      if (undoRedoListRef.current.canRedo()) {
        const redoData = undoRedoListRef.current.getRedoState();
        familyTree.load(redoData, FamilyTree.setting);
        setTitle(familyTree.getTitle());
        forceUpdate();
      }
    });
    window.electronAPI?.onCreateNewPerson(() => {
      handleAddPerson(true);
    });
    window.electronAPI?.onMoveWithDescents(setMoveWithDescents);
    window.electronAPI?.onShowGrid((flag) => {
      setDisplayGrid(flag);
      forceUpdate();
    });
    window.electronAPI?.onAllClear(() => {
      familyTree.getMarriageMap().clear();
      familyTree.getPersonMap().clear();
      familyTree.getSpots().clear();
      familyTree.setTitle("家系図");
      setTitle(familyTree.getTitle());
      save();
      forceUpdate();
    });
    window.electronAPI?.onShowBywords((flag) => {
      familyTree.setShowBywords(flag);
      forceUpdate();
    });
    window.electronAPI?.onShowYears((flag) => {
      familyTree.setShowYears(flag);
      forceUpdate();
    });
    window.electronAPI?.onIsVertical((flag) => {
      familyTree.setIsVertical(flag);
      forceUpdate();
    });
    window.electronAPI?.onOpenSettingEditor(() => {
      window.electronAPI?.openSettingEditor(FamilyTree.setting);
    });
    window.electronAPI?.onSendSettingToMain((setting) => {
      setDisplayGrid(setting.showGrid);
      setDisplayTicks(setting.showSideYear);
      familyTree.setFamilyTreeSetting(setting);
      forceUpdate();
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    offsetRef.current = offset;
    scaleRef.current = scale;
    ctx.scale(scale, scale);

    const unscaledUpperleft = unscaledPosition({ x: 0, y: 0 }, offset, scale);
    const unscaledLowerRight = unscaledPosition(
      { x: canvasWidth(), y: canvasHeight() },
      offset,
      scale
    );

    const newTicks = drawFamilyTree(
      ctx,
      familyTree,
      {
        top: unscaledUpperleft.y,
        left: unscaledUpperleft.x,
        bottom: unscaledLowerRight.y,
        right: unscaledLowerRight.x,
      },
      scale,
      displayGrid
    );
    if (displayTicks) {
      setTicks(
        newTicks.map(({ height, text }) => {
          return { height: height * scale + offset.y, text: text };
        })
      );
    } else {
      setTicks([]);
    }

    ctx.restore();
  }, [
    familyTree,
    offset,
    scale,
    updateTrigger,
    state,
    windowWidth,
    windowHeight,
  ]);

  const save = () => {
    undoRedoListRef.current.save(familyTree);
  };

  const loadFile = (path: string, content: string, isLoadData: boolean) => {
    const idxSlash = path.lastIndexOf("\\");
    const idxDot = path.lastIndexOf(".");
    const idxStart = idxSlash + 1 > idxDot ? 0 : idxSlash + 1;

    const newTitle = path.slice(idxStart, idxDot);

    const data = JSON.parse(content);
    const personData: PersonData[] = data.personData;
    const marriageData: MarriageData[] = data.marriageData;
    const spotData: SpotData[] = data.spotData;
    const setting: FamilyTreeSetting = data.familyTreeSetting;

    const newFamilyTree = new FamilyTree(
      personData,
      marriageData,
      spotData,
      setting
    );

    const canvasCenter: Position = {
      x: (canvasRef.current?.width ?? 0) / 2,
      y: (canvasRef.current?.height ?? 0) / 2,
    };
    if (isLoadData) {
      setTitle(newTitle);
      familyTree.load(newFamilyTree, setting);
      familyTree.setTitle(newTitle);
      const center: Position = {
        x: (familyTree.getRightX() + familyTree.getLeftX()) / 2,
        y: (familyTree.getBottomY() + familyTree.getTopY()) / 2,
      };
      setOffset({ x: canvasCenter.x - center.x, y: canvasCenter.y - center.y });
      setScale(1);
    } else {
      const center: Position = {
        x: (newFamilyTree.getRightX() + newFamilyTree.getLeftX()) / 2,
        y: (newFamilyTree.getBottomY() + newFamilyTree.getTopY()) / 2,
      };
      const unscaledCanvasCenter = unscaledPosition(
        canvasCenter,
        offsetRef.current,
        scaleRef.current
      );
      const offsetPersonId = familyTree.getNextPersonId();
      const offsetMarriageId = familyTree.getNextMarriageId();
      const offsetSpotId = familyTree.getNextSpotId();
      const offsetPosition: Position = {
        x: unscaledCanvasCenter.x - center.x,
        y: unscaledCanvasCenter.y - center.y,
      };

      for (const [, person] of newFamilyTree.getPersonMap()) {
        person.addOffset(offsetPosition, offsetPersonId, offsetMarriageId, 0);
        familyTree.getPersonMap().set(person.getId(), person);
        familyTree.nextPersonIdCountUp();
      }
      for (const [, marriage] of newFamilyTree.getMarriageMap()) {
        marriage.addOffset(offsetPersonId, offsetMarriageId);
        familyTree.getMarriageMap().set(marriage.getId(), marriage);
        familyTree.nextMarriageIdCountUp();
      }
      for (const [, spot] of newFamilyTree.getSpots()) {
        spot.addOffSet(offsetSpotId, offsetPosition);
        familyTree.getSpots().set(spot.getId(), spot);
        familyTree.nextSpotIdCountUp();
      }

      forceUpdate();
    }
    save();
  };

  const getMousePos = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    };
  };

  const forceUpdate = () => {
    setUpdateTrigger((prev) => prev + 1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const pos: Position = getMousePos(e);

    if (selectedPerson.current !== undefined) {
      const secondSelectedPerson = familyTree.getSelectedPerson(
        unscaledPosition(pos, offset, scale)
      );
      if (
        secondSelectedPerson !== undefined &&
        secondSelectedPerson.getId() !== selectedPerson.current.getId()
      ) {
        let isSuccessed = false;
        switch (state) {
          case State.SelectingSpouse:
            isSuccessed = familyTree.makeSpouses(
              selectedPerson.current,
              secondSelectedPerson
            );
            break;
          case State.SelectingChild:
            isSuccessed = familyTree.makeChild(
              selectedPerson.current,
              secondSelectedPerson
            );
            break;
          case State.SelectingParent:
            isSuccessed = familyTree.makeChild(
              secondSelectedPerson,
              selectedPerson.current
            );
            break;
          case State.SelectingBrother:
            isSuccessed = familyTree.makeBrother(
              selectedPerson.current,
              secondSelectedPerson
            );
            break;
          case State.SelectingAdoptedChild:
            isSuccessed = familyTree.makeAdoptedChild(
              selectedPerson.current,
              secondSelectedPerson
            );
            break;
          case State.SelectingAdoptedParent:
            isSuccessed = familyTree.makeAdoptedChild(
              secondSelectedPerson,
              selectedPerson.current
            );
            break;
          case State.CancellingRelation:
            isSuccessed = familyTree.deleteRelation(
              selectedPerson.current,
              secondSelectedPerson
            );
            break;
          default:
            break;
        }
        if (isSuccessed) save();
        selectedPerson.current = undefined;
        forceUpdate();
        setState(State.Usual);
      } else if (state === State.Usual) {
        selectedPerson.current = undefined;
        forceUpdate();
        setState(State.Usual);
      }
    }
    const unscaledMousePos = unscaledPosition(pos, offset, scale);
    movingSpot.current = familyTree.getSpotAt(unscaledMousePos, scale);
    if (movingSpot.current !== undefined) {
      selectedOffset.current = {
        x: unscaledMousePos.x - movingSpot.current.getLeftX(),
        y: unscaledMousePos.y - movingSpot.current.getTopY(),
      };
    } else {
      movingPerson.current = familyTree.getSelectedPerson(unscaledMousePos);
      if (movingPerson.current !== undefined) {
        movingPerson.current.setIsSelected(true);
        if (moveWithDesents) {
          movingDesentsRef.current = familyTree.getAllDescents(
            movingPerson.current
          );
        }
        selectedOffset.current = {
          x: unscaledMousePos.x - movingPerson.current.getLeftX(),
          y: unscaledMousePos.y - movingPerson.current.getTopY(),
        };
        forceUpdate();
      }
    }
    setContextMenuVisible(false);
    setPersonMenuVisible(false);
    setDisplaySpotEditor(false);
    setDisplaySpotMenu(false);
    setIsDragging(true);
    dragStart.current = { x: pos.x - offset.x, y: pos.y - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!isDragging) return;
    const pos = getMousePos(e);

    if (movingSpot.current !== undefined) {
      const unscaledPos = unscaledPosition(pos, offset, scale);
      const moveto: Position = {
        x: unscaledPos.x - selectedOffset.current.x,
        y: unscaledPos.y - selectedOffset.current.y,
      };
      movingSpot.current.setPosition(moveto);
      forceUpdate();
    } else if (movingPerson.current === undefined) {
      setOffset({
        x: pos.x - dragStart.current.x,
        y: pos.y - dragStart.current.y,
      });
    } else {
      const unscaledPos = unscaledPosition(pos, offset, scale);
      const unscaledOffset: Position = {
        x:
          unscaledPos.x -
          movingPerson.current.getLeftX() -
          selectedOffset.current.x,
        y:
          unscaledPos.y -
          movingPerson.current.getTopY() -
          selectedOffset.current.y,
      };
      if (movingPerson.current.getIsFixedVertically()) {
        unscaledOffset.y = 0;
      }
      movingPerson.current.addOffset(unscaledOffset, 0, 0, 0);
      if (moveWithDesents) {
        for (const descent of movingDesentsRef.current) {
          const isFixed = descent.getIsFixedVertically();
          descent.setIsFixedVertically(false);
          descent.addOffset(unscaledOffset, 0, 0, 0);
          descent.setIsFixedVertically(isFixed);
        }
      }
      forceUpdate();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (movingPerson.current !== undefined) {
      movingPerson.current.setIsSelected(false);
      forceUpdate();
      save();
    }
    setIsDragging(false);
    movingSpot.current = undefined;
    movingPerson.current = undefined;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY < 0 ? 1.1 : 1.0 / 1.1;
    const mouse = getMousePos(e);

    setScale((prev) => prev * zoomFactor);
    setOffset((prev) => ({
      x: mouse.x - (mouse.x - prev.x) * zoomFactor,
      y: mouse.y - (mouse.y - prev.y) * zoomFactor,
    }));
  };

  const handleTicksWheel = (e: React.WheelEvent) => {
    setOffset((prev) => ({
      x: prev.x,
      y: prev.y - e.deltaY * 0.3,
    }));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const mousePos = getMousePos(e);
    if (selectedPerson.current !== undefined) {
      selectedPerson.current = undefined;
      forceUpdate();
    }
    const spot = familyTree.getSpotAt(
      unscaledPosition(mousePos, offset, scale),
      scale
    );
    if (spot !== undefined) {
      editiongSpotData.current = {
        id: spot.getData().id,
        text: spot.getData().text,
        position: { ...spot.getData().position },
      };
      setContextMenuVisible(false);
      setPersonMenuVisible(false);
      setDisplaySpotMenu(true);
    } else {
      const person = familyTree.getSelectedPerson(
        unscaledPosition(mousePos, offset, scale)
      );
      if (person === undefined) {
        setContextMenuVisible(true);
        setPersonMenuVisible(false);
      } else {
        setPersonMenuVisible(true);
        setContextMenuVisible(false);
        selectedPerson.current = person;
        forceUpdate();
      }
      setDisplaySpotMenu(false);
    }
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDeletePerson = () => {
    if (selectedPerson.current !== undefined) {
      familyTree.deletePerson(selectedPerson.current);
      selectedPerson.current = undefined;
      forceUpdate();
      save();
    }
  };

  const handleAddPerson = (isCenter: boolean) => {
    const pos: Position = isCenter
      ? { x: canvasWidth() / 2, y: canvasHeight() / 2 }
      : menuPosition;
    const unscaledPos = unscaledPosition(pos, offset, scale);
    window.electronAPI?.onOpenEditor(getEmptyPersonData(-1, unscaledPos));
  };

  const editiongSpotData = useRef<SpotData | undefined>(undefined);

  const handleAddSpot = () => {
    editiongSpotData.current = {
      id: -1,
      text: "",
      position: unscaledPosition(menuPosition, offset, scale),
    };
    setDisplaySpotEditor(true);
  };

  const pressedKeyRef = useRef(new Set<string>([]));
  const isShiftPressed = () => {
    return (
      pressedKeyRef.current.has("ShiftLeft") ||
      pressedKeyRef.current.has("ShiftRight")
    );
  };
  const isControlPressed = () => {
    return (
      pressedKeyRef.current.has("ControlLeft") ||
      pressedKeyRef.current.has("ControlRight")
    );
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const keyCode = e.code;
    const shift = 26;
    const zoomFactor = 1.1;
    const center: Position = {
      x: canvasWidth() / 2,
      y: canvasHeight() / 2,
    };
    pressedKeyRef.current.add(keyCode);
    if (keyCode === "KeyW" || keyCode === "ArrowUp") {
      setOffset({
        x: offset.x,
        y: offset.y + shift,
      });
    } else if (keyCode === "KeyA" || keyCode === "ArrowLeft") {
      setOffset({
        x: offset.x + shift,
        y: offset.y,
      });
    } else if (keyCode === "KeyS" || keyCode === "ArrowDown") {
      setOffset({
        x: offset.x,
        y: offset.y - shift,
      });
    } else if (keyCode === "KeyD" || keyCode === "ArrowRight") {
      setOffset({
        x: offset.x - shift,
        y: offset.y,
      });
    } else if (
      keyCode === "Semicolon" &&
      isShiftPressed() &&
      isControlPressed()
    ) {
      setScale((prev) => prev * zoomFactor);
      setOffset((prev) => ({
        x: center.x - (center.x - prev.x) * zoomFactor,
        y: center.y - (center.y - prev.y) * zoomFactor,
      }));
    } else if (keyCode === "Minus" && isShiftPressed() && isControlPressed()) {
      setScale((prev) => prev / zoomFactor);
      setOffset((prev) => ({
        x: center.x - (center.x - prev.x) / zoomFactor,
        y: center.y - (center.y - prev.y) / zoomFactor,
      }));
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    const keyCode = e.code;
    pressedKeyRef.current.delete(keyCode);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: windowWidth,
        height: windowHeight,
        backgroundColor: "rgb(255, 255, 255)",
      }}
    >
      <Title
        margin={margin}
        title={title}
        setTitle={(newTitle) => {
          familyTree.setTitle(newTitle);
          save();
          setTitle(newTitle);
        }}
      />
      <canvas
        className="canvas"
        ref={canvasRef}
        width={canvasWidth()}
        height={canvasHeight()}
        style={{
          top: margin,
          left: margin,
          backgroundColor: FamilyTree.setting.backgroundColor,
          borderColor: FamilyTree.setting.borderColor,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      />
      {displayTicks && (
        <Ticks
          top={margin}
          left={margin + canvasWidth()}
          width={tickWidth}
          height={canvasHeight()}
          ticks={ticks}
          onWheel={handleTicksWheel}
        />
      )}
      {contextMenuVisible && (
        <ContextMenu
          position={menuPosition}
          canvasWidth={canvasWidth()}
          canvasHeight={canvasHeight()}
          onClose={() => setContextMenuVisible(false)}
          onAddPerson={() => handleAddPerson(false)}
          onAddSpot={handleAddSpot}
        />
      )}
      {personMenuVisible && selectedPerson.current !== undefined && (
        <PersonMenu
          position={menuPosition}
          familyTree={familyTree}
          selectedPerson={selectedPerson.current}
          canvasWidth={canvasWidth()}
          canvasHeight={canvasHeight()}
          onClose={() => setPersonMenuVisible(false)}
          onDeletePerson={handleDeletePerson}
          onSetState={(state) => setState(state)}
          onEditPerson={() => {
            if (selectedPerson.current !== undefined) {
              window.electronAPI?.onOpenEditor(selectedPerson.current.raw());
            }
          }}
          onShowPerson={() => {
            if (selectedPerson.current !== undefined) {
              window.electronAPI?.onOpenEditor(selectedPerson.current.raw());
            }
          }}
          onFixVertically={() => {
            if (selectedPerson.current !== undefined) {
              selectedPerson.current.setIsFixedVertically(
                !selectedPerson.current.getIsFixedVertically()
              );
            }
          }}
        />
      )}
      {displaySpotEditor && editiongSpotData.current !== undefined && (
        <SpotEditor
          spot={editiongSpotData.current}
          position={menuPosition}
          onClose={() => setDisplaySpotEditor(false)}
          onSave={(text) => {
            if (editiongSpotData.current !== undefined) {
              editiongSpotData.current.text = text;
              if (editiongSpotData.current.id === -1) {
                editiongSpotData.current.id = familyTree.getNextSpotId();
                familyTree.addSpot(new Spot(editiongSpotData.current));
                familyTree.nextSpotIdCountUp();
              } else {
                familyTree
                  .getSpots()
                  .get(editiongSpotData.current.id)
                  ?.setText(text);
              }
              forceUpdate();
              save();
              editiongSpotData.current = undefined;
            }
          }}
        />
      )}
      {displaySpotMenu && editiongSpotData.current !== undefined && (
        <SpotMenu
          position={menuPosition}
          canvasWidth={canvasWidth()}
          canvasHeight={canvasHeight()}
          onClose={() => setDisplaySpotMenu(false)}
          onDeleteSpot={() => {
            if (editiongSpotData.current !== undefined) {
              familyTree.deleteSpot(editiongSpotData.current.id);
              forceUpdate();
              save();
              editiongSpotData.current = undefined;
            }
          }}
          onEditSpot={() => {
            setDisplaySpotEditor(true);
          }}
        />
      )}
    </div>
  );
};

export default App;
