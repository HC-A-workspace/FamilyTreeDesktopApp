import { useEffect, useState } from "react";
import { Field, SearchResult } from "../../model/FundamentalData";
import { Person } from "../../model/Person";
import "./SearchWindow.css";
import { Spot } from "../../model/Spot";

interface SearchWindowProperties {
  onDecide: (selected: Person | Spot) => void;
  onSearh: (texts: string) => SearchResult[];
}

function displayTextOfResult(result: SearchResult) {
  const text = result.type.getText();
  const explains: string[] = [];
  for (const res of result.result) {
    let explain = "";
    switch (res.field) {
      case Field.Name:
        break;
      case Field.Spot:
        explain = `スポット`;
        break;
      case Field.Tag:
        explain = `タグ：${res.text}`;
        break;
      case Field.Alias:
        explain = `別名：${res.text}`;
        break;
      case Field.Bywords:
        explain = `称号：${res.text}`;
        break;
      case Field.Sprouse:
        explain = `${res.text}の配偶者`;
        break;
      case Field.Parent:
        explain = `${res.text}の子`;
        break;
      case Field.Child:
        explain = `${res.text}の親`;
        break;
      case Field.Brother:
        explain = `${res.text}の配偶者`;
        break;
      case Field.Work:
        explain = `功績：${res.text}`;
        break;
      case Field.Word:
        explain = `言葉・句：${res.text}`;
        break;
      case Field.Desciption:
        explain = `記述：${res.text}`;
        break;
      default:
        break;
    }
    if (explains.includes(explain) === false && explain !== "") {
      explains.push(explain);
    }
  }
  return { text: text, explain: explains.join(", ") };
}

const SearchWindow: React.FC<SearchWindowProperties> = ({
  onDecide,
  onSearh,
}) => {
  const [texts, setTexts] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const maxItems = 10;

  useEffect(() => {
    if (texts === "") {
      setResults([]);
    } else {
      const res: SearchResult[] = onSearh(texts).map((r) => {
        return {
          type: r.type.clone(),
          result: [...r.result],
        };
      });
      setResults(res.splice(0, maxItems));
    }
  }, [texts]);

  return (
    <div className="search-window">
      <input
        type="text"
        placeholder="キーワードを入力"
        value={texts}
        onChange={(e) => setTexts(e.target.value)}
      />
      {results.length > 0 && (
        <ul className="result">
          {results.map((result, id) => {
            const res = displayTextOfResult(result);
            return (
              <li
                key={id}
                onClick={() => {
                  onDecide(result.type);
                  setTexts("");
                }}
              >
                <div id="result-text">{res.text}</div>
                <div id="result-explain">{res.explain}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SearchWindow;
