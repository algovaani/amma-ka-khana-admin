import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import CooksPage from './pages/CooksPage';
import UserDetailPage from './pages/UserDetailPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WalletPage from './pages/WalletPage';
import WithdrawalsPage from './pages/WithdrawalsPage';
import SettingsPage from './pages/SettingsPage';
import ReferralsPage from './pages/ReferralsPage';
import LocationsPage from './pages/LocationsPage';
import CategoriesPage from './pages/CategoriesPage';
import MealPackagePage from './pages/MealPackagePage';
import CouponsPage from './pages/CouponsPage';
import BannersPage from './pages/BannersPage';
import ReportsPage from './pages/ReportsPage';
import SupportPage from './pages/SupportPage';
import CookMapPage from './pages/CookMapPage';
import LoginPage from './pages/LoginPage';
import ShoppingLayout from './components/layout/ShoppingLayout';
import ShopDashboardPage from './pages/shop/ShopDashboardPage';
import ShopCategoriesPage from './pages/shop/ShopCategoriesPage';
import ShopProductsPage from './pages/shop/ShopProductsPage';
import ShopOrdersPage from './pages/shop/ShopOrdersPage';
import ShopOrderDetailPage from './pages/shop/ShopOrderDetailPage';
import ShopSettingsPage from './pages/shop/ShopSettingsPage';

const App = () => {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/map" element={<Navigate to="/map/cooks" replace />} />
        <Route path="/users/:userId" element={<UserDetailPage />} />
        <Route path="/cooks" element={<CooksPage />} />
        <Route path="/map/cooks" element={<CookMapPage />} />
        <Route path="/cooks/map" element={<Navigate to="/map/cooks" replace />} />
        <Route path="/cooks/:userId" element={<UserDetailPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/withdrawals" element={<WithdrawalsPage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/meal-package" element={<MealPackagePage />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/banners" element={<BannersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/shop" element={<ShoppingLayout />}>
          <Route index element={<ShopDashboardPage />} />
          <Route path="categories" element={<ShopCategoriesPage />} />
          <Route path="products" element={<ShopProductsPage />} />
          <Route path="orders" element={<ShopOrdersPage />} />
          <Route path="orders/:orderId" element={<ShopOrderDetailPage />} />
          <Route path="settings" element={<ShopSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AdminLayout>
  );
};

export default App;
