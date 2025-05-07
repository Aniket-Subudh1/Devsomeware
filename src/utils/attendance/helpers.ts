import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { format } from 'date-fns';

/**
 * Generate a JWT token for attendance
 * @param email User email
 * @param userId User ID
 * @param salt Random salt for dynamic QR codes
 * @returns JWT token
 */
export const generateAttendanceToken = (
  email: string,
  userId: string,
  salt: string
): string => {
  return jwt.sign(
    { email, id: userId, salt },
    process.env.JWT_SECRET as string,
    { expiresIn: "12h" }
  );
};

/**
 * Generate a dynamic QR code based on current timestamp
 * @param email User email
 * @param userId User ID
 * @param salt Secret salt
 * @returns QR code data as string
 */
export const generateDynamicQRCode = (
  email: string,
  userId: string,
  salt: string
): string => {
  // Change the code every 2 seconds by using floor(Date.now() / 2000)
  const currentTime = Math.floor(Date.now() / 2000);
  
  // Generate HMAC using the salt and current time
  const dynamicCode = crypto
    .createHmac('sha256', salt)
    .update(currentTime.toString())
    .digest('hex');
  
  // Create the QR payload
  const qrPayload = JSON.stringify({
    email,
    id: userId,
    code: dynamicCode,
    timestamp: currentTime
  });
  
  return qrPayload;
};

/**
 * Verify a dynamic QR code
 * @param qrData QR code data
 * @param salt Secret salt
 * @returns Boolean indicating if code is valid
 */
interface QRCodeData {
  code: string;
  timestamp: number;
  email?: string;
  id?: string;
}

export const verifyQRCode = (
  qrData: QRCodeData,
  salt: string
): boolean => {
  const { code, timestamp } = qrData;
  
  // Verify the code is recent (within 10 seconds / 5 intervals)
  const currentTime = Math.floor(Date.now() / 2000);
  if (currentTime - timestamp > 5) {
    return false;
  }
  
  // Regenerate the code using the same salt and timestamp
  const expectedCode = crypto
    .createHmac('sha256', salt)
    .update(timestamp.toString())
    .digest('hex');
  
  // Compare the codes
  return code === expectedCode;
};

/**
 * Format duration in minutes to a readable string
 * @param minutes Duration in minutes
 * @returns Formatted string (e.g., "2h 30m")
 */
export const formatDuration = (minutes: number): string => {
  if (!minutes) return "0m";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

/**
 * Calculate attendance status based on duration
 * @param checkInTime Check-in time
 * @param checkOutTime Check-out time
 * @returns Status string ('present', 'half-day', 'absent')
 */
export const calculateAttendanceStatus = (
  checkInTime: Date,
  checkOutTime: Date | null
): string => {
  if (!checkOutTime) {
    return 'present'; // Default to present if no check-out yet
  }
  
  const durationInMinutes = Math.floor(
    (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60)
  );
  
  if (durationInMinutes < 240) { // Less than 4 hours
    return 'half-day';
  }
  
  return 'present';
};

/**
 * Calculate the attendance percentage
 * @param presentDays Number of present days
 * @param halfDays Number of half days
 * @param totalDays Total days
 * @returns Attendance percentage as string with 2 decimal places
 */
export const calculateAttendancePercentage = (
  presentDays: number,
  halfDays: number,
  totalDays: number
): string => {
  if (totalDays === 0) {
    return '0.00';
  }
  
  const percentage = ((presentDays + (halfDays * 0.5)) / totalDays) * 100;
  return percentage.toFixed(2);
};

/**
 * Format date to ISO string for consistent API usage
 * @param date Date object
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Generate a random token salt
 * @returns Random hex string
 */
export const generateSalt = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Extract expiration time from JWT token
 * @param token JWT token
 * @returns Expiration time in seconds or null if invalid
 */
export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const decoded = jwt.decode(token) as { exp: number } | null;
    if (!decoded || !decoded.exp) {
      return null;
    }
    return decoded.exp;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Calculate time remaining until token expiration
 * @param expirationTime Token expiration timestamp
 * @returns Time remaining in seconds
 */
export const calculateTimeRemaining = (expirationTime: number): number => {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expirationTime - now);
};

/**
 * Format seconds to a readable time string (HH:MM:SS)
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "Expired";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get date range for a specified period
 * @param period Period ('day', 'week', 'month', 'total')
 * @returns Object with start and end dates
 */
export const getDateRangeForPeriod = (period: string): { startDate: Date, endDate: Date } => {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  let startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  if (period === 'day') {
    // Just use today
  } else if (period === 'week') {
    // Start from last 7 days
    startDate.setDate(endDate.getDate() - 7);
  } else if (period === 'month') {
    // Start from last 30 days
    startDate.setDate(endDate.getDate() - 30);
  } else if (period === 'total') {
    // Start from a long time ago
    startDate = new Date(0); // January 1, 1970
  }
  
  return { startDate, endDate };
};