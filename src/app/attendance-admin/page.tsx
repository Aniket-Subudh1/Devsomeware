"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Toaster, toast } from "sonner";
import {
  Loader2,
  Clock,
  RefreshCw,
  Users,
  BarChart4,
  CheckCircle,
  LogOut,
  Clock8,
  Settings2,
  MapPin,
  AlertTriangle,
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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface CampusLocation {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  enabled: boolean;
}

interface AttendanceSettings {
  geoLocationEnabled: boolean;
  defaultRadius: number;
  maxQrValiditySeconds: number;
}

export default function AdminQRGenerator() {
  const router = useRouter();

  // Auth state
  const [adminPassword, setAdminPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // QR state
  const [qrData, setQrData] = useState("");
  const [isPulsing, setIsPulsing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [qrType, setQrType] = useState("check-in");

  // Location state
  const [geoEnabled, setGeoEnabled] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [campusLocations, setCampusLocations] = useState<CampusLocation[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("");

  // Settings state
  const [settings, setSettings] = useState<AttendanceSettings>({
    geoLocationEnabled: true,
    defaultRadius: 50,
    maxQrValiditySeconds: 10,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Stats state
  interface LatestCheckIn {
    _id: string;
    email: string;
    checkInTime: string;
    student: {
      name: string;
      regno?: string;
    };
  }

  interface WeeklyStat {
    day: string;
    attendance: number;
    rate: number;
  }

  interface QrStats {
    todayCheckins: number;
    todayCheckouts: number;
    activeSessions: number;
    totalStudents: number;
    uniqueAttendees: number;
    attendanceRate: number;
    avgDuration: number;
    weeklyStats: WeeklyStat[];
    latestCheckIns: LatestCheckIn[];
    campusStats?: {
      totalStudents: number;
      presentToday: number;
      checkInsToday: number;
      checkOutsToday: number;
    };
  }

  const [qrStats, setQrStats] = useState<QrStats | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Time tracking for progress bar
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get current location
  const getLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationLoading(false);
        toast.success("Location updated successfully");
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Failed to get location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        
        setLocationError(errorMessage);
        setLocationLoading(false);
        toast.error(errorMessage);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 
      }
    );
  };

  // Authenticate admin
  interface AuthResponse {
    success: boolean;
    message?: string;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!adminPassword) {
      toast.error("Please enter the admin password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/attendance/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminPassword }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        setAuthenticated(true);
        sessionStorage.setItem("adminAuthenticated", "true");
        sessionStorage.setItem("adminPassword", adminPassword);
        toast.success("Authentication successful");
        
        // Get initial location after authentication
        getLocation();
        
        // Fetch settings and campus locations
        fetchSettings();
        fetchCampusLocations();
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Error authenticating:", error);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    // Prevent multiple simultaneous requests
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      // Reset progress bar
      setProgress(0);

      // Create payload with or without location based on settings
      const payload: {
        adminPassword: string;
        type: string;
        adminLocation?: {
          latitude: number;
          longitude: number;
          accuracy?: number;
        };
        campus?: string;
      } = {
        adminPassword,
        type: qrType,
      };

      // Add location data if enabled and available
      if (geoEnabled && settings.geoLocationEnabled) {
        if (selectedCampus) {
          payload.campus = selectedCampus;
        } else if (currentLocation) {
          payload.adminLocation = currentLocation;
        }
      }

      const response = await fetch("/api/attendance/admin/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setQrData(data.qrData);
        setIsPulsing(true);
        setRefreshCount((prev) => prev + 1);

        // Update geo status from response
        if (data.geoLocationEnabled !== undefined) {
          setGeoEnabled(data.geoLocationEnabled);
        }

        // Fetch stats occasionally
        if (refreshCount % 3 === 0) {
          await fetchQrStats();
        }

        setTimeout(() => setIsPulsing(false), 500);
      } else {
        console.error("Failed to generate QR code:", data.message);
        toast.error(data.message || "Failed to generate QR code");
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Error generating QR code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQrType = () => {
    const newType = qrType === "check-in" ? "check-out" : "check-in";
    setQrType(newType);
    // Force an immediate QR generation with the new type
    setTimeout(() => generateQR(), 100);
  };

  // Fetch attendance settings
  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/attendance/admin/settings?password=${adminPassword}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        setGeoEnabled(data.settings.geoLocationEnabled);
      } else {
        toast.error(data.message || "Failed to fetch settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    }
  };

  // Save attendance settings
  const saveSettings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/attendance/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword,
          settings,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Settings updated successfully");
        setSettingsOpen(false);
        setGeoEnabled(settings.geoLocationEnabled);
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  // Fetch campus locations
  const fetchCampusLocations = async () => {
    try {
      const response = await fetch("/api/attendance/admin/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword,
          action: "get",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCampusLocations(data.locations);
      } else {
        toast.error(data.message || "Failed to fetch campus locations");
      }
    } catch (error) {
      console.error("Error fetching campus locations:", error);
      toast.error("Failed to load campus locations");
    }
  };

  // Fetch QR statistics
  const fetchQrStats = async () => {
    try {
      setDataLoading(true);
      const response = await fetch(
        `/api/attendance/admin/stats?password=${adminPassword}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setQrStats(data.stats);
      } else {
        toast.error(data.message || "Failed to fetch attendance statistics");
      }
    } catch (error) {
      console.error("Error fetching QR stats:", error);
      toast.error("Failed to load attendance statistics");
    } finally {
      setDataLoading(false);
    }
  };

  // Go to dashboard
  const goToDashboard = () => {
    router.push("/attendance-admin-dashboard");
  };

  // Format date and time
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid time";
    }
  };

  // Format duration in hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Check for existing authentication on component mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
    const storedPassword = sessionStorage.getItem("adminPassword");

    if (isAuthenticated === "true" && storedPassword) {
      setAuthenticated(true);
      setAdminPassword(storedPassword);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      const qrRefreshInterval = setInterval(() => {
        generateQR();
      }, 2000);

      return () => {
        clearInterval(qrRefreshInterval);
      };
    }
  }, [authenticated, qrType, geoEnabled, currentLocation, selectedCampus]);

  useEffect(() => {
    if (!authenticated) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, [authenticated]);

  useEffect(() => {
    if (progress === 100) {
      generateQR();
      setProgress(0);
    }
  }, [progress]);

  useEffect(() => {
    if (authenticated) {
      generateQR();
      fetchQrStats();
      fetchSettings();
      fetchCampusLocations();
    }
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Toaster richColors position="top-center" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-black border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-center bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent">
                Admin Authentication
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Enter the admin password to generate attendance QR codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Admin Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
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
                      Authenticating...
                    </>
                  ) : (
                    "Authenticate"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center text-xs text-gray-500">
              This page is for administrators only
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <Toaster richColors position="top-center" />

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-black border-purple-500/30 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Attendance Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure geolocation and attendance settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="geo-enabled" className="text-white">Geolocation Attendance</Label>
                <p className="text-xs text-gray-400">Require student location for attendance</p>
              </div>
              <Switch
                id="geo-enabled"
                checked={settings.geoLocationEnabled}
                onCheckedChange={(checked) => 
                  setSettings({...settings, geoLocationEnabled: checked})
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-radius" className="text-white">Default Radius (meters)</Label>
              <Input
                id="default-radius"
                type="number"
                value={settings.defaultRadius}
                onChange={(e) => 
                  setSettings({...settings, defaultRadius: parseInt(e.target.value) || 50})
                }
                min={10}
                max={500}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400">
                Students must be within this distance to record attendance
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qr-validity" className="text-white">QR Code Validity (seconds)</Label>
              <Input
                id="qr-validity"
                type="number"
                value={settings.maxQrValiditySeconds}
                onChange={(e) => 
                  setSettings({...settings, maxQrValiditySeconds: parseInt(e.target.value) || 10})
                }
                min={5}
                max={300}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400">
                How long each QR code remains valid after generation
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSettingsOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveSettings}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent mb-2">
                QR Code Generator
              </h1>
              <p className="text-gray-400 text-sm">
                Generate QR codes for student attendance check-in/out
              </p>
            </div>
            <div className="flex mt-4 md:mt-0 space-x-2">
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={goToDashboard}
              >
                <BarChart4 className="h-4 w-4 mr-2" />
                View Dashboard
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-400 hover:bg-gray-800"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-400 hover:bg-gray-800"
                onClick={fetchQrStats}
                disabled={dataLoading}
              >
                {dataLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - QR Code */}
            <div className="lg:col-span-2">
              <Card className="bg-black border-purple-500/30">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent">
                        {qrType === "check-in" ? "Check-In" : "Check-Out"} QR Code
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Students scan this code to mark attendance
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        qrType === "check-in"
                          ? "bg-green-900/20 text-green-400 border-green-500/30"
                          : "bg-blue-900/20 text-blue-400 border-blue-500/30"
                      }
                    >
                      {qrType === "check-in"
                        ? "Check In Mode"
                        : "Check Out Mode"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {/* Location Controls */}
                  <div className="w-full mb-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <MapPin className={`h-4 w-4 ${geoEnabled && settings.geoLocationEnabled ? 'text-green-500' : 'text-gray-500'}`} />
                        <span className="text-sm text-gray-300">
                          Geolocation {geoEnabled && settings.geoLocationEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <Switch 
                        checked={geoEnabled}
                        onCheckedChange={(checked) => setGeoEnabled(checked)}
                        disabled={!settings.geoLocationEnabled}
                      />
                    </div>
                    
                    {geoEnabled && settings.geoLocationEnabled && (
                      <>
                        {/* Campus Selection */}
                        <div className="space-y-1">
                          <Label htmlFor="campus-select" className="text-sm text-gray-300">
                            Select Campus
                          </Label>
                          <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                              <SelectValue placeholder="Select campus or use current location" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700 text-white">
                              <SelectItem value="">Use Current Location</SelectItem>
                              {campusLocations.map((campus) => (
                                <SelectItem key={campus._id} value={campus.name}>
                                  {campus.name.toUpperCase()} Campus
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {!selectedCampus && (
                          <div className="flex justify-between items-center">
                            <div>
                              {currentLocation ? (
                                <div className="text-xs text-gray-400">
                                  Lat: {currentLocation.latitude.toFixed(6)}, Lng: {currentLocation.longitude.toFixed(6)}
                                  {currentLocation.accuracy && ` (±${Math.round(currentLocation.accuracy)}m)`}
                                </div>
                              ) : locationError ? (
                                <div className="text-xs text-red-400">{locationError}</div>
                              ) : (
                                <div className="text-xs text-gray-400">No location data</div>
                              )}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-gray-700 text-gray-300 hover:bg-gray-800"
                              onClick={getLocation}
                              disabled={locationLoading}
                            >
                              {locationLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <MapPin className="h-3 w-3" />
                              )}
                              <span className="ml-1">Update</span>
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {geoEnabled && settings.geoLocationEnabled && !currentLocation && !selectedCampus && (
                    <Alert className="mb-4 bg-red-950/20 border-red-500/30">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <AlertTitle className="text-white">No Location Available</AlertTitle>
                      <AlertDescription className="text-gray-400">
                        QR codes require location data. Please update your location or select a campus.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Countdown display */}
                  <div className="mb-4 w-full">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>QR Refresh Progress</span>
                      <span>
                        <Clock className="h-3 w-3 inline mr-1" />
                        Expires in{" "}
                        {Math.ceil(
                          (settings.maxQrValiditySeconds || 10) - 
                          (Date.now() / 1000 - 
                           (qrData ? JSON.parse(qrData).timestamp : Date.now() / 1000))
                        )}{" "}
                        sec
                      </span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>

                  {/* QR Code */}
                  <div
                    className={`bg-white p-8 rounded-lg mb-6 transition-all ${
                      isPulsing
                        ? "scale-105 shadow-lg shadow-purple-500/20"
                        : "scale-100"
                    }`}
                  >
                    {isGenerating && !qrData ? (
                      <div className="w-64 h-64 flex items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                      </div>
                    ) : qrData ? (
                      <>
                        {/* Clear type indicator above the QR code */}
                        <div
                          className="text-center mb-2 font-bold text-lg"
                          style={{
                            color:
                              qrType === "check-in" ? "#16a34a" : "#2563eb",
                          }}
                        >
                          {qrType === "check-in" ? "CHECK IN" : "CHECK OUT"}
                        </div>

                        <QRCodeSVG
                          value={qrData}
                          size={256}
                          level="H"
                          includeMargin={true}
                          fgColor={
                            qrType === "check-in" ? "#16a34a" : "#2563eb"
                          }
                        />
                        
                        {/* If geolocation is enabled, show badge */}
                        {geoEnabled && settings.geoLocationEnabled && (
                          <div className="mt-2 text-center">
                            <Badge variant="outline" className="bg-purple-900/20 text-purple-400 border-purple-500/30">
                              <MapPin className="h-3 w-3 mr-1" />
                              {selectedCampus ? `${selectedCampus.toUpperCase()} Campus` : "Current Location"}
                            </Badge>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center bg-gray-200">
                        <p className="text-gray-500">QR code not generated</p>
                      </div>
                    )}
                  </div>

                  <div className="w-full space-y-4">
                    <Alert className="bg-gray-900/40 border-purple-500/30">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <AlertTitle className="text-white">
                        QR Code Validity
                      </AlertTitle>
                      <AlertDescription className="text-gray-400">
                        This code remains valid for {settings.maxQrValiditySeconds} seconds.
                        {geoEnabled && settings.geoLocationEnabled && " Students must be within "+
                        (selectedCampus ? 
                          campusLocations.find(c => c.name === selectedCampus)?.radius || settings.defaultRadius : 
                          settings.defaultRadius)+" meters to record attendance."}
                      </AlertDescription>
                    </Alert>

                   <div className="flex justify-center space-x-4">
                      <Button
                        variant="outline"
                        className={
                          qrType === "check-in"
                            ? "border-green-500/30 text-green-500 hover:bg-green-950/30"
                            : "border-blue-500/30 text-blue-500 hover:bg-blue-950/30"
                        }
                        onClick={toggleQrType}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Switch to{" "}
                        {qrType === "check-in" ? "Check Out" : "Check In"}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-700 text-gray-400 hover:bg-gray-800"
                        onClick={() => {
                          setProgress(0);
                          generateQR();
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              {/* Today's Stats */}
              <Card className="bg-black border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-200">
                    Today&apos;s Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                  ) : qrStats ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-green-500/30">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="text-xs text-gray-400">
                                Check-ins
                              </div>
                              <div className="text-xl font-bold text-white">
                                {qrStats.todayCheckins}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-blue-500/30">
                          <div className="flex items-center space-x-2">
                            <LogOut className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="text-xs text-gray-400">
                                Check-outs
                              </div>
                              <div className="text-xl font-bold text-white">
                                {qrStats.todayCheckouts}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-900/50 p-3 rounded-lg border border-purple-500/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-5 w-5 text-purple-500" />
                          <div>
                            <div className="text-xs text-gray-400">
                              Attendance Rate
                            </div>
                            <div className="text-xl font-bold text-white">
                              {qrStats.attendanceRate}% (
                              {qrStats.uniqueAttendees}/{qrStats.totalStudents})
                            </div>
                          </div>
                        </div>
                        <Progress
                          value={qrStats.attendanceRate}
                          className="h-1.5 bg-gray-800"
                        />
                      </div>

                      <div className="bg-gray-900/50 p-3 rounded-lg border border-amber-500/30">
                        <div className="flex items-center space-x-2">
                          <Clock8 className="h-5 w-5 text-amber-500" />
                          <div>
                            <div className="text-xs text-gray-400">
                              Avg. Duration
                            </div>
                            <div className="text-xl font-bold text-white">
                              {formatDuration(qrStats.avgDuration)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Show campus stats if a campus is selected */}
                      {selectedCampus && qrStats.campusStats && (
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-purple-500/30">
                          <div className="text-sm font-semibold text-white mb-2">
                            {selectedCampus.toUpperCase()} Campus Stats
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-400">Total Students:</div>
                            <div className="text-white">{qrStats.campusStats.totalStudents}</div>
                            
                            <div className="text-gray-400">Present Today:</div>
                            <div className="text-white">{qrStats.campusStats.presentToday}</div>
                            
                            <div className="text-gray-400">Check-ins:</div>
                            <div className="text-white">{qrStats.campusStats.checkInsToday}</div>
                            
                            <div className="text-gray-400">Check-outs:</div>
                            <div className="text-white">{qrStats.campusStats.checkOutsToday}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between text-sm text-gray-400">
                        <div>
                          Active Sessions:{" "}
                          <span className="text-white">
                            {qrStats.activeSessions}
                          </span>
                        </div>
                        <div>
                          Total Students:{" "}
                          <span className="text-white">
                            {qrStats.totalStudents}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      No stats available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Campus Management Card */}
              {settings.geoLocationEnabled && (
                <Card className="bg-black border-purple-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-200">
                      Campus Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {campusLocations.length > 0 ? (
                        campusLocations.map((campus) => (
                          <div key={campus._id} className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-white">{campus.name.toUpperCase()} Campus</span>
                              <Badge 
                                variant="outline" 
                                className={campus.enabled ? 
                                  "bg-green-900/20 text-green-400 border-green-500/30" :
                                  "bg-red-900/20 text-red-400 border-red-500/30"}
                              >
                                {campus.enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-x-2 text-xs">
                              <div className="text-gray-400">Latitude:</div>
                              <div className="text-gray-300">{campus.latitude.toFixed(6)}</div>
                              
                              <div className="text-gray-400">Longitude:</div>
                              <div className="text-gray-300">{campus.longitude.toFixed(6)}</div>
                              
                              <div className="text-gray-400">Radius:</div>
                              <div className="text-gray-300">{campus.radius}m</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No campus locations configured
                        </div>
                      )}
                      
                      <Alert className="bg-gray-900/40 border-amber-500/30">
                        <MapPin className="h-4 w-4 text-amber-500" />
                        <AlertTitle className="text-white">Campus Configuration</AlertTitle>
                        <AlertDescription className="text-gray-400">
                          Configure campus locations in the settings. Students must be physically present at their assigned campus to mark attendance.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              {qrStats?.latestCheckIns && qrStats.latestCheckIns.length > 0 && (
                <Card className="bg-black border-purple-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-200">
                      Recent Check-ins
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {qrStats.latestCheckIns.map((checkIn, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 py-2 border-b border-gray-800"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {checkIn.student?.name?.[0] || checkIn.email[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">
                              {checkIn.student?.name || "Unknown Student"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {checkIn.student?.regno || checkIn.email}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTime(checkIn.checkInTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}