import React, { useState, useEffect } from 'react';
import { 
  Package, ShoppingCart, PlusCircle, Pencil, Mail, Settings, CheckCircle2, 
  AlertCircle, RefreshCw, Trash2, 
  ExternalLink, 
  Check
} from 'lucide-react';
import { api } from '../services/api';
import BrandLogo from './BrandLogo';

export default function AdminDashboard({ onSwitchToStore, settings, onRefreshSettings, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders'); // orders, products, add-product, emails, settings
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  // Selected Email for HTML preview modal
  const [previewEmail, setPreviewEmail] = useState(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Bags',
    price: '',
    originalPrice: '',
    stock: 15,
    badge: 'New Arrival',
    description: '',
    features: '',
    imageUrl: ''
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  // When set, the product form edits this product instead of adding a new one
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    shopName: 'Masfeeh',
    tagline: 'Accessorize Your World',
    slogan: 'Little Things... Big Happiness ♡',
    ownerEmail: 'maishamonsura@gmail.com',
    ownerPhone: '01303-662891',
    address: 'Bashundhara R/A, Dhaka, Bangladesh',
    shippingDhaka: 70,
    shippingOutsideDhaka: 130,
    facebookUrl: 'https://www.facebook.com/profile.php?id=61596179578624',
    instagramUrl: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    senderName: 'Masfeeh Online Shop'
  });
  const [testEmailTarget, setTestEmailTarget] = useState('maishamonsura@gmail.com');
  const [testingSmtp, setTestingSmtp] = useState(false);

  // Load all initial admin data
  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, emailsData, statsData, settingsData] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
        api.getEmails(),
        api.getStats(),
        api.getSettings()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setEmails(emailsData);
      setStats(statsData);
      setSettingsForm(settingsData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show transient toast
  const showToast = (msg, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(''), 5000);
    } else {
      setActionMessage(msg);
      setTimeout(() => setActionMessage(''), 5000);
    }
  };

  // KEY ACTION: Accept Order -> triggers customer notification email!
  const handleAcceptOrder = async (orderId) => {
    try {
      const targetOrder = orders.find(o => o.id === orderId);
      const res = await api.updateOrderStatus(orderId, 'Accepted', 'Order accepted and confirmed by Masfeeh shop owner.');
      showToast(`🎉 Order #${orderId} accepted! Confirmation notification sent to ${targetOrder?.customer?.email || 'customer'}.`);
      loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch (err) {
      showToast(err.message || 'Failed to accept order', true);
    }
  };

  // Update order status with custom note or courier code
  const handleUpdateStatus = async (orderId, newStatus, courierCode) => {
    try {
      const res = await api.updateOrderStatus(
        orderId, 
        newStatus, 
        `Status updated to ${newStatus}`, 
        courierCode || 'Steadfast Courier'
      );
      showToast(`Order #${orderId} status updated to ${newStatus}`);
      loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', true);
    }
  };

  // Handle Image File selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const blankProduct = {
    name: '',
    category: 'Bags',
    price: '',
    originalPrice: '',
    stock: 15,
    badge: 'New Arrival',
    description: '',
    features: '',
    imageUrl: ''
  };

  const resetProductForm = () => {
    setNewProduct(blankProduct);
    setSelectedImageFile(null);
    setImagePreview('');
    setEditingId(null);
  };

  // Open the product form pre-filled with an existing product
  const startEditProduct = (p) => {
    setEditingId(p.id);
    setNewProduct({
      name: p.name || '',
      category: p.category || 'Bags',
      price: p.price ?? '',
      originalPrice: p.originalPrice ?? '',
      stock: p.stock ?? 0,
      badge: p.badge || '',
      description: p.description || '',
      features: (p.features || []).join('\n'),
      imageUrl: p.image || ''
    });
    setSelectedImageFile(null);
    setImagePreview(p.image || '');
    setActiveTab('add-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add New Product (or save changes when editing)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      return showToast('Please provide at least product name and price', true);
    }

    setAddingProduct(true);
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category);
      formData.append('price', newProduct.price);
      if (newProduct.originalPrice) formData.append('originalPrice', newProduct.originalPrice);
      formData.append('stock', newProduct.stock);
      formData.append('badge', newProduct.badge);
      formData.append('description', newProduct.description);
      formData.append('features', newProduct.features);
      if (editingId && !newProduct.originalPrice) formData.append('originalPrice', '');

      if (selectedImageFile) {
        formData.append('imageFile', selectedImageFile);
      } else if (newProduct.imageUrl) {
        formData.append('imageUrl', newProduct.imageUrl);
      }

      if (editingId) {
        await api.updateProduct(editingId, formData);
        showToast(`Changes to "${newProduct.name}" saved`);
      } else {
        await api.addProduct(formData);
        showToast(`✨ Product "${newProduct.name}" added successfully!`);
      }
      resetProductForm();
      loadData();
      if (onRefreshSettings) onRefreshSettings(); // refresh the storefront catalogue too
      setActiveTab('products');
    } catch (err) {
      showToast(err.message || (editingId ? 'Failed to save changes' : 'Failed to add product'), true);
    } finally {
      setAddingProduct(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      showToast(`Product "${name}" deleted`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete product', true);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(settingsForm);
      showToast('Settings saved successfully!');
      onRefreshSettings();
    } catch (err) {
      showToast(err.message || 'Failed to save settings', true);
    }
  };

  // Test SMTP
  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    try {
      await api.testSmtp(testEmailTarget);
      showToast(`Test email successfully sent to ${testEmailTarget}! Check your inbox.`);
      loadData();
    } catch (err) {
      showToast(`SMTP Error: ${err.message}`, true);
    } finally {
      setTestingSmtp(false);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-stone-800">
      {/* Admin Top Navbar */}
      <div className="bg-[#1f1d1d] text-white border-b border-stone-800 px-4 sm:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo variant="iconOnly" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-luxury text-lg font-bold text-[#faf5ee]">
                  Masfeeh Owner Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c59b27] text-white">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Logged in as {user?.role === 'owner' ? 'Owner' : 'Admin'} • {user?.email || settings?.ownerEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2 text-stone-400 hover:text-white bg-stone-800/80 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onSwitchToStore}
              className="px-3.5 py-2 bg-[#faf5ee] hover:bg-white text-stone-900 text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Back to Customer Store</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {actionMessage && (
        <div className="fixed top-18 right-6 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-600 text-xs flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{actionMessage}</span>
        </div>
      )}
      {actionError && (
        <div className="fixed top-18 right-6 z-50 bg-rose-800 text-white px-4 py-3 rounded-xl shadow-xl border border-rose-600 text-xs flex items-center gap-2 animate-in slide-in-from-top-4">
          <AlertCircle className="w-4 h-4 text-rose-300" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-6 border-b border-stone-300">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#1f1d1d] text-[#e6c89c] shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Orders Management</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-[#c59b27] text-white rounded-full">
                {pendingCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => { resetProductForm(); setActiveTab('add-product'); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'add-product'
                ? 'bg-[#1f1d1d] text-[#e6c89c] shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#c59b27]" />
            <span>+ Add New Item</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#1f1d1d] text-[#e6c89c] shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'emails'
                ? 'bg-[#1f1d1d] text-[#e6c89c] shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Activity & Outbox ({emails.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#1f1d1d] text-[#e6c89c] shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Shop & SMTP Settings</span>
          </button>
        </div>

        {/* STATS OVERVIEW CARDS */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Total Sales</span>
              <div className="mt-1 text-xl sm:text-2xl font-bold text-stone-900">
                ৳{stats.totalSales.toLocaleString()}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Across {stats.totalOrders} total orders</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pending Acceptance</span>
              <div className="mt-1 text-xl sm:text-2xl font-bold text-[#b07e15]">
                {stats.pendingOrders}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Requires owner confirmation</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Accepted / In Transit</span>
              <div className="mt-1 text-xl sm:text-2xl font-bold text-emerald-700">
                {stats.acceptedOrders}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Notified & packaging</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Live Catalog Items</span>
              <div className="mt-1 text-xl sm:text-2xl font-bold text-stone-900">
                {stats.totalProducts}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Bags, Nails, Bangles, Rings</p>
            </div>
          </div>
        )}

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-serif-luxury text-lg font-bold text-stone-900">
                  Customer Orders
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Click <strong>"Accept Order"</strong> on any pending order to automatically send the customer an acceptance email notification.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center text-stone-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No orders received yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Owner Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map((o) => {
                      const isPending = o.status === 'Pending';
                      return (
                        <tr key={o.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-stone-900 block font-mono">#{o.id}</span>
                            <span className="text-[10px] text-stone-400">
                              {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-stone-900">{o.customer?.name}</div>
                            <div className="text-[11px] text-stone-500">{o.customer?.phone}</div>
                            <div className="text-[11px] text-stone-400 truncate max-w-xs">{o.customer?.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 max-w-xs">
                              {o.items?.map((it, idx) => (
                                <div key={idx} className="truncate text-stone-700">
                                  <strong>{it.quantity}x</strong> {it.name}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-stone-900 text-sm">৳{o.total?.toLocaleString()}</span>
                            <span className="block text-[10px] text-stone-400">{o.paymentMethod}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              o.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : o.status === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.status === 'Delivered'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-stone-200 text-stone-800'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Prominent ACCEPT ORDER button */}
                              {isPending ? (
                                <button
                                  onClick={() => handleAcceptOrder(o.id)}
                                  className="px-3.5 py-1.5 bg-[#c59b27] hover:bg-[#a67e16] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                                  title="Accept order & send notification to customer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept Order</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Accepted</span>
                                </span>
                              )}

                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded-lg transition-colors"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD NEW PRODUCT ("owner can add new item easily") */}
        {activeTab === 'add-product' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 max-w-3xl mx-auto">
            <div className="border-b border-stone-200 pb-4 mb-6">
              <div className="flex items-center gap-2">
                {editingId ? <Pencil className="w-6 h-6 text-[#c59b27]" /> : <PlusCircle className="w-6 h-6 text-[#c59b27]" />}
                <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
                  {editingId ? 'Edit Item' : 'Add New Item to Shop'}
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {editingId
                  ? 'Change any detail, price, stock or photo, then save. Changes appear in the shop straight away.'
                  : "Quickly add a new bag, nail set, jewelry or hair accessory to Masfeeh's online catalog."}
              </p>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luxury Monogram Crossbody Bag with Dual Belts"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  >
                    <option value="Bags">Bags (Crossbody, Handbags)</option>
                    <option value="Hair Accessories">Hair Accessories</option>
                    <option value="Fake Nails">Fake Nails</option>
                    <option value="Rings">Rings</option>
                    <option value="Bangles & More">Bangles & More</option>
                  </select>
                </div>

                {/* Badge Tag */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Badge / Tag
                  </label>
                  <select
                    value={newProduct.badge}
                    onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  >
                    <option value="">No badge</option>
                    <option value="New Arrival">New Arrival</option>
                    <option value="New">New</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Featured">Featured</option>
                    <option value="Popular">Popular</option>
                    <option value="Trending">Trending</option>
                    <option value="Limited Edition">Limited Edition</option>
                    <option value="Hot">Hot</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Selling Price (৳ BDT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1850"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  />
                </div>

                {/* Original Compare Price */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Original Price (Optional strikethrough)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2350"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  />
                </div>

                {/* Image Upload Option */}
                <div className="sm:col-span-2 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    Item Photo (Upload from computer or use image URL)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1f1d1d] file:text-[#e6c89c] hover:file:bg-stone-800 cursor-pointer"
                    />
                    <span className="text-xs text-stone-400">or URL:</span>
                    <input
                      type="text"
                      placeholder="e.g. /assets/bag_fiom.jpg or https://..."
                      value={newProduct.imageUrl}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, imageUrl: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#c59b27]"
                    />
                  </div>

                  {/* Image Preview Box */}
                  {imagePreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-stone-300"
                      />
                      <span className="text-xs text-emerald-700 font-semibold">Photo ready!</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Premium cross body bag with both long and short belt. Features our signature monogram finish..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  />
                </div>

                {/* Features (one per line) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Bullet Features (One per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Includes both long and short belt&#10;Dual gold zipper partitions&#10;Scratch resistant leather finish"
                    value={newProduct.features}
                    onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { resetProductForm(); setActiveTab('products'); }}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingProduct}
                  className="px-6 py-2.5 bg-[#1f1d1d] hover:bg-stone-800 text-[#e6c89c] text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4 text-[#d4af37]" />
                  <span>
                    {editingId
                      ? (addingProduct ? 'Saving...' : 'Save Changes')
                      : (addingProduct ? 'Adding Item...' : 'Publish Product to Shop')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: PRODUCT INVENTORY */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center">
              <div>
                <h2 className="font-serif-luxury text-lg font-bold text-stone-900">
                  Product Inventory
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Currently active products in your shop ({products.length} items).
                </p>
              </div>
              <button
                onClick={() => { resetProductForm(); setActiveTab('add-product'); }}
                className="px-3.5 py-2 bg-[#1f1d1d] hover:bg-stone-800 text-[#e6c89c] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
              {products.map((p) => (
                <div key={p.id} className="border border-stone-200 rounded-xl overflow-hidden p-3 bg-stone-50/50 flex flex-col justify-between">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-white mb-2.5">
                    <img
                      src={p.image || '/assets/bag_fiom.jpg'}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/bag_fiom.jpg';
                      }}
                    />
                    {p.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#1f1d1d] text-[#e6c89c]">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">{p.category}</span>
                    <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{p.name}</h4>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm font-bold text-stone-900">৳{p.price.toLocaleString()}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-stone-400 line-through">৳{p.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Stock: <strong className={p.stock > 0 ? 'text-emerald-700' : 'text-rose-700'}>{p.stock} units</strong>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-200 flex justify-between items-center gap-1">
                    <button
                      onClick={() => startEditProduct(p)}
                      className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 flex items-center gap-1.5 transition-colors"
                      title="Edit Product"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-200/50 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EMAIL NOTIFICATIONS & OUTBOX */}
        {activeTab === 'emails' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-200">
              <h2 className="font-serif-luxury text-lg font-bold text-stone-900">
                Email Dispatch Activity & Audit Log
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Every email sent to the owner on new orders, and every acceptance notification sent to customers is recorded here. Click <strong>"Preview Email"</strong> to inspect the exact HTML layout delivered.
              </p>
            </div>

            {emails.length === 0 ? (
              <div className="p-12 text-center text-stone-400">
                <Mail className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No email records in outbox yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {emails.map((m) => (
                      <tr key={m.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                          {new Date(m.timestamp).toLocaleDateString()} {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          {m.to}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.type === 'OWNER_NEW_ORDER'
                              ? 'bg-amber-100 text-amber-800'
                              : m.type === 'CUSTOMER_ORDER_ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {m.type === 'OWNER_NEW_ORDER' ? 'Owner Order Alert' : m.type === 'CUSTOMER_ORDER_ACCEPTED' ? 'Customer Order Accepted' : 'Customer Confirmation'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-700 max-w-xs truncate" title={m.subject}>
                          {m.subject}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-medium text-emerald-700">
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setPreviewEmail(m)}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs transition-colors"
                          >
                            Preview Email
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SHOP & SMTP SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
                Shop Information & SMTP Configuration
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Configure owner contact details, notification emails, and real Gmail / SMTP credentials.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.shopName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shopName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Owner Notification Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={settingsForm.ownerEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400">All new customer orders will trigger an email to this address.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Owner Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={settingsForm.ownerPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Shop Address
                  </label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Shipping (Inside Dhaka)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.shippingDhaka}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shippingDhaka: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Shipping (Outside Dhaka)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.shippingOutsideDhaka}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shippingOutsideDhaka: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                {/* Social Media Links (Facebook & Instagram) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Official Facebook Page URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.facebook.com/profile.php?id=..."
                    value={settingsForm.facebookUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                  <span className="text-[10px] text-stone-400">Current: https://www.facebook.com/profile.php?id=61596179578624</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Official Instagram Profile URL (Add anytime!)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/masfeeh_official"
                    value={settingsForm.instagramUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                  <span className="text-[10px] text-stone-400">When provided, the Instagram button automatically appears in the header and footer!</span>
                </div>
              </div>

              {/* SMTP Credentials */}
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#c59b27]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Live SMTP Server Setup (Optional for Live Inboxes)
                  </h3>
                </div>
                <p className="text-[11px] text-stone-500">
                  By default, all emails are formatted and captured in the Email Activity Tab with complete HTML fidelity. To send live real emails through your Gmail or domain SMTP, enter credentials below:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      SMTP Host (e.g. smtp.gmail.com)
                    </label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      value={settingsForm.smtpHost || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpHost: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      SMTP Port (587 or 465)
                    </label>
                    <input
                      type="number"
                      placeholder="587"
                      value={settingsForm.smtpPort || 587}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpPort: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      SMTP Username / Email
                    </label>
                    <input
                      type="text"
                      placeholder="yourname@gmail.com"
                      value={settingsForm.smtpUser || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpUser: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      SMTP Password / App Password
                    </label>
                    <input
                      type="password"
                      placeholder="Gmail 16-character App Password"
                      value={settingsForm.smtpPass || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpPass: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* SMTP Test Row */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="email"
                      placeholder="Target test email"
                      value={testEmailTarget}
                      onChange={(e) => setTestEmailTarget(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg flex-1 sm:w-64"
                    />
                    <button
                      type="button"
                      disabled={testingSmtp || !settingsForm.smtpHost}
                      onClick={handleTestSmtp}
                      className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-[#e6c89c] text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {testingSmtp ? 'Sending...' : 'Send Test'}
                    </button>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Verifies connection directly with mail server.
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1f1d1d] hover:bg-stone-800 text-[#e6c89c] text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* MODAL 1: ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-200 bg-[#faf6f2] flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                  Order Details #{selectedOrder.id}
                </h3>
                <span className="text-xs text-stone-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Order Status & Accept Action */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold">Current Status</span>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">{selectedOrder.status}</div>
                </div>

                {selectedOrder.status === 'Pending' ? (
                  <button
                    onClick={() => handleAcceptOrder(selectedOrder.id)}
                    className="px-4 py-2 bg-[#c59b27] hover:bg-[#a67e16] text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Order Now</span>
                  </button>
                ) : (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Packaging')}
                      className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 rounded font-semibold text-stone-700"
                    >
                      Packaging
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Out for Delivery')}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 rounded font-semibold text-amber-800"
                    >
                      Out for Delivery
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered')}
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 rounded font-semibold text-emerald-800"
                    >
                      Delivered
                    </button>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                <h4 className="font-bold text-stone-800 mb-2">Customer & Contact:</h4>
                <p><strong>Name:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>Phone:</strong> <a href={`tel:${selectedOrder.customer?.phone}`} className="text-[#b07e15] font-bold">{selectedOrder.customer?.phone}</a></p>
                <p><strong>Email:</strong> <a href={`mailto:${selectedOrder.customer?.email}`} className="text-blue-600">{selectedOrder.customer?.email}</a></p>
                <p><strong>Address:</strong> {selectedOrder.customer?.address}</p>
                <p><strong>Region:</strong> {selectedOrder.customer?.city}</p>
                {selectedOrder.customer?.notes && (
                  <p className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                    <strong>Note:</strong> {selectedOrder.customer?.notes}
                  </p>
                )}
              </div>

              {/* Items */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-white">
                <h4 className="font-bold text-stone-800 mb-2">Ordered Items:</h4>
                <div className="divide-y divide-stone-100">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-stone-900">{it.name}</div>
                        <div className="text-[11px] text-stone-400">Qty: {it.quantity} × ৳{it.price.toLocaleString()}</div>
                      </div>
                      <span className="font-bold text-stone-900">৳{(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900 text-sm">
                  <span>Grand Total ({selectedOrder.paymentMethod}):</span>
                  <span className="text-[#997316]">৳{selectedOrder.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EMAIL PREVIEW MODAL */}
      {previewEmail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-stone-200 bg-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  Email Preview: {previewEmail.subject}
                </h3>
                <span className="text-xs text-stone-500">
                  Recipient: <strong>{previewEmail.to}</strong> • Status: {previewEmail.status}
                </span>
              </div>
              <button
                onClick={() => setPreviewEmail(null)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 max-h-[75vh] overflow-y-auto bg-[#faf7f5]">
              {/* Sandboxed: email HTML contains customer-entered text, never run it in the admin page */}
              <iframe
                title="Email preview"
                sandbox=""
                srcDoc={previewEmail.html}
                className="w-full h-[65vh] bg-white rounded-xl shadow-xs border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
