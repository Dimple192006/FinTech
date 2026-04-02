import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TokenDashboard from "./pages/TokenDashboard";
import CreateToken from "./pages/CreateToken";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/token" element={<TokenDashboard />} />
      <Route path="/create" element={<CreateToken />} />
    </Routes>
  );
}

export default App;