import { useEffect, useState } from "react";
import "./Profile.css";
import {
  Date,
  getNameStyle,
  isAllHalfWidth,
  Name,
  NameStyle,
  ProfileData,
  Sex,
} from "../../model/FundamentalData";
import { displayName, PersonData } from "../../model/Person";

function profileName(person: PersonData, familyName?: string) {
  if (familyName === undefined) {
    return displayName(person.name);
  } else {
    if (person.name.familyName === familyName) {
      return person.name.givenName;
    } else {
      return displayName(person.name);
    }
  }
}

function parseRubyText(text: string): React.ReactNode {
  const regex = /\[([^\(\)\[\]]+)\(([^\(\)\[\]]+)\)\]/g;
  const result: React.ReactNode[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, base, ruby] = match;
    const start = match.index;

    if (start > lastIndex) {
      result.push(text.slice(lastIndex, start));
    }

    result.push(
      <ruby key={start}>
        {base}
        <rt>{ruby}</rt>
      </ruby>
    );

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return <span>{result}</span>;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | undefined>(undefined);

  useEffect(() => {
    window.electronAPI?.onLoadDataOnProfile((profileData) => {
      setProfile(profileData);
    });
  }, []);
  if (profile) {
    return (
      <div className="profile">
        <NameViewer name={profile.person.name} />
        <BywordsVier bywords={profile.person.bywords} />
        <YearViewer
          birth={profile.person.birthday}
          death={profile.person.deathday}
          deathText={profile.deathText}
        />
        <AliasViewer aliases={profile.person.aliases} />
        <ParentsViewer
          isAdopted={false}
          parents={profile.parents}
          familyName={profile.person.name.familyName}
        />
        <ParentsViewer
          isAdopted={true}
          parents={profile.adoptedParents}
          familyName={profile.person.name.familyName}
        />
        <BrotherViewer brothers={profile.brothers} self={profile.person} />
        <FamilyViewer
          families={profile.marriages}
          familyName={profile.person.name.familyName}
        />
        <ShortTextsViewer texts={profile.person.works} title="功績" />
        <ShortTextsViewer texts={profile.person.words} title="言葉・句" />
        <TagViewer tags={profile.tags} />
        <DescriptionViewer texts={profile.person.description} />
      </div>
    );
  } else {
    return <div></div>;
  }
};

export default Profile;

const NameViewer: React.FC<{ name: Name }> = ({ name }) => {
  const style = getNameStyle(name);
  switch (style) {
    case NameStyle.OnlyGivenName:
      return (
        <div id="name-container">
          <ruby>
            {name.givenName}
            <rt>{name.givenNameKana}</rt>
          </ruby>
        </div>
      );
    case NameStyle.WithFamilyname:
      if (
        isAllHalfWidth(name.givenName) &&
        isAllHalfWidth(name.familyName ?? "")
      ) {
        return (
          <div id="name-container">
            <div>
              <ruby>
                {name.givenName}
                <rt>{name.givenNameKana}</rt>
              </ruby>
            </div>
            <div>
              <ruby>
                {name.familyName}
                <rt>{name.familyNameKana}</rt>
              </ruby>
            </div>
          </div>
        );
      } else {
        return (
          <div id="name-container">
            <div>
              <ruby>
                {name.familyName}
                <rt>{name.familyNameKana}</rt>
              </ruby>
            </div>
            <div>
              <ruby>
                {name.givenName}
                <rt>{name.givenNameKana}</rt>
              </ruby>
            </div>
          </div>
        );
      }
    case NameStyle.WithTitle:
      return (
        <div id="name-container">
          <div>
            <ruby>
              {name.givenName}
              <rt>{name.givenNameKana}</rt>
            </ruby>
          </div>
          <div>
            <ruby>
              {name.title}
              <rt>{name.titleKana}</rt>
            </ruby>
          </div>
        </div>
      );
    default:
      return <div></div>;
  }
};

const BywordsVier: React.FC<{ bywords: string }> = ({ bywords }) => {
  if (bywords === "") {
    return;
  } else {
    return <div className="bywords">{parseRubyText(bywords)}</div>;
  }
};

const YearViewer: React.FC<{
  birth?: Date;
  death?: Date;
  deathText: string;
}> = ({ birth, death, deathText }) => {
  const toString = (date: Date) => {
    let str = "";
    if (date.isBC) {
      str += "紀元前 ";
    }
    if (date.year) {
      str += `${date.year} 年`;
    }
    if (date.month) {
      str += ` ${date.month} 月`;
    }
    if (date.day) {
      str += ` ${date.day} 日`;
    }
    return str;
  };
  if (birth || death) {
    return (
      <div>
        {birth && (
          <div id="item">
            <div id="field">誕生</div>
            <div>{toString(birth)}</div>
          </div>
        )}
        {death && (
          <div id="item">
            <div id="field">{deathText}</div>
            <div>{toString(death)}</div>
          </div>
        )}
      </div>
    );
  } else {
    return;
  }
};

