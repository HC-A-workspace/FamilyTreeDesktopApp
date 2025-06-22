import type { FamilyTree } from "../model/FamilyTree";

export function saveFamilyTree(familyTree: FamilyTree) {
  if (familyTree.getTitle() === "") return;

  familyTree.normalizeId();

  const data = {
    personData: familyTree.getPersonData(),
    marriageData: familyTree.getMarriageData(),
    spotData: familyTree.getSpotData(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = familyTree.getTitle() + ".json";
  a.click();

  URL.revokeObjectURL(url);
}
