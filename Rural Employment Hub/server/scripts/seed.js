import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rural-hub";

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});
    console.log("Cleared existing collections.");

    // ==========================================
    // 1. CREATE STATE ADMIN (Level 1 - Top Level)
    // ==========================================
    const stateAdmin = await User.create({
      name: "Sri K. Vijay Kumar, IAS",
      firstName: "K. Vijay",
      lastName: "Kumar",
      email: "stateadmin@gov.in",
      phone: "+919876500001",
      password: "admin123",
      role: "state_admin",
      adminCode: "STATE_ADMIN_HQ",
      adminTitle: "Principal Secretary & State Employment Commissioner",
      state: "Andhra Pradesh",
      district: "State Headquarters (Amaravati)",
      mandal: "Central Secretariat",
      village: "Headquarters",
      isVerified: true,
      isActive: true,
    });
    console.log(`✓ Created State Admin: ${stateAdmin.email}`);

    // ==========================================
    // 2. CREATE ASSISTANT ADMINS (Level 2 - Created by State Admin)
    // ==========================================
    const asstAdminKurnool = await User.create({
      name: "R. Ramanathan",
      firstName: "R.",
      lastName: "Ramanathan",
      email: "assistantadmin@gov.in",
      phone: "+919876500002",
      password: "admin123",
      role: "assistant_admin",
      parentId: stateAdmin._id,
      adminCode: "ASST_ADMIN_KNL",
      adminTitle: "Assistant Commissioner - Kurnool Division",
      state: "Andhra Pradesh",
      district: "Kurnool",
      mandal: "Dhone",
      village: "Kurnool Regional Office",
      assignedDistricts: ["Kurnool", "Anantapur"],
      isVerified: true,
      isActive: true,
    });

    const asstAdminGuntur = await User.create({
      name: "Dr. Lakshmi Prasanna",
      firstName: "Lakshmi",
      lastName: "Prasanna",
      email: "assistantadmin2@gov.in",
      phone: "+919876500003",
      password: "admin123",
      role: "assistant_admin",
      parentId: stateAdmin._id,
      adminCode: "ASST_ADMIN_GNT",
      adminTitle: "Assistant Commissioner - Guntur Division",
      state: "Andhra Pradesh",
      district: "Guntur",
      mandal: "Tenali",
      village: "Guntur Zilla Parishad",
      assignedDistricts: ["Guntur", "Krishna"],
      isVerified: true,
      isActive: true,
    });
    console.log("✓ Created 2 Assistant Admins (Kurnool & Guntur)");

    // ==========================================
    // 3. CREATE FIELD ADMINS (Level 3 - Created by Assistant Admins)
    // ==========================================
    const fieldAdmin1 = await User.create({
      name: "Suresh Reddy",
      firstName: "Suresh",
      lastName: "Reddy",
      email: "fieldadmin@gov.in",
      phone: "+919876500004",
      password: "admin123",
      role: "field_admin",
      parentId: asstAdminKurnool._id,
      adminCode: "FIELD_ADMIN_DHONE",
      adminTitle: "Field Supervisor - Dhone Mandal",
      state: "Andhra Pradesh",
      district: "Kurnool",
      mandal: "Dhone",
      village: "Kothapalli",
      assignedVillages: ["Kothapalli", "Venkatapuram", "Chanugondla"],
      isVerified: true,
      isActive: true,
    });

    const fieldAdmin2 = await User.create({
      name: "M. Sangeetha",
      firstName: "M.",
      lastName: "Sangeetha",
      email: "fieldadmin2@gov.in",
      phone: "+919876500005",
      password: "admin123",
      role: "field_admin",
      parentId: asstAdminKurnool._id,
      adminCode: "FIELD_ADMIN_PTK",
      adminTitle: "Field Supervisor - Pattikonda Mandal",
      state: "Andhra Pradesh",
      district: "Kurnool",
      mandal: "Pattikonda",
      village: "Peddahothur",
      assignedVillages: ["Peddahothur", "Devanakonda"],
      isVerified: true,
      isActive: true,
    });
    console.log("✓ Created 2 Field Admins");

    // ==========================================
    // 4. CREATE WORKERS (Level 4 - Created by Field Admins)
    // ==========================================
    const workersData = [
      {
        name: "Ramesh Babu",
        firstName: "Ramesh",
        lastName: "Babu",
        email: "worker1@gov.in",
        phone: "+919876510001",
        password: "admin123",
        role: "worker",
        parentId: fieldAdmin1._id,
        assignedAdmin: fieldAdmin1._id,
        employeeID: "WRK-AP-1001",
        state: "Andhra Pradesh",
        district: "Kurnool",
        mandal: "Dhone",
        village: "Kothapalli",
        panchayat: "Kothapalli Gram Panchayat",
        aadhaarMasked: "XXXX-XXXX-4819",
        jobCardNumber: "AP-12-004-1001",
        dailyWage: 425,
        bankName: "State Bank of India",
        accountNumber: "389201948291",
        ifscCode: "SBIN0001234",
        fingerprintEnrolled: true,
        isVerified: true,
        isActive: true,
      },
      {
        name: "Lakshmi Devi",
        firstName: "Lakshmi",
        lastName: "Devi",
        email: "worker2@gov.in",
        phone: "+919876510002",
        password: "admin123",
        role: "worker",
        parentId: fieldAdmin1._id,
        assignedAdmin: fieldAdmin1._id,
        employeeID: "WRK-AP-1002",
        state: "Andhra Pradesh",
        district: "Kurnool",
        mandal: "Dhone",
        village: "Kothapalli",
        panchayat: "Kothapalli Gram Panchayat",
        aadhaarMasked: "XXXX-XXXX-9128",
        jobCardNumber: "AP-12-004-1002",
        dailyWage: 425,
        bankName: "Andhra Pragathi Grameena Bank",
        accountNumber: "738291048201",
        ifscCode: "APGB0004321",
        fingerprintEnrolled: true,
        isVerified: true,
        isActive: true,
      },
      {
        name: "Venkat Rao",
        firstName: "Venkat",
        lastName: "Rao",
        email: "worker3@gov.in",
        phone: "+919876510003",
        password: "admin123",
        role: "worker",
        parentId: fieldAdmin1._id,
        assignedAdmin: fieldAdmin1._id,
        employeeID: "WRK-AP-1003",
        state: "Andhra Pradesh",
        district: "Kurnool",
        mandal: "Dhone",
        village: "Venkatapuram",
        panchayat: "Venkatapuram Gram Panchayat",
        aadhaarMasked: "XXXX-XXXX-6512",
        jobCardNumber: "AP-12-004-1003",
        dailyWage: 425,
        bankName: "Union Bank of India",
        accountNumber: "510928374619",
        ifscCode: "UBIN0532145",
        fingerprintEnrolled: true,
        isVerified: true,
        isActive: true,
      },
      {
        name: "Anasuya Bai",
        firstName: "Anasuya",
        lastName: "Bai",
        email: "worker4@gov.in",
        phone: "+919876510004",
        password: "admin123",
        role: "worker",
        parentId: fieldAdmin2._id,
        assignedAdmin: fieldAdmin2._id,
        employeeID: "WRK-AP-1004",
        state: "Andhra Pradesh",
        district: "Kurnool",
        mandal: "Pattikonda",
        village: "Peddahothur",
        panchayat: "Peddahothur Gram Panchayat",
        aadhaarMasked: "XXXX-XXXX-3341",
        jobCardNumber: "AP-12-005-1004",
        dailyWage: 450,
        bankName: "Canara Bank",
        accountNumber: "283910293847",
        ifscCode: "CNRB0002938",
        fingerprintEnrolled: true,
        isVerified: true,
        isActive: true,
      },
      {
        name: "Govind Naik",
        firstName: "Govind",
        lastName: "Naik",
        email: "worker5@gov.in",
        phone: "+919876510005",
        password: "admin123",
        role: "worker",
        parentId: fieldAdmin1._id,
        assignedAdmin: fieldAdmin1._id,
        employeeID: "WRK-AP-1005",
        state: "Andhra Pradesh",
        district: "Kurnool",
        mandal: "Dhone",
        village: "Chanugondla",
        panchayat: "Chanugondla Gram Panchayat",
        aadhaarMasked: "XXXX-XXXX-8921",
        jobCardNumber: "AP-12-004-1005",
        dailyWage: 425,
        bankName: "State Bank of India",
        accountNumber: "492019384729",
        ifscCode: "SBIN0001234",
        fingerprintEnrolled: true,
        isVerified: true,
        isActive: true,
      },
    ];

    const workers = [];
    for (const w of workersData) {
      const createdWorker = await User.create(w);
      workers.push(createdWorker);
    }
    console.log(`✓ Created ${workers.length} Rural Workers`);

    // ==========================================
    // 5. SEED ATTENDANCE RECORDS (With Biometric Fingerprint)
    // ==========================================
    const attendanceList = [];
    const today = new Date();

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const attDate = new Date(today);
      attDate.setDate(today.getDate() - dayOffset);

      for (const worker of workers) {
        const isPresent = Math.random() > 0.15; // 85% attendance rate
        const attendance = await Attendance.create({
          workerId: worker._id,
          employee: worker._id,
          employeeID: worker.employeeID,
          workerName: worker.name,
          village: worker.village,
          mandal: worker.mandal,
          district: worker.district,
          fieldAdminId: worker.parentId,
          assistantAdminId: asstAdminKurnool._id,
          adminName: "Suresh Reddy",
          adminCode: "FIELD_ADMIN_DHONE",
          attendanceDate: attDate,
          date: attDate,
          checkInTime: isPresent ? new Date(attDate.setHours(8, 30)) : null,
          checkOutTime: isPresent ? new Date(attDate.setHours(17, 0)) : null,
          attendanceStatus: isPresent ? "present" : "absent",
          status: isPresent ? "present" : "absent",
          verificationMethod: "fingerprint",
          fingerprintVerified: isPresent,
          wageAmount: isPresent ? worker.dailyWage : 0,
          paymentStatus: isPresent ? "approved" : "approved",
          isVerified: true,
          verifiedBy: worker.parentId,
          remarks: isPresent ? "Biometric Fingerprint Verified on Field" : "Worker on Personal Leave",
        });
        attendanceList.push(attendance);
      }
    }
    console.log(`✓ Created ${attendanceList.length} Attendance Records`);

    // ==========================================
    // 6. SEED PAYMENTS & SMS NOTIFICATIONS
    // ==========================================
    for (const worker of workers) {
      const txnId1 = "TXN-DBT-" + Math.floor(100000000 + Math.random() * 900000000);
      const wageAmount1 = 850; // 2 days @ 425
      const smsMessage = `Dear ${worker.name}, your Rural Employment wage of ₹${wageAmount1} has been credited successfully to your bank account (${worker.bankName} - A/C ending in ${worker.accountNumber.slice(-4)}). Txn ID: ${txnId1}.`;

      // 1. Credited Payment Record
      const payment1 = await Payment.create({
        workerId: worker._id,
        employee: worker._id,
        employeeID: worker.employeeID,
        workerName: worker.name,
        workerPhone: worker.phone,
        fieldAdminId: worker.parentId,
        assistantAdminId: asstAdminKurnool._id,
        amount: wageAmount1,
        totalAmount: wageAmount1,
        dailyWage: worker.dailyWage,
        workingDays: 2,
        paymentStatus: "credited",
        status: "credited",
        paymentMethod: "Direct Benefit Transfer (DBT)",
        bankName: worker.bankName,
        accountNumber: worker.accountNumber,
        ifscCode: worker.ifscCode,
        transactionId: txnId1,
        transactionID: txnId1,
        creditedDate: new Date(Date.now() - 2 * 86400000),
        paidDate: new Date(Date.now() - 2 * 86400000),
        smsSent: true,
        smsMessage,
        smsSentAt: new Date(Date.now() - 2 * 86400000),
        approvedBy: worker.parentId,
        approvedAt: new Date(Date.now() - 3 * 86400000),
        remarks: "Weekly NREGA Wage Disbursement",
      });

      // 2. Pending Payment Record
      const txnId2 = "TXN-DBT-" + Math.floor(100000000 + Math.random() * 900000000);
      await Payment.create({
        workerId: worker._id,
        employee: worker._id,
        employeeID: worker.employeeID,
        workerName: worker.name,
        workerPhone: worker.phone,
        fieldAdminId: worker.parentId,
        assistantAdminId: asstAdminKurnool._id,
        amount: 1275, // 3 days @ 425
        totalAmount: 1275,
        dailyWage: worker.dailyWage,
        workingDays: 3,
        paymentStatus: "pending",
        status: "pending",
        paymentMethod: "Direct Benefit Transfer (DBT)",
        bankName: worker.bankName,
        accountNumber: worker.accountNumber,
        ifscCode: worker.ifscCode,
        transactionId: txnId2,
        transactionID: txnId2,
        smsSent: false,
        approvedBy: worker.parentId,
        approvedAt: new Date(),
        remarks: "Current Cycle Wages Pending State Treasury Release",
      });

      // 3. SMS Notification Log in Database
      await Notification.create({
        title: "Wage Credited to Bank Account",
        message: smsMessage,
        type: "wage_credit",
        recipient: worker._id,
        recipientPhone: worker.phone,
        recipientName: worker.name,
        sender: worker.parentId,
        channels: {
          email: false,
          sms: true,
          whatsapp: false,
          inApp: true,
        },
        status: {
          delivered: true,
          deliveredAt: new Date(Date.now() - 2 * 86400000),
          read: true,
        },
        relatedData: {
          referenceType: "payment",
          referenceID: payment1._id,
          amount: wageAmount1,
          transactionId: txnId1,
        },
        priority: "high",
      });
    }
    console.log("✓ Seeded DBT Payments and SMS Logs");

    console.log("\n=======================================================");
    console.log("🎉 RURAL EMPLOYMENT HUB SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=======================================================");
    console.log("Demo Credentials:");
    console.log("1. State Admin:       stateadmin@gov.in     / admin123");
    console.log("2. Assistant Admin:   assistantadmin@gov.in / admin123");
    console.log("3. Field Admin:       fieldadmin@gov.in     / admin123");
    console.log("4. Worker:            worker1@gov.in        / admin123");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
