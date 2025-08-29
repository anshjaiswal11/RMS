import React, { useState, useEffect } from 'react';
import {
  User,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
  Eye,
  Check,
  X,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Bell,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  Activity,
  Users,
  DollarSign,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';

const RMSAdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [payments, setPayments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Test credentials
  const TEST_CREDENTIALS = {
    email: 'admin@rms.com',
    password: 'rms123'
  };

  const API_BASE_URL = 'https://rms-backend-taupe.vercel.app/api';

  // Mock data for demonstration
  const [dashboardStats, setDashboardStats] = useState({
    totalPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    totalContacts: 0
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.email === TEST_CREDENTIALS.email && loginData.password === TEST_CREDENTIALS.password) {
      setIsAuthenticated(true);
      fetchInitialData();
    } else {
      alert('Invalid credentials!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginData({ email: '', password: '' });
  };

  const fetchInitialData = async () => {
    // To properly update stats, fetch all payments first, then contacts
    const paymentsResult = await fetchPayments();
    const contactsResult = await fetchContacts();
    
    // Ensure stats are updated with the latest data
    if (paymentsResult && contactsResult) {
        updateDashboardStats(paymentsResult.data, contactsResult.data);
    }
  };

  const apiCall = async (url, options = {}) => {
    try {
      setIsLoading(true);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API call failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      alert(`Error: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayments = async (status = '') => {
    const url = status ? `${API_BASE_URL}/admin/payments?status=${status}` : `${API_BASE_URL}/admin/payments`;
    const result = await apiCall(url);
    
    if (result && result.data) {
      setPayments(result.data);
    }
    return result; // Return the result for chaining
  };

  const fetchContacts = async () => {
    const result = await apiCall(`${API_BASE_URL}/admin/contact-messages`);
    
    if (result && result.data) {
      setContacts(result.data);
    }
    return result; // Return the result for chaining
  };

  const updateDashboardStats = (paymentsData = [], contactsData = []) => {
    setDashboardStats({
      totalPayments: paymentsData.length,
      pendingPayments: paymentsData.filter(p => p.status === 'pending').length,
      approvedPayments: paymentsData.filter(p => p.status === 'approved').length,
      totalContacts: contactsData.length
    });
  };
  
  // Update stats whenever payments or contacts change
  useEffect(() => {
    if(isAuthenticated) {
        updateDashboardStats(payments, contacts);
    }
  }, [payments, contacts, isAuthenticated]);


  const approvePayment = async (id) => {
    const result = await apiCall(`${API_BASE_URL}/admin/payments/${id}/approve`, { method: 'POST' });
    if (result) {
      fetchInitialData();
    }
  };

  const rejectPayment = async (id) => {
    const result = await apiCall(`${API_BASE_URL}/admin/payments/${id}/reject`, { method: 'POST' });
    if (result) {
      fetchInitialData();
    }
  };

  const expireCode = async (id) => {
    const result = await apiCall(`${API_BASE_URL}/admin/payments/${id}/expire`, { method: 'POST' });
    if (result) {
      fetchInitialData();
    }
  };

  const deleteContact = async (id) => {
    if(window.confirm('Are you sure you want to delete this message?')) {
        const result = await apiCall(`${API_BASE_URL}/admin/contact-messages/${id}`, { method: 'DELETE' });
        if (result) {
          fetchInitialData();
        }
    }
  };

  const filteredPayments = payments.filter(payment => {
    const searchInput = searchTerm.toLowerCase();
    const matchesSearch = payment.email.toLowerCase().includes(searchInput) ||
                          payment.utr.toLowerCase().includes(searchInput) ||
                          (payment.generatedCode && payment.generatedCode.includes(searchInput));
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">RMS Admin</h1>
              <p className="text-white/70">Welcome back to your dashboard</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="RMS ADMIN EMAIL"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="RMS ADMIN PASSWORD"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Sign In
              </button>
            </form>
            
            {/* <div className="mt-6 p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <p className="text-blue-200 text-sm text-center">
                <strong></strong><br />
                <br />
              
              </p>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.positive ? 'text-green-500' : 'text-red-500'}`}>
              {change.positive ? '+' : ''}{change.value}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const PaymentCard = ({ payment }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'pending': return <Clock className="w-4 h-4" />;
        case 'approved': return <CheckCircle className="w-4 h-4" />;
        case 'rejected': return <XCircle className="w-4 h-4" />;
        case 'expired': return <Timer className="w-4 h-4" />;
        default: return <AlertCircle className="w-4 h-4" />;
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-gray-900 dark:text-white truncate" title={payment.email}>{payment.email}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">UTR: {payment.utr}</p>
            {payment.generatedCode && (
              <p className="text-blue-600 dark:text-blue-400 text-sm font-mono">Code: {payment.generatedCode}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(payment.status)}`}>
            {getStatusIcon(payment.status)}
            <span className="capitalize">{payment.status}</span>
          </span>
        </div>
        
        <div className="flex space-x-2">
          {payment.status === 'pending' && (
            <>
              <button
                onClick={() => approvePayment(payment._id)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => rejectPayment(payment._id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </>
          )}
          {payment.status === 'approved' && (
            <button
              onClick={() => expireCode(payment._id)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <Timer className="w-4 h-4" />
              <span>Expire Code</span>
            </button>
          )}
        </div>
        
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}
        </div>
      </div>
    );
  };

  const ContactCard = ({ contact }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 overflow-hidden">
          <p className="font-semibold text-gray-900 dark:text-white truncate" title={contact.name}>{contact.name}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm truncate" title={contact.email}>{contact.email}</p>
          <p className="text-gray-800 dark:text-gray-200 font-medium mt-1 truncate" title={contact.subject}>{contact.subject}</p>
        </div>
        <button
          onClick={() => deleteContact(contact._id)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
        <p className="text-gray-700 dark:text-gray-300 text-sm">{contact.message}</p>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {new Date(contact.createdAt).toLocaleDateString()} at {new Date(contact.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-gray-800 h-screen fixed left-0 top-0 z-30 shadow-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col min-w-[64px] sm:min-w-[80px]`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center h-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">RMS Admin</h1>
            </div>
          )}
        </div>
      </div>
      
      <nav className="mt-6 flex-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'contacts', label: 'Messages', icon: MessageSquare },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            title={item.label}
            className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
              currentView === item.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            } ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <item.icon className="w-6 h-6 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
         <button
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors duration-200 ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
      </div>
    </div>
  );

  const Header = () => (
    <header className={`${isSidebarOpen ? 'ml-64' : 'ml-16'} bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 sticky top-0 z-20 gap-4`}>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{currentView}</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
        </button>
        
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 relative">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
        </button>
        
        <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="hidden md:block">
                <p className="font-semibold text-gray-900 dark:text-white">Admin</p>
                {/* <p className="text-xs text-gray-500 dark:text-gray-400">{TEST_CREDENTIALS.email}</p> */}
            </div>
        </div>
      </div>
    </header>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Payments"
          value={dashboardStats.totalPayments}
          icon={DollarSign}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          change={{ positive: true, value: 12 }}
        />
        <StatCard
          title="Pending Payments"
          value={dashboardStats.pendingPayments}
          icon={Clock}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
          change={{ positive: false, value: 5 }}
        />
        <StatCard
          title="Approved Payments"
          value={dashboardStats.approvedPayments}
          icon={CheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
          change={{ positive: true, value: 18 }}
        />
        <StatCard
          title="Contact Messages"
          value={dashboardStats.totalContacts}
          icon={Mail}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          change={{ positive: true, value: 8 }}
        />
      </div>
      
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Payments</h3>
          <div className="space-y-4">
            {payments.slice(0, 5).map((payment) => (
              <PaymentCard key={payment._id} payment={payment} />
            ))}
             {payments.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent payments.</p>}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Messages</h3>
          <div className="space-y-4">
            {contacts.slice(0, 3).map((contact) => (
              <ContactCard key={contact._id} contact={contact} />
            ))}
            {contacts.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent messages.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const PaymentsView = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, UTR, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        
        <button
          onClick={() => fetchInitialData()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredPayments.map((payment) => (
          <PaymentCard key={payment._id} payment={payment} />
        ))}
      </div>
      
      {filteredPayments.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">No Payments Found</p>
          <p className="text-gray-400 dark:text-gray-500">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );

  const ContactsView = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => fetchInitialData()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {filteredContacts.map((contact) => (
          <ContactCard key={contact._id} contact={contact} />
        ))}
      </div>
      
      {filteredContacts.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">No Messages Found</p>
           <p className="text-gray-400 dark:text-gray-500">Try adjusting your search.</p>
        </div>
      )}
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6 max-w-2xl mx-auto px-2">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Base URL</label>
            <input
              type="text"
              value={API_BASE_URL}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
         <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
            <div className="flex space-x-2">
                <button onClick={() => setIsDarkMode(false)} className={`flex-1 p-3 rounded-lg border-2 ${!isDarkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-300 dark:border-gray-600'}`}>Light</button>
                <button onClick={() => setIsDarkMode(true)} className={`flex-1 p-3 rounded-lg border-2 ${isDarkMode ? 'border-blue-500 bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}>Dark</button>
            </div>
          </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'payments': return <PaymentsView />;
      case 'contacts': return <ContactsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
    <Sidebar />
    <div className={`${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 flex-1 flex flex-col`}>
      <Header />
      <main className="p-2 sm:p-4 md:p-6">
        {renderCurrentView()}
      </main>
    </div>
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                <p className="text-gray-900 dark:text-white font-medium">Loading...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RMSAdminDashboard;
