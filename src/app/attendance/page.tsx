"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Toaster, toast } from "sonner";
import {
  Loader2,
  AlertTriangle,
  UserCheck,
  UserX,
  RefreshCw,
  MapPin,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

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
  const [lastScannedQR, setLastScannedQR] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  
  // Location state
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationRequired, setLocationRequired] = useState(false);

  const storeCredentials = (token: string, email: string, deviceId: string) => {
    document.cookie = `studentAttendanceToken=${token}; max-age=86400; path=/; samesite=strict`;
    document.cookie = `studentAttendanceEmail=${email}; max-age=86400; path=/; samesite=strict`;
    document.cookie = `studentAttendanceDeviceId=${deviceId}; max-age=86400; path=/; samesite=strict`;

    try {
      localStorage.setItem("studentAttendanceToken", token);
      localStorage.setItem("studentAttendanceEmail", email);
      localStorage.setItem("studentAttendanceDeviceId", deviceId);

      const encryptedBackup = btoa(
        JSON.stringify({
          t: token,
          e: email,
          d: deviceId,
          ts: Date.now(),
        })
      );
      localStorage.setItem("attendance_backup", encryptedBackup);
      sessionStorage.setItem("attendance_backup", encryptedBackup);

      sessionStorage.setItem("deviceFingerprint", deviceId);
    } catch {
      console.warn("LocalStorage not available");
    }
  };

  const getCredentials = () => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };

    const cookieToken = getCookie("studentAttendanceToken");
    const cookieEmail = getCookie("studentAttendanceEmail");
    const cookieDeviceId = getCookie("studentAttendanceDeviceId");

    const lsToken = localStorage.getItem("studentAttendanceToken");
    const lsEmail = localStorage.getItem("studentAttendanceEmail");
    const lsDeviceId = localStorage.getItem("studentAttendanceDeviceId");

    let backupValues = null;
    try {
      const backup =
        localStorage.getItem("attendance_backup") ||
        sessionStorage.getItem("attendance_backup");
      if (backup) {
        const decoded = JSON.parse(atob(backup));
        backupValues = {
          token: decoded.t,
          email: decoded.e,
          deviceId: decoded.d,
        };
      }
    } catch (e) {
      console.warn("Error parsing backup:", e);
    }

    return {
      token:
        cookieToken || lsToken || (backupValues ? backupValues.token : null),
      email:
        cookieEmail || lsEmail || (backupValues ? backupValues.email : null),
      deviceId:
        cookieDeviceId ||
        lsDeviceId ||
        (backupValues ? backupValues.deviceId : null),
    };
  };

  const getLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      toast.error("Your browser doesn't support geolocation");
      return;
    }
    
    // Check if permission is already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(permissionStatus => {
          console.log('Geolocation permission status:', permissionStatus.state);
          
          if (permissionStatus.state === 'denied') {
            setLocationError("Location permission is denied. Please enable location in your browser settings.");
            setLocationLoading(false);
            toast.error("Location permission denied. Please enable in settings.");
            return;
          }
          
          // If permission is granted or prompt, request the location
          requestLocation();
        })
        .catch(error => {
          console.warn('Permission query error:', error);
          // Fall back to directly requesting location
          requestLocation();
        });
    } else {
      // Just request location directly for browsers without Permissions API
      requestLocation();
    }
    
    function requestLocation() {
      // Use high accuracy for better positioning indoors
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          
          setCurrentLocation(newLocation);
          setLocationLoading(false);
          toast.success("Location updated successfully");
          
          // Store location in session to avoid frequent permission requests
          try {
            sessionStorage.setItem(
              "studentLocation", 
              JSON.stringify({
                ...newLocation,
                timestamp: Date.now()
              })
            );
          } catch (e) {
            console.warn("Error storing location:", e);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = "Failed to get location";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable. Check if you're indoors or have poor GPS signal.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
          }
          
          setLocationError(errorMessage);
          setLocationLoading(false);
          toast.error(errorMessage);
        },
        { 
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0 
        }
      );
    }
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

      const response = await fetch(
        `/api/attendance/student/login?_t=${timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          body: JSON.stringify({
            email,
            deviceId: deviceFingerprint,
          }),
        }
      );

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
        
        // Request location after successful login
        getLocation();

        toast.success(data.message || "Login successful");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceFingerprint = async () => {
    let existingFingerprint = null;

    try {
      existingFingerprint = localStorage.getItem("deviceFingerprint");
      if (existingFingerprint) return existingFingerprint;
    } catch (e) {
      console.warn("localStorage access failed:", e);
    }

    try {
      existingFingerprint = sessionStorage.getItem("deviceFingerprint");
      if (existingFingerprint) return existingFingerprint;
    } catch (e) {
      console.warn("sessionStorage access failed:", e);
    }

    if ("indexedDB" in window) {
      try {
        const dbPromise = new Promise<string | null>((resolve) => {
          const request = indexedDB.open("AttendanceSystem", 1);

          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains("deviceData")) {
              db.createObjectStore("deviceData", { keyPath: "id" });
            }
          };

          request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains("deviceData")) {
              resolve(null);
              return;
            }

            const transaction = db.transaction(["deviceData"], "readonly");
            const store = transaction.objectStore("deviceData");
            const getRequest = store.get("deviceId");

            getRequest.onsuccess = () => {
              if (getRequest.result) {
                resolve(getRequest.result.value);
              } else {
                resolve(null);
              }
            };

            getRequest.onerror = () => {
              resolve(null);
            };
          };

          request.onerror = () => {
            resolve(null);
          };
        });

        existingFingerprint = await dbPromise;
        if (existingFingerprint) return existingFingerprint;
      } catch (e) {
        console.warn("IndexedDB access failed:", e);
      }
    }

    // If no existing fingerprint is found, create a comprehensive device fingerprint
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const colorDepth = window.screen.colorDepth;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const deviceMemory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ||
      "unknown";
    const hardwareConcurrency = navigator.hardwareConcurrency || "unknown";
    const platform = navigator.platform || "unknown";
    const vendor = navigator.vendor || "unknown";
    const pixelRatio = window.devicePixelRatio || 1;

    // List of installed plugins (limited in modern browsers but still useful)
    const plugins = Array.from(navigator.plugins || [])
      .map((p) => p.name)
      .join(",");

    // Browser-specific features and settings
    const doNotTrack = navigator.doNotTrack || "unknown";
    const cookieEnabled = navigator.cookieEnabled;
    const touchPoints = navigator.maxTouchPoints || 0;

    // Add canvas fingerprinting for more unique device identification
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let canvasData = "canvas-not-supported";

    if (ctx) {
      canvas.width = 200;
      canvas.height = 200;

      // Text with different styles and colors
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Fingerprint", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("DeviceID", 4, 17);

      // Add a special shape
      ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
      ctx.stroke();

      // Add unique patterns that vary based on graphics rendering
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(${i * 12}, ${i * 8}, ${i * 4}, 0.05)`;
        ctx.fillRect(i * 10, i * 10, 10, 10);
      }

      // More complex gradients and shapes
      const gradient = ctx.createLinearGradient(0, 0, 200, 0);
      gradient.addColorStop(0, "red");
      gradient.addColorStop(1, "blue");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 100, 200, 20);

      // Get unique rendering data
      canvasData = canvas.toDataURL().slice(0, 100); // Use only a part to keep fingerprint manageable
    }

    // WebGL fingerprinting - different GPUs and drivers render differently
    let webglVendor = "unknown";
    let webglRenderer = "unknown";
    let webglExtensions = "";

    try {
      const webglCanvas = document.createElement("canvas");
      const gl =
        webglCanvas.getContext("webgl") ||
        (webglCanvas.getContext(
          "experimental-webgl"
        ) as WebGLRenderingContext | null);

      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          webglVendor =
            gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "unknown";
          webglRenderer =
            gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "unknown";
        }

        const extensions = gl.getSupportedExtensions() || [];
        webglExtensions = extensions.join(",").slice(0, 100);

        gl.clearColor(0.2, 0.3, 0.4, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    } catch (e) {
      console.warn("WebGL fingerprinting failed", e);
    }

    let audioFingerprint = "audio-not-supported";
    try {
      interface WindowWithWebkitAudio extends Window {
        webkitAudioContext?: typeof AudioContext;
      }

      if (
        window.AudioContext ||
        (window as WindowWithWebkitAudio).webkitAudioContext
      ) {
        const audioContext = new (window.AudioContext ||
          (window as WindowWithWebkitAudio).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        analyser.getByteFrequencyData(dataArray);

        audioFingerprint = Array.from(dataArray.slice(0, 10)).join(",");

        if (audioContext.state !== "closed" && audioContext.close) {
          audioContext.close();
        }
      }
    } catch (e) {
      console.warn("Audio fingerprinting failed", e);
    }

    // Browser features detection
    const featureDetection = [
      "ontouchstart" in window,
      "FileReader" in window,
      "Notification" in window,
      "WebSocket" in window,
      "SharedWorker" in window,
      "localStorage" in window,
      "indexedDB" in window,
      "BroadcastChannel" in window,
    ]
      .map((v) => (v ? "1" : "0"))
      .join("");

    // Combine all collected data into a fingerprint string
    const fingerprintString = [
      userAgent,
      `${screenWidth}x${screenHeight}`,
      colorDepth,
      timezone,
      language,
      deviceMemory,
      hardwareConcurrency,
      platform,
      vendor,
      plugins.slice(0, 100),
      doNotTrack,
      cookieEnabled ? "1" : "0",
      pixelRatio,
      touchPoints,
      webglVendor,
      webglRenderer,
      webglExtensions,
      canvasData,
      audioFingerprint,
      featureDetection,
    ].join("|");

    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintString);
    let hashHex;

    try {
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      console.warn("WebCrypto not available, using fallback fingerprinting");
      let hash = 0;
      for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      hashHex = Math.abs(hash).toString(16);
    }

    try {
      localStorage.setItem("deviceFingerprint", hashHex);

      sessionStorage.setItem("deviceFingerprint", hashHex);

      document.cookie = `deviceFingerprint=${hashHex}; max-age=31536000; path=/; samesite=strict`;

      if ("indexedDB" in window) {
        const request = indexedDB.open("AttendanceSystem", 1);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains("deviceData")) {
            db.createObjectStore("deviceData", { keyPath: "id" });
          }
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(["deviceData"], "readwrite");
          const store = transaction.objectStore("deviceData");

          store.put({ id: "deviceId", value: hashHex });
        };
      }
    } catch (e) {
      console.warn("Error storing device fingerprint:", e);
    }

    return hashHex;
  };

  const preventCredentialClearing = () => {
    const checkInterval = setInterval(() => {
      const credentials = getCredentials();
      if (!credentials.token && deviceId) {
        const storedFingerprint = sessionStorage.getItem("deviceFingerprint");
        if (storedFingerprint === deviceId) {
          storeCredentials(sessionToken, email, deviceId);
          console.log("Credentials restored - tampering detected");
        }
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  };

  const handleScan = async (result: { rawValue: string }[]) => {
    try {
      const currentTime = Date.now();
      const qrData = result[0].rawValue;

      if (lastScannedQR === qrData && currentTime - lastScanTime < 2000) {
        return;
      }
      if (scanSuccessTime && currentTime - scanSuccessTime < 2000) {
        return;
      }

      setScannerLoading(true);
      setScannerActive(false);
      setScanError(null);

      setLastScannedQR(qrData);
      setLastScanTime(currentTime);

      let qrPayload;

      try {
        qrPayload = JSON.parse(qrData);

        // Check if geolocation is required from QR code
        if (qrPayload.geoRequired) {
          setLocationRequired(true);
          
          // If location is required but not enabled, enable it
          if (!locationEnabled) {
            setLocationEnabled(true);
          }
          
          // If location is required but we don't have current location
          if (!currentLocation) {
            // First check if the browser supports geolocation
            if (!navigator.geolocation) {
              setScanError("Your browser doesn't support geolocation, which is required for attendance.");
              toast.error("Browser doesn't support geolocation");
              setScannerLoading(false);
              setTimeout(() => setScannerActive(true), 1000);
              return;
            }
            
            // Explicitly request location permission rather than calling getLocation()
            // This ensures the permission dialog appears immediately when scanning
            setScanError("Requesting location access...");
            
            try {
              // Use a promise to handle the geolocation request
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                });
              });
              
              // Update location state with the new position
              const newLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              };
              
              setCurrentLocation(newLocation);
              
              // Store the location in session storage
              try {
                sessionStorage.setItem(
                  "studentLocation", 
                  JSON.stringify({
                    ...newLocation,
                    timestamp: Date.now()
                  })
                );
              } catch (e) {
                console.warn("Error storing location:", e);
              }
              
              // Continue with QR processing now that we have location
              await processQrWithLocation(qrPayload, qrData, newLocation);
              return;
              
            } catch (geoError) {
              console.error("Geolocation error:", geoError);
              
              // Handle specific geolocation errors
              let errorMessage = "Failed to get location";
              if (geoError instanceof GeolocationPositionError) {
                switch (geoError.code) {
                  case geoError.PERMISSION_DENIED:
                    errorMessage = "Location permission denied. Please enable location in your browser settings and try again.";
                    break;
                  case geoError.POSITION_UNAVAILABLE:
                    errorMessage = "Location information unavailable. Please try again.";
                    break;
                  case geoError.TIMEOUT:
                    errorMessage = "Location request timed out. Please try again.";
                    break;
                }
              }
              
              setLocationError(errorMessage);
              setScanError(errorMessage);
              toast.error(errorMessage);
              setScannerLoading(false);
              setTimeout(() => setScannerActive(true), 1000);
              return;
            }
          }
        } else {
          setLocationRequired(false);
        }

        // Check if QR code has expired
        const qrTimestamp = qrPayload.timestamp || 0;
        const expiresAt = qrPayload.expiresAt || (qrTimestamp + 10);
        if (currentTime / 1000 > expiresAt) {
          setScanError("QR code has expired. Please scan a fresh code.");
          toast.error("QR code has expired");
          setScannerLoading(false);
          setTimeout(() => setScannerActive(true), 1000);
          return;
        }
        
        // If we have location and it's required, or location is not required,
        // process the QR code
        await processQrWithLocation(
          qrPayload, 
          qrData, 
          qrPayload.geoRequired ? currentLocation : null
        );
        
      } catch  {
        setScanError("Invalid QR code format. Please try scanning again.");
        toast.error("Invalid QR code format");
        setScannerLoading(false);
        setTimeout(() => setScannerActive(true), 1000);
      }
    } catch (error) {
      console.error("QR scan error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.";
      toast.error(errorMessage);
      setScanError(errorMessage);
      setScannerLoading(false);
      setTimeout(() => setScannerActive(true), 1500);
    }
  };

  // Extracted the QR processing logic to a separate function
  const processQrWithLocation = async (
    qrPayload: any, 
    qrData: string, 
    locationData: { latitude: number; longitude: number; accuracy?: number; } | null
  ) => {
    try {
      const timestamp = new Date().getTime();

      // Prepare the request payload
      const payload: any = {
        token: sessionToken,
        qrData,
        email,
        deviceId,
        type: qrPayload.type
      };
      
      // Add location data if available
      if (locationData) {
        payload.studentLocation = locationData;
      }

      const response = await fetch(
        `/api/attendance/student/record?_t=${timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage =
            errorData.message || `HTTP error! Status: ${response.status}`;
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
          lastAction:
            data.lastAction || (qrPayload.type as "check-in" | "check-out"),
        });

        toast.success(
          data.message ||
            `${
              qrPayload.type === "check-in" ? "Check-in" : "Check-out"
            } recorded successfully`
        );

        setScanSuccessTime(Date.now());
      } else {
        toast.error(data.message || "Failed to record attendance");
        setScanError(
          data.message || "Failed to record attendance. Please try again."
        );
      }
    } catch (error) {
      console.error("QR processing error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.";
      throw new Error(errorMessage);
    } finally {
      setScannerLoading(false);
      setTimeout(() => setScannerActive(true), 1500);
    }
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

          // Generate current device fingerprint
          const currentFingerprint = await generateDeviceFingerprint();

          // Verify if current device matches stored fingerprint
          if (currentFingerprint !== credentials.deviceId) {
            throw new Error("Device mismatch detected - security violation");
          }

          const timestamp = new Date().getTime();

          const response = await fetch(
            `/api/attendance/student/verify?_t=${timestamp}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
              body: JSON.stringify({
                token: credentials.token,
                email: credentials.email,
                deviceId: credentials.deviceId,
              }),
            }
          );

         if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
              const errorData = JSON.parse(errorText);
              errorMessage =
                errorData.message || `HTTP error! Status: ${response.status}`;
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
            
            // Try to get stored location from session storage
            try {
              const storedLocation = sessionStorage.getItem("studentLocation");
              if (storedLocation) {
                const locationData = JSON.parse(storedLocation);
                
                // Check if location is recent (less than 5 minutes old)
                if (Date.now() - locationData.timestamp < 5 * 60 * 1000) {
                  setCurrentLocation({
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                    accuracy: locationData.accuracy
                  });
                } else {
                  // Location is too old, get new location
                  getLocation();
                }
              } else {
                // No stored location, get new location
                getLocation();
              }
            } catch (e) {
              console.warn("Error retrieving stored location:", e);
              getLocation();
            }
          } else {
            localStorage.removeItem("studentAttendanceToken");
            localStorage.removeItem("studentAttendanceEmail");
            localStorage.removeItem("studentAttendanceDeviceId");
            localStorage.removeItem("attendance_backup");

            sessionStorage.removeItem("deviceFingerprint");
            sessionStorage.removeItem("attendance_backup");

            document.cookie =
              "studentAttendanceToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie =
              "studentAttendanceEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie =
              "studentAttendanceDeviceId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            setSessionToken("");
            toast.error("Your session has expired. Please login again.");
          }
        } catch (error) {
          console.error("Error verifying session:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Session verification failed";
          toast.error(errorMessage);

          localStorage.removeItem("studentAttendanceToken");
          localStorage.removeItem("studentAttendanceEmail");
          localStorage.removeItem("studentAttendanceDeviceId");
          localStorage.removeItem("attendance_backup");

          sessionStorage.removeItem("deviceFingerprint");
          sessionStorage.removeItem("attendance_backup");

          document.cookie =
            "studentAttendanceToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "studentAttendanceEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "studentAttendanceDeviceId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          setSessionToken("");
        } finally {
          setLoading(false);
        }
      };

      verifySession();
      const cleanupChecker = preventCredentialClearing();
      return cleanupChecker;
    }
  }, []);

  // Location update interval - refresh location every 2 minutes
  useEffect(() => {
    if (sessionToken) {
      // Get initial location
      if (!currentLocation) {
        getLocation();
      }
      
      const locationInterval = setInterval(() => {
        if (locationEnabled) {
          getLocation();
        }
      }, 2 * 60 * 1000); // Every 2 minutes
      
      return () => clearInterval(locationInterval);
    }
  }, [sessionToken, locationEnabled]);

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
        e.key === "studentAttendanceDeviceId" ||
        e.key === "attendance_backup"
      ) {
        if (!e.newValue && sessionToken) {
          // Attempt to restore credentials
          storeCredentials(sessionToken, email, deviceId);
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
              {/* Location Permission Request */}
              {locationRequired && !currentLocation && (
                <div className="w-full mb-4">
                  <Alert className="bg-red-950/30 border-red-500/30">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertTitle className="text-white">Location Permission Required</AlertTitle>
                    <AlertDescription className="text-gray-300">
                      <p className="mb-2">
                        You must enable location services to mark attendance. The system requires verification that you are physically present in the classroom.
                      </p>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={getLocation} 
                        disabled={locationLoading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        {locationLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Requesting Location...
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-2" />
                            Grant Location Permission
                          </>
                        )}
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Location Settings */}
              <div className="w-full mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className={`h-4 w-4 ${locationEnabled ? 'text-green-500' : 'text-gray-500'}`} />
                    <span className="text-sm text-gray-300">Location Services</span>
                  </div>
                  <Switch 
                    checked={locationEnabled}
                    onCheckedChange={(checked) => {
                      setLocationEnabled(checked);
                      if (checked && !currentLocation) {
                        getLocation();
                      }
                    }}
                    disabled={locationRequired} // Can't disable if location is required
                  />
                </div>
                
                {locationEnabled && (
                  <div className="p-2 rounded-md bg-gray-900/50 text-xs">
                    {currentLocation ? (
                      <div className="text-gray-400">
                        <span className="text-green-500">✓</span> Location available 
                        {currentLocation.accuracy && ` (±${Math.round(currentLocation.accuracy)}m)`}
                      </div>
                    ) : locationLoading ? (
                      <div className="flex items-center text-gray-400">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Getting location...
                      </div>
                    ) : locationError ? (
                      <div className="text-red-400">{locationError}</div>
                    ) : (
                      <div className="text-yellow-400">Location not available</div>
                    )}
                  </div>
                )}
              </div>

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
                        setScanError(
                          "Scanner error. Please refresh and try again."
                        );
                        toast.error("Scanner error. Please try again.");
                        setScannerActive(false);
                        setTimeout(() => setScannerActive(true), 1000);
                      }}
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
                  attendance. {locationRequired && "You must be physically present in the classroom."}
                </AlertDescription>
              </Alert>

              <div className="flex w-full space-x-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (locationRequired && !currentLocation) {
                      toast.error("Please enable location services first");
                      getLocation();
                      return;
                    }
                    setScannerActive(false);
                    setScanError(null);
                    setTimeout(() => setScannerActive(true), 500);
                  }}
                  disabled={scannerActive || scannerLoading || (locationRequired && !currentLocation)}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Check In
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    if (locationRequired && !currentLocation) {
                      toast.error("Please enable location services first");
                      getLocation();
                      return;
                    }
                    setScannerActive(false);
                    setScanError(null);
                    setTimeout(() => setScannerActive(true), 500);
                  }}
                  disabled={scannerActive || scannerLoading || (locationRequired && !currentLocation)}
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