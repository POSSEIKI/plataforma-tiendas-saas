import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { LandingPage } from './components/LandingPage/LandingPage';
import { AdminLayout } from './components/Admin/AdminLayout';
import { MiTiendaView } from './components/Admin/MiTiendaView';
import { PedidosView } from './components/Admin/PedidosView';
import { InventarioView } from './components/Admin/InventarioView';
import { CategoriasView } from './components/Admin/CategoriasView';
import { BannersView } from './components/Admin/BannersView';
import { ServiciosView } from './components/Admin/ServiciosView';
import { ImportarExcelView } from './components/Admin/ImportarExcelView';
import { VentasView } from './components/Admin/VentasView';
import { MetodosPagoView } from './components/Admin/MetodosPagoView';
import { ColoresPlantillasView } from './components/Admin/ColoresPlantillasView';
import { StorefrontView } from './components/Storefront/StorefrontView';

const MainApp: React.FC = () => {
  const { activeView, activeAdminTab, isAuthenticated, currentUser } = useStore();

  if (activeView === 'landing') {
    return <LandingPage />;
  }

  if (activeView === 'storefront') {
    return <StorefrontView />;
  }

  // Protección de Ruta: Si no está autenticado, fuerza la pantalla de inicio con login obligatorio
  if (!isAuthenticated) {
    return <LandingPage forceLogin={true} />;
  }

  const isVendedor = currentUser?.role === 'vendedor';

  // Admin View
  const renderAdminContent = () => {
    // Si el usuario tiene rol de Vendedor, sólo se renderiza la pestaña de Pedidos
    if (isVendedor || activeAdminTab === 'pedidos') {
      return <PedidosView />;
    }

    switch (activeAdminTab) {
      case 'mi-tienda':
        return <MiTiendaView />;
      case 'pedidos':
        return <PedidosView />;
      case 'inventario':
        return <InventarioView />;
      case 'categorias':
        return <CategoriasView />;
      case 'banners':
        return <BannersView />;
      case 'servicios':
        return <ServiciosView />;
      case 'importar-excel':
        return <ImportarExcelView />;
      case 'ventas':
        return <VentasView />;
      case 'metodos-pago':
        return <MetodosPagoView />;
      case 'colores-plantillas':
        return <ColoresPlantillasView />;
      default:
        return <MiTiendaView />;
    }
  };

  return <AdminLayout>{renderAdminContent()}</AdminLayout>;
};

export function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}

export default App;
