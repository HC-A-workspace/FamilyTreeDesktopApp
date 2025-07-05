import "./PersonEditor.css";

interface SingleItemProps {
  item: string;
  placeholderText: string;
  onChange: (text: string) => void;
  onDelete: () => void;
}

const SingleItem: React.FC<SingleItemProps> = ({
  item,
  placeholderText,
  onChange,
  onDelete,
}) => {
  return (
    <div id="list-input">
      <input
        type="text"
        value={item}
        placeholder={placeholderText}
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={onDelete}>ー 削除</button>
    </div>
  );
};

interface ListEditorProps {
  list: string[];
  placeholder: string;
  onChange: (idx: number, newText: string) => void;
  onAdd: () => void;
  onDelete: (idx: number) => void;
}

const ListEditor: React.FC<ListEditorProps> = ({
  list,
  placeholder,
  onChange,
  onAdd,
  onDelete,
}) => {
  if (list.length === 0) {
    list.push("");
  }
  return (
    <div>
      {list.map((text, idx) => (
        <div key={idx}>
          <SingleItem
            item={text}
            onChange={(text) => onChange(idx, text)}
            onDelete={() => onDelete(idx)}
            placeholderText={`${placeholder} ${idx + 1}`}
          />
        </div>
      ))}
      <button onClick={onAdd} id="list-add-button">
        ＋ {placeholder}を追加
      </button>
    </div>
  );
};

export default ListEditor;
