"use client";
import { useState, useEffect } from "react";
import { Lock, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { toast, Toaster } from "sonner";

// Define types for our data
interface RoundItem {
  _id: string;
  round: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function AdminStatusToggle() {
  const [data, setData] = useState<RoundItem[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [currentItem, setCurrentItem] = useState<RoundItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // FIX: Improved updateStatus function with better error handling
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setLoading(true);

      const passwordToUse = process.env.NEXT_PUBLIC_TEST_PASSWORD || password;

      const res = await fetch("/api/test", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          password: passwordToUse,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update status.");
      }

      return { success: true };
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Error updating status. Please try again later."
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // FIX: Improved refresh data function with better error handling
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Prevent caching
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const result = await res.json();

      if (result.success && Array.isArray(result.tests)) {
        setData(result.tests);
        toast.success("Data refreshed successfully!");
      } else {
        toast.error(
          result.error || "Failed to refresh data. Please try again."
        );
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Error refreshing data. Please try again later."
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  const openPasswordModal = (item: RoundItem) => {
    setCurrentItem(item);
    setPassword("");
    setError("");
    setShowModal(true);
  };

  // FIX: Improved status change handler with better feedback
  const handleStatusChange = async () => {
    // Clear previous errors/messages
    setError("");
    setSuccessMessage("");

    if (!currentItem) return;

    // Check password
    if (!password && !process.env.NEXT_PUBLIC_TEST_PASSWORD) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      const newStatus = currentItem.status === "true" ? "false" : "true";

      // Make API call to update status
      const result = await updateStatus(currentItem._id, newStatus);

      if (!result.success) {
        setError("Failed to update status. Please try again.");
        return;
      }

      // Success! Refresh data and show success message
      await refreshData();

      // Set success message
      const statusText = newStatus === "true" ? "activated" : "deactivated";
      setSuccessMessage(
        `Round ${currentItem.round} has been successfully ${statusText}.`
      );

      // Close modal after a short delay
      setTimeout(() => {
        setShowModal(false);
      }, 1000);
    } catch (err) {
      console.error("Error handling status change:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showModal) {
        setShowModal(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showModal]);

  // Format date for readability
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-900 min-h-screen mt-10 rounded">
      <Toaster
        position="top-center"
        richColors={true}
        closeButton={false}
        expand={false}
      />
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-200">
            Admin Status Control Panel
          </h1>
          <p className="text-gray-400 mt-1">Manage round activation status</p>
        </div>

        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-black border border-gray-300 rounded-lg shadow-sm transition-colors ${
            isRefreshing ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800"
          }`}
        >
          <RefreshCw
            size={16}
            className={`${isRefreshing ? "animate-spin" : ""}`}
          />
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
        {data.length === 0 ? (
          <div className="col-span-full flex items-center justify-center p-8 bg-gray-800 rounded-xl">
            <p className="text-gray-400">
              {isRefreshing
                ? "Loading test data..."
                : "No test data available. Try refreshing."}
            </p>
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    Round {item.round}
                  </h2>
                  <div
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors cursor-pointer ${
                      item.status === "true" ? "bg-green-500" : "bg-gray-300"
                    }`}
                    onClick={() => openPasswordModal(item)}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                        item.status === "true"
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
                <p
                  className={`text-sm font-medium mt-1 ${
                    item.status === "true" ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {item.status === "true" ? "Active" : "Inactive"}
                </p>
              </div>

              <div className="p-4 bg-gray-50">
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center justify-between">
                    <span className="font-medium">ID:</span>
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      {item._id.substring(0, 8)}...
                    </span>
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
          ))
        )}
      </div>

      {/* Password Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Lock className="text-blue-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Confirm Status Change
              </h2>
            </div>

            <p className="mb-5 text-gray-600">
              You are about to change the status of{" "}
              <span className="font-bold">Round {currentItem?.round}</span> from{" "}
              <span
                className={`font-semibold ${
                  currentItem?.status === "true"
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {currentItem?.status === "true" ? "Active" : "Inactive"}
              </span>{" "}
              to{" "}
              <span
                className={`font-semibold ${
                  currentItem?.status === "true"
                    ? "text-gray-500"
                    : "text-green-600"
                }`}
              >
                {currentItem?.status === "true" ? "Inactive" : "Active"}
              </span>
            </p>

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
                  if (e.key === "Enter") {
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
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
