import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from 'react-router-dom';
import App from "../render/main/Canvas";
import PersonEditor from "../render/editor/PersonEditor";

createRoot(document.getElementById("root") as Element).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>,
  <HashRouter>
    <Routes>
      <Route path="main" element={<App/>}/>
      <Route path="editor" element={<PersonEditor/>}/>
    </Routes>
  </HashRouter>
);
