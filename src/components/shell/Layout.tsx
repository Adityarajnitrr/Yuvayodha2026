import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  SaffronStrip, UtilityBar, SiteHeader, MenuBar,
  ControlStrip, NoticeBanner, SiteFooter, HelplineBar, FloatingHelp,
} from './Frame';
import { Breadcrumb } from '../ui/index';
import { ToastContainer } from '../ui/index';
import { useLang } from '../../context/AppContext';

function useBreadcrumbs() {
  const { t } = useLang();
  const { pathname, state } = useLocation();
  if (pathname === '/' || pathname === '') return [];
  if (pathname.startsWith('/areas/')) {
    const areaName = (state as { areaName?: string } | null)?.areaName ?? 'Area Detail';
    return [{ label: t('navAreas'), to: '/areas' }, { label: areaName }];
  }
  if (pathname === '/areas')   return [{ label: t('navAreas') }];
  if (pathname === '/adjust')  return [{ label: t('navAdjust') }];
  if (pathname === '/forecast')return [{ label: t('navForecast') }];
  if (pathname === '/notices') return [{ label: t('navNotices') }];
  if (pathname === '/help')    return [{ label: t('navHelp') }];
  return [{ label: pathname }];
}

export function Layout() {
  const [fontSize, setFontSize] = useState(16);
  const breadcrumbs = useBreadcrumbs();

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const handleFont = (delta: number) => {
    if (delta === 0) { setFontSize(16); return; }
    setFontSize(prev => Math.min(22, Math.max(12, prev + delta * 2)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SaffronStrip />
      <UtilityBar onFontChange={handleFont} fontSize={fontSize} />
      <SiteHeader />
      <MenuBar />
      <ControlStrip />
      <NoticeBanner />
      {breadcrumbs.length > 0 && (
        <div style={{ background: '#fff', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 16px' }}>
            <Breadcrumb items={breadcrumbs} />
          </div>
        </div>
      )}

      <main id="main-content" style={{ flex: 1, padding: '20px 0 32px' }} tabIndex={-1}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 16px' }}>
          <Outlet />
        </div>
      </main>

      <SiteFooter />
      <HelplineBar />
      <FloatingHelp />
      <ToastContainer />
    </div>
  );
}
