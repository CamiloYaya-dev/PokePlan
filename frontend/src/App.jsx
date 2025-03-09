import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateBoard from "./pages/CreateBoard";
import JoinBoard from "./pages/JoinBoard";
import Board from "./pages/Board";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateBoard />} />
          <Route path="/join" element={<JoinBoard />} />
          <Route path="/board/:id" element={<Board />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
