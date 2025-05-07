"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Toaster, toast } from "sonner";
import {
  Loader2,
  Clock,
  LogOut,
  Clipboard,
  AlertTriangle,
  CheckCircle2,
  User,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
  interface UserInfo {
    name?: string;
    regno?: string;
    branch?: string;
    email?: string;
  }
  
export default function AttendancePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [token, setToken] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Function to get remaining time for token expiration (12 hours)
  const calculateTimeLeft = useCallback(() => {
    if (!token) return null;

    try {
      // Extract token expiration time (assuming JWT)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      if (expTime > now) {
        return Math.floor((expTime - now) / 1000); // Return seconds left
      }
      return 0;
    } catch (error) {
      console.error("Error calculating time left:", error);
      return null;
    }
  }, [token]);

  // Format seconds into hours, minutes, seconds
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Expired";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Submit email to get token
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        toast.success("Attendance session started successfully");
        // Save token in sessionStorage to persist across page reloads
        sessionStorage.setItem("attendanceToken", data.token);

        // Get user info from the attendance token response if available
        if (data.user) {
          setUserInfo(data.user);
          sessionStorage.setItem(
            "attendanceUserInfo",
            JSON.stringify(data.user)
          );
        } else {
          // User info not provided in the attendance token response
          // We can use this info directly from the attendance API
          console.log("No user info provided in attendance token response");
        }
      } else {
        toast.error(data.message || "Failed to start attendance session");
      }
    } catch (error) {
      console.error("Error starting attendance session:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch QR code data
  const fetchQrCode = useCallback(async () => {
    if (!token) return;

    try {
      setQrLoading(true);

      const response = await fetch(`/api/attendance?token=${token}`);
      const data = await response.json();

      if (data.success) {
        setQrCode(data.qrData);
        setIsPulsing(true);
        setLastRefresh(new Date());
        setRefreshCount((prev) => prev + 1);
        setTimeout(() => setIsPulsing(false), 500); // Pulse effect for 500ms
      } else {
        console.error("Error fetching QR code:", data.message);
        // If token is invalid, clear the session
        if (
          data.message === "Invalid token" ||
          data.message === "Invalid or expired token"
        ) {
          handleLogout();
          toast.error("Your session has expired. Please login again.");
        }
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
    } finally {
      setQrLoading(false);
    }
  }, [token]);

  // Keep token valid by sending periodic heartbeats
  const pingToken = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/attendance", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      // If token is invalid, clear the session
      if (!data.success) {
        handleLogout();
        toast.error("Your session has expired. Please login again.");
      }
    } catch (error) {
      console.error("Error pinging token:", error);
    }
  }, [token]);

  // Handle logout - clear token
  const handleLogout = () => {
    // Show confirmation dialog
    if (
      token &&
      confirm("Are you sure you want to end your attendance session?")
    ) {
      setToken("");
      setQrCode("");
      setTimeLeft(null);
      setUserInfo(null);
      setRefreshCount(0);
      sessionStorage.removeItem("attendanceToken");
      sessionStorage.removeItem("attendanceUserInfo");
      toast.info("Attendance session ended");
    }
  };

  // Try to restore token from sessionStorage on page load
  useEffect(() => {
    const storedToken = sessionStorage.getItem("attendanceToken");
    const storedUserInfo = sessionStorage.getItem("attendanceUserInfo");

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo));
      } catch (error) {
        console.error("Error parsing stored user info:", error);
      }
    }
  }, []);

  // Update QR code every 2 seconds
  useEffect(() => {
    if (!token) return;

    fetchQrCode(); // Fetch immediately on token change

    // Set up polling interval
    const qrInterval = setInterval(fetchQrCode, 2000);

    // Clean up
    return () => clearInterval(qrInterval);
  }, [token, fetchQrCode]);

  // Update time left counter
  useEffect(() => {
    if (!token) return;

    const updateTimeLeft = () => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // If token is expired, log out
      if (newTimeLeft !== null && newTimeLeft <= 0) {
        handleLogout();
        toast.error("Your session has expired. Please login again.");
      }
    };

    // Update immediately
    updateTimeLeft();

    // Set up interval
    const timeInterval = setInterval(updateTimeLeft, 1000);

    // Clean up
    return () => clearInterval(timeInterval);
  }, [token, calculateTimeLeft]);

  // Keep session alive with ping every minute
  useEffect(() => {
    if (!token) return;

    // Send ping immediately
    pingToken();

    // Set up interval
    const pingInterval = setInterval(pingToken, 60000); // Every minute

    // Clean up
    return () => clearInterval(pingInterval);
  }, [token, pingToken]);

  // Prevent direct navigation away from the page for security
  useEffect(() => {
    if (!token) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue =
        "Are you sure you want to leave? Your attendance session will remain active.");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [token]);

  // Calculate QR refresh progress
  const qrRefreshProgress = () => {
    if (!lastRefresh) return 100;

    const now = new Date();
    const elapsed = now.getTime() - lastRefresh.getTime();
    const percent = (elapsed / 2000) * 100; // 2000ms = 2s

    return Math.min(100, percent);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Toaster richColors position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {!token ? (
          <Card className="bg-black border-purple-500/30">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CardTitle className="text-2xl text-center bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent">
                  Attendance Login
                </CardTitle>
                <CardDescription className="text-center text-gray-400">
                  Enter your registered email to start your attendance session
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Start Attendance Session"
                  )}
                </Button>
              </motion.form>
            </CardContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <CardFooter className="text-center text-xs text-gray-500">
                Your session will remain active for 12 hours or until you log
                out
              </CardFooter>
            </motion.div>
          </Card>
        ) : (
          <Card className="bg-black border-purple-500/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <CardTitle className="text-2xl bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent">
                    Attendance QR
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Show this code to mark attendance
                  </CardDescription>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <Clock className="h-3 w-3" />
                    <span>
                      {timeLeft !== null ? formatTime(timeLeft) : "Loading..."}
                    </span>
                  </Badge>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {/* User info if available */}
              {userInfo && (
                <motion.div
                  className="w-full mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-950/20 border border-purple-500/20">
                    <Avatar className="h-12 w-12 border-2 border-purple-500/30">
                      <AvatarFallback className="bg-purple-950 text-white">
                        {userInfo.name
                          ? userInfo.name.charAt(0).toUpperCase()
                          : "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-white truncate">
                        {userInfo.name}
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <User className="h-3 w-3 mr-1" />
                        <span className="truncate">
                          {userInfo.regno || "No Reg. No."}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        <span className="truncate">
                          {userInfo.branch || "No Branch"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* QR refresh progress */}
              <motion.div
                className="w-full mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>QR Refresh</span>
                  <span>Refreshed: {refreshCount} times</span>
                </div>
                <Progress value={qrRefreshProgress()} className="h-1" />
              </motion.div>

              <motion.div
                className={`bg-white p-4 rounded-lg mb-4 transition-all ${
                  isPulsing
                    ? "scale-105 shadow-lg shadow-purple-500/20"
                    : "scale-100"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {qrLoading ? (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                  </div>
                ) : qrCode ? (
                  <QRCodeSVG
                    value={qrCode}
                    size={192}
                    level="H"
                    includeMargin={true}
                    fgColor="#6a0dad"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500" />
                  </div>
                )}
              </motion.div>

              <motion.div
                className="w-full space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Alert className="bg-gray-900/40 border-purple-500/30">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" />
                  <AlertTitle className="text-white">
                    This code changes every 2 seconds
                  </AlertTitle>
                  <AlertDescription className="text-gray-400">
                    Keep this page open and show the QR code to your instructor
                    to mark attendance.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-500 hover:bg-red-950/30 hover:text-red-400"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-400 hover:bg-gray-800"
                    onClick={() => fetchQrCode()}
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Refresh QR
                  </Button>
                </div>
              </motion.div>
            </CardContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <CardFooter>
                <p className="text-xs text-gray-500 text-center w-full">
                  Session expires in{" "}
                  {timeLeft !== null ? formatTime(timeLeft) : "Loading..."}. Do
                  not close this page or log out until your attendance is
                  marked.
                </p>
              </CardFooter>
            </motion.div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
