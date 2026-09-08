import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  createInitialBuses,
  createSeedEvents,
  createSeedIncidents,
  createVehicleStats,
  createHourlyVehicleSeries,
  createRoadTrafficStats,
  createCongestionTrend,
  generateRoadDetection,
  generateTrafficEvent,
  generateIncident,
  jitterCoord,
  randomInt,
  congestionLabel,
  createInitialAmbulances,
  buildEmergencyResponse,
  ROADS,
} from '../data/mockData';
import { useToast } from './ToastContext';

const SimulationContext = createContext(null);

const initialState = {
  buses: createInitialBuses(),
  events: createSeedEvents(),
  incidents: createSeedIncidents(),
  vehicleStats: createVehicleStats(),
  hourlyVehicleSeries: createHourlyVehicleSeries(),
  roadTrafficStats: createRoadTrafficStats(),
  congestionTrend: createCongestionTrend(),
  simulationRunning: false,
  tickCount: 0,
  ambulances: createInitialAmbulances(),
  dispatches: [],
  policeCalls: [],
};

function moveBus(bus) {
  const [lat, lng] = bus.position;
  const step = 0.0016;
  const rad = (bus.heading * Math.PI) / 180;
  let newHeading = bus.heading + randomInt(-18, 18);
  if (newHeading < 0) newHeading += 360;
  if (newHeading >= 360) newHeading -= 360;
  const nextPos = [lat + Math.cos(rad) * step, lng + Math.sin(rad) * step];
  const nearestRoad = ROADS.reduce((best, r) => {
    const d = Math.hypot(r.coords[0] - nextPos[0], r.coords[1] - nextPos[1]);
    return d < best.d ? { d, name: r.name } : best;
  }, { d: Infinity, name: bus.currentLocation });

  return {
    ...bus,
    position: nextPos,
    heading: newHeading,
    speed: Math.max(8, Math.min(58, bus.speed + randomInt(-4, 4))),
    lastUpdate: new Date(),
    currentLocation: nearestRoad.name,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SIMULATION':
      return { ...state, simulationRunning: !state.simulationRunning };
    case 'TICK': {
      const buses = state.buses.map((b) => (Math.random() < 0.85 ? moveBus(b) : b));

      let events = state.events;
      let incidents = state.incidents;
      let vehicleStats = state.vehicleStats;
      let roadTrafficStats = state.roadTrafficStats;
      let newEvent = null;
      let newIncident = null;

      if (Math.random() < 0.65) {
        newEvent = Math.random() < 0.7 ? generateRoadDetection() : generateTrafficEvent();
        events = [newEvent, ...events].slice(0, 400);
        const busIdx = buses.findIndex((b) => b.id === newEvent.busId);
        if (busIdx >= 0) buses[busIdx] = { ...buses[busIdx], detections: buses[busIdx].detections + 1 };
      }

      if (Math.random() < 0.09) {
        newIncident = generateIncident();
        incidents = [newIncident, ...incidents].slice(0, 200);
      }

      vehicleStats = Object.fromEntries(
        Object.entries(vehicleStats).map(([k, v]) => [k, Math.max(0, v + randomInt(-12, 22))])
      );

      roadTrafficStats = roadTrafficStats.map((r) => {
        const density = Math.max(10, Math.min(99, r.density + randomInt(-5, 5)));
        return {
          ...r,
          density,
          congestion: congestionLabel(density),
          avgSpeed: Math.max(6, Math.min(50, r.avgSpeed + randomInt(-3, 3))),
          delay: Math.max(1, r.delay + randomInt(-2, 2)),
        };
      });

      return {
        ...state,
        buses,
        events,
        incidents,
        vehicleStats,
        roadTrafficStats,
        tickCount: state.tickCount + 1,
        _lastEvent: newEvent,
        _lastIncident: newIncident,
      };
    }
    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events].slice(0, 400) };
    case 'ADD_INCIDENT':
      return { ...state, incidents: [action.payload, ...state.incidents].slice(0, 200) };
    case 'UPDATE_INCIDENT_STATUS':
      return {
        ...state,
        incidents: state.incidents.map((inc) =>
          inc.id === action.payload.id ? { ...inc, status: action.payload.status } : inc
        ),
      };
    case 'UPDATE_EVENT_STATUS':
      return {
        ...state,
        events: state.events.map((ev) =>
          ev.id === action.payload.id ? { ...ev, status: action.payload.status } : ev
        ),
      };
    case 'BUMP_BUS_DETECTIONS':
      return {
        ...state,
        buses: state.buses.map((b) =>
          b.id === action.payload ? { ...b, detections: b.detections + 1, lastUpdate: new Date() } : b
        ),
      };
    case 'ADD_DISPATCH':
      return {
        ...state,
        dispatches: [action.payload, ...state.dispatches].slice(0, 50),
        ambulances: state.ambulances.map((a) =>
          a.id === action.payload.ambulanceId ? { ...a, status: 'Dispatched' } : a
        ),
      };
    case 'ADD_POLICE_CALL':
      return { ...state, policeCalls: [action.payload, ...state.policeCalls].slice(0, 50) };
    case 'SYNC_EMERGENCY': {
      const now = Date.now();
      const ambulanceUpdates = {};

      const dispatches = state.dispatches.map((d) => {
        if (d.status === 'Completed') return d;
        const elapsed = now - d.timestamp;
        let status = 'Dispatched';
        let progress = 0.08;
        if (elapsed >= 13000) {
          status = 'Completed';
          progress = 0;
        } else if (elapsed >= 8000) {
          status = 'On Scene';
          progress = 1;
        } else if (elapsed >= 3000) {
          status = 'En Route';
          progress = 0.5;
        }
        const position =
          status === 'Completed'
            ? d.originCoords
            : [
                d.originCoords[0] + (d.targetCoords[0] - d.originCoords[0]) * progress,
                d.originCoords[1] + (d.targetCoords[1] - d.originCoords[1]) * progress,
              ];
        ambulanceUpdates[d.ambulanceId] = { status: status === 'Completed' ? 'Available' : status, position };
        return status === d.status ? d : { ...d, status };
      });

      const policeCalls = state.policeCalls.map((c) => {
        if (c.status === 'Acknowledged') return c;
        const elapsed = now - c.timestamp;
        let status = 'Calling';
        if (elapsed >= 6000) status = 'Acknowledged';
        else if (elapsed >= 2500) status = 'Connected';
        return status === c.status ? c : { ...c, status };
      });

      const ambulances = Object.keys(ambulanceUpdates).length
        ? state.ambulances.map((a) => (ambulanceUpdates[a.id] ? { ...a, ...ambulanceUpdates[a.id] } : a))
        : state.ambulances;

      return { ...state, dispatches, policeCalls, ambulances };
    }
    default:
      return state;
  }
}

