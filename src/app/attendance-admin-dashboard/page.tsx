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
  Check,
  Download,
  UserCheck,
  UserX,
  BarChart4,
  Hand,
  RefreshCw,
  ChevronDown,
  FileSpreadsheet,
  FileDown,
  Eye,
  AlertTriangle,
  School,
  UserMinus,
  Building,
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

interface CampusStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  partialToday: number;
  attendanceRate: number;
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
  campusStats?: {
    bbsr: CampusStats;
    pkd: CampusStats;
    vzm: CampusStats;
    [key: string]: CampusStats;
  };
  activeSessions: number;
}

// List of absent students (those who haven't checked in today)
interface AbsentStudent {
  _id: string;
  name: string;
  email: string;
  regno?: string;
  branch?: string;
  campus?: string;
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
  const [absentStudents, setAbsentStudents] = useState<AbsentStudent[]>([]);
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
    campusStats: {
      bbsr: {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        partialToday: 0,
        attendanceRate: 0,
      },
      pkd: {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        partialToday: 0,
        attendanceRate: 0,
      },
      vzm: {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        partialToday: 0,
        attendanceRate: 0,
      },
    },
    activeSessions: 0,
  });

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campusFilter, setCampusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: new Date(),
    to: new Date(),
  });
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">(
    "day"
  );
  const ALL_STUDENTS_VALUE = "ALL_STUDENTS";
  const [selectedStudent, setSelectedStudent] =
    useState<string>(ALL_STUDENTS_VALUE);

  // Page state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Campus names mapping
  const campusNames = {
    bbsr: "Bhubaneswar",
    pkd: "Paralakhemundi",
    vzm: "Vizianagaram",
  };

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

        // Set records and students from API
        setAttendanceRecords(data.records || []);
        setFilteredRecords(data.records || []);
        setStudents(data.students || []);

        // Extract statistics
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
            campusStats: {
              bbsr: {
                totalStudents: 0,
                presentToday: 0,
                absentToday: 0,
                partialToday: 0,
                attendanceRate: 0,
              },
              pkd: {
                totalStudents: 0,
                presentToday: 0,
                absentToday: 0,
                partialToday: 0,
                attendanceRate: 0,
              },
              vzm: {
                totalStudents: 0,
                presentToday: 0,
                absentToday: 0,
                partialToday: 0,
                attendanceRate: 0,
              },
            },
            activeSessions: 0,
          }
        );

        // Calculate absent students (students who haven't checked in today)
        calculateAbsentStudents(data.records, data.students);

        // Update campus stats
        calculateCampusStats(data.records, data.students);
      } else {
        console.error("API returned error:", data.message);
        toast.error(data.message || "Failed to fetch attendance data");

        // Set empty arrays and zero values
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
          campusStats: {
            bbsr: {
              totalStudents: 0,
              presentToday: 0,
              absentToday: 0,
              partialToday: 0,
              attendanceRate: 0,
            },
            pkd: {
              totalStudents: 0,
              presentToday: 0,
              absentToday: 0,
              partialToday: 0,
              attendanceRate: 0,
            },
            vzm: {
              totalStudents: 0,
              presentToday: 0,
              absentToday: 0,
              partialToday: 0,
              attendanceRate: 0,
            },
          },
          activeSessions: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Failed to fetch attendance data. Please try again.");

      // Set empty arrays and zero values
      setAttendanceRecords([]);
      setFilteredRecords([]);
      setStudents([]);
      setAbsentStudents([]);
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
        campusStats: {
          bbsr: {
            totalStudents: 0,
            presentToday: 0,
            absentToday: 0,
            partialToday: 0,
            attendanceRate: 0,
          },
          pkd: {
            totalStudents: 0,
            presentToday: 0,
            absentToday: 0,
            partialToday: 0,
            attendanceRate: 0,
          },
          vzm: {
            totalStudents: 0,
            presentToday: 0,
            absentToday: 0,
            partialToday: 0,
            attendanceRate: 0,
          },
        },
        activeSessions: 0,
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Calculate campus-specific stats
  const calculateCampusStats = (
    records: AttendanceRecord[],
    allStudents: Student[]
  ) => {
    // Initialize campus stats
    const campusStats = {
      bbsr: {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        partialToday: 0,
        attendanceRate: 0,
      },
      pkd: {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        partialToday: 0,
        attendanceRate: 0,
      },
      vzm: {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        partialToday: 0,
        attendanceRate: 0,
      },
    };

    // Count students by campus
    allStudents.forEach((student) => {
      const campus = student.campus?.toLowerCase() || "unknown";
      if (campusStats[campus as keyof typeof campusStats]) {
        campusStats[campus as keyof typeof campusStats].totalStudents += 1;
      }
    });

    // Filter today's records
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRecords = records.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= today && recordDate < tomorrow;
    });

    // Count present and partial students by campus
    const processedStudentIds = new Set<string>();

    todayRecords.forEach((record) => {
      const student = allStudents.find((s) => s._id === record.testUserId);
      if (student) {
        const campus = student.campus?.toLowerCase() || "unknown";
        if (campusStats[campus as keyof typeof campusStats]) {
          // Only count each student once for today
          if (!processedStudentIds.has(record.testUserId)) {
            processedStudentIds.add(record.testUserId);

            // Count based on status
            if (record.status === "present") {
              campusStats[campus as keyof typeof campusStats].presentToday += 1;
            } else if (record.status === "half-day") {
              campusStats[campus as keyof typeof campusStats].partialToday += 1;
            }
          }
        }
      }
    });

    // Calculate absent students and attendance rates
    Object.keys(campusStats).forEach((campus) => {
      const key = campus as keyof typeof campusStats;
      campusStats[key].absentToday = Math.max(
        0,
        campusStats[key].totalStudents -
          (campusStats[key].presentToday + campusStats[key].partialToday)
      );

      campusStats[key].attendanceRate =
        campusStats[key].totalStudents > 0
          ? Math.round(
              ((campusStats[key].presentToday +
                campusStats[key].partialToday * 0.5) /
                campusStats[key].totalStudents) *
                100
            )
          : 0;
    });

    // Update stats with campus-specific data
    setStats((prevStats) => ({
      ...prevStats,
      campusStats,
    }));
  };

  // Calculate list of absent students
  const calculateAbsentStudents = (
    records: AttendanceRecord[],
    allStudents: Student[]
  ) => {
    // Filter today's records
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRecords = records.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= today && recordDate < tomorrow;
    });

    // Get IDs of students who checked in today
    const presentStudentIds = new Set<string>();
    todayRecords.forEach((record) => {
      if (record.checkInTime) {
        presentStudentIds.add(record.testUserId);
      }
    });

    // Find students who haven't checked in
    const absent = allStudents.filter(
      (student) => !presentStudentIds.has(student._id)
    );
    setAbsentStudents(absent);
  };

  // Apply filters to records
  useEffect(() => {
    if (attendanceRecords.length === 0) return;

    let filtered = [...attendanceRecords];

    // Apply date range filter
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

    // Apply campus filter
    if (campusFilter !== "all") {
      filtered = filtered.filter((record) => {
        const student = record.student;
        return student?.campus?.toLowerCase() === campusFilter.toLowerCase();
      });
    }

    // Apply search filter (search by name, email, or registration number)
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

    // Apply student filter
    if (selectedStudent && selectedStudent !== ALL_STUDENTS_VALUE) {
      filtered = filtered.filter(
        (record) =>
          record.testUserId === selectedStudent ||
          record.email === selectedStudent
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    attendanceRecords,
    searchTerm,
    statusFilter,
    campusFilter,
    dateRange,
    selectedStudent,
  ]);

  // Export to CSV
  const exportToCSV = () => {
    if (filteredRecords.length === 0 && absentStudents.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Create CSV header
      let csvContent =
        "Campus,Date,Name,Email,Registration Number,Check In,Check Out,Duration (mins),Status\n";

      // Add present/partial students (from filteredRecords)
      filteredRecords.forEach((record) => {
        const campus = record.student?.campus || "Unknown";
        const recordDate = new Date(record.date).toLocaleDateString();
        const studentName = record.student?.name || "Unknown";
        const email = record.email;
        const regNo = record.student?.regno || "N/A";
        const checkIn = record.checkInTime
          ? new Date(record.checkInTime).toLocaleTimeString()
          : "N/A";
        const checkOut = record.checkOutTime
          ? new Date(record.checkOutTime).toLocaleTimeString()
          : "N/A";
        const duration = record.duration || "N/A";
        const status = record.status;

        // Escape any commas in the fields by wrapping in quotes
        const escapedRow = [
          `"${campus}"`,
          `"${recordDate}"`,
          `"${studentName}"`,
          `"${email}"`,
          `"${regNo}"`,
          `"${checkIn}"`,
          `"${checkOut}"`,
          `"${duration}"`,
          `"${status}"`
        ];

        csvContent += escapedRow.join(",") + "\n";
      });

      // Add absent students with appropriate indicators if they're being displayed
      if (absentStudents.length > 0) {
        absentStudents.forEach((student) => {
          if (
            campusFilter === "all" ||
            student.campus?.toLowerCase() === campusFilter
          ) {
            const escapedRow = [
              `"${student.campus || "Unknown"}"`,
              `"${new Date().toLocaleDateString()}"`,
              `"${student.name || "Unknown"}"`,
              `"${student.email}"`,
              `"${student.regno || "N/A"}"`,
              `"N/A"`, // No check-in
              `"N/A"`, // No check-out
              `"0"`, // Duration
              `"absent"`
            ];

            csvContent += escapedRow.join(",") + "\n";
          }
        });
      }

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `attendance_report_${campusFilter !== "all" ? campusFilter + "_" : ""}${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV file downloaded successfully");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast.error("Failed to export data to CSV");
    }
  };

  // Export data to Excel (XLSX)
  const exportToExcel = async () => {
    if (filteredRecords.length === 0 && absentStudents.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Show loading toast
      toast.loading("Preparing Excel export...");
      
      // Dynamically import xlsx
      const XLSX = await import('xlsx');
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create a worksheet for each campus
      const campuses = ["bbsr", "pkd", "vzm"];
      let allRecordsWorksheet = null;
      
      // First, create the "All Campuses" worksheet
      if (campusFilter === "all") {
        const allData: {
          "Campus": string;
          "Date": string;
          "Name": string;
          "Email": string;
          "Registration Number": string;
          "Check In": string;
          "Check Out": string;
          "Duration (mins)": string;
          "Status": string;
        }[] = [];
        
        // Add records for all campuses
        filteredRecords.forEach((record) => {
          allData.push({
            "Campus": record.student?.campus || "Unknown",
            "Date": new Date(record.date).toLocaleDateString(),
            "Name": record.student?.name || "Unknown",
            "Email": record.email,
            "Registration Number": record.student?.regno || "N/A",
            "Check In": record.checkInTime
              ? new Date(record.checkInTime).toLocaleTimeString()
              : "N/A",
            "Check Out": record.checkOutTime
              ? new Date(record.checkOutTime).toLocaleTimeString()
              : "N/A",
            "Duration (mins)": record.duration?.toString() || "0",
            "Status": record.status
          });
        });
        
        // Add absent students
        absentStudents.forEach((student) => {
          allData.push({
            "Campus": student.campus || "Unknown",
            "Date": new Date().toLocaleDateString(),
            "Name": student.name || "Unknown",
            "Email": student.email,
            "Registration Number": student.regno || "N/A",
            "Check In": "N/A",
            "Check Out": "N/A",
            "Duration (mins)": "0",
            "Status": "absent"
          });
        });
        
        // Create worksheet with all data
        allRecordsWorksheet = XLSX.utils.json_to_sheet(allData);
        XLSX.utils.book_append_sheet(workbook, allRecordsWorksheet, "All Campuses");
      }
      
      // Create separate worksheet for each campus if we're looking at all campuses
      if (campusFilter === "all") {
        campuses.forEach((campus) => {
          const campusData: {
            "Date": string;
            "Name": string;
            "Email": string;
            "Registration Number": string;
            "Check In": string;
            "Check Out": string;
            "Duration (mins)": string;
            "Status": string;
          }[] = [];
          
          // Add records for this campus
          filteredRecords
            .filter((record) => record.student?.campus?.toLowerCase() === campus)
            .forEach((record) => {
              campusData.push({
                "Date": new Date(record.date).toLocaleDateString(),
                "Name": record.student?.name || "Unknown",
                "Email": record.email,
                "Registration Number": record.student?.regno || "N/A",
                "Check In": record.checkInTime
                  ? new Date(record.checkInTime).toLocaleTimeString()
                  : "N/A",
                "Check Out": record.checkOutTime
                  ? new Date(record.checkOutTime).toLocaleTimeString()
                  : "N/A",
                "Duration (mins)": (record.duration?.toString() || "0"),
                "Status": record.status
              });
            });
          
          // Add absent students for this campus
          absentStudents
            .filter((student) => student.campus?.toLowerCase() === campus)
            .forEach((student) => {
              campusData.push({
                "Date": new Date().toLocaleDateString(),
                "Name": student.name || "Unknown",
                "Email": student.email,
                "Registration Number": student.regno || "N/A",
                "Check In": "N/A",
                "Check Out": "N/A",
                "Duration (mins)": "0",
                "Status": "absent"
              });
            });
          
          // Only create worksheet if there's data
          if (campusData.length > 0) {
            const campusWorksheet = XLSX.utils.json_to_sheet(campusData);
            XLSX.utils.book_append_sheet(
              workbook, 
              campusWorksheet, 
              campus.toUpperCase()
            );
          }
        });
      } else {
        // If a specific campus is selected, just create one worksheet
        const campusData: {
          "Date": string;
          "Name": string;
          "Email": string;
          "Registration Number": string;
          "Check In": string;
          "Check Out": string;
          "Duration (mins)": string;
          "Status": string;
        }[] = [];
        // Add records for the selected campus
        filteredRecords.forEach((record) => {
          campusData.push({
            "Date": new Date(record.date).toLocaleDateString(),
            "Name": record.student?.name || "Unknown",
            "Email": record.email,
            "Registration Number": record.student?.regno || "N/A",
            "Check In": record.checkInTime
              ? new Date(record.checkInTime).toLocaleTimeString()
              : "N/A",
            "Check Out": record.checkOutTime
              ? new Date(record.checkOutTime).toLocaleTimeString()
              : "N/A",
            "Duration (mins)": (record.duration?.toString() || "0"),
            "Status": record.status
          });
        });
        
        // Add absent students for the selected campus
        absentStudents
          .filter((student) => 
            student.campus?.toLowerCase() === campusFilter.toLowerCase()
          )
          .forEach((student) => {
            campusData.push({
              "Date": new Date().toLocaleDateString(),
              "Name": student.name || "Unknown",
              "Email": student.email,"Registration Number": student.regno || "N/A",
              "Check In": "N/A",
              "Check Out": "N/A",
              "Duration (mins)": "0",
              "Status": "absent"
            });
          });
        
        // Create worksheet with campus data
        const campusWorksheet = XLSX.utils.json_to_sheet(campusData);
        XLSX.utils.book_append_sheet(
          workbook, 
          campusWorksheet, 
          campusFilter.toUpperCase()
        );
      }
      
      // Add a statistics worksheet
      const statsData = [];
      
      // Overall stats
      statsData.push({
        "Type": "Overall Statistics",
        "Value": "",
        "": ""
      });
      
      statsData.push({
        "Type": "Total Students",
        "Value": stats.totalStudents,
        "": ""
      });
      
      statsData.push({
        "Type": "Present Today",
        "Value": stats.presentToday,
        "": ""
      });
      
      statsData.push({
        "Type": "Partial Attendance",
        "Value": stats.partialToday,
        "": ""
      });
      
      statsData.push({
        "Type": "Absent Today",
        "Value": stats.absentToday,
        "": ""
      });
      
      statsData.push({
        "Type": "Average Duration",
        "Value": `${Math.floor(stats.avgDuration / 60)}h ${stats.avgDuration % 60}m`,
        "": ""
      });
      
      statsData.push({
        "Type": "Attendance Rate",
        "Value": `${getAttendancePercentage(campusFilter)}%`,
        "": ""
      });
      
      // Add a space before campus stats
      statsData.push({
        "Type": "",
        "Value": "",
        "": ""
      });
      
      // Campus-specific stats
      statsData.push({
        "Type": "Campus Statistics",
        "Value": "",
        "": ""
      });
      
      if (stats.campusStats) {
        campuses.forEach((campus) => {
          const campusData = stats.campusStats?.[campus as keyof typeof stats.campusStats];
          
          if (campusData) {
            statsData.push({
              "Type": `${campus.toUpperCase()} - Total Students`,
              "Value": campusData.totalStudents,
              "": ""
            });
            
            statsData.push({
              "Type": `${campus.toUpperCase()} - Present`,
              "Value": campusData.presentToday,
              "": ""
            });
            
            statsData.push({
              "Type": `${campus.toUpperCase()} - Partial`,
              "Value": campusData.partialToday,
              "": ""
            });
            
            statsData.push({
              "Type": `${campus.toUpperCase()} - Absent`,
              "Value": campusData.absentToday,
              "": ""
            });
            
            statsData.push({
              "Type": `${campus.toUpperCase()} - Attendance Rate`,
              "Value": `${campusData.attendanceRate}%`,
              "": ""
            });
            
            // Add a space between campuses
            statsData.push({
              "Type": "",
              "Value": "",
              "": ""
            });
          }
        });
      }
      
      // Create and add the stats worksheet
      const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsWorksheet, "Statistics");
      
      // Generate the Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Download the file
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_report_${campusFilter !== "all" ? campusFilter + "_" : ""}${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Dismiss loading toast and show success
      toast.dismiss();
      toast.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.dismiss();
      toast.error("Failed to export data to Excel");
    }
  };

  // Update attendance status for students who checked in but didn't check out
  const markPendingCheckoutsAsPartial = async () => {
    try {
      setLoading(true);

      // Use the password from state or session storage
      const password = adminPassword || sessionStorage.getItem("adminPassword");

      const response = await fetch("/api/attendance/admin/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword: password,
          // Update records with check-in but no check-out to half-day
          updateType: "pending-checkouts",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `${data.updatedCount || 0} records marked as partial attendance`
        );
        // Refresh data
        fetchAttendanceData();
      } else {
        toast.error(data.message || "Failed to update attendance status");
      }
    } catch (error) {
      console.error("Error updating attendance status:", error);
      toast.error("Failed to update attendance status");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (updateType: string) => {
    try {
      setLoading(true);

      const password = adminPassword || sessionStorage.getItem("adminPassword");

      const response = await fetch("/api/attendance/admin/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword: password,
          updateType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${data.updatedCount || 0} records updated successfully`);
        // Refresh data to show updated status
        fetchAttendanceData();
      } else {
        toast.error(data.message || "Failed to update attendance status");
      }
    } catch (error) {
      console.error("Error updating attendance status:", error);
      toast.error("Failed to update attendance status");
    } finally {
      setLoading(false);
    }
  };
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Set up authentication check on component mount
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
  const getAttendancePercentage = (campusKey?: string) => {
    if (campusKey && campusKey !== "all") {
      const campusData =
        stats.campusStats?.[campusKey as keyof typeof stats.campusStats];
      if (!campusData || campusData.totalStudents === 0) return 0;

      return Math.round(
        ((campusData.presentToday + campusData.partialToday * 0.5) /
          campusData.totalStudents) *
          100
      );
    }

    // Overall percentage
    if (stats.totalStudents === 0) return 0;
    return Math.round(
      ((stats.presentToday + stats.partialToday * 0.5) / stats.totalStudents) *
        100
    );
  };

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

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

  // Main dashboard
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
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => router.push("/adminupdateattendancemanually")}
              >
                <Hand className="h-4 w-4 mr-2" />
                Attendance Manual Update
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

              <Button
                variant="outline"
                className="border-amber-500/30 text-amber-400 hover:bg-amber-950/30"
                onClick={markPendingCheckoutsAsPartial}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserMinus className="h-4 w-4 mr-2" />
                )}
                Mark Pending Checkouts as Partial
              </Button>
            </div>
          </div>

          {/* Campus Stats */}
          {campusFilter !== "all" && stats.campusStats ? (
            <Card className="bg-black border-purple-500/30 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 text-purple-500 mr-2" />
                  {campusNames[campusFilter as keyof typeof campusNames] ||
                    campusFilter}{" "}
                  Campus Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-purple-500/30">
                    <div className="text-sm text-gray-400">Total Students</div>
                    <div className="text-2xl font-bold text-white">
                      {stats.campusStats[
                        campusFilter as keyof typeof stats.campusStats
                      ]?.totalStudents || 0}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-green-500/30">
                    <div className="text-sm text-gray-400">Present Today</div>
                    <div className="text-2xl font-bold text-green-400">
                      {stats.campusStats[
                        campusFilter as keyof typeof stats.campusStats
                      ]?.presentToday || 0}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-amber-500/30">
                    <div className="text-sm text-gray-400">
                      Partial Attendance
                    </div>
                    <div className="text-2xl font-bold text-amber-400">
                      {stats.campusStats[
                        campusFilter as keyof typeof stats.campusStats
                      ]?.partialToday || 0}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-red-500/30">
                    <div className="text-sm text-gray-400">Absent Today</div>
                    <div className="text-2xl font-bold text-red-400">
                      {stats.campusStats[
                        campusFilter as keyof typeof stats.campusStats
                      ]?.absentToday || 0}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>
                      Attendance Rate:{" "}
                      {stats.campusStats[
                        campusFilter as keyof typeof stats.campusStats
                      ]?.attendanceRate || 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      stats.campusStats[
                        campusFilter as keyof typeof stats.campusStats
                      ]?.attendanceRate || 0
                    }
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Stats Overview - for All Campuses or when no campus filter is selected */}
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
                {getAttendancePercentage(campusFilter)}% of students have
                checked in today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                    <span>
                      Present:{" "}
                      {campusFilter !== "all" && stats.campusStats
                        ? stats.campusStats[
                            campusFilter as keyof typeof stats.campusStats
                          ]?.presentToday
                        : stats.presentToday}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-amber-500 mr-1"></div>
                    <span>
                      Partial:{" "}
                      {campusFilter !== "all" && stats.campusStats
                        ? stats.campusStats[
                            campusFilter as keyof typeof stats.campusStats
                          ]?.partialToday
                        : stats.partialToday}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                    <span>
                      Absent:{" "}
                      {campusFilter !== "all" && stats.campusStats
                        ? stats.campusStats[
                            campusFilter as keyof typeof stats.campusStats
                          ]?.absentToday
                        : stats.absentToday}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>
                      Total:{" "}
                      {campusFilter !== "all" && stats.campusStats
                        ? stats.campusStats[
                            campusFilter as keyof typeof stats.campusStats
                          ]?.totalStudents
                        : stats.totalStudents}
                    </span>
                  </div>
                </div>

                <div className="flex w-full h-3 bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full"
                    style={{
                      width: `${
                        campusFilter !== "all" && stats.campusStats
                          ? ((stats.campusStats[
                              campusFilter as keyof typeof stats.campusStats
                            ]?.presentToday || 0) /
                              (stats.campusStats[
                                campusFilter as keyof typeof stats.campusStats
                              ]?.totalStudents || 1)) *
                            100
                          : (stats.presentToday /
                              Math.max(1, stats.totalStudents)) *
                            100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-amber-500 h-full"
                    style={{
                      width: `${
                        campusFilter !== "all" && stats.campusStats
                          ? ((stats.campusStats[
                              campusFilter as keyof typeof stats.campusStats
                            ]?.partialToday || 0) /
                              (stats.campusStats[
                                campusFilter as keyof typeof stats.campusStats
                              ]?.totalStudents || 1)) *
                            100
                          : (stats.partialToday /
                              Math.max(1, stats.totalStudents)) *
                            100
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
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="records">Attendance Records</TabsTrigger>
              <TabsTrigger value="absent">Absent Students</TabsTrigger>
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
                        <SelectItem value={ALL_STUDENTS_VALUE}>
                          All Students
                        </SelectItem>
                        {students
                          .filter(
                            (student) =>
                              campusFilter === "all" ||
                              student.campus?.toLowerCase() === campusFilter
                          )
                          .map((student) => (
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

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[150px] bg-gray-900 border-gray-700 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="half-day">Partial</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-amber-500/30 text-amber-400 hover:bg-amber-950/30"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <UserMinus className="h-4 w-4 mr-2" />
                          )}
                          UpdateAttendance Status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus("pending-checkouts")
                          }
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Update Today&apos;s Records
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus("fix-checked-out-today")
                          }
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Fix Checked-Out Students
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus("fix-all-statuses")}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Fix All Historical Records
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
                            <TableHead className="text-left">Campus</TableHead>
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
                          {currentRecords.map((record) => (
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
                                <Badge variant="outline">
                                  {record.student?.campus || "Unknown"}
                                </Badge>
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
                        Showing{" "}
                        <span className="font-medium">
                          {indexOfFirstRecord + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(indexOfLastRecord, filteredRecords.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredRecords.length}
                        </span>{" "}
                        results
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => paginate(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => paginate(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Export buttons */}
                  <div className="mt-6 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-400 hover:bg-gray-800"
                      onClick={exportToCSV}
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as CSV
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-400 hover:bg-gray-800"
                      onClick={exportToExcel}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export as Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Absent Students Tab */}
            <TabsContent value="absent" className="space-y-4">
              <Card className="bg-black border-purple-500/30">
                <CardHeader>
                  <CardTitle>Absent Students</CardTitle>
                  <CardDescription>
                    Students who haven&apos;t checked in today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                  ) : absentStudents.length === 0 ? (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-gray-400">
                        No absent students found
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        All students have checked in today.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border border-gray-800">
                      <Table>
                        <TableHeader className="bg-gray-900">
                          <TableRow>
                            <TableHead className="text-left">Student</TableHead>
                            <TableHead className="text-left">Campus</TableHead>
                            <TableHead className="text-left">Email</TableHead>
                            <TableHead className="text-left">
                              Registration No.
                            </TableHead>
                            <TableHead className="text-left">Branch</TableHead>
                            <TableHead className="text-left">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {absentStudents
                            .filter(
                              (student) =>
                                campusFilter === "all" ||
                                student.campus?.toLowerCase() ===
                                  campusFilter.toLowerCase()
                            )
                            .slice(0, 20) // Limit to 20 students for performance
                            .map((student) => (
                              <TableRow
                                key={student._id}
                                className="hover:bg-gray-900/50"
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-2">
                                      <AvatarFallback>
                                        {student.name
                                          ? student.name.charAt(0)
                                          : "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">
                                        {student.name || "Unknown"}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {student.campus || "Unknown"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.regno || "N/A"}</TableCell>
                                <TableCell>{student.branch || "N/A"}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="bg-red-900/20 text-red-400 border-red-500/30"
                                  >
                                    Absent
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-400 hover:bg-gray-800"
                      onClick={() => exportToCSV()}
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Export Absent List
                    </Button>
                  </div>
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
                        <SelectItem value={ALL_STUDENTS_VALUE}>
                          All Students
                        </SelectItem>
                        {students
                          .filter(
                            (student) =>
                              campusFilter === "all" ||
                              student.campus?.toLowerCase() === campusFilter
                          )
                          .map((student) => (
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

                  {selectedStudent && selectedStudent !== ALL_STUDENTS_VALUE ? (
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
                      
                      {/* Export buttons for individual student */}
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          className="border-gray-700 text-gray-400 hover:bg-gray-800"
                          onClick={exportToCSV}
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          Export Student Data (CSV)
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-700 text-gray-400 hover:bg-gray-800"
                          onClick={exportToExcel}
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Export Student Data (Excel)
                        </Button>
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
                                    ((presentCount+ partialCount * 0.5) /
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
                            {students
                              .filter(
                                (student) =>
                                  campusFilter === "all" ||
                                  student.campus?.toLowerCase() ===
                                    campusFilter.toLowerCase()
                              )
                              .slice(0, 10)
                              .map((student) => {
                                const studentRecords =
                                  attendanceRecords.filter(
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
                  Visualize attendance patterns by campus
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

                  {/* Campus comparison */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* BBSR Campus Stats */}
                    <Card className="bg-gray-900/20 border border-purple-500/30">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <School className="h-5 w-5 mr-2 text-purple-500" />
                          BBSR Campus
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Students:</span>
                            <span className="font-medium">
                              {stats.campusStats?.bbsr.totalStudents || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Present:</span>
                            <span className="font-medium text-green-400">
                              {stats.campusStats?.bbsr.presentToday || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Partial:</span>
                            <span className="font-medium text-amber-400">
                              {stats.campusStats?.bbsr.partialToday || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Absent:</span>
                            <span className="font-medium text-red-400">
                              {stats.campusStats?.bbsr.absentToday || 0}
                            </span>
                          </div>
                          <div className="pt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Attendance Rate</span>
                              <span>
                                {stats.campusStats?.bbsr.attendanceRate || 0}%
                              </span>
                            </div>
                            <Progress
                              value={
                                stats.campusStats?.bbsr.attendanceRate || 0
                              }
                              className="h-2"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* PKD Campus Stats */}
                    <Card className="bg-gray-900/20 border border-purple-500/30">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <School className="h-5 w-5 mr-2 text-purple-500" />
                          PKD Campus
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Students:</span>
                            <span className="font-medium">
                              {stats.campusStats?.pkd.totalStudents || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Present:</span>
                            <span className="font-medium text-green-400">
                              {stats.campusStats?.pkd.presentToday || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Partial:</span>
                            <span className="font-medium text-amber-400">
                              {stats.campusStats?.pkd.partialToday || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Absent:</span>
                            <span className="font-medium text-red-400">
                              {stats.campusStats?.pkd.absentToday || 0}
                            </span>
                          </div>
                          <div className="pt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Attendance Rate</span>
                              <span>
                                {stats.campusStats?.pkd.attendanceRate || 0}%
                              </span>
                            </div>
                            <Progress
                              value={
                                stats.campusStats?.pkd.attendanceRate || 0
                              }
                              className="h-2"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* VZM Campus Stats */}
                    <Card className="bg-gray-900/20 border border-purple-500/30">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <School className="h-5 w-5 mr-2 text-purple-500" />
                          VZM Campus
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Students:</span>
                            <span className="font-medium">
                              {stats.campusStats?.vzm.totalStudents || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Present:</span>
                            <span className="font-medium text-green-400">
                              {stats.campusStats?.vzm.presentToday || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Partial:</span>
                            <span className="font-medium text-amber-400">
                              {stats.campusStats?.vzm.partialToday || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Absent:</span>
                            <span className="font-medium text-red-400">
                              {stats.campusStats?.vzm.absentToday || 0}
                            </span>
                          </div>
                          <div className="pt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Attendance Rate</span>
                              <span>
                                {stats.campusStats?.vzm.attendanceRate || 0}%
                              </span>
                            </div>
                            <Progress
                              value={
                                stats.campusStats?.vzm.attendanceRate || 0
                              }
                              className="h-2"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Campus attendance bar chart placeholder */}
                  <div className="p-4 border border-gray-800 rounded-lg h-[300px] flex flex-col justify-center items-center bg-gray-900/20">
                    <BarChart4 className="h-16 w-16 text-purple-500/20 mb-4" />
                    <p className="text-center text-gray-400">
                      Campus attendance comparison chart would be displayed
                      here.
                      <br />
                      This visualizes attendance rates across different
                      campuses.
                    </p>
                  </div>

                  {/* Weekly Trends */}
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
                        the week for each campus.
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
                        check-out times per campus.
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