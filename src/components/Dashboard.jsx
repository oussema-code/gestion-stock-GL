import { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Factory, 
  TrendingUp,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { productsAPI } from '../lib/supabase';

const Dashboard = ({ onStockAlertClick, stockAlerts = [] }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalValue: 0,
    activeSuppliers: 8,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const { data: products } = await productsAPI.getAll();
      const lowStockProducts = products?.filter(p => p.current_stock < p.min_stock) || [];
      
      // Calculate total inventory value
      const totalValue = products?.reduce((acc, product) => {
        return acc + (product.current_stock * product.unit_price);
      }, 0) || 0;
      
      setStats({
        totalProducts: products?.length || 0,
        lowStockCount: lowStockProducts.length,
        totalValue: totalValue,
        activeSuppliers: 8,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Products',
      value: loading ? '...' : stats.totalProducts.toString(),
      change: '+12%',
      trend: 'up',
      icon: Package,
      color: 'blue',
    },
    {
      title: 'Low Stock Items',
      value: loading ? '...' : stats.lowStockCount.toString(),
      change: stockAlerts.length > 0 ? 'Alert!' : 'Good',
      trend: stockAlerts.length > 0 ? 'down' : 'up',
      icon: AlertTriangle,
      color: stockAlerts.length > 0 ? 'amber' : 'green',
    },
    {
      title: 'Total Value',
      value: loading ? '...' : `$${(stats.totalValue / 1000).toFixed(1)}K`,
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Active Suppliers',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: Factory,
      color: 'purple',
    },
  ];

  const productionStatus = [
    { line: 'Line A', product: 'Product Alpha', status: 'running', completion: 75 },
    { line: 'Line B', product: 'Product Beta', status: 'idle', completion: 0 },
    { line: 'Line C', product: 'Product Gamma', status: 'running', completion: 45 },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      amber: 'bg-amber-50 text-amber-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Alerts Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Stock Alerts</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {stockAlerts.length} {stockAlerts.length === 1 ? 'alert' : 'alerts'}
              </span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="p-6">
          {stockAlerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stockAlerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => onStockAlertClick(alert)}
                  className="p-4 border border-amber-200 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.product}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        alert.priority === 'critical' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {alert.priority === 'critical' ? 'Critical' : 'Low Stock'}
                      </span>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 ml-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-600">Current: </span>
                      <span className="font-medium text-red-600">{alert.current}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Min: </span>
                      <span className="font-medium text-gray-900">{alert.minimum}</span>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((alert.current / alert.minimum) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg text-gray-900 font-semibold">All stock levels are optimal!</p>
              <p className="text-gray-500 text-sm mt-2">No items below minimum threshold</p>
            </div>
          )}
        </div>
      </div>

      {/* Production Planning */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Production Planning Status</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {productionStatus.map((item) => (
              <div key={item.line} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === 'running' ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    ></div>
                    <span className="font-medium text-gray-900">{item.line}</span>
                    <span className="text-sm text-gray-500">- {item.product}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">
                      {item.completion}%
                    </span>
                    {item.status === 'running' ? (
                      <PlayCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${item.completion}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Package className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Add Product</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ShoppingCart className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">New Purchase</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Factory className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Start Production</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;