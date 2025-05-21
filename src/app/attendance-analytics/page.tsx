"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  Loader2,
  Download,
  FileSpreadsheet,
  School,
  Users,
  BarChart4,
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DateRangePicker,
  DateRangePickerValue,
} from "@/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface CampusStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  partialToday: number;
  attendanceRate: number;
}

interface MonthlyAttendance {
  labels: string[];
  present: number[];
  absent: number[];
  partial: number[];
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
  monthlyAttendance: MonthlyAttendance;
  campusStats?: {
    bbsr: CampusStats;
    pkd: CampusStats;
    vzm: CampusStats;
    [key: string]: CampusStats;
  };
  activeSessions: number;
}

interface StudentAttendanceStats {
  student: Student;
  totalClasses: number;
  presentCount: number;
  partialCount: number;
  absentCount: number;
  attendancePercentage: number;
}

interface DailyAttendance {
  date: string;
  totalStudents: number;
  presentCount: number;
  partialCount: number;
  absentCount: number;
  attendanceRate: number;
  bbsr: {
    totalStudents: number;
    presentCount: number;
    partialCount: number;
    absentCount: number;
    attendanceRate: number;
  };
  pkd: {
    totalStudents: number;
    presentCount: number;
    partialCount: number;
    absentCount: number;
    attendanceRate: number;
  };
  vzm: {
    totalStudents: number;
    presentCount: number;
    partialCount: number;
    absentCount: number;
    attendanceRate: number;
  };
}

