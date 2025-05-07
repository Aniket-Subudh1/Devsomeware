"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  Loader2,
  Users,
  Calendar,
  Clock,
  Download,
  UserCheck,
  UserX,
  BarChart4,
  RefreshCw,
  ChevronDown,
  FileSpreadsheet,
  FileDown,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  DateRangePicker,
  DateRangePickerValue,
} from "@/components/ui/date-range-picker";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Type definitions
interface Student {
  _id: string;
  name: string;
  email: string;
  regno?: string;
  branch?: string;
  campus?: string;
  image?: string;
}

interface AttendanceRecord {
  _id: string;
  email: string;
  testUserId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number;
  status: "present" | "half-day" | "absent";
  lastAction: "check-in" | "check-out";
  student?: Student;
}

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  partialToday: number;
  checkInsToday: number;
  checkOutsToday: number;
  avgDuration: number;
  weeklyAttendance: number[];
  monthlyAttendance: {
    labels: string[];
    present: number[];
    absent: number[];
    partial: number[];
  };
}
export default function AttendanceAdminDashboard() {
  const router = useRouter();

  // Auth state
  const [adminPassword, setAdminPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Dashboard data and filters
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(
    []
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    partialToday: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    avgDuration: 0,
    weeklyAttendance: [0, 0, 0, 0, 0, 0, 0],
    monthlyAttendance: {
      labels: [],
      present: [],
      absent: [],
      partial: [],
    },
  });

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: new Date(),
    to: new Date(),
  });
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">(
    "day"
  );
  const ALL_STUDENTS_VALUE = 'ALL_STUDENTS';
  const [selectedStudent, setSelectedStudent] = useState<string>(ALL_STUDENTS_VALUE);

  // Authenticate admin
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

      const data = await response.json();

      if (data.success) {
        setAuthenticated(true);
        sessionStorage.setItem("adminAuthenticated", "true");
        sessionStorage.setItem("adminPassword", adminPassword);
        toast.success("Authentication successful");
        fetchAttendanceData();
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
  


  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      setDataLoading(true);

      // Make sure adminPassword is available
      if (!adminPassword) {
        const storedPassword = sessionStorage.getItem("adminPassword");
        if (storedPassword) {
          setAdminPassword(storedPassword);
        } else {
          toast.error("Admin password not found. Please re-authenticate.");
          setAuthenticated(false);
          return;
        }
      }

      // Use the password from state or session storage
      const password = adminPassword || sessionStorage.getItem("adminPassword");
      console.log(
        "Using admin password:",
        password ? "Yes (password available)" : "No (no password)"
      );

      // Make API call with the admin password
      const response = await fetch(
        `/api/attendance/admin/records?password=${encodeURIComponent(
          password || ""
        )}`
      );

      if (!response.ok) {
        console.error(
          "API response not OK:",
          response.status,
          response.statusText
        );
        throw new Error(
          `Failed to fetch attendance data: ${response.status} ${response.statusText}`
        );
      }

      
      const data = await response.json();

      if (data.success) {
        console.log("Data successfully fetched");
        // Only set real data from database
        setAttendanceRecords(data.records || []);
        setFilteredRecords(data.records || []);
        setStudents(data.students || []);
        setStats(
          data.stats || {
            totalStudents: data.students?.length || 0,
            presentToday: 0,
            absentToday: 0,
            partialToday: 0,
            checkInsToday: 0,
            checkOutsToday: 0,
            avgDuration: 0,
            weeklyAttendance: [0, 0, 0, 0, 0, 0, 0],
            monthlyAttendance: {
              labels: Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }),
              present: Array(30).fill(0),
              absent: Array(30).fill(0),
              partial: Array(30).fill(0),
            },
          }
        );
      } else {
        console.error("API returned error:", data.message);
        toast.error(data.message || "Failed to fetch attendance data");

        // Set empty arrays and zero values - no mock data
        setAttendanceRecords([]);
        setFilteredRecords([]);
        setStudents([]);
        setStats({
          totalStudents: 0,
          presentToday: 0,
          absentToday: 0,
          partialToday: 0,
          checkInsToday: 0,
          checkOutsToday: 0,
          avgDuration: 0,
          weeklyAttendance: [0, 0, 0, 0, 0, 0, 0],
          monthlyAttendance: {
            labels: Array.from({ length: 30 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (29 - i));
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }),
            present: Array(30).fill(0),
            absent: Array(30).fill(0),
            partial: Array(30).fill(0),
          },
        });
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Failed to fetch attendance data. Please try again.");

      // Set empty arrays and zero values instead of mock data
      setAttendanceRecords([]);
      setFilteredRecords([]);
      setStudents([]);
      setStats({
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        partialToday: 0,
        checkInsToday: 0,
        checkOutsToday: 0,
        avgDuration: 0,
        weeklyAttendance: [0, 0, 0, 0, 0, 0, 0],
        monthlyAttendance: {
          labels: Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }),
          present: Array(30).fill(0),
          absent: Array(30).fill(0),
          partial: Array(30).fill(0),
        },
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Apply filters to records
  useEffect(() => {
    if (attendanceRecords.length === 0) return;

    let filtered = [...attendanceRecords];

   
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= fromDate;
      });
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate <= toDate;
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    // Apply search filter (search by name or email)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((record) => {
        const studentName = record.student?.name?.toLowerCase() || "";
        const studentEmail = record.email.toLowerCase();
        const studentRegNo = record.student?.regno?.toLowerCase() || "";

        return (
          studentName.includes(term) ||
          studentEmail.includes(term) ||
          studentRegNo.includes(term)
        );
      });
    }

    if (selectedStudent && selectedStudent !== ALL_STUDENTS_VALUE) {
      filtered = filtered.filter(
        (record) =>
          record.testUserId === selectedStudent ||
          record.email === selectedStudent
      );
    }

    setFilteredRecords(filtered);
  }, [attendanceRecords, searchTerm, statusFilter, dateRange, selectedStudent]);

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Create CSV content
      let csvContent =
        "Date,Name,Email,Check In,Check Out,Duration (mins),Status\n";

      filteredRecords.forEach((record) => {
        const row = [
          new Date(record.date).toLocaleDateString(),
          record.student?.name || "Unknown",
          record.email,
          record.checkInTime
            ? new Date(record.checkInTime).toLocaleTimeString()
            : "N/A",
          record.checkOutTime
            ? new Date(record.checkOutTime).toLocaleTimeString()
            : "N/A",
          record.duration || "N/A",
          record.status,
        ];

        csvContent += row.join(",") + "\n";
      });

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `attendance_report_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV file downloaded successfully");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast.error("Failed to export data");
    }
  };

  // Export data to Excel (XLSX)
  const exportToExcel = () => {
    toast.info(
      "Exporting to Excel... This would trigger the Excel export functionality"
    );
  };

  
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
    const storedPassword = sessionStorage.getItem("adminPassword");

    if (isAuthenticated === "true" && storedPassword) {
      setAuthenticated(true);
      setAdminPassword(storedPassword);
      fetchAttendanceData();
    }
  }, []);

  // Helper to format time from ISO string
  const formatTime = (timeString?: string) => {
    if (!timeString) return "Not recorded";

    try {
      return new Date(timeString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid time";
    }
  };

  // Calculate attendance percentage
  const getAttendancePercentage = () => {
    if (stats.totalStudents === 0) return 0;
    return Math.round(
      ((stats.presentToday + stats.partialToday * 0.5) / stats.totalStudents) *
        100
    );
  };

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
                Enter the admin password to access the attendance dashboard
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent mb-4 md:mb-0">
              Attendance Dashboard
            </h1>
            <div className="flex space-x-2">
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => router.push("/attendance-admin")}
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Generator
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-400 hover:bg-gray-800"
                onClick={fetchAttendanceData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </header>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-black border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-2xl font-bold text-white">
                    {stats.totalStudents}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Present Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold text-white">
                    {stats.presentToday}
                  </span>
                  <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                    {stats.totalStudents > 0
                      ? Math.round(
                          (stats.presentToday / stats.totalStudents) * 100
                        )
                      : 0}
                    %
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Absent Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <UserX className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-2xl font-bold text-white">
                    {stats.absentToday}
                  </span>
                  <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30">
                    {stats.totalStudents > 0
                      ? Math.round(
                          (stats.absentToday / stats.totalStudents) * 100
                        )
                      : 0}
                    %
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Avg. Attendance Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold text-white">
                    {Math.round(stats.avgDuration / 60)} hr{" "}
                    {Math.round(stats.avgDuration % 60)} min
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Attendance Progress */}
          <Card className="bg-black border-purple-500/30 mb-8">
            <CardHeader>
              <CardTitle>Today&apos;s Attendance Progress</CardTitle>
              <CardDescription>
                {getAttendancePercentage()}% of students have checked in today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                    <span>Present: {stats.presentToday}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-amber-500 mr-1"></div>
                    <span>Partial: {stats.partialToday}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                    <span>Absent: {stats.absentToday}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>Total: {stats.totalStudents}</span>
                  </div>
                </div>

                <div className="flex w-full h-3 bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full"
                    style={{
                      width: `${
                        (stats.presentToday / stats.totalStudents) * 100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-amber-500 h-full"
                    style={{
                      width: `${
                        (stats.partialToday / stats.totalStudents) * 100
                      }%`,
                    }}
                  ></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex justify-between items-center border border-gray-800 rounded-lg p-3">
                    <div>
                      <div className="text-sm text-gray-400">
                        Check-ins Today
                      </div>
                      <div className="text-2xl font-bold">
                        {stats.checkInsToday}
                      </div>
                    </div>
                    <UserCheck className="h-8 w-8 text-purple-500" />
                  </div>

                  <div className="flex justify-between items-center border border-gray-800 rounded-lg p-3">
                    <div>
                      <div className="text-sm text-gray-400">
                        Check-outs Today
                      </div>
                      <div className="text-2xl font-bold">
                        {stats.checkOutsToday}
                      </div>
                    </div>
                    <UserX className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Data Tabs */}
          <Tabs defaultValue="records" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="records">Attendance Records</TabsTrigger>
              <TabsTrigger value="students">Student Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Records Tab */}
            <TabsContent value="records" className="space-y-4">
              <Card className="bg-black border-purple-500/30">
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                  <CardDescription>
                    View and filter attendance records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by name, email or ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    </div>

                    <Select
    value={selectedStudent}
    onValueChange={setSelectedStudent}
  >
    <SelectTrigger className="w-full md:w-[300px] bg-gray-900 border-gray-700 text-white">
      <SelectValue placeholder="Select Student" />
    </SelectTrigger>
    <SelectContent className="bg-gray-900 border-gray-700 text-white max-h-[300px]">
      <SelectItem value={ALL_STUDENTS_VALUE}>All Students</SelectItem>
      {students.map((student) => (
        <SelectItem key={student._id} value={student._id}>
          {student.name} ({student.regno || student.email})
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-gray-900 border-gray-700 text-white"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Date Range
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
                        <DateRangePicker
                          value={dateRange}
                          onChange={setDateRange}
                        />
                      </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-gray-900 border-gray-700 text-white"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                        <DropdownMenuItem onClick={exportToCSV}>
                          <FileDown className="h-4 w-4 mr-2" />
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportToExcel}>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Export as Excel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Records Table */}
                  {dataLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                  ) : filteredRecords.length === 0 ? (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-gray-400">
                        No records found
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Try changing your filters or search criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border border-gray-800">
                      <Table>
                        <TableHeader className="bg-gray-900">
                          <TableRow>
                            <TableHead className="text-left">Student</TableHead>
                            <TableHead className="text-left">Date</TableHead>
                            <TableHead className="text-left">
                              Check In
                            </TableHead>
                            <TableHead className="text-left">
                              Check Out
                            </TableHead>
                            <TableHead className="text-left">
                              Duration
                            </TableHead>
                            <TableHead className="text-left">Status</TableHead>
                            <TableHead className="text-left">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRecords.slice(0, 10).map((record) => (
                            <TableRow
                              key={record._id}
                              className="hover:bg-gray-900/50"
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarFallback>
                                      {record.student?.name
                                        ? record.student.name.charAt(0)
                                        : record.email.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {record.student?.name || "Unknown"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {record.student?.regno || record.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(record.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {formatTime(record.checkInTime)}
                              </TableCell>
                              <TableCell>
                                {record.checkOutTime
                                  ? formatTime(record.checkOutTime)
                                  : "Not checked out"}
                              </TableCell>
                              <TableCell>
                                {record.duration
                                  ? `${Math.floor(record.duration / 60)}h ${
                                      record.duration % 60
                                    }m`
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    record.status === "present"
                                      ? "bg-green-900/20 text-green-400 border-green-500/30"
                                      : record.status === "half-day"
                                      ? "bg-amber-900/20 text-amber-400 border-amber-500/30"
                                      : "bg-red-900/20 text-red-400 border-red-500/30"
                                  }
                                >
                                  {record.status === "present"
                                    ? "Present"
                                    : record.status === "half-day"
                                    ? "Partial"
                                    : "Absent"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-gray-900 border-gray-700 text-white">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Attendance Details
                                      </DialogTitle>
                                      <DialogDescription>
                                        Full details about this attendance
                                        record
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="flex items-center space-x-4">
                                        <Avatar className="h-12 w-12">
                                          <AvatarFallback>
                                            {record.student?.name
                                              ? record.student.name.charAt(0)
                                              : record.email.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <h4 className="text-lg font-semibold">
                                            {record.student?.name || "Unknown"}
                                          </h4>
                                          <p className="text-sm text-gray-400">
                                            {record.email}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">
                                            Registration No:
                                          </span>
                                          <span>
                                            {record.student?.regno ||
                                              "Not available"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">
                                            Branch:
                                          </span>
                                          <span>
                                            {record.student?.branch ||
                                              "Not available"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">
                                            Campus:
                                          </span>
                                          <span>
                                            {record.student?.campus ||
                                              "Not available"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">
                                            Date:
                                          </span>
                                          <span>
                                            {new Date(
                                              record.date
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">
                                            Check In:
                                          </span>
                                          <span>
                                            {formatTime(record.checkInTime)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">
                                            Check Out:
                                          </span>
                                          <span>
                                            {record.checkOutTime
                                              ? formatTime(record.checkOutTime)
                                              : "Not checked out"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">
                                            Duration:
                                          </span>
                                          <span>
                                            {record.duration
                                              ? `${Math.floor(
                                                  record.duration / 60
                                                )}h ${record.duration % 60}m`
                                              : "N/A"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">
                                            Status:
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className={
                                              record.status === "present"
                                                ? "bg-green-900/20 text-green-400 border-green-500/30"
                                                : record.status === "half-day"
                                                ? "bg-amber-900/20 text-amber-400 border-amber-500/30"
                                                : "bg-red-900/20 text-red-400 border-red-500/30"
                                            }
                                          >
                                            {record.status === "present"
                                              ? "Present"
                                              : record.status === "half-day"
                                              ? "Partial"
                                              : "Absent"}
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">
                                            Last Action:
                                          </span>
                                          <span>
                                            {record.lastAction === "check-in"
                                              ? "Check In"
                                              : "Check Out"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination */}
                  {!dataLoading && filteredRecords.length > 0 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        Showing <span className="font-medium">1</span> to{" "}
                        <span className="font-medium">
                          {Math.min(10, filteredRecords.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredRecords.length}
                        </span>{" "}
                        results
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled>
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={filteredRecords.length <= 10}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-4">
              <Card className="bg-black border-purple-500/30">
                <CardHeader>
                  <CardTitle>Student Reports</CardTitle>
                  <CardDescription>
                    View detailed attendance reports for specific students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Select
                      value={selectedStudent}
                      onValueChange={setSelectedStudent}
                    >
                      <SelectTrigger className="w-full md:w-[300px] bg-gray-900 border-gray-700 text-white">
                        <SelectValue placeholder="Select Student" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white max-h-[300px]">
                        <SelectItem value="">All Students</SelectItem>
                        {students.map((student) => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.name} ({student.regno || student.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={currentView}
                      onValueChange={(value) =>
                        setCurrentView(value as "day" | "week" | "month")
                      }
                    >
                      <SelectTrigger className="w-[150px] bg-gray-900 border-gray-700 text-white">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedStudent ? (
                    <div className="space-y-6">
                      {/* Student Profile */}
                      {students.find((s) => s._id === selectedStudent) && (
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-4 bg-gray-900/20 rounded-lg border border-gray-800">
                          <Avatar className="h-20 w-20">
                            <AvatarFallback>
                              {students
                                .find((s) => s._id === selectedStudent)
                                ?.name.charAt(0) || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-xl font-semibold">
                              {students.find((s) => s._id === selectedStudent)
                                ?.name || "Selected Student"}
                            </h3>
                            <p className="text-gray-400">
                              {students.find((s) => s._id === selectedStudent)
                                ?.regno || ""}
                            </p>
                            <p className="text-gray-400">
                              {students.find((s) => s._id === selectedStudent)
                                ?.email || ""}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary">
                                {students.find((s) => s._id === selectedStudent)
                                  ?.branch || "No Branch"}
                              </Badge>
                              <Badge variant="secondary">
                                {students.find((s) => s._id === selectedStudent)
                                  ?.campus || "No Campus"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col md:items-end">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="text-center p-3 bg-gray-900/30 rounded-lg">
                                <div className="text-sm text-gray-400">
                                  Present Days
                                </div>
                                <div className="text-2xl font-bold text-green-400">
                                  {
                                    filteredRecords.filter(
                                      (r) =>
                                        r.testUserId === selectedStudent &&
                                        r.status === "present"
                                    ).length
                                  }
                                </div>
                              </div>
                              <div className="text-center p-3 bg-gray-900/30 rounded-lg">
                                <div className="text-sm text-gray-400">
                                  Partial Days
                                </div>
                                <div className="text-2xl font-bold text-amber-400">
                                  {
                                    filteredRecords.filter(
                                      (r) =>
                                        r.testUserId === selectedStudent &&
                                        r.status === "half-day"
                                    ).length
                                  }
                                </div>
                              </div>
                              <div className="text-center p-3 bg-gray-900/30 rounded-lg">
                                <div className="text-sm text-gray-400">
                                  Absent Days
                                </div>
                                <div className="text-2xl font-bold text-red-400">
                                  {
                                    filteredRecords.filter(
                                      (r) =>
                                        r.testUserId === selectedStudent &&
                                        r.status === "absent"
                                    ).length
                                  }
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 w-full md:w-auto">
                              <div className="text-sm text-gray-400 mb-1">
                                Attendance Rate
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={(() => {
                                    const records = filteredRecords.filter(
                                      (r) => r.testUserId === selectedStudent
                                    );
                                    if (records.length === 0) return 0;

                                    const present = records.filter(
                                      (r) => r.status === "present"
                                    ).length;
                                    const partial = records.filter(
                                      (r) => r.status === "half-day"
                                    ).length;

                                    return (
                                      ((present + partial * 0.5) /
                                        records.length) *
                                      100
                                    );
                                  })()}
                                  className="h-2 w-full md:w-[200px]"
                                />
                                <span className="text-sm font-medium">
                                  {(() => {
                                    const records = filteredRecords.filter(
                                      (r) => r.testUserId === selectedStudent
                                    );
                                    if (records.length === 0) return "0%";

                                    const present = records.filter(
                                      (r) => r.status === "present"
                                    ).length;
                                    const partial = records.filter(
                                      (r) => r.status === "half-day"
                                    ).length;

                                    return (
                                      Math.round(
                                        ((present + partial * 0.5) /
                                          records.length) *
                                          100
                                      ) + "%"
                                    );
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Student Records Table */}
                      <div className="overflow-x-auto rounded-md border border-gray-800">
                        <Table>
                          <TableHeader className="bg-gray-900">
                            <TableRow>
                              <TableHead className="text-left">Date</TableHead>
                              <TableHead className="text-left">
                                Check In
                              </TableHead>
                              <TableHead className="text-left">
                                Check Out
                              </TableHead>
                              <TableHead className="text-left">
                                Duration
                              </TableHead>
                              <TableHead className="text-left">
                                Status
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredRecords
                              .filter(
                                (record) =>
                                  record.testUserId === selectedStudent
                              )
                              .slice(0, 10)
                              .map((record) => (
                                <TableRow
                                  key={record._id}
                                  className="hover:bg-gray-900/50"
                                >
                                  <TableCell>
                                    {new Date(record.date).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    {formatTime(record.checkInTime)}
                                  </TableCell>
                                  <TableCell>
                                    {record.checkOutTime
                                      ? formatTime(record.checkOutTime)
                                      : "Not checked out"}
                                  </TableCell>
                                  <TableCell>
                                    {record.duration
                                      ? `${Math.floor(record.duration / 60)}h ${
                                          record.duration % 60
                                        }m`
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={
                                        record.status === "present"
                                          ? "bg-green-900/20 text-green-400 border-green-500/30"
                                          : record.status === "half-day"
                                          ? "bg-amber-900/20 text-amber-400 border-amber-500/30"
                                          : "bg-red-900/20 text-red-400 border-red-500/30"
                                      }
                                    >
                                      {record.status === "present"
                                        ? "Present"
                                        : record.status === "half-day"
                                        ? "Partial"
                                        : "Absent"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert className="bg-gray-900/40 border-purple-500/30">
                        <AlertTriangle className="h-4 w-4 text-purple-500" />
                        <AlertTitle className="text-white">
                          No student selected
                        </AlertTitle>
                        <AlertDescription className="text-gray-400">
                          Please select a student from the dropdown to view
                          their detailed attendance report.
                        </AlertDescription>
                      </Alert>

                      {/* Summary Cards for All Students */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <Card className="bg-black border-purple-500/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">
                              Average Attendance Rate
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-col gap-2">
                              <div className="text-2xl font-bold text-white">
                                {(() => {
                                  const totalRecords = attendanceRecords.length;
                                  if (totalRecords === 0) return "0%";

                                  const presentCount = attendanceRecords.filter(
                                    (r) => r.status === "present"
                                  ).length;
                                  const partialCount = attendanceRecords.filter(
                                    (r) => r.status === "half-day"
                                  ).length;

                                  return (
                                    Math.round(
                                      ((presentCount + partialCount * 0.5) /
                                        totalRecords) *
                                        100
                                    ) + "%"
                                  );
                                })()}
                              </div>
                              <Progress
                                value={(() => {
                                  const totalRecords = attendanceRecords.length;
                                  if (totalRecords === 0) return 0;

                                  const presentCount = attendanceRecords.filter(
                                    (r) => r.status === "present"
                                  ).length;
                                  const partialCount = attendanceRecords.filter(
                                    (r) => r.status === "half-day"
                                  ).length;

                                  return (
                                    ((presentCount + partialCount * 0.5) /
                                      totalRecords) *
                                    100
                                  );
                                })()}
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-black border-purple-500/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">
                              Students with 100% Attendance
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-white">
                              {(() => {
                                const uniqueStudentIds = [
                                  ...new Set(
                                    attendanceRecords.map((r) => r.testUserId)
                                  ),
                                ];

                                let perfectAttendanceCount = 0;

                                uniqueStudentIds.forEach((id) => {
                                  const studentRecords =
                                    attendanceRecords.filter(
                                      (r) => r.testUserId === id
                                    );
                                  const allPresent = studentRecords.every(
                                    (r) => r.status === "present"
                                  );

                                  if (allPresent && studentRecords.length > 0) {
                                    perfectAttendanceCount++;
                                  }
                                });

                                return perfectAttendanceCount;
                              })()}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-black border-purple-500/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">
                              Average Duration
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-white">
                              {(() => {
                                const recordsWithDuration =
                                  attendanceRecords.filter((r) => r.duration);

                                if (recordsWithDuration.length === 0)
                                  return "0h 0m";

                                const totalDuration =
                                  recordsWithDuration.reduce(
                                    (sum, record) =>
                                      sum + (record.duration || 0),
                                    0
                                  );
                                const avgDuration =
                                  totalDuration / recordsWithDuration.length;

                                return `${Math.floor(
                                  avgDuration / 60
                                )}h ${Math.round(avgDuration % 60)}m`;
                              })()}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Students List */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          All Students
                        </h3>
                        <div className="overflow-x-auto rounded-md border border-gray-800">
                          <Table>
                            <TableHeader className="bg-gray-900">
                              <TableRow>
                                <TableHead className="text-left">
                                  Student
                                </TableHead>
                                <TableHead className="text-left">
                                  Campus
                                </TableHead>
                                <TableHead className="text-left">
                                  Branch
                                </TableHead>
                                <TableHead className="text-left">
                                  Present
                                </TableHead>
                                <TableHead className="text-left">
                                  Partial
                                </TableHead>
                                <TableHead className="text-left">
                                  Absent
                                </TableHead>
                                <TableHead className="text-left">
                                  Rate
                                </TableHead>
                                <TableHead className="text-left">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {students.slice(0, 10).map((student) => {
                                const studentRecords = attendanceRecords.filter(
                                  (r) => r.testUserId === student._id
                                );
                                const presentCount = studentRecords.filter(
                                  (r) => r.status === "present"
                                ).length;
                                const partialCount = studentRecords.filter(
                                  (r) => r.status === "half-day"
                                ).length;
                                const absentCount = studentRecords.filter(
                                  (r) => r.status === "absent"
                                ).length;

                                const totalCount =
                                  presentCount + partialCount + absentCount;
                                const attendanceRate =
                                  totalCount > 0
                                    ? Math.round(
                                        ((presentCount + partialCount * 0.5) /
                                          totalCount) *
                                          100
                                      )
                                    : 0;

                                return (
                                  <TableRow
                                    key={student._id}
                                    className="hover:bg-gray-900/50"
                                  >
                                    <TableCell className="font-medium">
                                      <div className="flex items-center">
                                        <Avatar className="h-8 w-8 mr-2">
                                          <AvatarFallback>
                                            {student.name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium">
                                            {student.name}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {student.regno || student.email}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {student.campus || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                      {student.branch || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-green-400">
                                      {presentCount}
                                    </TableCell>
                                    <TableCell className="text-amber-400">
                                      {partialCount}
                                    </TableCell>
                                    <TableCell className="text-red-400">
                                      {absentCount}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Progress
                                          value={attendanceRate}
                                          className="h-2 w-[60px]"
                                        />
                                        <span className="text-sm">
                                          {attendanceRate}%
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          setSelectedStudent(student._id)
                                        }
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card className="bg-black border-purple-500/30">
                <CardHeader>
                  <CardTitle>Attendance Analytics</CardTitle>
                  <CardDescription>
                    Visualize attendance patterns and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Period Selector */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Attendance Overview
                      </h3>
                      <Select
                        value={currentView}
                        onValueChange={(value) =>
                          setCurrentView(value as "day" | "week" | "month")
                        }
                      >
                        <SelectTrigger className="w-[150px] bg-gray-900 border-gray-700 text-white">
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700 text-white">
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Daily Chart Placeholder */}
                    <div className="p-4 border border-gray-800 rounded-lg h-[300px] flex flex-col justify-center items-center bg-gray-900/20">
                      <BarChart4 className="h-16 w-16 text-purple-500/20 mb-4" />
                      <p className="text-center text-gray-400">
                        The attendance chart would be displayed here using a
                        charting library like Recharts.
                        <br />
                        We can visualize attendance trends over time.
                      </p>
                    </div>

                    {/* Attendance Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Attendance Breakdown
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-black border-green-500/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">
                              Present
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold text-green-400">
                                {(() => {
                                  const presentCount = filteredRecords.filter(
                                    (r) => r.status === "present"
                                  ).length;
                                  return presentCount;
                                })()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {(() => {
                                  const totalRecords = filteredRecords.length;
                                  if (totalRecords === 0) return "0%";

                                  const presentCount = filteredRecords.filter(
                                    (r) => r.status === "present"
                                  ).length;
                                  return (
                                    Math.round(
                                      (presentCount / totalRecords) * 100
                                    ) + "%"
                                  );
                                })()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-black border-amber-500/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">
                              Partial
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold text-amber-400">
                                {(() => {
                                  const partialCount = filteredRecords.filter(
                                    (r) => r.status === "half-day"
                                  ).length;
                                  return partialCount;
                                })()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {(() => {
                                  const totalRecords = filteredRecords.length;
                                  if (totalRecords === 0) return "0%";

                                  const partialCount = filteredRecords.filter(
                                    (r) => r.status === "half-day"
                                  ).length;
                                  return (
                                    Math.round(
                                      (partialCount / totalRecords) * 100
                                    ) + "%"
                                  );
                                })()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-black border-red-500/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">
                              Absent
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold text-red-400">
                                {(() => {
                                  const absentCount = filteredRecords.filter(
                                    (r) => r.status === "absent"
                                  ).length;
                                  return absentCount;
                                })()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {(() => {
                                  const totalRecords = filteredRecords.length;
                                  if (totalRecords === 0) return "0%";

                                  const absentCount = filteredRecords.filter(
                                    (r) => r.status === "absent"
                                  ).length;
                                  return (
                                    Math.round(
                                      (absentCount / totalRecords) * 100
                                    ) + "%"
                                  );
                                })()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Attendance Trends */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Weekly Trends
                      </h3>
                      <div className="p-4 border border-gray-800 rounded-lg h-[300px] flex flex-col justify-center items-center bg-gray-900/20">
                        <BarChart4 className="h-16 w-16 text-purple-500/20 mb-4" />
                        <p className="text-center text-gray-400">
                          Weekly attendance trends would be visualized here.
                          <br />
                          This chart would show attendance patterns throughout
                          the week.
                        </p>
                      </div>
                    </div>

                    {/* Check-in/Check-out Distribution */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Check-in Time Distribution
                      </h3>
                      <div className="p-4 border border-gray-800 rounded-lg h-[300px] flex flex-col justify-center items-center bg-gray-900/20">
                        <BarChart4 className="h-16 w-16 text-purple-500/20 mb-4" />
                        <p className="text-center text-gray-400">
                          This chart would show the distribution of check-in and
                          check-out times.
                          <br />
                          It helps identify popular times and potential
                          bottlenecks.
                        </p>
                      </div>
                    </div>

                    {/* Export Analytics Button */}
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="bg-gray-900 border-gray-700 text-white"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Analytics
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                          <DropdownMenuItem onClick={exportToCSV}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Export as CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportToExcel}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export as Excel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}

// Define QrCode component (missing in the code)
const QrCode = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="8" height="8" x="3" y="3" rx="1" />
      <path d="M7 7v.01" />
      <rect width="8" height="8" x="13" y="3" rx="1" />
      <path d="M17 7v.01" />
      <rect width="8" height="8" x="3" y="13" rx="1" />
      <path d="M7 17v.01" />
      <path d="M13 13h4" />
      <path d="M13 17h4" />
      <path d="M17 17v.01" />
      <path d="M17 13v.01" />
    </svg>
  );
};
