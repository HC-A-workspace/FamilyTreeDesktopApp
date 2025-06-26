import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import App from "../render/main/Canvas";
import PersonEditor from "../render/editor/PersonEditor";
import SettingEditor from "../render/editor/SettingEditor";
import Profile from "../render/profile/Profile";

createRoot(document.getElementById("root") as Element).render(
  <HashRouter>
    <Routes>
      <Route path="main" element={<App />} />
      <Route path="editor" element={<PersonEditor />} />
      <Route path="settingEditor" element={<SettingEditor />} />
      <Route path="profile" element={<Profile />} />
    </Routes>
  </HashRouter>
);
