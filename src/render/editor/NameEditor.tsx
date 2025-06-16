import type { Name } from "../../model/FundamentalData";

interface WithFamilyNameProps {
  name: Name;
  width: number;
  onChangeGivenName: (givenName: string) => void;
  onChangeGivenNameKana: (givenNameKana: string) => void;
  onChangeFamilyName: (familyName: string) => void;
  onChangeFamilyNameKana: (familyNameKana: string) => void;
}

export const WithFamilyNameInput: React.FC<WithFamilyNameProps> = ({
  name,
  width,
  onChangeGivenName,
  onChangeGivenNameKana,
  onChangeFamilyName,
  onChangeFamilyNameKana,
}) => {
  return (
    <div>
      <input
        type="text"
        style={{
          margin: 10,
          marginBottom: 3,
          width: width * 0.4,
        }}
        value={name.familyNameKana ?? ""}
        onChange={(e) => onChangeFamilyNameKana(e.target.value)}
        placeholder="みょうじ"
      />
      <input
        type="text"
        style={{
          margin: 10,
          marginBottom: 3,
          width: width * 0.4,
        }}
        value={name.givenNameKana ?? ""}
        onChange={(e) => onChangeGivenNameKana(e.target.value)}
        placeholder="なまえ"
      />
      <input
        type="text"
        style={{
          margin: 10,
          width: width * 0.4,
          marginTop: 3,
          fontSize: 30,
        }}
        value={name.familyName ?? ""}
        onChange={(e) => onChangeFamilyName(e.target.value)}
        placeholder="苗字"
      />
      <input
        type="text"
        style={{
          margin: 10,
          width: width * 0.4,
          marginTop: 3,
          fontSize: 30,
        }}
        value={name.givenName}
        onChange={(e) => {
          onChangeGivenName(e.target.value);
        }}
        placeholder="名前"
      />
    </div>
  );
};

interface WithTitleProps {
  name: Name;
  width: number;
  onChangeGivenName: (givenName: string) => void;
  onChangeGivenNameKana: (givenNameKana: string) => void;
  onChangeNameTitle: (nameTitle: string) => void;
}

export const WithTitleInput: React.FC<WithTitleProps> = ({
  name,
  width,
  onChangeGivenName,
  onChangeGivenNameKana,
  onChangeNameTitle,
}) => {
  return (
    <div>
      <input
        type="text"
        style={{
          margin: 10,
          marginBottom: 3,
          width: width * 0.4,
        }}
        value={name.givenNameKana ?? ""}
        onChange={(e) => onChangeGivenNameKana(e.target.value)}
        placeholder="なまえ"
      />
      <div style={{ width: width * 0.4 }} />
      <input
        type="text"
        style={{
          margin: 10,
          width: width * 0.4,
          marginTop: 3,
          fontSize: 30,
        }}
        value={name.givenName}
        onChange={(e) => onChangeGivenName(e.target.value)}
        placeholder="名前"
      />
      <input
        type="text"
        style={{
          margin: 10,
          width: width * 0.4,
          marginTop: 3,
          fontSize: 30,
        }}
        value={name.title ?? ""}
        onChange={(e) => onChangeNameTitle(e.target.value)}
        placeholder="立場"
      />
    </div>
  );
};

interface OnlyNameProps {
  name: Name;
  width: number;
  onChangeGivenName: (givenName: string) => void;
  onChangeGivenNameKana: (givenNameKana: string) => void;
}

export const OnlyNameInput: React.FC<OnlyNameProps> = ({
  name,
  width,
  onChangeGivenName,
  onChangeGivenNameKana,
}) => {
  return (
    <div>
      <input
        type="text"
        style={{
          margin: 10,
          marginBottom: 3,
          width: width * 0.8,
        }}
        value={name.givenNameKana ?? ""}
        onChange={(e) => onChangeGivenNameKana(e.target.value)}
        placeholder="なまえ"
      />
      <div style={{ width: width * 0.4 }} />
      <input
        type="text"
        style={{
          margin: 10,
          width: width * 0.8,
          marginTop: 3,
          fontSize: 30,
        }}
        value={name.givenName}
        onChange={(e) => onChangeGivenName(e.target.value)}
        placeholder="名前"
      />
    </div>
  );
};
