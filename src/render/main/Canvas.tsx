import React, { useRef, useEffect, useState } from "react";
import { FamilyTree } from "../../model/FamilyTree";
import { drawFamilyTree } from "./DrawFamilyTree";
import { nullPosition, type Position } from "../../model/FundamentalData";
import {
  getEmptyPersonData,
  Person,
  personDataClone,
  type PersonData,
} from "../../model/Person";
import ContextMenu from "../../components/ContextMenu";
import type { MarriageData } from "../../model/Marriage";
import PersonMenu from "../../components/PersonMenu";
import { BackForwordList } from "../../model/BackForwordList";
import { off } from "process";
import Ticks from "./Ticks";
import { saveFamilyTree } from "../../components/saveData";

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
      className="title"
      type="text"
      style={{
        position: "absolute",
        top: margin,
        left: "30%",
        right: "30%",
        font: "MS PGothic",
        fontSize: "30px",
        fontWeight: "bold",
        textAlign: "center",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        backgroundColor: "rgba(0,0,0,0)",
      }}
      value={title}
      placeholder="タイトルを入力"
      onChange={(e) => setTitle(e.target.value)}
    />
  );
};

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [familyTree] = useState<FamilyTree>(new FamilyTree([], []));
  const [title, setTitle] = useState<string>("家系図");

  const backforwordListRef = useRef<BackForwordList<FamilyTree>>(
    new BackForwordList<FamilyTree>(
      100,
      () => {
        return new FamilyTree([], []);
      },
      (oldState: FamilyTree, newState: FamilyTree) => {
        oldState.load(newState);
      }
    )
  );

  const [updateTrigger, setUpdateTrigger] = useState(0);

  const offsetRef = useRef<Position>({x: 0, y:0})
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
  const [menuPosition, setMenuPosition] = useState<Position>(nullPosition());

  const [displayTicks, setDisplayTicks] = useState(true);
  const [moveWithDesents, setMoveWithDescents] = useState(false);
  const movingDesentsRef = useRef<Person[]>([])

  const margin = 50;
  const tickWidth = 100;
  const [ticks, setTicks] = useState<{height: number, text: string}[]>([])

  const canvasWidth = () => {
    return displayTicks ? windowWidth - 2 * margin - tickWidth : windowWidth - 2 * margin;
  };

  const canvasHeight = () => {
    return windowHeight - 3 * margin;
  };

  const selectedPerson = useRef<Person | undefined>(undefined);
  const selectedOffset = useRef<Position>({x: 0, y: 0})


  useEffect(() => {
    window.electronAPI?.onLoadData((path, content) => {loadFile(path, content, true)});
    window.electronAPI?.onLoadAndAddData((path, content) => {loadFile(path, content, false)});
    window.electronAPI?.onSendDataToMain((personData: PersonData) => {
      Person.formatData(personData);
      if (
        personData.id === -1 ||
        familyTree.findPersonById(personData.id) === undefined
      ) {
        personData.id = familyTree.getNextPersonId();
        familyTree
          .getPersonMap()
          .set(personData.id, new Person(personData, familyTree.getShowBywords(), familyTree.getShowYears(), familyTree.getIsVertical()));
        familyTree.nextPersonIdCountUp();
      } else {
        const targetPerson = familyTree.findPersonById(
          personData.id
        );
        if (targetPerson !== undefined) {
          targetPerson.update(personData);
        }
      }
      save();
      forceUpdate();
    })
    window.electronAPI?.onSaveFamilyTree(() => {
      saveFamilyTree(familyTree);
    });
    window.electronAPI?.onUndo(() => {
      if (backforwordListRef.current.canBack()) {
        const backData = backforwordListRef.current.getBackState();
        familyTree.load(backData);
        setTitle(familyTree.getTitle());
        forceUpdate();
      }
    });
    window.electronAPI?.onRedo(() => {
      if (backforwordListRef.current.canForword()) {
        const backData = backforwordListRef.current.getForwordState();
        familyTree.load(backData);
        setTitle(familyTree.getTitle());
        forceUpdate();
      }
    });
    window.electronAPI?.onMoveWithDescents(setMoveWithDescents);
    window.electronAPI?.onShowGrid((flag) => {
      setDisplayTicks(flag);
      forceUpdate();
    });
    window.electronAPI?.onAllClear(() => {
      familyTree.getMarriageMap().clear();
      familyTree.getPersonMap().clear();
      familyTree.setTitle("家系図")
      setTitle(familyTree.getTitle());
      save();
      forceUpdate();
    });
    window.electronAPI?.onShowBywords((flag) => {
      familyTree.setShowBywords(flag);
      save();
      forceUpdate();
    });
    window.electronAPI?.onShowYears((flag) => {
      familyTree.setShowYears(flag);
      save();
      forceUpdate();
    });
    window.electronAPI?.onIsVertical((flag) => {
      familyTree.setIsVertical(flag);
      save();
      forceUpdate();
    });
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    offsetRef.current = offset
    scaleRef.current = scale;
    ctx.scale(scale, scale);

    const unscaledUpperleft = unscaledPosition({x: 0, y: 0}, offset, scale);
    const unscaledLowerRight = unscaledPosition({x: canvasWidth(), y: canvasHeight()}, offset, scale)

    const newTicks = drawFamilyTree(ctx, familyTree, {top: unscaledUpperleft.y, left: unscaledUpperleft.x, bottom: unscaledLowerRight.y, right: unscaledLowerRight.x}, scale, displayTicks);
    setTicks(newTicks.map(({height, text}) => {return {height: height * scale + offset.y, text: text}}));

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
    backforwordListRef.current.save(familyTree);
  };

  const loadFile = (path:string, content: string, isLoadData: boolean) => {
    const idxSlash = path.lastIndexOf("\\");
    const idxDot = path.lastIndexOf(".");
    const idxStart = (idxSlash + 1 > idxDot) ? 0 : idxSlash + 1;

    const newTitle = path.slice(idxStart, idxDot);

    const data = JSON.parse(content);
    const personData: PersonData[] = data.personData;
    const marriageData: MarriageData[] = data.marriageData;

    const newFamilyTree = new FamilyTree(personData, marriageData);

    const canvasCenter: Position = {
      x: (canvasRef.current?.width ?? 0) / 2,
      y: (canvasRef.current?.height ?? 0) / 2,
    };
    if (isLoadData) {
      setTitle(newTitle);
      familyTree.load(newFamilyTree);
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
      const offseMarriageId = familyTree.getNextMarriageId();
      const offsetPosition: Position = {
        x: unscaledCanvasCenter.x - center.x,
        y: unscaledCanvasCenter.y - center.y,
      };

      for (const [, person] of newFamilyTree.getPersonMap()) {
        person.addOffset(offsetPosition, offsetPersonId, offseMarriageId, 0);
        familyTree.getPersonMap().set(person.getId(), person);
        familyTree.nextPersonIdCountUp();
      }
      for (const [, marriage] of newFamilyTree.getMarriageMap()) {
        marriage.addOffset(offsetPersonId, offseMarriageId);
        familyTree.getMarriageMap().set(marriage.getId(), marriage);
        familyTree.nextMarriageIdCountUp();
      }

      forceUpdate();
    }
    save();
  }

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
        selectedPerson.current?.changeColor();
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
        selectedPerson.current?.changeColor();
        selectedPerson.current = undefined;
        forceUpdate();
        setState(State.Usual);
      }
    }
    setContextMenuVisible(false);
    setPersonMenuVisible(false);
    setIsDragging(true);
    const unscaledMousePos = unscaledPosition(pos, offset, scale)
    movingPerson.current = familyTree.getSelectedPerson(
      unscaledMousePos
    );
    if (movingPerson.current !== undefined) {
      movingPerson.current.changeFont(FamilyTree.BOLD_FONT);
      if (moveWithDesents) {
        movingDesentsRef.current = familyTree.getAllDescents(movingPerson.current);
      }
      selectedOffset.current = {
        x: unscaledMousePos.x - movingPerson.current.getLeftX(),
        y: unscaledMousePos.y - movingPerson.current.getTopY()
      }
    }
    dragStart.current = { x: pos.x - offset.x, y: pos.y - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!isDragging) return;
    const pos = getMousePos(e);

    if (movingPerson.current === undefined) {
      setOffset({
        x: pos.x - dragStart.current.x,
        y: pos.y - dragStart.current.y,
      });
    } else {
      const unscaledPos = unscaledPosition(pos, offset, scale);
      const unscaledOffset: Position = {
        x: unscaledPos.x - movingPerson.current.getLeftX() - selectedOffset.current.x,
        y: unscaledPos.y - movingPerson.current.getTopY() - selectedOffset.current.y
      }
      movingPerson.current.addOffset(unscaledOffset, 0, 0, 0);
      if (moveWithDesents) {
        for (const descent of movingDesentsRef.current) {
          descent.addOffset(unscaledOffset, 0, 0, 0);
        }
      }
      setUpdateTrigger((prev) => prev + 1);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (movingPerson.current !== undefined) {
      movingPerson.current.changeFont(FamilyTree.NORMAL_FONT);
      forceUpdate();
      save();
    }
    setIsDragging(false);
    movingPerson.current = undefined;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY > 0 ? 1.1 : 1.0 / 1.1;
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
      y: prev.y - e.deltaY * 0.3
    }))
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const mousePos = getMousePos(e);
    if (selectedPerson.current !== undefined) {
      selectedPerson.current?.changeColor();
      selectedPerson.current = undefined;
      forceUpdate();
    }
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
      selectedPerson.current.changeColor("green");
      forceUpdate();
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

  const handleAddPerson = () => {
    const rescaledPos = unscaledPosition(
      { x: canvasWidth() / 2, y: canvasHeight() / 2 },
      offset,
      scale
    );
    window.electronAPI?.onOpenEditor(getEmptyPersonData(-1, rescaledPos));
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
        ref={canvasRef}
        width={canvasWidth()}
        height={canvasHeight()}
        style={{
          border: "1px solid black",
          zIndex: 0,
          position: "absolute",
          top: 2 * margin,
          left: margin,
          backgroundColor: "rgba(128, 253, 12, 0.27)",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
      />
      {displayTicks && (
        <Ticks top={2 * margin} left={margin + canvasWidth() + 2} width={tickWidth} height={canvasHeight()} ticks={ticks} onWheel={handleTicksWheel}/>
      )}
      {contextMenuVisible && (
        <ContextMenu
          position={menuPosition}
          familyTree={familyTree}
          canvasWidth={canvasWidth()}
          canvasHeight={canvasHeight()}
          onClose={() => setContextMenuVisible(false)}
          onAddPerson={handleAddPerson}
          onLoadData={() => {}}
          onBack={() => {
            if (backforwordListRef.current.canBack()) {
              const backData = backforwordListRef.current.getBackState();
              familyTree.load(backData);
              setTitle(familyTree.getTitle());
              forceUpdate();
            }
          }}
          canBack={backforwordListRef.current.canBack()}
          onForword={() => {
            if (backforwordListRef.current.canForword()) {
              const forwordData =
                backforwordListRef.current.getForwordState();
              familyTree.load(forwordData);
              setTitle(familyTree.getTitle());
              forceUpdate();
            }
          }}
          canForword={backforwordListRef.current.canForword()}
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
        />
      )}
    </div>    
  );
};

export default App;
