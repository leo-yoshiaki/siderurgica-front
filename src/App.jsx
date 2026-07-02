import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import OrdemDetalhes from './pages/OrdemDetalhes.jsx';
import OrdemForm from './pages/OrdemForm.jsx';
import OrdemLista from './pages/OrdemLista.jsx';

function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/ordens" replace />} />
          <Route path="/ordens" element={<OrdemLista />} />
          <Route path="/ordens/nova" element={<OrdemForm />} />
          <Route path="/ordens/:id" element={<OrdemDetalhes />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
