import { BrowserRouter, Routes, Route } from "react-router-dom";
import COA from "./pages/COA.jsx";
import InputCOA from "./pages/InputCOA.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<COA />} />
        <Route path="/input-coa" element={<InputCOA />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;