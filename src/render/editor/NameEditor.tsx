import type { Name } from "../../model/FundamentalData";
import "./PersonEditor.css";

interface WithFamilyNameProps {
  name: Name;
  onChangeGivenName: (givenName: string) => void;
  onChangeGivenNameKana: (givenNameKana: string) => void;
  onChangeFamilyName: (familyName: string) => void;
  onChangeFamilyNameKana: (familyNameKana: string) => void;
}

export const WithFamilyNameInput: React.FC<WithFamilyNameProps> = ({
  name,
  onChangeGivenName,
  onChangeGivenNameKana,
  onChangeFamilyName,
  onChangeFamilyNameKana,
}) => {
  return (
    <div id="edit-name-container">
      <div>
        <div>
          <input
            type="text"
            id="kana"
            value={name.familyNameKana ?? ""}
            onChange={(e) => onChangeFamilyNameKana(e.target.value.trim())}
            placeholder="みょうじ"
          />
        </div>
        <div>
          <input
            type="text"
            id="mana"
            value={name.familyName ?? ""}
            onChange={(e) => onChangeFamilyName(e.target.value.trim())}
            placeholder="苗字"
          />
        </div>
      </div>
      <div>
        <div>
          <input
            type="text"
            id="kana"
            value={name.givenNameKana ?? ""}
            onChange={(e) => onChangeGivenNameKana(e.target.value.trim())}
            placeholder="なまえ"
          />
        </div>
        <div>
          <input
            type="text"
            id="mana"
            value={name.givenName}
            onChange={(e) => {
              onChangeGivenName(e.target.value.trim());
            }}
            placeholder="名前"
          />
        </div>
      </div>
    </div>
  );
};

interface WithTitleProps {
  name: Name;
  onChangeGivenName: (givenName: string) => void;
  onChangeGivenNameKana: (givenNameKana: string) => void;
  onChangeNameTitle: (nameTitle: string) => void;
  onChangeNameTitleKana: (nameTitleKana: string) => void;
}

export const WithTitleInput: React.FC<WithTitleProps> = ({
  name,
  onChangeGivenName,
  onChangeGivenNameKana,
  onChangeNameTitle,
  onChangeNameTitleKana,
}) => {
  return (
    <div id="edit-name-container">
      <div>
        <div>
          <input
            type="text"
            id="kana"
            value={name.givenNameKana ?? ""}
            onChange={(e) => onChangeGivenNameKana(e.target.value.trim())}
            placeholder="なまえ"
          />
        </div>
        <div>
          <input
            type="text"
            id="mana"
            value={name.givenName}
            onChange={(e) => {
              onChangeGivenName(e.target.value.trim());
            }}
            placeholder="名前"
          />
        </div>
      </div>
      <div>
        <div>
          <input
            type="text"
            id="kana"
            value={name.familyNameKana ?? ""}
            onChange={(e) => onChangeNameTitleKana(e.target.value.trim())}
            placeholder="たちば"
          />
        </div>
        <div>
          <input
            type="text"
            id="mana"
            value={name.familyName ?? ""}
            onChange={(e) => onChangeNameTitle(e.target.value.trim())}
            placeholder="立場"
          />
        </div>
      </div>
    </div>
  );
};

interface OnlyNameProps {
  name: Name;
  onChangeGivenName: (givenName: string) => void;
  onChangeGivenNameKana: (givenNameKana: string) => void;
}

export const OnlyNameInput: React.FC<OnlyNameProps> = ({
  name,
  onChangeGivenName,
  onChangeGivenNameKana,
}) => {
  return (
    <div id="edit-name-container">
      <div>
        <div>
          <input
            type="text"
            id="kana"
            value={name.givenNameKana ?? ""}
            onChange={(e) => onChangeGivenNameKana(e.target.value.trim())}
            placeholder="なまえ"
          />
        </div>
        <div>
          <input
            type="text"
            id="mana"
            value={name.givenName}
            onChange={(e) => {
              onChangeGivenName(e.target.value.trim());
            }}
            placeholder="名前"
          />
        </div>
      </div>
    </div>
  );
};
