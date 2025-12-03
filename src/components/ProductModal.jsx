import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSave, product, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'raw_materials',
    unit: 'pcs',
    current_stock: 0,
    min_stock: 0,
    max_stock: 0,
    unit_price: 0,
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'raw_materials',
        unit: product.unit || 'pcs',
        current_stock: product.current_stock || 0,
        min_stock: product.min_stock || 0,
        max_stock: product.max_stock || 0,
        unit_price: product.unit_price || 0,
        location: product.location || '',
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        sku: '',
        name: '',
        description: '',
        category: 'raw_materials',
        unit: 'pcs',
        current_stock: 0,
        min_stock: 0,
        max_stock: 0,
        unit_price: 0,
        location: '',
      });
    }
    setErrors({});
  }, [product, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.min_stock < 0) newErrors.min_stock = 'Min stock must be >= 0';
    if (formData.max_stock < formData.min_stock) {
      newErrors.max_stock = 'Max stock must be >= min stock';
    }
    if (formData.current_stock < 0) newErrors.current_stock = 'Current stock must be >= 0';
    if (formData.unit_price < 0) newErrors.unit_price = 'Price must be >= 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          {/* SKU and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                disabled={mode === 'edit'}
                placeholder="e.g., RM-001"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                } ${mode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Raw Material X"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Product description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="raw_materials">Raw Materials</option>
                <option value="components">Components</option>
                <option value="finished_products">Finished Products</option>
                <option value="packaging">Packaging</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., kg, L, pcs"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock
              </label>
              <input
                type="number"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.current_stock ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.current_stock && <p className="text-red-500 text-xs mt-1">{errors.current_stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Stock
              </label>
              <input
                type="number"
                name="min_stock"
                value={formData.min_stock}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.min_stock ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.min_stock && <p className="text-red-500 text-xs mt-1">{errors.min_stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Stock
              </label>
              <input
                type="number"
                name="max_stock"
                value={formData.max_stock}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.max_stock ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.max_stock && <p className="text-red-500 text-xs mt-1">{errors.max_stock}</p>}
            </div>
          </div>

          {/* Price and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price ($)
              </label>
              <input
                type="number"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.unit_price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.unit_price && <p className="text-red-500 text-xs mt-1">{errors.unit_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Warehouse A - Shelf 12"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