const AliasViewer: React.FC<{ aliases: string[] }> = ({ aliases }) => {
  if (aliases.length === 0) {
    return;
  }
  return (
    <div id="item">
      <div id="field">別名</div>
      <div id="container">
        {aliases.map((alias, id) => {
          return <div key={id}>{parseRubyText(alias)}</div>;
        })}
      </div>
    </div>
  );
};

const ParentsViewer: React.FC<{
  isAdopted: boolean;
  parents: PersonData[];
  familyName?: string;
}> = ({ isAdopted, parents, familyName }) => {
  if (parents.length === 0) {
    return;
  }
  const father = parents.filter((p) => p.sex === Sex.Male);
  const mother = parents.filter((p) => p.sex === Sex.Female);
  const other = parents.filter((p) => p.sex === Sex.Other);
  const prefix = isAdopted ? "養" : "";

  return (
    <div id="item">
      <div id="field">{prefix}親</div>
      <div id="container">
        {father.map((person, id) => {
          return (
            <div key={id}>
              {prefix}父：{profileName(person, familyName)}
            </div>
          );
        })}
        {mother.map((person, id) => {
          return (
            <div key={id}>
              {prefix}母：{profileName(person, familyName)}
            </div>
          );
        })}
        {other.map((person, id) => {
          return <div key={id}>{profileName(person, familyName)}</div>;
        })}
      </div>
    </div>
  );
};

const BrotherViewer: React.FC<{ brothers: PersonData[]; self: PersonData }> = ({
  brothers,
  self,
}) => {
  if (brothers.length <= 1) {
    return;
  }
  return (
    <div id="item">
      <div id="field">兄弟・姉妹</div>
      <div id="container">
        {brothers.map((brother, id) => {
          if (brother.id === self.id) {
            return (
              <div style={{ fontWeight: "bold" }} key={id}>
                {profileName(brother, self.name.familyName)}
              </div>
            );
          } else {
            return (
              <div key={id}>{profileName(brother, self.name.familyName)}</div>
            );
          }
        })}
      </div>
    </div>
  );
};

const FamilyViewer: React.FC<{
  families: {
    sprouse?: PersonData;
    children: {
      isAdopted: boolean;
      child: PersonData;
    }[];
  }[];
  familyName?: string;
}> = ({ families, familyName }) => {
  if (families.length === 0) {
    return;
  }
  if (families.length === 1 && !families[0].sprouse) {
    return (
      <div id="item">
        <div id="field">子</div>
        <div id="container">
          {families[0].children.map((child, id) => {
            const postfix = child.isAdopted ? "(養子)" : "";
            return (
              <div key={id}>
                {profileName(child.child, familyName)}
                <span id="adopted-child">{postfix}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else if (families.every((family) => family.children.length === 0)) {
    return (
      <div id="item">
        <div id="field">配偶者</div>
        <div id="container">
          {families.map((family, id) => {
            if (family.sprouse) {
              return (
                <div key={id}>{profileName(family.sprouse, familyName)}</div>
              );
            }
          })}
        </div>
      </div>
    );
  } else {
    return (
      <div id="item">
        <div id="field">
          <div>配偶者</div>
          <div className="child-title-child">╚ 子</div>
        </div>
        <div>
          {families.map((family, fid) => {
            const sprouseName = family.sprouse
              ? profileName(family.sprouse, familyName)
              : "(未記入)";
            return (
              <div key={fid}>
                <div>{sprouseName}</div>
                <div id="child-view">
                  <div style={{ userSelect: "none" }}>╚</div>
                  <div id="child-container">
                    {family.children.map((child, cid) => {
                      const postfix = child.isAdopted ? "(養子)" : "";
                      return (
                        <div key={cid}>
                          {profileName(child.child, familyName)}
                          <span id="adopted-child">{postfix}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
};

const ShortTextsViewer: React.FC<{ texts: string[]; title: string }> = ({
  texts,
  title,
}) => {
  if (texts.length === 0) {
    return;
  }
  return (
    <div id="item">
      <div id="field">{title}</div>
      <div>
        {texts.map((work, id) => {
          const splited = work.split(/[\s\u3000]+/g);
          return (
            <div id="list">
              <div>・</div>
              <div key={id} id="container">
                {splited.map((text, id) => {
                  return <div key={id}>{parseRubyText(text)}</div>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DescriptionViewer: React.FC<{ texts: string }> = ({ texts }) => {
  if (texts === "") {
    return;
  }
  const splited = texts.split(/\r\n|\n|\r/g);
  return (
    <div>
      {splited.map((text, id) => {
        return (
          <p key={id} id="paragraph">
            {parseRubyText(text)}
          </p>
        );
      })}
    </div>
  );
};

const TagViewer: React.FC<{ tags: string[] }> = ({ tags }) => {
  if (tags.length === 0) {
    return;
  }
  return (
    <div>
      <div id="item">
        <div id="field">タグ</div>
        <div id="container">
          {tags.map((tag, id) => {
            return <div key={id}>{tag}</div>;
          })}
        </div>
      </div>
    </div>
  );
};
