import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ManualBuilder from './pages/ManualBuilder';
import AIBuilder from './pages/AIBuilder';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/builder/manual" element={<ManualBuilder />} />
        <Route path="/builder/ai" element={<AIBuilder />} />
      </Routes>
    </Router>
  );
}

export default App;

