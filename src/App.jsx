import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddProblem from './pages/AddProblem';
import RevisitQueue from './pages/RevisitQueue';
import Profile from './pages/Profile';
import Search from './pages/Search';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add" element={<AddProblem />} />
          <Route path="revisit" element={<RevisitQueue />} />
          <Route path="profile" element={<Profile />} />
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
