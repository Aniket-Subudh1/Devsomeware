"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Toaster, toast } from "sonner";
import { Loader2, AlertTriangle, UserCheck, UserX, RefreshCw } from "lucide-react";
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
  campus?: string;
  branch?: string;
  regno?: string;
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
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccessTime, setScanSuccessTime] = useState<number | null>(null);
  
  const storeCredentials = (token: string, email: string, deviceId: string) => {
    document.cookie = `studentAttendanceToken=${token}; max-age=86400; path=/`;
    document.cookie = `studentAttendanceEmail=${email}; max-age=86400; path=/`;
    document.cookie = `studentAttendanceDeviceId=${deviceId}; max-age=86400; path=/`;
    
    localStorage.setItem("studentAttendanceToken", token);
    localStorage.setItem("studentAttendanceEmail", email);
    localStorage.setItem("studentAttendanceDeviceId", deviceId);
  };

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

  const handleRefreshScanner = () => {
    setScannerActive(false);
    setScanError(null);
    setTimeout(() => {
      setScannerActive(true);
    }, 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const deviceFingerprint = await generateDeviceFingerprint();
      setDeviceId(deviceFingerprint);

      const timestamp = new Date().getTime();
      
      const response = await fetch(`/api/attendance/student/login?_t=${timestamp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
        body: JSON.stringify({
          email,
          deviceId: deviceFingerprint,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || "Authentication failed";
        } catch {
          errorMessage = `Authentication failed (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // Check if response has content before parsing JSON
      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error("Empty response received from server");
      }
      
      const data = JSON.parse(responseText);

      if (data.success) {
        setSessionToken(data.token);
        setStudentInfo(data.student);
        setAttendanceStatus({
          lastCheckIn: data.lastCheckIn,
          lastCheckOut: data.lastCheckOut,
          lastAction: data.lastAction,
        });

        storeCredentials(data.token, email, deviceFingerprint);

        toast.success(data.message || "Login successful");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (result: { rawValue: string }[]) => {
    try {
    
      if (scanSuccessTime && Date.now() - scanSuccessTime < 2000) {
        return;
      }
      
      setScannerLoading(true);
      setScannerActive(false);
      setScanError(null);

      const qrData = result[0].rawValue;
      let qrPayload;

      try {
        qrPayload = JSON.parse(qrData);
      } catch {
        setScanError("Invalid QR code format. Please try scanning again.");
        toast.error("Invalid QR code format");
        setScannerLoading(false);
        setTimeout(() => setScannerActive(true), 1000);
        return;
      }

      const timestamp = new Date().getTime();
      
      const response = await fetch(`/api/attendance/student/record?_t=${timestamp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
        body: JSON.stringify({
          token: sessionToken,
          qrData,
          email: email,
          deviceId: deviceId,
          type: qrPayload.type, 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `HTTP error! Status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! Status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error("Empty response received from server");
      }
      
      const data = JSON.parse(responseText);

      if (data.success) {
        setAttendanceStatus({
          lastCheckIn:
            qrPayload.type === "check-in"
              ? new Date().toISOString()
              : data.lastCheckIn || attendanceStatus.lastCheckIn,
          lastCheckOut:
            qrPayload.type === "check-out"
              ? new Date().toISOString()
              : data.lastCheckOut || attendanceStatus.lastCheckOut,
          lastAction: data.lastAction || qrPayload.type as "check-in" | "check-out",
        });

        toast.success(
          data.message || `${qrPayload.type === "check-in" ? "Check-in" : "Check-out"} recorded successfully`
        );
        
        setScanSuccessTime(Date.now());
      } else {
        toast.error(data.message || "Failed to record attendance");
        setScanError(data.message || "Failed to record attendance. Please try again.");
      }
    } catch (error) {
      console.error("QR scan error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
      toast.error(errorMessage);
      setScanError(errorMessage);
    } finally {
      setScannerLoading(false);
      setTimeout(() => setScannerActive(true), 1500);
    }
  };

  const generateDeviceFingerprint = async () => {
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const colorDepth = window.screen.colorDepth;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const deviceMemory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ||
      "unknown";

    const fingerprintString = `${userAgent}|${screenWidth}x${screenHeight}|${colorDepth}|${timezone}|${language}|${deviceMemory}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  };

  useEffect(() => {
    const credentials = getCredentials();

    if (credentials.token && credentials.email && credentials.deviceId) {
      setSessionToken(credentials.token);
      setEmail(credentials.email);
      setDeviceId(credentials.deviceId);

      const verifySession = async () => {
        try {
          setLoading(true);
          
          const timestamp = new Date().getTime();

          const response = await fetch(`/api/attendance/student/verify?_t=${timestamp}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0"
            },
            body: JSON.stringify({
              token: credentials.token,
              email: credentials.email,
              deviceId: credentials.deviceId,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || `HTTP error! Status: ${response.status}`;
            } catch {
              errorMessage = `HTTP error! Status: ${response.status}`;
            }
            throw new Error(errorMessage);
          }

          const responseText = await response.text();
          
          if (!responseText) {
            throw new Error("Empty response received from server");
          }
          
          const data = JSON.parse(responseText);

          if (data.success) {
            setStudentInfo(data.student);
            setAttendanceStatus({
              lastCheckIn: data.lastCheckIn,
              lastCheckOut: data.lastCheckOut,
              lastAction: data.lastAction,
            });
          } else {
            localStorage.removeItem("studentAttendanceToken");
            localStorage.removeItem("studentAttendanceEmail");
            localStorage.removeItem("studentAttendanceDeviceId");
            
            document.cookie = "studentAttendanceToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "studentAttendanceEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "studentAttendanceDeviceId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
            setSessionToken("");
            toast.error("Your session has expired. Please login again.");
          }
        } catch (error) {
          console.error("Error verifying session:", error);
          const errorMessage = error instanceof Error ? error.message : "Session verification failed";
          toast.error(errorMessage);
          
          localStorage.removeItem("studentAttendanceToken");
          localStorage.removeItem("studentAttendanceEmail");
          localStorage.removeItem("studentAttendanceDeviceId");
          
          document.cookie = "studentAttendanceToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "studentAttendanceEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "studentAttendanceDeviceId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          
          setSessionToken("");
        } finally {
          setLoading(false);
        }
      };

      verifySession();
    }
  }, []);

  const formatAttendanceTime = (timestamp: string | null) => {
    if (!timestamp) return "Not recorded";

    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return "Invalid time";
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "studentAttendanceToken" ||
        e.key === "studentAttendanceEmail" ||
        e.key === "studentAttendanceDeviceId"
      ) {
        if (!e.newValue && sessionToken) {
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
                  <div className="text-gray-400">Student:</div>
                  <div className="text-white font-medium">
                    {studentInfo?.name || email}
                  </div>
                  
                  {studentInfo?.campus && (
                    <>
                      <div className="text-gray-400">Campus:</div>
                      <div className="text-white font-medium">
                        {studentInfo.campus}
                      </div>
                    </>
                  )}
                  
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
                        setScanError("Scanner error. Please refresh and try again.");
                        toast.error("Scanner error. Please try again.");
                        setScannerActive(false);
                        setTimeout(() => setScannerActive(true), 1000);
                      }}
                      // Using higher quality and better scanning options
                      constraints={{
                        facingMode: "environment",
                        aspectRatio: 1,
                      }}
                      scanDelay={500}
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
                        <div className="flex flex-col items-center">
                          <Button
                            onClick={() => setScannerActive(true)}
                            className="mb-2 bg-purple-600 hover:bg-purple-700"
                          >
                            Start Scanner
                          </Button>
                          {scanError && (
                            <p className="text-red-400 text-sm mt-2 text-center max-w-xs">
                              {scanError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Refresh scanner button in the corner */}
                  {scannerActive && (
                    <Button 
                      size="icon"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/80"
                      onClick={handleRefreshScanner}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
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
                  onClick={() => {
                    setScannerActive(false);
                    setScanError(null);
                    setTimeout(() => setScannerActive(true), 500);
                  }}
                  disabled={scannerActive || scannerLoading}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Check In
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setScannerActive(false);
                    setScanError(null);
                    setTimeout(() => setScannerActive(true), 500);
                  }}
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