import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { productsAPI, stockAPI } from '../lib/supabase';
import ProductModal from './ProductModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ProductDetailModal from './ProductDetailModal';
import StockAdjustmentModal from './StockAdjustmentModal';

const StockManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productModal, setProductModal] = useState({ isOpen: false, mode: 'create', product: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [detailModal, setDetailModal] = useState({ isOpen: false, product: null });
  const [adjustmentModal, setAdjustmentModal] = useState({ isOpen: false, product: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const itemsPerPage = 10;

  // Fetch products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await productsAPI.getAll();
      
      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      // Transform Supabase data to match the component's format
      const transformedData = data?.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: formatCategory(product.category),
        quantity: product.current_stock,
        minStock: product.min_stock,
        maxStock: product.max_stock,
        unit: product.unit,
        price: product.unit_price,
        location: product.location || 'Not specified',
        status: getStockStatus(product.current_stock, product.min_stock),
        lastRestocked: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : 'N/A',
        movement: 0, // This would come from stock_movements table
      })) || [];

      setStockItems(transformedData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // CREATE
  const handleCreate = async (formData) => {
    try {
      const { data, error } = await productsAPI.create(formData);
      if (error) throw error;
      
      await fetchProducts();
      showSuccess('Product created successfully!');
      setProductModal({ isOpen: false, mode: 'create', product: null });
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  // UPDATE
  const handleUpdate = async (formData) => {
    try {
      const { data, error } = await productsAPI.update(productModal.product.id, formData);
      if (error) throw error;
      
      await fetchProducts();
      showSuccess('Product updated successfully!');
      setProductModal({ isOpen: false, mode: 'edit', product: null });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  // DELETE
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const { error } = await productsAPI.update(deleteModal.product.id, { is_active: false });
      if (error) throw error;
      
      await fetchProducts();
      showSuccess('Product deleted successfully!');
      setDeleteModal({ isOpen: false, product: null });
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setProductModal({ isOpen: true, mode: 'create', product: null });
  };

  const openEditModal = (product) => {
    // Convert to database format
    const dbProduct = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      category: product.category.toLowerCase().replace(' ', '_'),
      unit: product.unit,
      current_stock: product.quantity,
      min_stock: product.minStock,
      max_stock: product.maxStock,
      unit_price: product.price,
      location: product.location,
    };
    setProductModal({ isOpen: true, mode: 'edit', product: dbProduct });
    setDetailModal({ isOpen: false, product: null });
  };

  const openDeleteModal = (product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const openDetailModal = (product) => {
    setDetailModal({ isOpen: true, product });
  };

  const openAdjustmentModal = (product) => {
    setAdjustmentModal({ isOpen: true, product });
  };

  // STOCK ADJUSTMENT
  const handleStockAdjustment = async (movement) => {
    try {
      const { error } = await stockAPI.updateStock(movement);
      if (error) throw error;
      
      await fetchProducts();
      showSuccess(`Stock ${movement.movement_type === 'in' ? 'increased' : 'decreased'} successfully!`);
      setAdjustmentModal({ isOpen: false, product: null });
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error;
    }
  };

  const formatCategory = (category) => {
    const categoryMap = {
      'raw_materials': 'Raw Materials',
      'components': 'Components',
      'finished_products': 'Finished Products',
      'packaging': 'Packaging',
    };
    return categoryMap[category] || category;
  };

  const getStockStatus = (current, min) => {
    if (current < min * 0.5) return 'critical';
    if (current < min) return 'warning';
    return 'good';
  };

  // Sample stock data (fallback if database is empty)
  const sampleStockItems = [
    {
      id: 1,
      name: 'Raw Material X',
      sku: 'RM-001',
      category: 'Raw Materials',
      quantity: 45,
      minStock: 100,
      maxStock: 500,
      unit: 'kg',
      price: 25.50,
      supplier: 'ABC Supplies',
      location: 'Warehouse A - Shelf 12',
      status: 'critical',
      lastRestocked: '2024-11-15',
      movement: -12,
    },
    {
      id: 2,
      name: 'Component Y',
      sku: 'CP-045',
      category: 'Components',
      quantity: 78,
      minStock: 150,
      maxStock: 600,
      unit: 'pcs',
      price: 15.75,
      supplier: 'XYZ Materials',
      location: 'Warehouse B - Shelf 05',
      status: 'warning',
      lastRestocked: '2024-11-20',
      movement: 5,
    },
    {
      id: 3,
      name: 'Material Z',
      sku: 'RM-089',
      category: 'Raw Materials',
      quantity: 120,
      minStock: 200,
      maxStock: 800,
      unit: 'L',
      price: 42.00,
      supplier: 'Global Parts',
      location: 'Warehouse A - Shelf 08',
      status: 'warning',
      lastRestocked: '2024-11-22',
      movement: -8,
    },
    {
      id: 4,
      name: 'Finished Product A',
      sku: 'FP-201',
      category: 'Finished Products',
      quantity: 350,
      minStock: 200,
      maxStock: 1000,
      unit: 'pcs',
      price: 125.00,
      supplier: 'Internal',
      location: 'Warehouse C - Zone A',
      status: 'good',
      lastRestocked: '2024-11-28',
      movement: 25,
    },
    {
      id: 5,
      name: 'Packaging Material',
      sku: 'PK-012',
      category: 'Packaging',
      quantity: 1200,
      minStock: 500,
      maxStock: 2000,
      unit: 'pcs',
      price: 2.50,
      supplier: 'Pack Solutions',
      location: 'Warehouse B - Shelf 15',
      status: 'good',
      lastRestocked: '2024-11-25',
      movement: 50,
    },
    {
      id: 6,
      name: 'Electronic Component E1',
      sku: 'EC-334',
      category: 'Components',
      quantity: 25,
      minStock: 100,
      maxStock: 400,
      unit: 'pcs',
      price: 85.00,
      supplier: 'TechParts Inc',
      location: 'Warehouse A - Shelf 03',
      status: 'critical',
      lastRestocked: '2024-11-10',
      movement: -15,
    },
    {
      id: 7,
      name: 'Adhesive Material',
      sku: 'RM-156',
      category: 'Raw Materials',
      quantity: 450,
      minStock: 300,
      maxStock: 1000,
      unit: 'L',
      price: 18.25,
      supplier: 'Chemical Supplies Co',
      location: 'Warehouse A - Shelf 20',
      status: 'good',
      lastRestocked: '2024-11-27',
      movement: 10,
    },
    {
      id: 8,
      name: 'Metal Sheet Type B',
      sku: 'RM-203',
      category: 'Raw Materials',
      quantity: 180,
      minStock: 150,
      maxStock: 500,
      unit: 'pcs',
      price: 55.00,
      supplier: 'Metal Works Ltd',
      location: 'Warehouse C - Zone B',
      status: 'good',
      lastRestocked: '2024-11-26',
      movement: 8,
    },
  ];

  const categories = ['all', 'Raw Materials', 'Components', 'Finished Products', 'Packaging'];

  // Calculate stats from real data
  const calculateStats = () => {
    const totalValue = stockItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const lowStockCount = stockItems.filter((item) => 
      item.status === 'critical' || item.status === 'warning'
    ).length;

    return [
      {
        title: 'Total Items',
        value: loading ? '...' : stockItems.length,
        icon: Package,
        color: 'blue',
      },
      {
        title: 'Low Stock',
        value: loading ? '...' : lowStockCount,
        icon: AlertTriangle,
        color: lowStockCount > 0 ? 'amber' : 'green',
      },
      {
        title: 'Total Value',
        value: loading ? '...' : `$${(totalValue / 1000).toFixed(1)}K`,
        icon: TrendingUp,
        color: 'green',
      },
      {
        title: 'Categories',
        value: categories.length - 1,
        icon: Filter,
        color: 'purple',
      },
    ];
  };

  const stats = calculateStats();

  const getStatusColor = (status) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      warning: 'bg-amber-100 text-amber-700 border-amber-200',
      good: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[status] || colors.good;
  };

  const getStockPercentage = (quantity, minStock, maxStock) => {
    return ((quantity - minStock) / (maxStock - minStock)) * 100;
  };

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-500 mt-1">
            {loading ? 'Loading inventory...' : `Manage and monitor your inventory levels (${stockItems.length} items)`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm hover:shadow-md flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    stat.color === 'blue'
                      ? 'bg-blue-50 text-blue-600'
                      : stat.color === 'amber'
                      ? 'bg-amber-50 text-amber-600'
                      : stat.color === 'green'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-purple-50 text-purple-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : stockItems.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No products found</p>
              <p className="text-gray-500 text-sm mt-1">Add products to your database or import seed data</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Adjust
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.status === 'critical'
                              ? 'bg-red-500'
                              : item.status === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              Math.max(
                                getStockPercentage(item.quantity, item.minStock, item.maxStock),
                                0
                              ),
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {item.minStock} / Max: {item.maxStock}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status === 'critical'
                        ? 'Critical'
                        : item.status === 'warning'
                        ? 'Low Stock'
                        : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{item.location}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      ${item.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openAdjustmentModal(item)}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium flex items-center space-x-1"
                        title="Adjust Stock"
                      >
                        <span className="text-sm">±</span>
                        <span>Adjust</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openDetailModal(item)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(item)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredItems.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(startIndex + itemsPerPage, filteredItems.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredItems.length}</span> results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={productModal.isOpen}
        onClose={() => setProductModal({ isOpen: false, mode: 'create', product: null })}
        onSave={productModal.mode === 'create' ? handleCreate : handleUpdate}
        product={productModal.product}
        mode={productModal.mode}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleDelete}
        productName={deleteModal.product?.name}
        loading={deleteLoading}
      />

      <ProductDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, product: null })}
        product={detailModal.product}
        onEdit={openEditModal}
      />

      <StockAdjustmentModal
        isOpen={adjustmentModal.isOpen}
        onClose={() => setAdjustmentModal({ isOpen: false, product: null })}
        onSave={handleStockAdjustment}
        product={adjustmentModal.product}
      />
    </div>
  );
};

export default StockManagement;
