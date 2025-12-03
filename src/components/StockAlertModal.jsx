import { X, AlertTriangle, Package, Calendar, TrendingDown } from 'lucide-react';

const StockAlertModal = ({ isOpen, onClose, alertData }) => {
  if (!isOpen || !alertData) return null;

  const lastMovement = new Date();
  lastMovement.setDate(lastMovement.getDate() - 3);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200 p-6 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-200 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Stock Alert</h2>
                  <p className="text-sm text-amber-700 mt-1">
                    Immediate attention required
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-amber-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Alert Message */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p className="text-amber-900 font-medium">
                <strong>{alertData.product}</strong> is below minimum threshold
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Stock level has dropped below the safety threshold. Consider creating a purchase request to replenish inventory.
              </p>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Product Name</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{alertData.product}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Status</span>
                </div>
                <p className="text-lg font-semibold text-red-600">Critical</p>
              </div>
            </div>

            {/* Stock Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Stock Information</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                  <p className="text-3xl font-bold text-red-600">{alertData.current}</p>
                  <p className="text-xs text-gray-500 mt-1">units</p>
                </div>

                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Minimum Stock</p>
                  <p className="text-3xl font-bold text-blue-600">{alertData.minimum}</p>
                  <p className="text-xs text-gray-500 mt-1">units</p>
                </div>

                <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Shortage</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {alertData.minimum - alertData.current}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">units</p>
                </div>
              </div>

              {/* Stock Level Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stock Level</span>
                  <span className="font-medium text-red-600">
                    {Math.round((alertData.current / alertData.minimum) * 100)}% of minimum
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min((alertData.current / alertData.minimum) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Additional Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Movement</p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {lastMovement.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Package className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Category</p>
                    <p className="text-sm text-gray-900 font-semibold">Raw Materials</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <h4 className="font-semibold text-primary-900 mb-2">Recommended Action</h4>
              <p className="text-sm text-primary-800">
                Create a purchase request for at least{' '}
                <strong>{alertData.minimum - alertData.current + 50}</strong> units to restore
                stock to optimal levels and maintain a safety buffer.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
            <div className="flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm hover:shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockAlertModal;
