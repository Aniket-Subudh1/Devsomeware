"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  Lock,
  Unlock,
  X,
  RefreshCw,
  ShieldAlert,
  EyeOff,
  Eye,
} from "lucide-react";

// Admin password for the page
const ADMIN_CODE = "CUTM-BASELINE-2025"; // You can change this to your desired code

interface Test {
  _id: string;
  round: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminTestPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [adminPassword, setAdminPassword] = useState("");

  // Authenticate with the secure code
  const handleAuthentication = () => {
    if (password === ADMIN_CODE) {
      setAuthenticated(true);
      toast.success("Authentication successful");
      fetchTests();
    } else {
      toast.error("Invalid authentication code");
    }
  };

  // Fetch tests data from the API
  const fetchTests = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/test");
      const data = await response.json();

      if (data.tests) {
        // Sort tests by round number
        const sortedTests = [...data.tests].sort((a, b) => a.round - b.round);
        setTests(sortedTests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to load test data");
    } finally {
      setRefreshing(false);
    }
  };

  // Toggle the status of a test round (lock/unlock)
  const toggleTestStatus = async (testId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      const response = await fetch("/api/test", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: testId,
          status: !currentStatus,
          password: adminPassword,
        }),
      });

      const data = await response.json();

      if (data.updatedTest) {
        toast.success(
          `Round ${data.updatedTest.round} ${
            !currentStatus ? "unlocked" : "locked"
          } successfully`
        );
        fetchTests();
      } else {
        toast.error(data.error || "Failed to update test status");
      }
    } catch (error) {
      console.error("Error updating test status:", error);
      toast.error("Failed to update test status");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new test round
  const addTestRound = async (round: number) => {
    try {
      setLoading(true);
      const response = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          round,
          status: false,
          password: adminPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Round ${round} created successfully`);
        fetchTests();
      } else {
        toast.error(data.error || "Failed to create test round");
      }
    } catch (error) {
      console.error("Error creating test round:", error);
      toast.error("Failed to create test round");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Card for each test round
  const TestCard = ({ test }: { test: Test }) => {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">Round {test.round}</h3>
          <div
            className={`px-3 py-1 rounded-full ${
              test.status ? "bg-green-500/20" : "bg-red-500/20"
            }`}
          >
            {test.status ? (
              <span className="flex items-center text-green-400 text-sm">
                <Unlock className="w-4 h-4 mr-1" /> Unlocked
              </span>
            ) : (
              <span className="flex items-center text-red-400 text-sm">
                <Lock className="w-4 h-4 mr-1" /> Locked
              </span>
            )}
          </div>
        </div>

        <div className="text-gray-300 text-sm mb-4">
          <div className="flex items-center">
            <span className="text-purple-400 mr-2">Created:</span>
            <span>{formatDate(test.createdAt)}</span>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-purple-400 mr-2">Updated:</span>
            <span>{formatDate(test.updatedAt)}</span>
          </div>
        </div>

        <button
          onClick={() => toggleTestStatus(test._id, test.status)}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center transition ${
            test.status
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : test.status ? (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Lock Round
            </>
          ) : (
            <>
              <Unlock className="w-5 h-5 mr-2" />
              Unlock Round
            </>
          )}
        </button>
      </div>
    );
  };

  // Auth screen when not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Toaster richColors position="top-center" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-8 backdrop-blur-sm"
        >
          <div className="flex justify-center mb-6">
            <ShieldAlert className="w-16 h-16 text-purple-500" />
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Secure Admin Access
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin code"
                className="w-full bg-black/50 border border-purple-500/50 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              onClick={handleAuthentication}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg flex items-center justify-center hover:from-purple-700 hover:to-purple-900 transition"
            >
              Authenticate
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-12 px-4">
      <Toaster richColors />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent mb-8"
      >
        Test Management Dashboard
      </motion.h1>

      {/* API Password Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-3xl bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">API Authentication</h2>
          <button
            onClick={fetchTests}
            disabled={refreshing}
            className="flex items-center text-purple-400 hover:text-purple-300 transition"
          >
            <RefreshCw
              className={`w-5 h-5 mr-1 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Enter API password"
            className="w-full bg-black/50 border border-purple-500/50 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <p className="text-yellow-400 text-sm flex items-start">
          <ShieldAlert className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>
            This password is required for API operations. You need to set it to
            match your server&apos;s expected password.
          </span>
        </p>
      </motion.div>

      {/* Add New Round Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-3xl bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm mb-8"
      >
        <h2 className="text-xl font-bold text-white mb-4">
          Add New Test Round
        </h2>
        <div className="flex gap-2">
          {[1, 2, 3].map((round) => (
            <button
              key={round}
              onClick={() => addTestRound(round)}
              disabled={loading || tests.some((t) => t.round === round)}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center transition ${
                tests.some((t) => t.round === round)
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              Create Round {round}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Test Rounds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {tests.length > 0 ? (
          tests.map((test) => (
            <motion.div
              key={test._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <TestCard test={test} />
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center p-12 border border-dashed border-gray-700 rounded-xl bg-black/30">
            <X className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              No test rounds found. Create them using the controls above.
            </p>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        onClick={() => setAuthenticated(false)}
        className="mt-10 py-2 px-6 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-900/20 transition"
      >
        Logout
      </motion.button>
    </div>
  );
};

export default AdminTestPage;
