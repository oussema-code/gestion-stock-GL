import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import StockManagement from './components/StockManagement';
import StockAlertModal from './components/StockAlertModal';
import Login from './components/Login';
import { auth, stockAPI, productsAPI } from './lib/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [stockAlerts, setStockAlerts] = useState([]);

  // Check if user is already logged in
  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch stock alerts when user logs in
  useEffect(() => {
    if (user) {
      fetchStockAlerts();
    }
  }, [user]);

  const checkUser = async () => {
    const { user } = await auth.getCurrentUser();
    setUser(user);
    setLoading(false);
  };

  const fetchStockAlerts = async () => {
    // Fetch products directly and filter for low stock
    const { data: products, error } = await productsAPI.getAll();
    
    if (products && !error) {
      // Find products below minimum stock
      const lowStockProducts = products.filter(product => 
        product.current_stock < product.min_stock && product.is_active
      );
      
      // Transform to alert format expected by Dashboard
      const formattedAlerts = lowStockProducts.map(product => {
        const stockPercentage = (product.current_stock / product.min_stock) * 100;
        const priority = stockPercentage < 50 ? 'critical' : 'medium';
        
        return {
          id: product.id,
          product: product.name,
          current: product.current_stock,
          minimum: product.min_stock,
          priority: priority,
          productId: product.id,
        };
      });
      
      setStockAlerts(formattedAlerts);
      
      // Auto-open first critical alert
      const criticalAlert = formattedAlerts.find(alert => alert.priority === 'critical');
      if (criticalAlert) {
        setTimeout(() => {
          handleStockAlertClick(criticalAlert);
        }, 1000);
      }
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setCurrentPage('dashboard');
  };

  const handleStockAlertClick = (alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNotificationClick = () => {
    if (stockAlerts.length > 0 && !isModalOpen) {
      handleStockAlertClick(stockAlerts[0]);
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onStockAlertClick={handleStockAlertClick} stockAlerts={stockAlerts} />;
      case 'stock':
        return <StockManagement />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Module
              </h2>
              <p className="text-gray-500">This module is under development</p>
            </div>
          </div>
        );
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main app
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Stock Alert Banner */}
        {stockAlerts.length > 0 && currentPage === 'dashboard' && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold text-sm">!</span>
              </div>
              <span className="font-medium">
                <strong>Stock Alert:</strong> {stockAlerts.length} product(s) below minimum threshold
              </span>
            </div>
            <button
              onClick={() => handleStockAlertClick(stockAlerts[0])}
              className="px-4 py-1.5 bg-white text-amber-600 font-medium rounded-lg hover:bg-amber-50 transition-colors text-sm"
            >
              View Details
            </button>
          </div>
        )}

        {/* Navbar */}
        <Navbar
          user={user}
          onLogout={handleLogout}
          onNotificationClick={handleNotificationClick}
          hasUnreadNotifications={stockAlerts.length > 0}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {renderPage()}
        </div>
      </div>

      {/* Stock Alert Modal */}
      <StockAlertModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        alertData={selectedAlert}
      />
    </div>
  );
}

export default App;
