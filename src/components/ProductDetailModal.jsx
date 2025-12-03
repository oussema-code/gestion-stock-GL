import { X, Package, MapPin, DollarSign, TrendingUp, Calendar, Edit2 } from 'lucide-react';

const ProductDetailModal = ({ isOpen, onClose, product, onEdit }) => {
  if (!isOpen || !product) return null;

  const getStatusColor = (status) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      warning: 'bg-amber-100 text-amber-700 border-amber-200',
      good: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[status] || colors.good;
  };

  const getStockPercentage = () => {
    return ((product.quantity - product.minStock) / (product.maxStock - product.minStock)) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
              <Package className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-gray-500 mt-1">SKU: {product.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusColor(
                product.status
              )}`}
            >
              {product.status === 'critical'
                ? 'Critical Stock'
                : product.status === 'warning'
                ? 'Low Stock'
                : 'In Stock'}
            </span>
            <button
              onClick={() => onEdit(product)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Product</span>
            </button>
          </div>

          {/* Stock Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                <p className="text-3xl font-bold text-gray-900">{product.quantity}</p>
                <p className="text-sm text-gray-500">{product.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Minimum Stock</p>
                <p className="text-2xl font-bold text-amber-600">{product.minStock}</p>
                <p className="text-sm text-gray-500">{product.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Maximum Stock</p>
                <p className="text-2xl font-bold text-green-600">{product.maxStock}</p>
                <p className="text-sm text-gray-500">{product.unit}</p>
              </div>
            </div>

            {/* Stock Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Stock Level</span>
                <span className="text-sm text-gray-500">
                  {Math.round(getStockPercentage())}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    product.status === 'critical'
                      ? 'bg-red-500'
                      : product.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(Math.max(getStockPercentage(), 0), 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p className="text-base font-medium text-gray-900">{product.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Unit Price
                </p>
                <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Location
                </p>
                <p className="text-base font-medium text-gray-900">{product.location}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Supplier</p>
                <p className="text-base font-medium text-gray-900">{product.supplier || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Last Restocked
                </p>
                <p className="text-base font-medium text-gray-900">{product.lastRestocked}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Recent Movement
                </p>
                <p className={`text-base font-bold ${product.movement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.movement > 0 ? '+' : ''}{product.movement} {product.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-primary-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 mb-1">Total Stock Value</p>
                <p className="text-3xl font-bold text-primary-700">
                  ${(product.quantity * product.price).toFixed(2)}
                </p>
              </div>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
