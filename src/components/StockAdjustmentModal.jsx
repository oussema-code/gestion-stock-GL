import { useState } from 'react';
import { X, Plus, Minus, Package, Save } from 'lucide-react';

const StockAdjustmentModal = ({ isOpen, onClose, onSave, product }) => {
  const [adjustmentType, setAdjustmentType] = useState('in'); // 'in' or 'out'
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (adjustmentType === 'out' && quantity > product.quantity) {
      setError(`Cannot reduce more than current stock (${product.quantity} ${product.unit})`);
      return;
    }

    setLoading(true);
    try {
      await onSave({
        product_id: product.id,
        movement_type: adjustmentType,
        quantity: quantity,
        reference_type: 'manual_adjustment',
        notes: notes || 'Manual stock adjustment'
      });
      
      // Reset form
      setQuantity(0);
      setNotes('');
      setAdjustmentType('in');
      onClose();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      setError('Failed to adjust stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const newStock = adjustmentType === 'in' 
    ? product.quantity + quantity 
    : product.quantity - quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Adjust Stock</h2>
              <p className="text-sm text-gray-500 mt-1">{product.name}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Current Stock Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">{product.quantity} {product.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">SKU</p>
                <p className="text-sm font-medium text-gray-900">{product.sku}</p>
              </div>
            </div>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdjustmentType('in')}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'in'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Stock</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('out')}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'out'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <Minus className="w-5 h-5" />
                <span className="font-medium">Reduce Stock</span>
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder={`Enter quantity in ${product.unit}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                required
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                {product.unit}
              </span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Amounts</p>
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setQuantity(amount)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Reason for adjustment..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* New Stock Preview */}
          {quantity > 0 && (
            <div className={`rounded-lg p-4 ${
              adjustmentType === 'in' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    adjustmentType === 'in' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    New Stock Level
                  </p>
                  <p className={`text-2xl font-bold ${
                    adjustmentType === 'in' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {newStock} {product.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${
                    adjustmentType === 'in' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {adjustmentType === 'in' ? '+' : '-'}{quantity} {product.unit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || quantity <= 0}
              className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                adjustmentType === 'in'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {loading 
                  ? 'Saving...' 
                  : adjustmentType === 'in' 
                    ? 'Add Stock' 
                    : 'Reduce Stock'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
