"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Download,
  UserCheck,
  UserX,
  CalendarDays,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import * as XLSX from "xlsx";

export default function AttendanceAdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scanAction, setScanAction] = useState<"check-in" | "check-out">(
    "check-in"
  );
  interface ScannedData {
    name: string;
    email: string;
    checkInTime?: string;
    checkOutTime?: string;
    duration?: number;
  }

  interface AttendanceRecord {
    testUserId: {
      name: string;
      regno: string;
      branch: string;
    };
    email: string;
    date: string;
    checkInTime?: string;
    checkOutTime?: string;
    duration?: number;
    status: string;
  }

  interface StudentStats {
    name: string;
    regno?: string;
    branch?: string;
    presentDays: number;
    halfDays: number;
    absentDays: number;
    attendancePercentage: string;
    totalHours: number;
  }

  interface DashboardStats {
    success: boolean;
    overall: {
      totalStudents: number;
      studentsWithAttendance: number;
      avgAttendance: number;
      attendanceRanges: {
        excellent: number;
        good: number;
        average: number;
        poor: number;
      };
    };
    dateRange: {
      start: string;
      end: string;
    };
    studentStats: StudentStats[];
  }

  const [lastScannedData, setLastScannedData] = useState<ScannedData | null>(
    null
  );

  // Attendance data
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [timeframe, setTimeframe] = useState("month");
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Handle admin login
  const handleLogin = () => {
    if (!adminPassword) {
      toast.error("Please enter the admin password");
      return;
    }

    setLoading(true);
    // Verify password against the one in .env through the API
    fetchAttendanceRecords();
  };

  // Handle QR code scan
  const handleScan = async (result: { rawValue: string }[]) => {
    try {
      setScannerLoading(true);
      setScannerActive(false);

      const qrData = result[0].rawValue;

      // Send scan to API to mark attendance
      const response = await fetch("/api/attendance/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrData,
          adminPassword,
          action: scanAction,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLastScannedData(data.data);
        toast.success(
          `${
            scanAction === "check-in" ? "Check-in" : "Check-out"
          } recorded for ${data.data.name}`
        );
        // Refresh attendance records
        fetchAttendanceRecords();
      } else {
        toast.error(data.message || "Failed to process QR code");
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setScannerLoading(false);
      // Re-enable scanner after a short delay
      setTimeout(() => setScannerActive(true), 1500);
    }
  };

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);

      // Format dates for API
      const startDate = dateRange.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined;
      const endDate = dateRange.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : undefined;

      const response = await fetch(
        `/api/attendance/check?password=${adminPassword}${
          startDate ? `&startDate=${startDate}` : ""
        }${endDate ? `&endDate=${endDate}` : ""}`
      );

      const data = await response.json();

      if (data.success) {
        setAttendanceRecords(data.data);
        setFilteredRecords(data.data);
        setIsAuthenticated(true);
      } else {
        toast.error(data.message || "Authentication failed");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      toast.error("Failed to fetch attendance records");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setDashboardLoading(true);

      const response = await fetch(
        `/api/attendance/dashboard?password=${adminPassword}&period=${timeframe}`
      );

      const data = await response.json();

      if (data.success) {
        setDashboardStats(data);
      } else {
        toast.error(data.message || "Failed to fetch dashboard statistics");
      }
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
      toast.error("Failed to fetch dashboard statistics");
    } finally {
      setDashboardLoading(false);
    }
  };

  // Filter records based on search term
  useEffect(() => {
    if (!attendanceRecords.length) return;

    const filtered = attendanceRecords.filter(
      (record) =>
        record.testUserId.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.testUserId.regno.toString().includes(searchTerm)
    );

    setFilteredRecords(filtered);
  }, [searchTerm, attendanceRecords]);

  // Fetch dashboard stats when authenticated or timeframe changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, timeframe]);

  // Export attendance data to Excel
  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredRecords.map((record) => ({
        Name: record.testUserId.name,
        "Reg No": record.testUserId.regno,
        Email: record.email,
        Branch: record.testUserId.branch,
        Date: format(new Date(record.date), "yyyy-MM-dd"),
        "Check In": record.checkInTime
          ? format(new Date(record.checkInTime), "HH:mm:ss")
          : "N/A",
        "Check Out": record.checkOutTime
          ? format(new Date(record.checkOutTime), "HH:mm:ss")
          : "N/A",
        Duration: record.duration ? `${record.duration} mins` : "N/A",
        Status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");

      // Generate file name with current date
      const fileName = `attendance_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);

      toast.success("Attendance data exported successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export attendance data");
    }
  };

  if (!isAuthenticated) {
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
                Attendance Admin
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Enter the admin password to access attendance management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <Button
                  onClick={handleLogin}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <Toaster richColors position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent mb-4 md:mb-0">
              Attendance Management
            </h1>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-400 hover:bg-gray-800"
                onClick={fetchAttendanceRecords}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                className="border-green-700 text-green-500 hover:bg-green-900/30"
                onClick={exportToExcel}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </header>

          <Tabs defaultValue="scanner" className="space-y-6">
            <TabsList className="grid grid-cols-3 max-w-md mx-auto bg-gray-900">
              <TabsTrigger value="scanner">Scanner</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>

            {/* Scanner Tab */}
            <TabsContent value="scanner" className="space-y-6">
              <Card className="bg-black border-purple-500/30">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent">
                    QR Code Scanner
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Scan QR codes to record student attendance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex space-x-2">
                        <Button
                          variant={
                            scanAction === "check-in" ? "default" : "outline"
                          }
                          className={
                            scanAction === "check-in"
                              ? "bg-green-600 hover:bg-green-700"
                              : "border-gray-700 text-gray-400 hover:bg-gray-800"
                          }
                          onClick={() => setScanAction("check-in")}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Check In
                        </Button>
                        <Button
                          variant={
                            scanAction === "check-out" ? "default" : "outline"
                          }
                          className={
                            scanAction === "check-out"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "border-gray-700 text-gray-400 hover:bg-gray-800"
                          }
                          onClick={() => setScanAction("check-out")}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Check Out
                        </Button>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg border border-gray-700 aspect-video max-w-md mx-auto">
                      {scannerActive ? (
                        <Scanner
                          onScan={(result) => handleScan(result)}
                          onError={(error) => console.error(error)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <Button
                            onClick={() => setScannerActive(true)}
                            disabled={scannerLoading}
                          >
                            {scannerLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>Start Scanner</>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {lastScannedData && (
                      <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-900/50">
                        <h3 className="text-lg font-medium text-white mb-2">
                          Last Scan Result
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-400">Name:</div>
                          <div className="text-white font-medium">
                            {lastScannedData.name}
                          </div>

                          <div className="text-gray-400">Email:</div>
                          <div className="text-white font-medium">
                            {lastScannedData.email}
                          </div>

                          <div className="text-gray-400">Time:</div>
                          <div className="text-white font-medium">
                            {lastScannedData.checkOutTime
                              ? format(
                                  new Date(lastScannedData.checkOutTime),
                                  "HH:mm:ss"
                                )
                              : lastScannedData.checkInTime
                              ? format(
                                  new Date(lastScannedData.checkInTime),
                                  "HH:mm:ss"
                                )
                              : "N/A"}
                          </div>

                          {lastScannedData.duration && (
                            <>
                              <div className="text-gray-400">Duration:</div>
                              <div className="text-white font-medium">
                                {lastScannedData.duration} minutes
                              </div>
                            </>
                          )}

                          <div className="text-gray-400">Status:</div>
                          <div className="text-white font-medium">
                            <Badge
                              variant="outline"
                              className="bg-green-900/20 text-green-400 border-green-500/30"
                            >
                              {scanAction === "check-in"
                                ? "Checked In"
                                : "Checked Out"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Records Tab */}
            <TabsContent value="records" className="space-y-6">
              <Card className="bg-black border-purple-500/30">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent">
                    Attendance Records
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    View and filter attendance records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder="Search by name, email, or reg. no"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 bg-gray-900 border-gray-700 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto justify-start text-left font-normal border-gray-700 text-gray-400 hover:bg-gray-800"
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {dateRange.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(dateRange.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 bg-gray-900 border-gray-700"
                            align="end"
                          >
                            <Calendar
                              initialFocus
                              mode="range"
                              selected={dateRange}
                              onSelect={(range) => {
                                if (range) {
                                  setDateRange({
                                    from: range.from,
                                    to: range.to,
                                  });
                                  if (
                                    range.from &&
                                    (range.to || !dateRange.to)
                                  ) {
                                    fetchAttendanceRecords();
                                  }
                                } else {
                                  setDateRange({
                                    from: undefined,
                                    to: undefined,
                                  });
                                }
                              }}
                              numberOfMonths={2}
                              className="bg-gray-900 text-white"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="rounded-md border border-gray-700">
                      <div className="relative overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-900/50 hover:bg-gray-900">
                              <TableHead className="text-gray-400">
                                Name
                              </TableHead>
                              <TableHead className="text-gray-400">
                                Reg. No.
                              </TableHead>
                              <TableHead className="text-gray-400">
                                Date
                              </TableHead>
                              <TableHead className="text-gray-400">
                                Check In
                              </TableHead>
                              <TableHead className="text-gray-400">
                                Check Out
                              </TableHead>
                              <TableHead className="text-gray-400">
                                Duration
                              </TableHead>
                              <TableHead className="text-gray-400">
                                Status
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredRecords.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="h-24 text-center text-gray-500"
                                >
                                  No attendance records found
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredRecords.map((record, index) => (
                                <TableRow
                                  key={index}
                                  className="hover:bg-gray-900/50 border-t border-gray-800"
                                >
                                  <TableCell className="font-medium text-white">
                                    {record.testUserId?.name || "Unknown"}
                                  </TableCell>
                                  <TableCell className="text-gray-300">
                                    {record.testUserId?.regno || "N/A"}
                                  </TableCell>
                                  <TableCell className="text-gray-300">
                                    {format(
                                      new Date(record.date),
                                      "yyyy-MM-dd"
                                    )}
                                  </TableCell>
                                  <TableCell className="text-gray-300">
                                    {record.checkInTime
                                      ? format(
                                          new Date(record.checkInTime),
                                          "HH:mm:ss"
                                        )
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell className="text-gray-300">
                                    {record.checkOutTime
                                      ? format(
                                          new Date(record.checkOutTime),
                                          "HH:mm:ss"
                                        )
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell className="text-gray-300">
                                    {record.duration
                                      ? `${record.duration} mins`
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={
                                        record.status === "present"
                                          ? "bg-green-900/20 text-green-400 border-green-500/30"
                                          : record.status === "half-day"
                                          ? "bg-yellow-900/20 text-yellow-400 border-yellow-500/30"
                                          : "bg-red-900/20 text-red-400 border-red-500/30"
                                      }
                                    >
                                      {record.status.charAt(0).toUpperCase() +
                                        record.status.slice(1)}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <Card className="bg-black border-purple-500/30">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <CardTitle className="bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent">
                        Attendance Dashboard
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Overview and statistics of attendance
                      </CardDescription>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger className="w-[180px] border-gray-700 bg-gray-900 text-white">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700 text-white">
                          <SelectItem value="day">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="total">All Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                  ) : !dashboardStats ? (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      No dashboard data available
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Overview Statistics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gray-900/50 border-gray-800">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-400">
                                Total Students
                              </div>
                              <div className="text-3xl font-bold text-white mt-2">
                                {dashboardStats.overall.totalStudents}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-900/50 border-gray-800">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-400">
                                Active Students
                              </div>
                              <div className="text-3xl font-bold text-white mt-2">
                                {dashboardStats.overall.studentsWithAttendance}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {(
                                  (dashboardStats.overall
                                    .studentsWithAttendance /
                                    dashboardStats.overall.totalStudents) *
                                  100
                                ).toFixed(1)}
                                %
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-900/50 border-gray-800">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-400">
                                Avg. Attendance
                              </div>
                              <div className="text-3xl font-bold text-white mt-2">
                                {dashboardStats.overall.avgAttendance}%
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-900/50 border-gray-800">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-400">
                                Date Range
                              </div>
                              <div className="text-lg font-medium text-white mt-2">
                                {dashboardStats.dateRange.start} to{" "}
                                {dashboardStats.dateRange.end}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Attendance Breakdown */}
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">
                          Attendance Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Card className="bg-green-900/10 border-green-900/30">
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <div className="text-sm font-medium text-green-400">
                                  Excellent (90%+)
                                </div>
                                <div className="text-3xl font-bold text-white mt-2">
                                  {
                                    dashboardStats.overall.attendanceRanges
                                      .excellent
                                  }
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {(
                                    (dashboardStats.overall.attendanceRanges
                                      .excellent /
                                      dashboardStats.overall.totalStudents) *
                                    100
                                  ).toFixed(1)}
                                  % of students
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-blue-900/10 border-blue-900/30">
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <div className="text-sm font-medium text-blue-400">
                                  Good (75-89%)
                                </div>
                                <div className="text-3xl font-bold text-white mt-2">
                                  {dashboardStats.overall.attendanceRanges.good}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {(
                                    (dashboardStats.overall.attendanceRanges
                                      .good /
                                      dashboardStats.overall.totalStudents) *
                                    100
                                  ).toFixed(1)}
                                  % of students
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-yellow-900/10 border-yellow-900/30">
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <div className="text-sm font-medium text-yellow-400">
                                  Average (60-74%)
                                </div>
                                <div className="text-3xl font-bold text-white mt-2">
                                  {
                                    dashboardStats.overall.attendanceRanges
                                      .average
                                  }
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {(
                                    (dashboardStats.overall.attendanceRanges
                                      .average /
                                      dashboardStats.overall.totalStudents) *
                                    100
                                  ).toFixed(1)}
                                  % of students
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-red-900/10 border-red-900/30">
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <div className="text-sm font-medium text-red-400">
                                  Poor (&lt; 60%)
                                </div>
                                <div className="text-3xl font-bold text-white mt-2">
                                  {dashboardStats.overall.attendanceRanges.poor}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {(
                                    (dashboardStats.overall.attendanceRanges
                                      .poor /
                                      dashboardStats.overall.totalStudents) *
                                    100
                                  ).toFixed(1)}
                                  % of students
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Student Attendance Table */}
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">
                          Student Attendance Ranking
                        </h3>
                        <div className="rounded-md border border-gray-700">
                          <div className="relative overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-900/50 hover:bg-gray-900">
                                  <TableHead className="text-gray-400">
                                    Name
                                  </TableHead>
                                  <TableHead className="text-gray-400">
                                    Reg. No.
                                  </TableHead>
                                  <TableHead className="text-gray-400">
                                    Branch
                                  </TableHead>
                                  <TableHead className="text-gray-400">
                                    Present Days
                                  </TableHead>
                                  <TableHead className="text-gray-400">
                                    Half Days
                                  </TableHead>
                                  <TableHead className="text-gray-400">
                                    Absent Days
                                  </TableHead>
                                  <TableHead className="text-gray-400">
                                    Attendance %
                                  </TableHead>
                                  <TableHead className="text-gray-400">
                                    Total Hours
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {dashboardStats.studentStats.length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={8}
                                      className="h-24 text-center text-gray-500"
                                    >
                                      No student data found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  dashboardStats.studentStats.map(
                                    (
                                      student: {
                                        name: string;
                                        regno?: string;
                                        branch?: string;
                                        presentDays: number;
                                        halfDays: number;
                                        absentDays: number;
                                        attendancePercentage: string;
                                        totalHours: number;
                                      },
                                      index: number
                                    ) => (
                                      <TableRow
                                        key={index}
                                        className="hover:bg-gray-900/50 border-t border-gray-800"
                                      >
                                        <TableCell className="font-medium text-white">
                                          {student.name}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                          {student.regno || "N/A"}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                          {student.branch || "N/A"}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                          {student.presentDays}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                          {student.halfDays}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                          {student.absentDays}
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant="outline"
                                            className={
                                              parseFloat(
                                                student.attendancePercentage
                                              ) >= 90
                                                ? "bg-green-900/20 text-green-400 border-green-500/30"
                                                : parseFloat(
                                                    student.attendancePercentage
                                                  ) >= 75
                                                ? "bg-blue-900/20 text-blue-400 border-blue-500/30"
                                                : parseFloat(
                                                    student.attendancePercentage
                                                  ) >= 60
                                                ? "bg-yellow-900/20 text-yellow-400 border-yellow-500/30"
                                                : "bg-red-900/20 text-red-400 border-red-500/30"
                                            }
                                          >
                                            {student.attendancePercentage}%
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                          {student.totalHours}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
