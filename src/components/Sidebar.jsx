import { 
  LayoutDashboard, 
  Package, 
  Factory, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Calculator, 
  Settings 
} from 'lucide-react';

const Sidebar = ({ currentPage, onNavigate }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: Package, label: 'Stock', page: 'stock' },
    { icon: Factory, label: 'Production', page: 'production' },
    { icon: Users, label: 'CRM', page: 'crm' },
    { icon: ShoppingCart, label: 'Purchases', page: 'purchases' },
    { icon: TrendingUp, label: 'Sales', page: 'sales' },
    { icon: Calculator, label: 'Accounting', page: 'accounting' },
    { icon: Settings, label: 'Settings', page: 'settings' },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">ManufactERP</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
            JD
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
