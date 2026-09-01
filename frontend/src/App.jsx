import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Todo from './pages/Todo';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"     element={<Home />} />
        <Route path="/todo" element={<Todo />} />
      </Routes>
    </BrowserRouter>
  );
}
