"use client"
import { useState, useEffect } from 'react';
import { Lock, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Define types for our data
interface RoundItem {
  _id: string;
  round: string;
  status: boolean; // Changed from string to boolean
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// This would be your API call in a real application
const mockUpdateStatus = async (id: string, newStatus: boolean) => { // Changed parameter type
  try {
    const res = await fetch('/api/test', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status: newStatus, password: process.env.NEXT_PUBLIC_TEST_PASSWORD }),
    });
    const data = await res.json();
    console.log("data in the mock update status", data);
    return { success: data.success };
  }
  catch (err) {
    toast.error("Error updating status. Please try again later.");
    console.log("error in the mock update status", err);
    throw err; // Rethrow to handle in the calling function
  }
};

export default function AdminStatusToggle() {
  const [data, setData] = useState<RoundItem[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<RoundItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  // Track items being updated to show loading state on specific toggles
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});

  // Mock data refresh function
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await res.json();
      console.log("result in the refresh data", result);
      
      if (result.success) {
        // Convert string statuses to boolean values
        const formattedData = result.tests.map((test: any) => ({
          ...test,
          status: test.status === "true" || test.status === true
        }));
        setData(formattedData);
        toast.success("Data refreshed successfully!");
      } else {
        toast.error("Failed to refresh data. Please try again.");
      }
    }
    catch (err) {
      toast.error("Error refreshing data. Please try again later.");
      console.log("error in the refresh data", err);
    }
    finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const openPasswordModal = (item: RoundItem) => {
    setCurrentItem(item);
    setPassword('');
    setError('');
    setShowModal(true);
  };

  const handleStatusChange = async () => {
    // Check password (mock - in real app you'd verify this on the backend)
    if (password !== process.env.NEXT_PUBLIC_TEST_PASSWORD) {
      setError('Incorrect password');
      return;
    }

    if (!currentItem) return;
    
    setLoading(true);
    // Set this specific item as updating
    setUpdatingItems(prev => ({ ...prev, [currentItem._id]: true }));
    setShowModal(false); // Close modal immediately to show updating state
    
    try {
      const newStatus = !currentItem.status; // Toggle boolean directly
      
      // Make API call to update status
      const result = await mockUpdateStatus(currentItem._id, newStatus);
      
      if (result.success) {
        // Update the UI immediately after successful API call
        setData(prevData => 
          prevData.map(item => 
            item._id === currentItem._id 
              ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } 
              : item
          )
        );
        
        const statusText = newStatus ? "active" : "inactive";
        setSuccessMessage(`Round ${currentItem.round} is now ${statusText}`);
        toast.success(`Round ${currentItem.round} is now ${statusText}`, {
          duration: 3000,
          icon: newStatus ? "✅" : "ℹ️"
        });
      } else {
        // If the API returns success: false
        toast.error(`Failed to update Round ${currentItem.round}. Please try again.`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(`Failed to update Round ${currentItem.round}. Please try again.`);
    } finally {
      // Allow a moment for the user to see the updating state before refreshing
      setTimeout(async () => {
        try {
          await refreshData(); // Refresh data to ensure everything is in sync
        } finally {
          // Remove this item from updating state
          setUpdatingItems(prev => {
            const newState = { ...prev };
            delete newState[currentItem?._id || ''];
            return newState;
          });
          setLoading(false);
        }
      }, 800);
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showModal]);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Format date for readability
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-900 min-h-screen mt-10 rounded">
      <Toaster position="top-center" richColors={true} closeButton={false} expand={false} />
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-200">Admin Status Control Panel</h1>
          <p className="text-gray-400 mt-1">Manage round activation status</p>
        </div>
        
        <button 
          onClick={refreshData}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-black border border-gray-300 rounded-lg shadow-sm ${
            isRefreshing ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800"
          } transition-colors`}
        >
          <RefreshCw size={16} className={`${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>
      
      {successMessage && (
        <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md flex items-center animate-fade-in">
          <Check size={20} className="mr-2" />
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div 
            key={item._id} 
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Round {item.round}</h2>
                
                {updatingItems[item._id] ? (
                  <div className="flex items-center justify-center px-4 py-1.5 bg-gray-100 rounded-md">
                    <RefreshCw size={14} className="mr-2 animate-spin text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Updating...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => openPasswordModal(item)}
                    className={`px-4 py-1.5 rounded-md font-medium text-sm transition-all flex items-center ${
                      item.status 
                        ? "bg-green-100 text-green-700 hover:bg-green-200" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item.status ? (
                      <>
                        <Check size={14} className="mr-1" />
                        Active
                      </>
                    ) : (
                      "Inactive"
                    )}
                    <span className="ml-1 text-xs opacity-70">• Click to change</span>
                  </button>
                )}
              </div>
              <p className={`text-sm font-medium mt-2 ${
                item.status ? "text-green-600" : "text-gray-500"
              }`}>
                Status: {item.status ? "Currently active" : "Currently inactive"}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50">
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center justify-between">
                  <span className="font-medium">ID:</span>
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{item._id.substring(0, 8)}...</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-medium">Created:</span>
                  <span>{formatDate(item.createdAt)}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-medium">Updated:</span>
                  <span>{formatDate(item.updatedAt)}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Password Confirmation Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => !loading && setShowModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200 animate-slide-up" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Lock className="text-blue-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Confirm Status Change</h2>
            </div>
            
            <div className="mb-5">
              <p className="text-gray-600 mb-3">
                You are about to change the status of <span className="font-bold">Round {currentItem?.round}</span>:
              </p>
              
              <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                <div className="flex-1 border-r border-gray-200 pr-4">
                  <p className="text-sm text-gray-500 mb-1">Current Status:</p>
                  <div className={`font-medium flex items-center ${
                    currentItem?.status ? "text-green-600" : "text-gray-500"
                  }`}>
                    {currentItem?.status ? (
                      <>
                        <Check size={16} className="mr-1" />
                        Active
                      </>
                    ) : (
                      <>Inactive</>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 pl-4">
                  <p className="text-sm text-gray-500 mb-1">New Status:</p>
                  <div className={`font-medium flex items-center ${
                    currentItem?.status ? "text-gray-500" : "text-green-600"
                  }`}>
                    {currentItem?.status ? (
                      <>Inactive</>
                    ) : (
                      <>
                        <Check size={16} className="mr-1" />
                        Active
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStatusChange();
                  }
                }}
              />
              {error && (
                <div className="flex items-center mt-2 text-red-600">
                  <AlertTriangle size={16} className="mr-1" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => !loading && setShowModal(false)}
                disabled={loading}
                className={`px-4 py-2 text-gray-700 bg-gray-100 rounded-lg ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200 transition-colors"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg flex items-center justify-center min-w-24 ${
                  loading 
                    ? "bg-blue-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 transition-colors"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    <span>Processing</span>
                  </>
                ) : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}