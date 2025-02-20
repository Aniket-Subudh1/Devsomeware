"use client"

import { useState, useEffect, useRef } from "react"
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser"
import { Loader2Icon, CameraIcon, CameraOffIcon } from "lucide-react"

interface QrScannerProps {
  onScan: (data: string | null) => void
  isActive?: boolean
}

export function QrScanner({ onScan, isActive = true }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [camerasList, setCamerasList] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null)
  const scannerControlsRef = useRef<IScannerControls | null>(null)
  const lastErrorRef = useRef<number>(0)
  const errorCountRef = useRef<number>(0)

  const initializeScanner = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setCamerasList(videoDevices)

      const backCamera = videoDevices.find((device) =>
        device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear")
      )
      const defaultCamera = backCamera?.deviceId || (videoDevices.length > 0 ? videoDevices[0].deviceId : null)
      setSelectedCamera(defaultCamera)

      if (!defaultCamera) {
        setError("No camera detected")
        return
      }

      if (videoRef.current && isActive) {
        await startScanning(defaultCamera)
      }
    } catch (err) {
      console.error("Camera access error:", err)
      setError("Failed to access camera. Ensure camera permissions are granted.")
    }
  }

  useEffect(() => {
    if (isActive) {
      initializeScanner()
    }
    return () => {
      stopScanning()
    }
  }, [isActive])

  // Reset error count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      errorCountRef.current = 0;
    }, 5000); // Reset every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const startScanning = async (deviceId: string) => {
    if (!videoRef.current) return

    stopScanning() // Ensure any previous scanner instance is stopped

    try {
      const hints = new Map();
      hints.set(2, true); // Enable PURE_BARCODE mode
      hints.set(3, true); // Enable TRY_HARDER mode
      
      codeReaderRef.current = new BrowserQRCodeReader(hints)
      // Removed timeBetweenScansMillis as it does not exist on BrowserQRCodeReader

      // Configure video constraints for better performance
      

      scannerControlsRef.current = await codeReaderRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            console.log("QR Code detected:", result.getText())
            errorCountRef.current = 0;
            onScan(result.getText())
          }

          if (error) {
            const now = Date.now();
            
            // Only log errors if they're not too frequent
            if (now - lastErrorRef.current > 1000) {
              errorCountRef.current++;
              lastErrorRef.current = now;

              // If we get too many errors in a short period, try reinitializing
              if (errorCountRef.current > 10) {
                console.log("Too many errors, reinitializing scanner...");
                errorCountRef.current = 0;
                stopScanning();
                setTimeout(() => {
                  initializeScanner();
                }, 1000);
                return;
              }

              // Only log non-NotFound errors and don't flood the console
              if (error.name !== "NotFoundException") {
                console.log("Scanning error:", error.name);
              }
            }
          }
        }
      )

      setIsScanning(true)
      setError(null)
    } catch (err) {
      console.error("Failed to start scanning:", err)
      setError("Error initializing QR scanner. Please try again.")
    }
  }

  const stopScanning = () => {
    if (scannerControlsRef.current) {
      try {
        scannerControlsRef.current.stop()
        scannerControlsRef.current = null
      } catch (err) {
        console.error("Error stopping scanner:", err)
      }
    }
    if (codeReaderRef.current) {
      codeReaderRef.current = null
    }
    setIsScanning(false)
  }

  const switchCamera = async (deviceId: string) => {
    setSelectedCamera(deviceId)
    stopScanning()
    // Add small delay before starting new camera
    await new Promise(resolve => setTimeout(resolve, 300));
    startScanning(deviceId)
  }

  const handleRetry = async () => {
    setError(null)
    errorCountRef.current = 0
    // Add small delay before retrying
    await new Promise(resolve => setTimeout(resolve, 300));
    initializeScanner()
  }

  if (!isActive) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {error ? (
        <div className="p-6 text-center">
          <CameraOffIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2">Camera Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-3 p-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-black">
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2Icon className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
            <video ref={videoRef} className="h-full w-full object-cover" />
            <div className="absolute inset-0 border-2 border-white/50 border-dashed m-8 rounded-md pointer-events-none" />
          </div>

          {camerasList.length > 1 && (
            <div className="flex justify-between items-center p-2">
              <span className="text-sm text-muted-foreground">Switch Camera:</span>
              <div className="flex gap-2">
                {camerasList.map((camera, index) => (
                  <button
                    key={camera.deviceId}
                    className={`p-2 rounded-full ${selectedCamera === camera.deviceId ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                    onClick={() => switchCamera(camera.deviceId)}
                    title={camera.label || `Camera ${index + 1}`}
                  >
                    <CameraIcon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}