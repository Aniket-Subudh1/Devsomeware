"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  Check,
  Lock,
  Unlock,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TestLinks {
  round1: string;
  round2: string;
  round3: string;
}

const TestPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [testStatus, setTestStatus] = useState({
    round1: true, // Always start with round 1 unlocked by default
    round2: false,
    round3: false,
  });

  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  // Selected campus and domain
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");

  const [testLinks, setTestLinks] = useState<TestLinks>({
    round1:
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-1",
    round2:
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-2",
    round3: "", // Will be set based on domain selection
  });

  const router = useRouter();

  // Domain options based on campus
  const domains = {
    bbsr: [
      "Data Analytics and Machine Learning + Generative AI",
      "Cloud Technology + Full-Stack Development with MERN",
      "Data Analytics and Machine Learning",
      "Software Technology",
      "Cybersecurity Domain Track",
      "Gaming and Immersive Learning: AR/VR Domain Track",
      "Blockchain Domain Track",
      "Cloud Technology Domain Track",
    ],
    pkd: [
      "Data Analytics and Machine Learning + Generative AI",
      "Cloud Technology + Full-Stack Development with MERN",
      "Data Analytics and Machine Learning",
      "Software Technology",
      "Cybersecurity Domain Track",
      "Gaming and Immersive Learning: AR/VR Domain Track",
      "Blockchain Domain Track",
      "Cloud Technology Domain Track",
    ],
    vzm: [
      "Artificial Intelligence & Machine Learning (AIML)",
      "Data Analysis & Machine Learning (DAML)",
      "Software Engineering (SE)",
      "Computer Network (CN)",
      "IoT Cyber Security Blockchain (CIC)",
    ],
  };

  // Define domain-specific test links
  const domainLinks: { [key: string]: string } = {
    "Data Analytics and Machine Learning + Generative AI":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-da-ml-gen-ai",
    "Cloud Technology + Full-Stack Development with MERN":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-cloud-full-stack-mern",
    "Data Analytics and Machine Learning":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-da-ml",
    "Software Technology":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-software-tech",
    "Cybersecurity Domain Track":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-cyber-security",
    "Gaming and Immersive Learning: AR/VR Domain Track":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-gaming-ar-vr",
    "Blockchain Domain Track":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-blockchain",
    "Cloud Technology Domain Track":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-cloud-tech",
    "Artificial Intelligence & Machine Learning (AIML)":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-ai-ml",
    "Data Analysis & Machine Learning (DAML)":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-basket-v-da-ml",
    "Software Engineering (SE)":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-software-eng",
    "Computer Network (CN)":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-cn",
    "IoT Cyber Security Blockchain (CIC)":
      "https://practice.geeksforgeeks.org/contest/baseline-evaluation-coding-test-round-3-iot-cs-blockchain",
  };

  // Extract basic user info from JWT token (if possible)
  const extractUserInfoFromToken = (token: string) => {
    try {
      // Simple JWT parsing without validation
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);

      return {
        name: payload.name || "User",
        email: payload.email || "",
      };
    } catch (error) {
      console.error("Error extracting user info from token:", error);
      return null;
    }
  };

  // FIX: Set up polling for test status updates
  useEffect(() => {
    // Initial fetch
    fetchTestStatus();

    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchTestStatus();
    }, 30000); // 30 seconds

    // Clean up on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // Get the JWT token from localStorage
    const token = localStorage.getItem("testtoken");

    if (!token) {
      toast.error("You need to register first");
      setTimeout(() => {
        router.push("/baseline");
      }, 2000);
      return;
    }

    // Extract basic user info from token if possible
    const tokenInfo = extractUserInfoFromToken(token);
    if (tokenInfo) {
      setUserName(tokenInfo.name);
      setUserEmail(tokenInfo.email);
    }

    // Set loading to false after a short delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Handle domain selection change
  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const domain = e.target.value;
    setSelectedDomain(domain);

    // Update Round 3 link based on selected domain
    if (domain && domainLinks[domain]) {
      setTestLinks((prev) => ({
        ...prev,
        round3: domainLinks[domain],
      }));
    } else {
      // Set default if no domain selected or no matching link
      setTestLinks((prev) => ({
        ...prev,
        round3: "",
      }));
    }
  };

  // Handle campus selection change
  const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const campus = e.target.value;
    setSelectedCampus(campus);
    // Reset domain when campus changes
    setSelectedDomain("");
  };

  // FIX: Improved fetchTestStatus function with better error handling
  const fetchTestStatus = async () => {
    try {
      setRefreshing(true);

      // Fetch test status from API
      const response = await fetch("/api/test");

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      // Check if data.tests exists and is an array
      if (data.tests && Array.isArray(data.tests)) {
        // Initialize default status object
        const updatedStatus = {
          round1: true, // Always make sure Round 1 is available by default
          round2: false,
          round3: false,
        };

        // Process each test item in the array
        data.tests.forEach(
          (test: { status: string | boolean; round: string }) => {
            // Convert string 'true'/'false' to boolean value
            const isActive = test.status === "true" || test.status === true;

            // Update the appropriate round
            if (test.round === "1") {
              updatedStatus.round1 = true; // Always ensure round 1 is available
            } else if (test.round === "2") {
              updatedStatus.round2 = isActive;
            } else if (test.round === "3") {
              updatedStatus.round3 = isActive;
            }
          }
        );

        // Update state with the processed status
        setTestStatus(updatedStatus);

        // Log update for debugging (remove in production)
        console.log("Test status updated:", updatedStatus);
      } else {
        console.error("Invalid test status response format:", data);
      }
    } catch (error) {
      console.error("Error fetching test status:", error);
      // Don't show error toast during background refreshes to avoid disrupting the user
    } finally {
      setRefreshing(false);
    }
  };

  // FIX: Implemented proper handleTestClick function
  const handleTestClick = (round: number, testLink: string) => {
    // Validate if the test is accessible
    if (round === 1 && !testStatus.round1) {
      toast.error("Round 1 test is not available at this time.");
      return;
    }

    if (round === 2 && !testStatus.round2) {
      toast.error(
        "Round 2 test is not available yet. Please complete Round 1 first."
      );
      return;
    }

    if (round === 3) {
      if (!testStatus.round3) {
        toast.error(
          "Round 3 test is not available yet. Please complete previous rounds first."
        );
        return;
      }

      if (!selectedDomain) {
        toast.error("Please select a domain before starting Round 3 test.");
        return;
      }
    }

    if (!testLink) {
      toast.error("Test link not available. Please try again later.");
      return;
    }

    // Open test link in a new tab/window
    window.open(testLink, "_blank");

    // Optionally, you could log or track that the user started a test
    console.log(`User started Round ${round} test`);
  };

  // Force refresh button handler
  const handleForceRefresh = () => {
    fetchTestStatus();
    toast.success("Test status refreshed");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
        Baseline Evaluation Test
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-r from-purple-900/30 to-black/50 p-6 rounded-lg border border-purple-500/30 max-w-md w-full mb-8"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-white font-semibold mb-4">
            User Information
          </h2>
          <button
            onClick={handleForceRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1 text-xs text-purple-300 hover:text-purple-100 transition-colors"
          >
            <RefreshCw
              className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-gray-300">
            <span className="text-purple-300">Email:</span> {userEmail}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Round 1 Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 flex flex-col backdrop-blur-sm transition-transform hover:translate-y-[-5px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">Round 1</h3>
            <div className="flex items-center px-3 py-1 rounded-full bg-opacity-20 backdrop-blur-sm">
              <span className="flex items-center text-green-400 text-sm">
                <Unlock className="w-4 h-4 mr-1" /> Unlocked
              </span>
            </div>
          </div>

          <p className="text-gray-300 mb-6 flex-grow">
            Complete the foundational test to evaluate your programming basics.
            This is the first step of your evaluation.
          </p>

          <button
            onClick={() => handleTestClick(1, testLinks.round1)}
            disabled={!testStatus.round1}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg flex items-center justify-center hover:from-purple-700 hover:to-purple-900 transition"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Begin Test
          </button>
        </motion.div>

        {/* Round 2 Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 flex flex-col backdrop-blur-sm transition-transform hover:translate-y-[-5px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">Round 2</h3>
            <div className="flex items-center px-3 py-1 rounded-full bg-opacity-20 backdrop-blur-sm">
              {testStatus.round2 ? (
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

          <p className="text-gray-300 mb-6 flex-grow">
            Test your intermediate programming skills. This round will evaluate
            your problem-solving abilities.
          </p>

          <button
            onClick={() => handleTestClick(2, testLinks.round2)}
            disabled={!testStatus.round2}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition ${
              testStatus.round2
                ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {testStatus.round2 ? (
              <>
                <ExternalLink className="w-5 h-5 mr-2" />
                Begin Test
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Locked
              </>
            )}
          </button>
        </motion.div>

        {/* Round 3 Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 flex flex-col backdrop-blur-sm transition-transform hover:translate-y-[-5px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">Round 3</h3>
            <div className="flex items-center px-3 py-1 rounded-full bg-opacity-20 backdrop-blur-sm">
              {testStatus.round3 ? (
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

          <p className="text-gray-300 mb-4">
            Domain-specific advanced test. This is the final evaluation to
            assess your specialized skills.
          </p>

          {/* Campus Dropdown */}
          <div className="mb-3">
            <label className="block text-gray-300 text-sm mb-1">
              Select Campus
            </label>
            <select
              value={selectedCampus}
              onChange={handleCampusChange}
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white text-sm"
            >
              <option value="">Select Campus</option>
              <option value="bbsr">Bhubaneswar (BBSR)</option>
              <option value="pkd">Paralakhemundi (PKD)</option>
              <option value="vzm">Vizianagaram (VZM)</option>
            </select>
          </div>

          {/* Domain Dropdown - Only show if campus is selected */}
          {selectedCampus && (
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-1">
                Select Domain
              </label>
              <select
                value={selectedDomain}
                onChange={handleDomainChange}
                className="w-full bg-black/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white text-sm"
              >
                <option value="">Select Domain</option>
                {selectedCampus &&
                  domains[selectedCampus as keyof typeof domains].map(
                    (domain, index) => (
                      <option key={index} value={domain}>
                        {domain}
                      </option>
                    )
                  )}
              </select>
            </div>
          )}

          <div className="mt-auto">
            <button
              onClick={() => handleTestClick(3, testLinks.round3)}
              disabled={!testStatus.round3 || !selectedDomain}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition ${
                testStatus.round3 && selectedDomain
                  ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {testStatus.round3 ? (
                <>
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Begin Test
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Locked
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-10 bg-gradient-to-r from-purple-900/30 to-black/50 p-6 rounded-lg border border-purple-500/30 max-w-3xl"
      >
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Important Instructions
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>
                You must complete each round before proceeding to the next one.
              </li>
              <li>
                Ensure you have a stable internet connection during the test.
              </li>
              <li>Once you start a test, complete it in a single session.</li>
              <li>
                For Round 3, select your campus and domain to access the
                specialized test.
              </li>
              <li>Each test has a specific time limit. Plan accordingly.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TestPage;
