import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useGridStore } from './store/gridStore';
import { Layout } from './components/shell/Layout';
import HomePage        from './pages/home/HomePage';
import AreaStatusPage  from './pages/areas/AreaStatusPage';
import AreaDetailPage  from './pages/areas/AreaDetailPage';
import AdjustSupplyPage from './pages/adjust/AdjustSupplyPage';
import ForecastPage    from './pages/forecast/ForecastPage';
import NoticesPage     from './pages/notices/NoticesPage';
import HelpPage        from './pages/help/HelpPage';

function DataInit() {
  const { startTick, stopTick } = useGridStore();
  useEffect(() => { startTick(); return () => stopTick(); }, []);
  return null;
}

export default function App() {
  return (
    <AppProvider>
      <DataInit />
      <Routes>
        <Route element={<Layout />}>
          <Route index              element={<HomePage />} />
          <Route path="/areas"      element={<AreaStatusPage />} />
          <Route path="/areas/:areaId" element={<AreaDetailPage />} />
          <Route path="/adjust"     element={<AdjustSupplyPage />} />
          <Route path="/forecast"   element={<ForecastPage />} />
          <Route path="/notices"    element={<NoticesPage />} />
          <Route path="/help"       element={<HelpPage />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
