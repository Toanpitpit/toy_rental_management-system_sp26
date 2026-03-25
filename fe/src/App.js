import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import AppRoutes from './routers/Router';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
