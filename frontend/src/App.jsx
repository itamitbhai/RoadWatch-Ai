import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { SimulationProvider } from './context/SimulationContext';
import { AuthProvider } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';
import { NotificationCenterProvider } from './context/NotificationCenterContext';
import { ViolationsProvider } from './context/ViolationsContext';
import { ComplaintsProvider } from './context/ComplaintsContext';
import Layout from './components/Layout';
import CitizenLayout from './components/CitizenLayout';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import BusMonitor from './pages/BusMonitor';
import RoadIntelligence from './pages/RoadIntelligence';
import TrafficAnalytics from './pages/TrafficAnalytics';
import IncidentManagement from './pages/IncidentManagement';
import GISMap from './pages/GISMap';
import Reports from './pages/Reports';
import DetectionStudio from './pages/DetectionStudio';
import Violations from './pages/Violations';
import Vehicles from './pages/Vehicles';
import ComplaintsAdmin from './pages/ComplaintsAdmin';
import Departments from './pages/Departments';
import NotificationCenter from './pages/NotificationCenter';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import CitizenHome from './pages/citizen/Home';
import ReportIssue from './pages/citizen/ReportIssue';
import TrackComplaint from './pages/citizen/TrackComplaint';
import TrafficSafety from './pages/citizen/TrafficSafety';
import Help from './pages/citizen/Help';
import Feedback from './pages/citizen/Feedback';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuditProvider>
          <NotificationCenterProvider>
            <ViolationsProvider>
              <ComplaintsProvider>
                <SimulationProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/login" element={<Login />} />

                      {/* Public citizen site — what a normal visitor sees at the root domain. */}
                      <Route element={<CitizenLayout />}>
                        <Route path="/" element={<CitizenHome />} />
                        <Route path="/report" element={<ReportIssue />} />
                        <Route path="/track" element={<TrackComplaint />} />
                        <Route path="/track/:id" element={<TrackComplaint />} />
                        <Route path="/safety" element={<TrafficSafety />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/feedback/:id" element={<Feedback />} />
                      </Route>

                      {/* Government / admin command center — separate area under /admin. */}
                      <Route path="/admin" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="fleet" element={<Fleet />} />
                        <Route path="fleet/:busId" element={<BusMonitor />} />
                        <Route path="road-intelligence" element={<RoadIntelligence />} />
                        <Route path="traffic-analytics" element={<TrafficAnalytics />} />
                        <Route path="incidents" element={<IncidentManagement />} />
                        <Route path="detection-studio" element={<DetectionStudio />} />
                        <Route path="violations" element={<Violations />} />
                        <Route path="vehicles" element={<Vehicles />} />
                        <Route path="complaints" element={<ComplaintsAdmin />} />
                        <Route path="gis-map" element={<GISMap />} />
                        <Route path="departments" element={<Departments />} />
                        <Route path="notifications" element={<NotificationCenter />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="settings" element={<Settings />} />
                      </Route>
                    </Routes>
                  </BrowserRouter>
                </SimulationProvider>
              </ComplaintsProvider>
            </ViolationsProvider>
          </NotificationCenterProvider>
        </AuditProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