export default function AttendanceAnalytics() {
  const router = useRouter();

  // Auth state
  const [adminPassword, setAdminPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Student and attendance data
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [studentStats, setStudentStats] = useState<StudentAttendanceStats[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [campusFilter, setCampusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days by default
    to: new Date(),
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StudentAttendanceStats | null;
    direction: "asc" | "desc";
  }>({
    key: "attendancePercentage",
    direction: "desc",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Campus names mapping
  const campusNames = {
    bbsr: "Bhubaneswar",
    pkd: "Paralakhemundi",
    vzm: "Vizianagaram",
  };

  // Authentication
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

      const storedPassword = adminPassword || sessionStorage.getItem("adminPassword");
      
      if (!storedPassword) {
        toast.error("Admin password not found. Please re-authenticate.");
        setAuthenticated(false);
        return;
      }

      // First fetch standard attendance data
      const response = await fetch(
        `/api/attendance/admin/records?password=${encodeURIComponent(storedPassword)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch attendance data: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAttendanceRecords(data.records || []);
        setStudents(data.students || []);
        setStats(data.stats || null);
        
        // Process student attendance statistics
        processStudentAttendanceStats(data.records, data.students);
        
        // Then fetch analytics data with daily attendance
        const fromDate = dateRange.from?.toISOString().split('T')[0];
        const toDate = dateRange.to?.toISOString().split('T')[0];
        
        const analyticsResponse = await fetch(
          `/api/attendance/analytics?password=${encodeURIComponent(storedPassword)}${fromDate ? `&from=${fromDate}` : ''}${toDate ? `&to=${toDate}` : ''}${campusFilter !== 'all' ? `&campus=${campusFilter}` : ''}`
        );
        
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          
          if (analyticsData.success) {
            // Set daily attendance data
            setDailyAttendance(analyticsData.data.dailyAttendance || []);
          }
        }
      } else {
        toast.error(data.message || "Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Failed to fetch attendance data. Please try again.");
    } finally {
      setDataLoading(false);
    }
  };

  // Process student attendance statistics
  const processStudentAttendanceStats = (records: AttendanceRecord[], students: Student[]) => {
    // Get unique class dates to determine total number of classes
    const uniqueDates = new Set<string>();
    records.forEach(record => {
      const dateStr = new Date(record.date).toISOString().split('T')[0];
      uniqueDates.add(dateStr);
    });
    
    const totalClasses = uniqueDates.size;
    
    // Process attendance for each student
    const studentsStats: StudentAttendanceStats[] = students.map(student => {
      const studentRecords = records.filter(record => 
        record.testUserId === student._id || record.email === student.email
      );
      
      // Group by date to avoid counting multiple records for the same day
      const recordsByDate = new Map<string, AttendanceRecord>();
      studentRecords.forEach(record => {
        const dateStr = new Date(record.date).toISOString().split('T')[0];
        recordsByDate.set(dateStr, record);
      });
      
      // Count attendance records by status
      const presentCount = Array.from(recordsByDate.values()).filter(
        record => record.status === "present"
      ).length;
      
      const partialCount = Array.from(recordsByDate.values()).filter(
        record => record.status === "half-day"
      ).length;
      
      const absentCount = totalClasses - presentCount - partialCount;
      
      // Calculate attendance percentage
      const attendancePercentage = totalClasses > 0
        ? Math.round(((presentCount + partialCount * 0.5) / totalClasses) * 100)
        : 0;
      
      return {
        student,
        totalClasses,
        presentCount,
        partialCount,
        absentCount,
        attendancePercentage
      };
    });
    
    setStudentStats(studentsStats);
  };

  // Handle sorting
  const handleSort = (key: keyof StudentAttendanceStats) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === "asc" 
          ? "desc" 
          : "asc",
    });
  };

  // Apply filters and sorting
  const getFilteredAndSortedStudentStats = () => {
    let filtered = [...studentStats];
    
    // Apply campus filter
    if (campusFilter !== "all") {
      filtered = filtered.filter(
        stats => stats.student.campus?.toLowerCase() === campusFilter.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(stats => {
        const student = stats.student;
        return (
          student.name?.toLowerCase().includes(term) ||
          student.email?.toLowerCase().includes(term) ||
          student.regno?.toLowerCase().includes(term) ||
          student.branch?.toLowerCase().includes(term)
        );
      });
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Export to Excel with all statistics including daily attendance
  const exportToExcel = async () => {
    try {
      toast.loading("Preparing Excel export...");
      
      // Dynamically import xlsx
      const XLSX = await import("xlsx");
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // 1. Overall Summary Worksheet
      const overallData = [
        ["Attendance Analytics Summary", "", "", ""],
        ["Date Range", `${dateRange.from?.toLocaleDateString() || 'All time'} to ${dateRange.to?.toLocaleDateString() || 'Today'}`, "", ""],
        ["", "", "", ""],
        ["Campus", "Total Students", "Present Count", "Attendance Rate %"],
      ];
      
      // Add overall campus data
      if (stats?.campusStats) {
        Object.entries(stats.campusStats).forEach(([key, value]) => {
          if (key === "bbsr" || key === "pkd" || key === "vzm") {
            overallData.push([
              campusNames[key as keyof typeof campusNames],
              String(value.totalStudents),
              String(value.presentToday),
              String(value.attendanceRate)
            ]);
          }
        });
      }
      
      // Add total row
      overallData.push([
        "All Campuses",
        String(stats?.totalStudents || 0),
        String(stats?.presentToday || 0),
        String(getOverallAttendanceRate())
      ]);
      
      const summarySheet = XLSX.utils.aoa_to_sheet(overallData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
      
      // 2. Daily Attendance Worksheet
      if (dailyAttendance.length > 0) {
        const dailyData = [
          ["Date", "Total Students", "Present", "Partial", "Absent", "Rate %", 
           "BBSR Total", "BBSR Present", "BBSR Rate %",
           "PKD Total", "PKD Present", "PKD Rate %", 
           "VZM Total", "VZM Present", "VZM Rate %"]
        ];
        
        dailyAttendance.forEach(day => {
          dailyData.push([
            formatDate(day.date),
            String(day.totalStudents),
            String(day.presentCount),
            String(day.partialCount), 
            String(day.absentCount),
            String(day.attendanceRate),
            String(day.bbsr.totalStudents),
            String(day.bbsr.presentCount),
            String(day.bbsr.attendanceRate),
            String(day.pkd.totalStudents),
            String(day.pkd.presentCount),
            String(day.pkd.attendanceRate),
            String(day.vzm.totalStudents),
            String(day.vzm.presentCount),
            String(day.vzm.attendanceRate)
          ]);
        });
        
        const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);
        XLSX.utils.book_append_sheet(workbook, dailySheet, "Daily Attendance");
      }
      
      // 3. Detailed Student Attendance Worksheet
      const filteredStudents = getFilteredAndSortedStudentStats();
      const studentData = filteredStudents.map(stat => ({
        "Name": stat.student.name,
        "Email": stat.student.email,
        "Registration No": stat.student.regno || "N/A",
        "Campus": stat.student.campus || "N/A",
        "Branch": stat.student.branch || "N/A",
        "Total Classes": stat.totalClasses,
        "Present Days": stat.presentCount,
        "Partial Days": stat.partialCount,
        "Absent Days": stat.absentCount,
        "Attendance Percentage": `${stat.attendancePercentage}%`
      }));
      
      const studentSheet = XLSX.utils.json_to_sheet(studentData);
      XLSX.utils.book_append_sheet(workbook, studentSheet, "Student Attendance");
      
      // 4. Campus-specific worksheets
      ["bbsr", "pkd", "vzm"].forEach(campus => {
        const campusStudents = studentStats.filter(
          stat => stat.student.campus?.toLowerCase() === campus.toLowerCase()
        );
        
        if (campusStudents.length > 0) {
          const campusData = campusStudents.map(stat => ({
            "Name": stat.student.name,
            "Email": stat.student.email,
            "Registration No": stat.student.regno || "N/A",
            "Branch": stat.student.branch || "N/A",
            "Total Classes": stat.totalClasses,
            "Present Days": stat.presentCount,
            "Partial Days": stat.partialCount,
            "Absent Days": stat.absentCount,
            "Attendance Percentage": `${stat.attendancePercentage}%`
          }));
          
          const campusSheet = XLSX.utils.json_to_sheet(campusData);
          XLSX.utils.book_append_sheet(
            workbook, 
            campusSheet, 
            campus.toUpperCase()
          );
        }
      });
      
      // Generate the Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const excelBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      
      // Create download link
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_analytics_${
        campusFilter !== "all" ? campusFilter + "_" : ""
      }${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss();
      toast.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.dismiss();
      toast.error("Failed to export data to Excel");
    }
  };

  // Calculate overall attendance rate
  const getOverallAttendanceRate = () => {
    if (!stats || stats.totalStudents === 0) return 0;
    
    return Math.round(
      ((stats.presentToday + stats.partialToday * 0.5) / stats.totalStudents) * 100
    );
  };

  // Calculate campus-specific attendance rate
  const getCampusAttendanceRate = (campus: string) => {
    if (
      !stats?.campusStats ||
      !stats.campusStats[campus as keyof typeof stats.campusStats] ||
      stats.campusStats[campus as keyof typeof stats.campusStats].totalStudents === 0
    ) {
      return 0;
    }
    
    const campusData = stats.campusStats[campus as keyof typeof stats.campusStats];
    return Math.round(
      ((campusData.presentToday + campusData.partialToday * 0.5) / 
       campusData.totalStudents) * 100
    );
  };

  // Navigation
  const goToAttendanceDashboard = () => {
    router.push("/attendance-admin-dashboard");
  };

  const goToQRGenerator = () => {
    router.push("/attendance-admin");
  };

  const goToManualUpdate = () => {
    router.push("/adminupdateattendancemanually");
  };

  // Sort indicator icon for tables
  const getSortIcon = (key: keyof StudentAttendanceStats) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  // Effect hook to fetch data when authenticated, campus filter or date range changes
  useEffect(() => {
    if (authenticated) {
      fetchAttendanceData();
    }
  }, [authenticated, campusFilter, dateRange]);

  // Check for existing authentication on component mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
    const storedPassword = sessionStorage.getItem("adminPassword");

    if (isAuthenticated === "true" && storedPassword) {
      setAuthenticated(true);
      setAdminPassword(storedPassword);
    }
  }, []);

  // Filtered and sorted student stats for display
  const filteredStudentStats = getFilteredAndSortedStudentStats();
  
  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredStudentStats.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredStudentStats.length / recordsPerPage);

  // Login screen
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
                Enter the admin password to access attendance analytics
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

  // Main content
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
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-b from-neutral-200 to-purple-500 bg-clip-text text-transparent mb-2">
                Attendance Analytics
              </h1>
              <p className="text-gray-400 text-sm">
                Comprehensive attendance statistics across all campuses
              </p>
            </div>
            <div className="flex flex-wrap mt-4 md:mt-0 gap-2">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-400 hover:bg-gray-800"
                onClick={goToAttendanceDashboard}
              >
                <BarChart4 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-400 hover:bg-gray-800"
                onClick={goToQRGenerator}
              >
                <Calendar className="h-4 w-4 mr-2" />
                QR Generator
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-400 hover:bg-gray-800"
                onClick={goToManualUpdate}
              >
                <Users className="h-4 w-4 mr-2" />
                Manual Update
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

          {/* Campus Filter */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Label
                htmlFor="campus-filter"
                className="text-gray-300 min-w-[100px]"
              >
                Campus Filter:
              </Label>
              <Select value={campusFilter} onValueChange={setCampusFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="All Campuses" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="all">All Campuses</SelectItem>
                  <SelectItem value="bbsr">Bhubaneswar (BBSR)</SelectItem>
                  <SelectItem value="pkd">Paralakhemundi (PKD)</SelectItem>
                  <SelectItem value="vzm">Vizianagaram (VZM)</SelectItem>
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
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-950/30"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                  <DropdownMenuItem onClick={exportToExcel}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Campus Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* BBSR Campus Stats */}
            <Card className="bg-black border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <School className="h-5 w-5 text-purple-500 mr-2" />
                  Bhubaneswar Campus
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Total Students:</div>
                      <div className="font-semibold">
                        {stats?.campusStats?.bbsr.totalStudents || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Present:</div>
                      <div className="font-semibold text-green-400">
                        {stats?.campusStats?.bbsr.presentToday || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Partial:</div>
                      <div className="font-semibold text-amber-400">
                        {stats?.campusStats?.bbsr.partialToday || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Absent:</div>
                      <div className="font-semibold text-red-400">
                        {stats?.campusStats?.bbsr.absentToday || 0}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Attendance Rate:</span>
                        <span>{getCampusAttendanceRate("bbsr")}%</span>
                      </div>
                      <Progress
                        value={getCampusAttendanceRate("bbsr")}
                        className="h-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PKD Campus Stats */}
            <Card className="bg-black border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <School className="h-5 w-5 text-purple-500 mr-2" />
                  Paralakhemundi Campus
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Total Students:</div>
                      <div className="font-semibold">
                        {stats?.campusStats?.pkd.totalStudents || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Present:</div>
                      <div className="font-semibold text-green-400">
                        {stats?.campusStats?.pkd.presentToday || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Partial:</div>
                      <div className="font-semibold text-amber-400">
                        {stats?.campusStats?.pkd.partialToday || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Absent:</div>
                      <div className="font-semibold text-red-400">
                        {stats?.campusStats?.pkd.absentToday || 0}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Attendance Rate:</span>
                        <span>{getCampusAttendanceRate("pkd")}%</span>
                      </div>
                      <Progress
                        value={getCampusAttendanceRate("pkd")}
                        className="h-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* VZM Campus Stats */}
            <Card className="bg-black border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <School className="h-5 w-5 text-purple-500 mr-2" />
                  Vizianagaram Campus
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Total Students:</div>
                      <div className="font-semibold">
                        {stats?.campusStats?.vzm.totalStudents || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Present:</div>
                      <div className="font-semibold text-green-400">
                        {stats?.campusStats?.vzm.presentToday || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Partial:</div>
                      <div className="font-semibold text-amber-400">
                        {stats?.campusStats?.vzm.partialToday || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-400">Absent:</div>
                      <div className="font-semibold text-red-400">
                        {stats?.campusStats?.vzm.absentToday || 0}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Attendance Rate:</span>
                        <span>{getCampusAttendanceRate("vzm")}%</span>
                      </div>
                      <Progress
                        value={getCampusAttendanceRate("vzm")}
                        className="h-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Overall Summary */}
          <Card className="bg-black border-purple-500/30 mb-8">
            <CardHeader>
              <CardTitle>
                Overall Attendance Summary
                {campusFilter !== "all" && (
                  <span className="ml-2 text-gray-400 text-base font-normal">
                    ({campusNames[campusFilter as keyof typeof campusNames]} Campus)
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {dateRange.from ? (
                  <>
                    From {dateRange.from.toLocaleDateString()} to{" "}
                    {dateRange.to ? dateRange.to.toLocaleDateString() : "today"}
                  </>
                ) : (
                  "All time attendance statistics"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Visual attendance representation */}
                  <div className="rounded-lg border border-gray-800 p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Attendance Distribution</h3>
                    
                    <div className="flex w-full h-3 bg-gray-900 rounded-full overflow-hidden mb-4">
                      <div
                        className="bg-green-500 h-full"
                        style={{
                          width: `${
                            campusFilter !== "all" && stats?.campusStats
                              ? ((stats.campusStats[
                                  campusFilter as keyof typeof stats.campusStats
                                ]?.presentToday || 0) /
                                  (stats.campusStats[
                                    campusFilter as keyof typeof stats.campusStats
                                  ]?.totalStudents || 1)) *
                                100
                              : (stats?.presentToday || 0) /
                                Math.max(1, stats?.totalStudents || 1) *
                                100
                          }%`,
                        }}
                      ></div>
                      <div
                        className="bg-amber-500 h-full"
                        style={{
                          width: `${
                            campusFilter !== "all" && stats?.campusStats
                              ? ((stats.campusStats[
                                  campusFilter as keyof typeof stats.campusStats
                                ]?.partialToday || 0) /
                                  (stats.campusStats[
                                    campusFilter as keyof typeof stats.campusStats
                                  ]?.totalStudents || 1)) *
                                100
                              : (stats?.partialToday || 0) /
                                Math.max(1, stats?.totalStudents || 1) *
                                100
                          }%`,
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex flex-wrap justify-between text-sm">
                      <div className="flex items-center mr-4 mb-2">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Present: {campusFilter !== "all" && stats?.campusStats
                          ? stats.campusStats[campusFilter as keyof typeof stats.campusStats]?.presentToday || 0
                          : stats?.presentToday || 0}</span>
                      </div>
                      <div className="flex items-center mr-4 mb-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                        <span>Partial: {campusFilter !== "all" && stats?.campusStats
                          ? stats.campusStats[campusFilter as keyof typeof stats.campusStats]?.partialToday || 0
                          : stats?.partialToday || 0}</span>
                      </div>
                      <div className="flex items-center mr-4 mb-2">
                        <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                        <span>Absent: {campusFilter !== "all" && stats?.campusStats
                          ? stats.campusStats[campusFilter as keyof typeof stats.campusStats]?.absentToday || 0
                          : stats?.absentToday || 0}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                        <span>Total: {campusFilter !== "all" && stats?.campusStats
                          ? stats.campusStats[campusFilter as keyof typeof stats.campusStats]?.totalStudents || 0
                          : stats?.totalStudents || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overall attendance rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">Overall Attendance Rate</h3>
                      <Badge variant="outline" className="bg-purple-900/20 text-purple-400 border-purple-500/30">
                        {campusFilter !== "all"
                          ? `${getCampusAttendanceRate(campusFilter)}%`
                          : `${getOverallAttendanceRate()}%`}
                      </Badge>
                    </div>
                    <Progress
                      value={
                        campusFilter !== "all"
                          ? getCampusAttendanceRate(campusFilter)
                          : getOverallAttendanceRate()
                      }
                      className="h-2"
                    />
                  </div>
                  
                  {/* Additional metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      <div className="text-xs text-gray-400">Students</div>
                      <div className="text-xl font-bold">
                        {campusFilter !== "all" && stats?.campusStats
                          ? stats.campusStats[campusFilter as keyof typeof stats.campusStats]?.totalStudents || 0
                          : stats?.totalStudents || 0}
                      </div>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-green-500/30">
                      <div className="text-xs text-gray-400">Present</div>
                      <div className="text-xl font-bold text-green-400">
                        {campusFilter !== "all" && stats?.campusStats
                          ? stats.campusStats[campusFilter as keyof typeof stats.campusStats]?.presentToday || 0
                          : stats?.presentToday || 0}
                      </div>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-amber-500/30">
                      <div className="text-xs text-gray-400">Average Duration</div>
                      <div className="text-xl font-bold text-amber-400">
                        {Math.floor((stats?.avgDuration || 0) / 60)}h {(stats?.avgDuration || 0) % 60}m
                      </div>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-blue-500/30">
                      <div className="text-xs text-gray-400">Sessions</div>
                      <div className="text-xl font-bold text-blue-400">
                        {stats?.activeSessions || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Attendance Table */}
          <Card className="bg-black border-purple-500/30 mb-8">
            <CardHeader>
              <CardTitle>Daily Attendance Report</CardTitle>
              <CardDescription>
                Attendance statistics for each day in the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : dailyAttendance.length === 0 ? (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium text-gray-400">
                    No daily attendance data available
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Try adjusting your date range to see daily attendance information.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-gray-800">
                  <Table>
                    <TableHeader className="bg-gray-900">
                      <TableRow>
                        <TableHead className="text-left">Date</TableHead>
                        <TableHead className="text-center">Total Students</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                        <TableHead className="text-center">Partial</TableHead>
                        <TableHead className="text-center">Absent</TableHead>
                        <TableHead className="text-right">Attendance Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyAttendance.map((day) => (
                        <TableRow
                          key={day.date}
                          className="hover:bg-gray-900/50"
                        >
                          <TableCell className="font-medium">
                            {formatDate(day.date)}
                          </TableCell>
                          <TableCell className="text-center">
                            {day.totalStudents}
                          </TableCell>
                          <TableCell className="text-center text-green-400">
                            {day.presentCount}
                          </TableCell>
                          <TableCell className="text-center text-amber-400">
                            {day.partialCount}
                          </TableCell>
                          <TableCell className="text-center text-red-400">
                            {day.absentCount}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress
                                value={day.attendanceRate}
                                className="h-2 w-[60px]"
                              />
                              <Badge
                                variant="outline"
                                className={`
                                  ${day.attendanceRate >= 75 
                                    ? "bg-green-900/20 text-green-400 border-green-500/30"
                                    : day.attendanceRate >= 50
                                    ? "bg-amber-900/20 text-amber-400 border-amber-500/30"
                                    : "bg-red-900/20 text-red-400 border-red-500/30"}
                                `}
                              >
                                {day.attendanceRate}%
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Attendance Table */}
          <Card className="bg-black border-purple-500/30 mb-8">
            <CardHeader>
              <CardTitle>Student Attendance Report</CardTitle>
              <CardDescription>
                Detailed attendance statistics for all students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and filter controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email or registration number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-950/30"
                  onClick={exportToExcel}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>

              {/* Attendance Records Table */}
              {dataLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : filteredStudentStats.length === 0 ? (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium text-gray-400">
                    No students found
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Try changing your search or filter criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-gray-800">
                  <Table>
                    <TableHeader className="bg-gray-900">
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-800"
                          onClick={() => handleSort("student")}
                        >
                          Student {getSortIcon("student")}
                        </TableHead>
                        <TableHead className="text-left">Campus</TableHead>
                        <TableHead className="text-left">Branch</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-800 text-center"
                          onClick={() => handleSort("totalClasses")}
                        >
                          Total Classes {getSortIcon("totalClasses")}
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-800 text-center"
                          onClick={() => handleSort("presentCount")}
                        >
                          Present {getSortIcon("presentCount")}
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-800 text-center"
                          onClick={() => handleSort("partialCount")}
                        >
                          Partial {getSortIcon("partialCount")}
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-800 text-center"
                          onClick={() => handleSort("absentCount")}
                        >
                          Absent {getSortIcon("absentCount")}
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-800 text-right"
                          onClick={() => handleSort("attendancePercentage")}
                        >
                          Attendance % {getSortIcon("attendancePercentage")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRecords.map((stats) => (
                        <TableRow
                          key={stats.student._id}
                          className="hover:bg-gray-900/50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>
                                  {stats.student.name
                                    ? stats.student.name.charAt(0).toUpperCase()
                                    : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {stats.student.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {stats.student.regno || stats.student.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {stats.student.campus || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {stats.student.branch || "N/A"}
                          </TableCell>
                          <TableCell className="text-center">
                            {stats.totalClasses}
                          </TableCell>
                          <TableCell className="text-center text-green-400">
                            {stats.presentCount}
                          </TableCell>
                          <TableCell className="text-center text-amber-400">
                            {stats.partialCount}
                          </TableCell>
                          <TableCell className="text-center text-red-400">
                            {stats.absentCount}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress
                                value={stats.attendancePercentage}
                                className="h-2 w-[60px]"
                              />
                              <Badge
                                variant="outline"
                                className={`
                                  ${stats.attendancePercentage >= 75 
                                    ? "bg-green-900/20 text-green-400 border-green-500/30"
                                    : stats.attendancePercentage >= 50
                                    ? "bg-amber-900/20 text-amber-400 border-amber-500/30"
                                    : "bg-red-900/20 text-red-400 border-red-500/30"}
                                `}
                              >
                                {stats.attendancePercentage}%
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {!dataLoading && filteredStudentStats.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium">
                      {indexOfFirstRecord + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastRecord, filteredStudentStats.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredStudentStats.length}
                    </span>{" "}
                    results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}