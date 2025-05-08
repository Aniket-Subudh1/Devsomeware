"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  CornerDownRight,
  LayoutList
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Student {
  _id: string;
  name: string;
  email: string;
  regno?: string;
  branch?: string;
  campus?: string;
}

interface AttendanceRecord {
  _id?: string;
  email: string;
  testUserId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number;
  status: "present" | "half-day" | "absent";
  lastAction?: "check-in" | "check-out";
  student?: Student;
}

export default function AdminManualAttendance() {
  const router = useRouter();

  // Auth state
  const [adminPassword, setAdminPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Student selection
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [campusFilter, setCampusFilter] = useState<string>("all");

  // Attendance update
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(formatDateForInput(new Date()));
  const [checkInTime, setCheckInTime] = useState<string>("09:00");
  const [checkOutTime, setCheckOutTime] = useState<string>("17:00");
  const [attendanceType, setAttendanceType] = useState<"present" | "half-day" | "absent">("present");
  const [attendanceStatus, setAttendanceStatus] = useState<"new" | "update">("new");
  const [existingRecord, setExistingRecord] = useState<AttendanceRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Batch update
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchAttendanceType, setBatchAttendanceType] = useState<"present" | "half-day" | "absent">("present");
  const [batchCheckInTime, setBatchCheckInTime] = useState<string>("09:00");
  const [batchCheckOutTime, setBatchCheckOutTime] = useState<string>("17:00");

  // Attendance history
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<Student | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
        fetchStudents();
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

  // Fetch students
  const fetchStudents = async () => {
    try {
      setDataLoading(true);
      const password = adminPassword || sessionStorage.getItem("adminPassword") || "";

      const response = await fetch(
        `/api/attendance/admin/students?password=${encodeURIComponent(password)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setStudents(data.students || []);
        setFilteredStudents(data.students || []);
      } else {
        toast.error(data.message || "Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students. Please try again.");
    } finally {
      setDataLoading(false);
    }
  };

  // Check for existing authentication on component mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
    const storedPassword = sessionStorage.getItem("adminPassword");

    if (isAuthenticated === "true" && storedPassword) {
      setAuthenticated(true);
      setAdminPassword(storedPassword);
      fetchStudents();
    }
  }, []);

  // Filter students
  useEffect(() => {
    let filtered = [...students];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term) ||
          (student.regno && student.regno.toLowerCase().includes(term))
      );
    }

    if (campusFilter !== "all") {
      filtered = filtered.filter(
        (student) => student.campus?.toLowerCase() === campusFilter.toLowerCase()
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, campusFilter]);

  // Select a student to update attendance
  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setAttendanceType("present");
    setCheckInTime("09:00");
    setCheckOutTime("17:00");
    setAttendanceDate(formatDateForInput(new Date()));
    setExistingRecord(null);
    setAttendanceStatus("new");

    // Check if attendance record already exists for today
    try {
      const password = adminPassword || sessionStorage.getItem("adminPassword") || "";
      const formattedDate = new Date(attendanceDate).toISOString().split('T')[0];
      
      const response = await fetch(
        `/api/attendance/admin/student-record?password=${encodeURIComponent(password)}&studentId=${student._id}&date=${formattedDate}`
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.record) {
          setExistingRecord(data.record);
          setAttendanceStatus("update");
          
          // Pre-fill values from existing record
          if (data.record.checkInTime) {
            setCheckInTime(formatTimeForInput(new Date(data.record.checkInTime)));
          }
          
          if (data.record.checkOutTime) {
            setCheckOutTime(formatTimeForInput(new Date(data.record.checkOutTime)));
          }
          
          setAttendanceType(data.record.status);
        }
      }
    } catch (error) {
      console.error("Error checking existing attendance:", error);
      // Continue with new record if error occurred
    }
    
    setDialogOpen(true);
  };

  // Check attendance history for a student
  const handleViewHistory = async (student: Student) => {
    setSelectedStudentHistory(student);
    setHistoryLoading(true);
    
    try {
      const password = adminPassword || sessionStorage.getItem("adminPassword") || "";
      
      const response = await fetch(
        `/api/attendance/admin/student-history?password=${encodeURIComponent(password)}&studentId=${student._id}`
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setAttendanceHistory(data.records || []);
        } else {
          toast.error(data.message || "Failed to fetch attendance history");
          setAttendanceHistory([]);
        }
      } else {
        toast.error("Failed to fetch attendance history");
        setAttendanceHistory([]);
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      toast.error("Failed to fetch attendance history");
      setAttendanceHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Update attendance for a student
  const handleUpdateAttendance = async () => {
    if (!selectedStudent) return;
    
    try {
      setIsSubmitting(true);
      const password = adminPassword || sessionStorage.getItem("adminPassword") || "";
      
      // Create date-time values
      const recordDate = new Date(attendanceDate);
      const checkIn = attendanceType !== "absent" ? combineDateTime(recordDate, checkInTime) : undefined;
      const checkOut = attendanceType === "present" ? combineDateTime(recordDate, checkOutTime) : undefined;
      
      // Calculate duration if both times exist
      let duration;
      if (checkIn && checkOut) {
        duration = Math.round((checkOut.getTime() - checkIn.getTime()) / 60000); // minutes
      }
      
      const attendanceData: AttendanceRecord = {
        testUserId: selectedStudent._id,
        email: selectedStudent.email,
        date: recordDate.toISOString(),
        status: attendanceType,
        lastAction: checkOut ? "check-out" : "check-in",
      };
      
      if (checkIn) {
        attendanceData.checkInTime = checkIn.toISOString();
      }
      
      if (checkOut) {
        attendanceData.checkOutTime = checkOut.toISOString();
      }
      
      if (duration) {
        attendanceData.duration = duration;
      }
      
      // If updating existing record, include the record ID
      if (attendanceStatus === "update" && existingRecord?._id) {
        attendanceData._id = existingRecord._id;
      }
      
      const response = await fetch("/api/attendance/admin/update-manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword: password,
          record: attendanceData
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Attendance updated successfully");
        setDialogOpen(false);
        setSelectedStudent(null);
      } else {
        toast.error(data.message || "Failed to update attendance");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Batch update attendance for multiple students
  const handleBatchUpdateAttendance = async () => {
    if (selectedStudents.length === 0) {
      toast.error("No students selected");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const password = adminPassword || sessionStorage.getItem("adminPassword") || "";
      
      // Create date-time values
      const recordDate = new Date(attendanceDate);
      const checkIn = batchAttendanceType !== "absent" ? combineDateTime(recordDate, batchCheckInTime) : undefined;
      const checkOut = batchAttendanceType === "present" ? combineDateTime(recordDate, batchCheckOutTime) : undefined;
      
      // Calculate duration if both times exist
      let duration;
      if (checkIn && checkOut) {
        duration = Math.round((checkOut.getTime() - checkIn.getTime()) / 60000); // minutes
      }
      
      const response = await fetch("/api/attendance/admin/batch-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword: password,
          studentIds: selectedStudents,
          attendanceData: {
            date: recordDate.toISOString(),
            status: batchAttendanceType,
            checkInTime: checkIn?.toISOString(),
            checkOutTime: checkOut?.toISOString(),
            duration,
            lastAction: checkOut ? "check-out" : "check-in",
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Attendance updated for ${data.updateCount || selectedStudents.length} students`);
        setBatchDialogOpen(false);
        setSelectedStudents([]);
        setSelectAll(false);
      } else {
        toast.error(data.message || "Failed to update attendance");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle select all students for batch update
  useEffect(() => {
    if (selectAll) {
      setSelectedStudents(filteredStudents.map(student => student._id));
    } else {
      setSelectedStudents([]);
    }
  }, [selectAll, filteredStudents]);

  // Toggle individual student selection
  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  // Navigate to other admin pages
  const goToQRGenerator = () => {
    router.push("/attendance-admin");
  };

  const goToDashboard = () => {
    router.push("/attendance-admin-dashboard");
  };

  // Helper functions
  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatTimeForInput(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function combineDateTime(date: Date, timeString: string): Date {
    const result = new Date(date);
    const [hours, minutes] = timeString.split(':').map(Number);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  // Format date-time for display
  function formatDateTime(dateTimeStr: string | undefined): string {
    if (!dateTimeStr) return "Not set";
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString();
    } catch {
      return "Invalid date";
    }
  }

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
                Enter the admin password to access manual attendance updates
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

  // Main admin page
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
                Manual Attendance Update
              </h1>
              <p className="text-gray-400 text-sm">
                Update attendance records for students manually to handle technical exceptions
              </p>
            </div>
            <div className="flex mt-4 md:mt-0 space-x-2">
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={goToQRGenerator}
              >
                QR Generator
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-400 hover:bg-gray-800"
                onClick={goToDashboard}
              >
                Dashboard
              </Button>
            </div>
          </header>

          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="individual">Individual Update</TabsTrigger>
              <TabsTrigger value="batch">Batch Update</TabsTrigger>
            </TabsList>

            {/* Individual update tab */}
            <TabsContent value="individual">
              <Card className="bg-black border-purple-500/30 mb-8">
                <CardHeader>
                  <CardTitle>Student Search</CardTitle>
                  <CardDescription>
                    Find a student to update their attendance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <Input
                          placeholder="Search by name, email or registration number"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-gray-900 border-gray-700 text-white pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={campusFilter}
                      onValueChange={setCampusFilter}
                    >
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
                      className="border-gray-700 text-gray-400 hover:bg-gray-800"
                      onClick={fetchStudents}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  {dataLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                  ) : filteredStudents.length === 0 ? (
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
                            <TableHead className="text-left">Student</TableHead>
                            <TableHead className="text-left">Campus</TableHead>
                            <TableHead className="text-left">Branch</TableHead>
                            <TableHead className="text-left">Email</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.slice(0, 10).map((student) => (
                            <TableRow
                              key={student._id}
                              className="hover:bg-gray-900/50"
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarFallback>
                                      {student.name ? student.name.charAt(0) : "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{student.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {student.regno || "No Reg. No"}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {student.campus || "Unknown"}
                                </Badge>
                              </TableCell>
                              <TableCell>{student.branch || "N/A"}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-500/30 text-green-400 hover:bg-green-900/20"
                                    onClick={() => handleSelectStudent(student)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Update
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-500/30 text-blue-400 hover:bg-blue-900/20"
                                    onClick={() => handleViewHistory(student)}
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    History
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {filteredStudents.length > 10 && (
                    <div className="text-center text-sm text-gray-500 mt-4">
                      Showing 10 of {filteredStudents.length} students. Refine your search for more specific results.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Student attendance history */}
              {selectedStudentHistory && (
                <Card className="bg-black border-purple-500/30 mb-8">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <LayoutList className="h-5 w-5 mr-2 text-purple-500" />
                          Attendance History: {selectedStudentHistory.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {selectedStudentHistory.email} | {selectedStudentHistory.campus} Campus
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedStudentHistory(null)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {historyLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      </div>
                    ) : attendanceHistory.length === 0 ? (
                      <Alert className="bg-gray-900/40 border-gray-700">
                        <AlertTitle>No attendance records found</AlertTitle>
                        <AlertDescription>
                          This student has no attendance records.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="overflow-x-auto rounded-md border border-gray-800">
                        <Table>
                          <TableHeader className="bg-gray-900">
                            <TableRow>
                              <TableHead className="text-left">Date</TableHead>
                              <TableHead className="text-left">Check In</TableHead>
                              <TableHead className="text-left">Check Out</TableHead>
                              <TableHead className="text-left">Duration</TableHead>
                              <TableHead className="text-left">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {attendanceHistory.map((record) => (
                              <TableRow
                                key={record._id}
                                className="hover:bg-gray-900/50"
                              >
                                <TableCell>
                                  {new Date(record.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {record.checkInTime
                                    ? new Date(record.checkInTime).toLocaleTimeString()
                                    : "Not recorded"}
                                </TableCell>
                                <TableCell>
                                  {record.checkOutTime
                                    ? new Date(record.checkOutTime).toLocaleTimeString()
                                    : "Not recorded"}
                                </TableCell>
                                <TableCell>
                                  {record.duration
                                    ? `${Math.floor(record.duration / 60)}h ${record.duration % 60}m`
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
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Batch update tab */}
            <TabsContent value="batch">
              <Card className="bg-black border-purple-500/30 mb-8">
                <CardHeader>
                  <CardTitle>Batch Attendance Update</CardTitle>
                  <CardDescription>
                    Update attendance for multiple students at once
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <Input
                          placeholder="Search by name, email or registration number"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-gray-900 border-gray-700 text-white pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={campusFilter}
                      onValueChange={setCampusFilter}
                    >
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
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                      disabled={selectedStudents.length === 0}
                      onClick={() => setBatchDialogOpen(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Selected ({selectedStudents.length})
                    </Button>
                  </div>

                  {dataLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-gray-400">
                        No students found
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Try changing your search or filter criteria.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center mb-4 space-x-2">
                        <Switch 
                          id="select-all" 
                          checked={selectAll}
                          onCheckedChange={setSelectAll}
                        />
                        <Label htmlFor="select-all" className="text-white">
                          Select All ({filteredStudents.length} students)
                        </Label>
                        
                        <div className="ml-auto">
                          <Input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="bg-gray-900 border-gray-700 text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto rounded-md border border-gray-800">
                        <Table>
                          <TableHeader className="bg-gray-900">
                            <TableRow>
                              <TableHead className="w-12 text-center">Select</TableHead>
                              <TableHead className="text-left">Student</TableHead>
                              <TableHead className="text-left">Campus</TableHead>
                              <TableHead className="text-left">Branch</TableHead>
                              <TableHead className="text-left">Email</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredStudents.map((student) => (
                              <TableRow
                                key={student._id}
                                className="hover:bg-gray-900/50"
                              >
                                <TableCell className="text-center">
                                  <Switch 
                                    checked={selectedStudents.includes(student._id)}
                                    onCheckedChange={() => toggleStudentSelection(student._id)}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-2">
                                      <AvatarFallback>
                                        {student.name ? student.name.charAt(0) : "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{student.name}</div>
                                      <div className="text-xs text-gray-500">
                                        {student.regno || "No Reg. No"}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {student.campus || "Unknown"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{student.branch || "N/A"}</TableCell>
                                <TableCell>{student.email}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {/* Individual Update Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {attendanceStatus === "update" ? "Update Attendance Record" : "Create Attendance Record"}
            </DialogTitle>
            <DialogDescription>
              {selectedStudent?.name} | {selectedStudent?.campus} Campus | {selectedStudent?.regno || selectedStudent?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attendance-date" className="text-right">
                Date
              </Label>
              <Input
                id="attendance-date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="col-span-3 bg-gray-800 border-gray-600"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attendance-type" className="text-right">
                Status
              </Label>
              <Select
                value={attendanceType}
                onValueChange={(value) => setAttendanceType(value as "present" | "half-day" | "absent")}
              >
                <SelectTrigger id="attendance-type" className="col-span-3 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="present">Present (Full Day)</SelectItem>
                  <SelectItem value="half-day">Partial (Half Day)</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {attendanceType !== "absent" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="check-in-time" className="text-right">
                  Check-in Time
                </Label>
                <Input
                  id="check-in-time"
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="col-span-3 bg-gray-800 border-gray-600"
                />
              </div>
            )}
            
            {attendanceType === "present" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="check-out-time" className="text-right">
                  Check-out Time
                </Label>
                <Input
                  id="check-out-time"
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="col-span-3 bg-gray-800 border-gray-600"
                />
              </div>
            )}
            
            {attendanceStatus === "update" && existingRecord && (
              <Alert className="bg-amber-900/20 border-amber-500/30">
                <AlertTitle className="text-amber-400">
                  Updating Existing Record
                </AlertTitle>
                <AlertDescription className="text-gray-300">
                  Current status: <Badge className="ml-1">{existingRecord.status}</Badge><br />
                  Check-in: {formatDateTime(existingRecord.checkInTime)}<br />
                  Check-out: {formatDateTime(existingRecord.checkOutTime)}
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAttendance}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update Attendance"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Update Dialog */}
      <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Batch Update Attendance</DialogTitle>
            <DialogDescription>
              Update attendance for {selectedStudents.length} students
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="batch-date" className="text-right">
                Date
              </Label>
              <Input
                id="batch-date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="col-span-3 bg-gray-800 border-gray-600"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="batch-status" className="text-right">
                Status
              </Label>
              <Select
                value={batchAttendanceType}
                onValueChange={(value) => setBatchAttendanceType(value as "present" | "half-day" | "absent")}
              >
                <SelectTrigger id="batch-status" className="col-span-3 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="present">Present (Full Day)</SelectItem>
                  <SelectItem value="half-day">Partial (Half Day)</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {batchAttendanceType !== "absent" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="batch-check-in" className="text-right">
                  Check-in Time
                </Label>
                <Input
                  id="batch-check-in"
                  type="time"
                  value={batchCheckInTime}
                  onChange={(e) => setBatchCheckInTime(e.target.value)}
                  className="col-span-3 bg-gray-800 border-gray-600"
                />
              </div>
            )}
            
            {batchAttendanceType === "present" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="batch-check-out" className="text-right">
                  Check-out Time
                </Label>
                <Input
                  id="batch-check-out"
                  type="time"
                  value={batchCheckOutTime}
                  onChange={(e) => setBatchCheckOutTime(e.target.value)}
                  className="col-span-3 bg-gray-800 border-gray-600"
                />
              </div>
            )}
            
            <Alert className="bg-blue-900/20 border-blue-500/30">
              <CornerDownRight className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-400">
                Bulk Update Warning
              </AlertTitle>
              <AlertDescription className="text-gray-300">
                This will update or create attendance records for all selected students with the same values.
                Any existing records for the selected date will be overwritten.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBatchDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBatchUpdateAttendance}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update All Selected"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}