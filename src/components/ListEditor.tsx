import React from "react";

interface SingleItemProps {
  item: string;
  width: number;
  placeholderText: string;
  onChange: (text: string) => void;
  onDelete: () => void;
}

const SingleItem: React.FC<SingleItemProps> = ({
  item,
  width,
  placeholderText,
  onChange,
  onDelete,
}) => {
  return (
    <div style={{ display: "flex" }}>
      <input
        type="text"
        value={item}
        placeholder={placeholderText}
        style={{
          width: width * 0.6,
          margin: 10,
          marginBottom: 4,
          marginTop: 4,
          font: "400 18px 'Yu Gothic'",
        }}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        onClick={onDelete}
        style={{
          width: width * 0.2,
          font: "700 15px 'Yu Gothic",
          marginBottom: 4,
          marginTop: 4,
          border: "1px solid black",
          backgroundColor: "rgb(255, 255, 255)",
        }}
      >
        削除
      </button>
    </div>
  );
};

interface ListEditorProps {
  list: string[];
  width: number;
  placeholder: string;
  onChange: (idx: number, newText: string) => void;
  onAdd: () => void;
  onDelete: (idx: number) => void;
}

const ListEditor: React.FC<ListEditorProps> = ({
  list,
  width,
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
        <React.Fragment key={idx}>
          <SingleItem
            item={text}
            width={width}
            onChange={(text) => onChange(idx, text)}
            onDelete={() => onDelete(idx)}
            placeholderText={`${placeholder} ${idx + 1}`}
          />
        </React.Fragment>
      ))}
      <button
        onClick={onAdd}
        style={{
          width: width * 0.3,
          font: "700 15px 'Yu Gothic",
          margin: 10,
          marginBottom: 4,
          marginTop: 4,
          border: "1px solid black",
          backgroundColor: "rgb(255, 255, 255)",
        }}
      >
        {placeholder}を追加
      </button>
    </div>
  );
};

export default ListEditor;
