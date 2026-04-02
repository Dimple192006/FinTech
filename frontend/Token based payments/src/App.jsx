import { Route, Routes } from "react-router-dom";
import CreateToken from "./pages/CreateToken";
import Home from "./pages/Home";
import ManageTokens from "./pages/ManageTokens";
import TokenDashboard from "./pages/TokenDashboard";
import TokenHistory from "./pages/TokenHistory";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/token" element={<TokenDashboard />} />
      <Route path="/token/manage" element={<ManageTokens />} />
      <Route path="/token/history" element={<TokenHistory />} />
      <Route path="/create" element={<CreateToken />} />
    </Routes>
  );
}

export default App;
