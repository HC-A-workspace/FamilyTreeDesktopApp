import { data } from "react-router-dom";
import { EventData } from "../../model/FundamentalData";
import "./PersonEditor.css";

interface SingleEventProps {
  event: EventData;
  placeholderText: string;
  onChange: (text: EventData) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const SingleItem: React.FC<SingleEventProps> = ({
  event,
  placeholderText,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  return (
    <div>
      <div id="list-input">
        <label>
          <input
            type="number"
            placeholder="年"
            value={event.date?.year ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || val === "0") {
                onChange({
                  ...event,
                  date: { ...event.date, year: undefined },
                });
              } else {
                onChange({
                  ...event,
                  date: { ...event.date, year: Number(val) },
                });
              }
            }}
            style={{ marginLeft: 0 }}
          />
          /
          <input
            type="number"
            placeholder="月"
            value={event.date?.month ?? ""}
            min={1}
            max={12}
            onChange={(e) => {
              const val = e.target.value;
              const month = Number(val);
              if (val === "" || month < 1 || month > 12) {
                onChange({
                  ...event,
                  date: { ...event.date, month: undefined },
                });
              } else {
                onChange({
                  ...event,
                  date: { ...event.date, month: Number(e.target.value) },
                });
              }
            }}
          />
          /
          <input
            type="number"
            placeholder="日"
            value={event.date?.day ?? ""}
            min={1}
            max={31}
            onChange={(e) => {
              const val = e.target.value;
              const day = Number(val);
              if (val === "" || day < 1 || day > 31) {
                onChange({
                  ...event,
                  date: { ...event.date, day: undefined },
                });
              } else {
                onChange({
                  ...event,
                  date: { ...event.date, day: Number(e.target.value) },
                });
              }
            }}
          />
        </label>
        <button onClick={onMoveUp}>上へ</button>
        <button onClick={onMoveDown}>下へ</button>
        <button onClick={onDelete}>ー 削除</button>
      </div>
      <div id="list-input">
        <input
          type="text"
          value={event.text}
          placeholder={placeholderText}
          onChange={(e) =>
            onChange({ text: e.target.value, date: { ...event.date } })
          }
        />
      </div>
    </div>
  );
};

interface EventEditorProps {
  events: EventData[];
  onChange: (idx: number, newEvent: EventData) => void;
  onAdd: () => void;
  onDelete: (idx: number) => void;
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
}

const EventEditor: React.FC<EventEditorProps> = ({
  events,
  onChange,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  if (events.length === 0) {
    events.push({ text: "" });
  }
  return (
    <div>
      {events.map((event, idx) => (
        <div key={idx}>
          <SingleItem
            event={event}
            onChange={(newEvent) => onChange(idx, newEvent)}
            onDelete={() => onDelete(idx)}
            onMoveUp={() => onMoveUp(idx)}
            onMoveDown={() => onMoveDown(idx)}
            placeholderText={`出来事 ${idx + 1}`}
          />
        </div>
      ))}
      <button onClick={onAdd} id="list-add-button">
        ＋ 出来事を追加
      </button>
    </div>
  );
};

export default EventEditor;