export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { push } = useToast();
  const intervalRef = useRef(null);
  const ambulancesRef = useRef(state.ambulances);

  useEffect(() => {
    ambulancesRef.current = state.ambulances;
  }, [state.ambulances]);

  useEffect(() => {
    if (state.simulationRunning) {
      intervalRef.current = setInterval(() => dispatch({ type: 'TICK' }), 2600);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.simulationRunning]);

  // Progresses ambulance dispatch / police-call statuses in real time, independent of
  // the fleet simulation toggle, so emergency response always keeps moving.
  useEffect(() => {
    const syncInterval = setInterval(() => dispatch({ type: 'SYNC_EMERGENCY' }), 2000);
    return () => clearInterval(syncInterval);
  }, []);

  const dispatchEmergencyResponse = useCallback(
    (incident) => {
      const { dispatch: amb, calls } = buildEmergencyResponse(incident, ambulancesRef.current);
      if (amb) {
        dispatch({ type: 'ADD_DISPATCH', payload: amb });
        push({
          title: `🚑 Nearest Ambulance Dispatched`,
          message: `${amb.ambulanceName} · ${amb.distanceKm} km to ${amb.location} · ETA ${amb.etaMin} min`,
          variant: 'danger',
          duration: 6000,
        });
      }
      calls.forEach((call) => {
        dispatch({ type: 'ADD_POLICE_CALL', payload: call });
        push({
          title: `📞 Calling ${call.department}`,
          message: `${call.station} · ${call.distanceKm} km from ${call.location}`,
          variant: 'warning',
          duration: 6000,
        });
      });
    },
    [push]
  );

  useEffect(() => {
    if (state._lastIncident) {
      push({
        title: `New Incident · ${state._lastIncident.type}`,
        message: `${state._lastIncident.busId} · ${state._lastIncident.location}`,
        variant: 'danger',
      });
      dispatchEmergencyResponse(state._lastIncident);
    }
  }, [state._lastIncident, push, dispatchEmergencyResponse]);

  const toggleSimulation = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIMULATION' });
    push({
      title: state.simulationRunning ? 'Simulation Paused' : 'AI Fleet Simulation Running',
      message: state.simulationRunning
        ? 'Live fleet updates stopped.'
        : 'Streaming live GPS, detections and traffic data.',
      variant: state.simulationRunning ? 'info' : 'success',
    });
  }, [push, state.simulationRunning]);

  const simulateDetectionForBus = useCallback(
    (busId, bus) => {
      const kinds = [
        () => generateRoadDetection({ busId, coords: bus ? jitterCoord(bus.position, 0.003) : undefined }),
        () => generateTrafficEvent({ busId, coords: bus ? jitterCoord(bus.position, 0.003) : undefined }),
      ];
      const event = pickKind(kinds)();
      dispatch({ type: 'ADD_EVENT', payload: event });
      dispatch({ type: 'BUMP_BUS_DETECTIONS', payload: busId });
      push({
        title: `${event.type} Detected`,
        message: `${busId} · ${event.location} · ${event.confidence}% confidence`,
        variant: event.severity === 'HIGH' ? 'danger' : event.severity === 'MEDIUM' ? 'warning' : 'success',
      });
      return event;
    },
    [push]
  );

  const simulateEmergencyIncident = useCallback(
    (overrides) => {
      const safeOverrides = overrides && overrides.constructor === Object ? overrides : {};
      const incident = generateIncident({ type: 'Accident', severity: 'HIGH', ...safeOverrides });
      dispatch({ type: 'ADD_INCIDENT', payload: incident });
      push({
        title: `🚨 ${incident.type} Reported`,
        message: `${incident.busId} · ${incident.location}`,
        variant: 'danger',
      });
      dispatchEmergencyResponse(incident);
      return incident;
    },
    [push, dispatchEmergencyResponse]
  );

  const updateIncidentStatus = useCallback((id, status) => {
    dispatch({ type: 'UPDATE_INCIDENT_STATUS', payload: { id, status } });
  }, []);

  const updateEventStatus = useCallback((id, status) => {
    dispatch({ type: 'UPDATE_EVENT_STATUS', payload: { id, status } });
  }, []);

  const kpis = useMemo(() => {
    const roadHazards = state.events.filter((e) => e.category === 'road').length;
    const activeIncidents = state.incidents.filter((i) => i.status !== 'Resolved').length;
    const congestedZones = state.roadTrafficStats.filter((r) => r.density >= 70).length;
    return {
      activeBuses: state.buses.length,
      aiDetectionsToday: state.events.length,
      roadHazards,
      activeIncidents,
      congestedZones,
    };
  }, [state.buses, state.events, state.incidents, state.roadTrafficStats]);

  const value = useMemo(
    () => ({
      ...state,
      kpis,
      toggleSimulation,
      simulateDetectionForBus,
      simulateEmergencyIncident,
      updateIncidentStatus,
      updateEventStatus,
      dispatch,
    }),
    [
      state,
      kpis,
      toggleSimulation,
      simulateDetectionForBus,
      simulateEmergencyIncident,
      updateIncidentStatus,
      updateEventStatus,
    ]
  );

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

function pickKind(kinds) {
  return kinds[Math.floor(Math.random() * kinds.length)];
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
