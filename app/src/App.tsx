// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import BatchCreation from './components/BatchCreation';
import BatchView from './components/BatchView';
import Profile from './components/Profile';
import AllBatches from './components/AllBatches';
import AddEvent from './components/AddEvent';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-batch" element={<BatchCreation />} />
            <Route path="/batch/:id" element={<BatchView />} />
            <Route path="/batch/:id/add-event" element={<AddEvent />} />
            <Route path="/all-batches" element={<AllBatches />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


export default App;