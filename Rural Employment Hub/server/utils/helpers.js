import { v4 as uuidv4 } from "uuid";

// Generate Unique Employee ID
export const generateEmployeeID = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `REH-${timestamp}-${random}`;
};

// Generate Conversation ID
export const generateConversationID = () => {
  return `conv-${uuidv4()}`;
};

// Generate Payment Receipt Number
export const generateReceiptNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REC-${timestamp}-${random}`;
};

// Format Date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Calculate Working Hours
export const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return diff / (1000 * 60 * 60); // Convert to hours
};

// Mask Email
export const maskEmail = (email) => {
  const [localPart, domain] = email.split("@");
  const maskedLocal =
    localPart.charAt(0) + "*".repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  return maskedLocal + "@" + domain;
};

// Mask Phone
export const maskPhone = (phone) => {
  return phone.slice(0, 2) + "*".repeat(phone.length - 6) + phone.slice(-4);
};

// Mask Aadhaar
export const maskAadhaar = (aadhaar) => {
  if (!aadhaar) return null;
  const aadhaarStr = aadhaar.toString().replace(/\D/g, "");
  if (aadhaarStr.length !== 12) return null;
  return "XXXX-XXXX-" + aadhaarStr.slice(-4);
};

// Validate Email
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate Phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

// Validate Aadhaar
export const isValidAadhaar = (aadhaar) => {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar.replace(/\D/g, ""));
};
