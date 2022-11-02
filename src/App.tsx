import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "@/pages/home";
import DeloppgavePage from "@/pages/deloppgave";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/deloppgave" element={<DeloppgavePage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
