"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Toaster, toast } from "sonner";
import { Loader2, AlertTriangle, UserCheck, UserX } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StudentInfo {
  name?: string;
  email?: string;
  id?: string;
  [key: string]: string | number | boolean | undefined;
}

export default function StudentScanner() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<{
    lastCheckIn: string | null;
    lastCheckOut: string | null;
    lastAction: "check-in" | "check-out" | null;
  }>({
    lastCheckIn: null,
    lastCheckOut: null,
    lastAction: null,
  });
  const [deviceId, setDeviceId] = useState("");

  // Store credentials in both cookies and localStorage
  const storeCredentials = (token: string, email: string, deviceId: string) => {
    // Store in cookies with expiry for better security
    document.cookie = `studentAttendanceToken=${token}; max-age=86400; path=/`;
    document.cookie = `studentAttendanceEmail=${email}; max-age=86400; path=/`;
    document.cookie = `studentAttendanceDeviceId=${deviceId}; max-age=86400; path=/`;
    
    // Also store in localStorage as a backup
    localStorage.setItem("studentAttendanceToken", token);
    localStorage.setItem("studentAttendanceEmail", email);
    localStorage.setItem("studentAttendanceDeviceId", deviceId);
  };

  // Retrieve credentials from cookies with fallback to localStorage
  const getCredentials = () => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };
    
    return {
      token: getCookie("studentAttendanceToken") || localStorage.getItem("studentAttendanceToken"),
      email: getCookie("studentAttendanceEmail") || localStorage.getItem("studentAttendanceEmail"),
      deviceId: getCookie("studentAttendanceDeviceId") || localStorage.getItem("studentAttendanceDeviceId")
    };
  };

  // Login with student email
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      // Register the device ID (browser fingerprint) along with the email
      const deviceFingerprint = await generateDeviceFingerprint();
      setDeviceId(deviceFingerprint);

      const response = await fetch("/api/attendance/student/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          deviceId: deviceFingerprint,
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Check if response has content before parsing JSON
      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error("Empty response received from server");
      }
      
      // Now parse the JSON from the text response
      const data = JSON.parse(responseText);

      if (data.success) {
        setSessionToken(data.token);
        setStudentInfo(data.student);
        setAttendanceStatus({
          lastCheckIn: data.lastCheckIn,
          lastCheckOut: data.lastCheckOut,
          lastAction: data.lastAction,
        });

        // Store credentials in cookies and localStorage
        storeCredentials(data.token, email, deviceFingerprint);

        toast.success("Login successful");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle QR code scan
  const handleScan = async (result: { rawValue: string }[]) => {
    try {
      setScannerLoading(true);
      setScannerActive(false);

      const qrData = result[0].rawValue;
      let qrPayload;

      try {
        qrPayload = JSON.parse(qrData);
      } catch {
        toast.error("Invalid QR code format");
        setScannerLoading(false);
        setScannerActive(true);
        return;
      }

      // Verify the QR code is recent (within last 5 seconds to allow scanning time)
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime - qrPayload.timestamp > 5) {
        toast.error("QR code has expired. Please scan a fresh code.");
        setScannerLoading(false);
        setScannerActive(true);
        return;
      }

      // Send the scan to the server
      const response = await fetch("/api/attendance/student/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: sessionToken,
          qrData,
          email: email,
          deviceId: deviceId,
          type: qrPayload.type, // check-in or check-out
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Check if response has content before parsing JSON
      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error("Empty response received from server");
      }
      
      // Now parse the JSON from the text response
      const data = JSON.parse(responseText);

      if (data.success) {
        // Update attendance status
        setAttendanceStatus({
          lastCheckIn:
            qrPayload.type === "check-in"
              ? new Date().toISOString()
              : attendanceStatus.lastCheckIn,
          lastCheckOut:
            qrPayload.type === "check-out"
              ? new Date().toISOString()
              : attendanceStatus.lastCheckOut,
          lastAction: qrPayload.type as "check-in" | "check-out",
        });

        toast.success(
          `${
            qrPayload.type === "check-in" ? "Check-in" : "Check-out"
          } recorded successfully`
        );
      } else {
        toast.error(data.message || "Failed to record attendance");
      }
    } catch (error) {
      console.error("QR scan error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setScannerLoading(false);
      // Re-enable scanner after a short delay
      setTimeout(() => setScannerActive(true), 1500);
    }
  };

  // Generate device fingerprint (simple implementation)
  const generateDeviceFingerprint = async () => {
    // Collect browser and device info
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const colorDepth = window.screen.colorDepth;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const deviceMemory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ||
      "unknown";

    // Create a device fingerprint string
    const fingerprintString = `${userAgent}|${screenWidth}x${screenHeight}|${colorDepth}|${timezone}|${language}|${deviceMemory}`;

    // Hash the fingerprint (simple hash for demo)
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  };

  // Attempt to restore session on component mount
  useEffect(() => {
    const credentials = getCredentials();

    if (credentials.token && credentials.email && credentials.deviceId) {
      setSessionToken(credentials.token);
      setEmail(credentials.email);
      setDeviceId(credentials.deviceId);

      // Verify the session is still valid and get latest status
      const verifySession = async () => {
        try {
          setLoading(true);

          const response = await fetch("/api/attendance/student/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: credentials.token,
              email: credentials.email,
              deviceId: credentials.deviceId,
            }),
          });

          // Check if response is ok before trying to parse JSON
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          // Check if response has content before parsing JSON
          const responseText = await response.text();
          
          if (!responseText) {
            throw new Error("Empty response received from server");
          }
          
          // Now parse the JSON from the text response
          const data = JSON.parse(responseText);

          if (data.success) {
            setStudentInfo(data.student);
            setAttendanceStatus({
              lastCheckIn: data.lastCheckIn,
              lastCheckOut: data.lastCheckOut,
              lastAction: data.lastAction,
            });
          } else {
            // Session is invalid, clear local storage and cookies
            localStorage.removeItem("studentAttendanceToken");
            localStorage.removeItem("studentAttendanceEmail");
            localStorage.removeItem("studentAttendanceDeviceId");
            
            // Clear cookies
            document.cookie = "studentAttendanceToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "studentAttendanceEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "studentAttendanceDeviceId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
            setSessionToken("");
            toast.error("Your session has expired. Please login again.");
          }
        } catch (error) {
          console.error("Error verifying session:", error);
        } finally {
          setLoading(false);
        }
      };

      verifySession();
    }
  }, []);

  // Format attendance time for display
  const formatAttendanceTime = (timestamp: string | null) => {
    if (!timestamp) return "Not recorded";

    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return "Invalid time";
    }
  };

  // Prevent users from clearing their session by adding an event listener to storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "studentAttendanceToken" ||
        e.key === "studentAttendanceEmail" ||
        e.key === "studentAttendanceDeviceId"
      ) {
        if (!e.newValue && sessionToken) {
          // Someone tried to clear the storage, restore it
          localStorage.setItem("studentAttendanceToken", sessionToken);
          localStorage.setItem("studentAttendanceEmail", email);
          localStorage.setItem("studentAttendanceDeviceId", deviceId);

          toast.error("You cannot manually clear your attendance session.");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [sessionToken, email, deviceId]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Toaster richColors position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {!sessionToken ? (
          <Card className="bg-black border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-center bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent">
                Student Attendance
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Enter your email to start scanning attendance QR codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
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
                      Logging in...
                    </>
                  ) : (
                    "Start Attendance"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center text-xs text-gray-500">
              You must use your registered email address
            </CardFooter>
          </Card>
        ) : (
          <Card className="bg-black border-purple-500/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent">
                    QR Scanner
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Scan the attendance QR code
                  </CardDescription>
                </div>
                <Badge className="bg-purple-600">
                  {studentInfo?.name || email}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {/* Attendance Status */}
              <div className="w-full mb-4 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                <h3 className="text-sm font-medium text-white mb-2">
                  Attendance Status
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Last Check-in:</div>
                  <div
                    className={`text-${
                      attendanceStatus.lastCheckIn ? "green" : "gray"
                    }-400`}
                  >
                    {formatAttendanceTime(attendanceStatus.lastCheckIn)}
                  </div>

                  <div className="text-gray-400">Last Check-out:</div>
                  <div
                    className={`text-${
                      attendanceStatus.lastCheckOut ? "blue" : "gray"
                    }-400`}
                  >
                    {formatAttendanceTime(attendanceStatus.lastCheckOut)}
                  </div>

                  <div className="text-gray-400">Last Action:</div>
                  <div>
                    {attendanceStatus.lastAction ? (
                      <Badge
                        variant="outline"
                        className={
                          attendanceStatus.lastAction === "check-in"
                            ? "bg-green-900/20 text-green-400 border-green-500/30"
                            : "bg-blue-900/20 text-blue-400 border-blue-500/30"
                        }
                      >
                        {attendanceStatus.lastAction === "check-in"
                          ? "Check-in"
                          : "Check-out"}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Scanner */}
              <div className="w-full mb-4">
                <div className="relative overflow-hidden rounded-lg border border-gray-700 aspect-video">
                  {scannerActive ? (
                    <Scanner
                      onScan={(result) => handleScan(result)}
                      onError={(error) => {
                        console.error("Scanner error:", error);
                        toast.error("Scanner error. Please try again.");
                        setScannerActive(false);
                        setTimeout(() => setScannerActive(true), 1000);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      {scannerLoading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-2" />
                          <p className="text-gray-400 text-sm">
                            Processing scan...
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setScannerActive(true)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Start Scanner
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Alert className="bg-gray-900/40 border-purple-500/30 mb-4">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-white">Important</AlertTitle>
                <AlertDescription className="text-gray-400">
                  Scan the QR code displayed by your instructor. Make sure to
                  scan both check-in and check-out codes to record full
                  attendance.
                </AlertDescription>
              </Alert>

              <div className="flex w-full space-x-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => setScannerActive(true)}
                  disabled={scannerActive || scannerLoading}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Check In
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setScannerActive(true)}
                  disabled={scannerActive || scannerLoading}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Check Out
                </Button>
              </div>
            </CardContent>
            <CardFooter className="text-center text-xs text-gray-500">
              <p>
                Connected as {email}. Your attendance session is locked to this
                device.
              </p>
            </CardFooter>
          </Card>
        )}
      </motion.div>
    </div>
  );
}