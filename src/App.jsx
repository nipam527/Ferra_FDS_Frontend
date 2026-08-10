import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Restaurants from "./pages/Restaurants";
import RestaurantDetail from "./pages/RestaurantDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateRestaurant from "./pages/CreateRestaurant";
import Navbar from "./components/Navbar";
import VendorDashboard from "./pages/VendorDashboard";
import AddMenuItem from "./pages/AddMenuItem";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/OrderDetail";
import OrderHistory from "./pages/OrderHistory";
import VendorOrders from "./pages/VendorOrders";
import RiderDashboard from "./pages/RiderDashboard";
import RiderDeliveries from "./pages/RiderDeliveries";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRestaurants from "./pages/AdminRestaurants";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import AdminCoupons from "./pages/AdminCoupons";
import ForgotPassword from "./pages/ForgotPassword";
import VendorAnalytics from "./pages/VendorAnalytics";
import VendorAnalyticsRedirect from "./pages/VendorAnalyticsRedirect";
import VendorMenu from "./pages/VendorMenu";
import Favorites from "./pages/Favorites";
import VendorEarnings from "./pages/VendorEarnings";
import CustomerCoupons from "./pages/CustomerCoupons";




function App() {
  return (
     <>
      <Navbar />
    <Routes>
      <Route path="/" element={<Restaurants />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/restaurants/:id" element={<RestaurantDetail />} />
      <Route
  path="/vendor/dashboard"
  element={
    <ProtectedRoute allowedRoles={["vendor"]}>
      <VendorDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/checkout"
  element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <Checkout />
    </ProtectedRoute>
  }
/>
<Route
  path="/orders"
  element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <OrderHistory />
    </ProtectedRoute>
  }
/>
<Route
  path="/orders/:id"
  element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <OrderDetail />
    </ProtectedRoute>
  }
/>

<Route
  path="/cart"
  element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <Cart />
    </ProtectedRoute>
  }
/>

<Route path="/coupons" element={<CustomerCoupons />} />

<Route
  path="/vendor/create-restaurant"
  element={
    <ProtectedRoute allowedRoles = {["vendor"]}>
      <CreateRestaurant />
    </ProtectedRoute>
  }
/>


<Route path="/vendor/restaurants/:restaurantId/earnings" element={<VendorEarnings />} />
<Route
  path="/vendor/restaurants/:restaurantId/add-menu-item"
  element={
    <ProtectedRoute allowedRoles={["vendor"]}>
      <AddMenuItem />
    </ProtectedRoute>
  }
/>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
  path="/vendor/restaurants/:restaurantId/orders"
  element={
    <ProtectedRoute allowedRoles={["vendor"]}>
      <VendorOrders />
    </ProtectedRoute>
  }
/>


<Route
  path="/rider/dashboard"
  element={
    <ProtectedRoute allowedRoles={["rider"]}>
      <RiderDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/rider/deliveries"
  element={
    <ProtectedRoute allowedRoles={["rider"]}>
      <RiderDeliveries />
    </ProtectedRoute>
  }
/>


<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/restaurants"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminRestaurants />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminUsers />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/orders"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminOrders />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/coupons"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminCoupons />
    </ProtectedRoute>
  }
/>

<Route
  path="/vendor/restaurants/:restaurantId/analytics"
  element={
    <ProtectedRoute allowedRoles={["vendor"]}>
      <VendorAnalytics />
    </ProtectedRoute>
  }
/>



<Route
  path="/vendor/analytics"
  element={
    <ProtectedRoute allowedRoles={["vendor"]}>
      <VendorAnalyticsRedirect />
    </ProtectedRoute>
  }
/>


<Route
  path="/vendor/restaurants/:restaurantId/menu"
  element={
    <ProtectedRoute allowedRoles={["vendor"]}>
      <VendorMenu />
    </ProtectedRoute>
  }
/>


<Route
  path="/favorites"
  element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <Favorites />
    </ProtectedRoute>
  }
/>

<Route path="/forgot-password" element={<ForgotPassword />} />

    </Routes>
    </>
  );
}

export default App;