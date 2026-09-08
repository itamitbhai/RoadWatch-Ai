import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { SimulationProvider } from './context/SimulationContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import BusMonitor from './pages/BusMonitor';
import RoadIntelligence from './pages/RoadIntelligence';
import TrafficAnalytics from './pages/TrafficAnalytics';
import IncidentManagement from './pages/IncidentManagement';
import GISMap from './pages/GISMap';
import Reports from './pages/Reports';

export default function App() {
  return (
    <ToastProvider>
      <SimulationProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/fleet/:busId" element={<BusMonitor />} />
              <Route path="/road-intelligence" element={<RoadIntelligence />} />
              <Route path="/traffic-analytics" element={<TrafficAnalytics />} />
              <Route path="/incidents" element={<IncidentManagement />} />
              <Route path="/gis-map" element={<GISMap />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SimulationProvider>
    </ToastProvider>
  );
}
