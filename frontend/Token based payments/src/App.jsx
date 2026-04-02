import { Route, Routes } from "react-router-dom";
import CreateToken from "./pages/CreateToken";
import Home from "./pages/Home";
import ManageTokens from "./pages/ManageTokens";
import Merchant from "./pages/Merchant";
import TokenDashboard from "./pages/TokenDashboard";
import TokenFailure from "./pages/TokenFailed";
import TokenHistory from "./pages/TokenHistory";
import TokenSuccess from "./pages/TokenSuccess";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/success" element={<TokenSuccess />} />
      <Route path="/failure" element={<TokenFailure />} />
      <Route path="/token" element={<TokenDashboard />} />
      <Route path="/token/manage" element={<ManageTokens />} />
      <Route path="/token/history" element={<TokenHistory />} />
      <Route path="/create" element={<CreateToken />} />
      <Route path="/merchant" element={<Merchant />} />
    </Routes>
  );
}

export default App;
