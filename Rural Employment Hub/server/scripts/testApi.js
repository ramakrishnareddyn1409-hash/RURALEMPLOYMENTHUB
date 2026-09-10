import axios from "axios";

const BASE_URL = process.env.TEST_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true, // Don't throw so we can inspect status codes
});

let passed = 0;
let failed = 0;

const assert = (testName, condition, details = "") => {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ""}`);
    failed++;
  }
};

const runApiTests = async () => {
  console.log("==================================================");
  console.log(`🧪 STARTING END-TO-END API SUITE on ${BASE_URL}`);
  console.log("==================================================");

  // 1. Health Check
  console.log("\n[1] Health Check Endpoint");
  const healthRes = await api.get("/health");
  assert("GET /health status is 200", healthRes.status === 200);
  assert("Health response has status 'success'", healthRes.data?.status === "success");

  // 2. Auth - Admin Login
  console.log("\n[2] Authentication - Admin Login");
  const adminLoginRes = await api.post("/auth/login", {
    email: "admin@ruralhub.com",
    password: "Admin@12345",
  });
  assert("POST /auth/login (Admin) status is 200", adminLoginRes.status === 200);
  const adminToken = adminLoginRes.data?.token;
  assert("Admin token generated", !!adminToken);
  assert("Admin role is 'admin'", adminLoginRes.data?.user?.role === "admin");

  // 3. Auth - Employee Login
  console.log("\n[3] Authentication - Employee Login");
  const empLoginRes = await api.post("/auth/login", {
    email: "ramesh@ruralhub.com",
    password: "Employee@12345",
  });
  assert("POST /auth/login (Employee) status is 200", empLoginRes.status === 200);
  const empToken = empLoginRes.data?.token;
  assert("Employee token generated", !!empToken);
  assert("Employee role is 'employee'", empLoginRes.data?.user?.role === "employee");

  // 4. Current User Profiles
  console.log("\n[4] User Profile Verification");
  const adminMeRes = await api.get("/auth/me", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert("GET /auth/me (Admin) status is 200", adminMeRes.status === 200);
  assert("Admin profile matches", adminMeRes.data?.user?.email === "admin@ruralhub.com");

  const empMeRes = await api.get("/auth/me", {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert("GET /auth/me (Employee) status is 200", empMeRes.status === 200);
  assert("Employee ID is present", !!empMeRes.data?.user?.employeeID);

  // 5. Dashboard Endpoints
  console.log("\n[5] Dashboard Stats");
  const adminDashRes = await api.get("/dashboard/admin/stats", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert("GET /dashboard/admin/stats status is 200", adminDashRes.status === 200);
  assert("Total employees count exists", adminDashRes.data?.dashboard?.employees?.total >= 1);

  const empDashRes = await api.get("/dashboard/employee/stats", {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert("GET /dashboard/employee/stats status is 200", empDashRes.status === 200);

  // 6. User Management
  console.log("\n[6] Admin Worker Directory");
  const usersRes = await api.get("/users/all", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert("GET /users/all status is 200", usersRes.status === 200);
  assert("Employees array returned", Array.isArray(usersRes.data?.employees));

  // 7. Attendance Flow
  console.log("\n[7] Attendance Operations");
  const markAttRes = await api.post(
    "/attendance/mark",
    {
      date: new Date().toISOString(),
      status: "present",
      verificationMethod: "face-recognition",
      faceVerified: true,
      latitude: 15.421,
      longitude: 77.876,
      address: "Venkatapuram Gram Panchayat",
    },
    { headers: { Authorization: `Bearer ${empToken}` } }
  );
  assert(
    "POST /attendance/mark status is 200 or 201",
    markAttRes.status === 200 || markAttRes.status === 201,
    `status: ${markAttRes.status}`
  );

  const empAttRes = await api.get("/attendance/employee", {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert("GET /attendance/employee status is 200", empAttRes.status === 200);
  assert("Employee has attendance records", empAttRes.data?.attendance?.length >= 1);

  const dailyAttRes = await api.get("/attendance/daily", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert("GET /attendance/daily (Admin) status is 200", dailyAttRes.status === 200);

  // 8. Payments Flow
  console.log("\n[8] Payment & Wage Disbursements");
  const paymentsListRes = await api.get("/payments", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert("GET /payments status is 200", paymentsListRes.status === 200);
  assert("Payment vouchers array returned", Array.isArray(paymentsListRes.data?.payments));

  const empPaymentsRes = await api.get("/payments/employee/list", {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert("GET /payments/employee/list status is 200", empPaymentsRes.status === 200);

  // 9. Work Assignments Flow
  console.log("\n[9] Rural Work Assignments");
  const allAssignmentsRes = await api.get("/assignments", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert("GET /assignments status is 200", allAssignmentsRes.status === 200);

  const empAssignmentsRes = await api.get("/assignments/employee/my-assignments", {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert("GET /assignments/employee/my-assignments status is 200", empAssignmentsRes.status === 200);

  const activeProjectsRes = await api.get("/assignments/active/list", {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert("GET /assignments/active/list status is 200", activeProjectsRes.status === 200);

  // 10. Notifications Flow
  console.log("\n[10] Notifications & Alerts");
  const broadcastRes = await api.post(
    "/notifications/broadcast/all",
    {
      title: "Test API Broadcast",
      message: "Automated test notification dispatch",
      type: "general",
      priority: "medium",
    },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  assert(
    "POST /notifications/broadcast/all status is 200 or 201",
    broadcastRes.status === 200 || broadcastRes.status === 201
  );

  const notificationsRes = await api.get("/notifications", {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert("GET /notifications status is 200", notificationsRes.status === 200);

  // 11. AI Assistant Chat
  console.log("\n[11] AI Assistant Chat Endpoint");
  const chatRes = await api.post(
    "/chat/message",
    {
      message: "How is my daily wage calculated on Rural Employment Hub?",
    },
    { headers: { Authorization: `Bearer ${empToken}` } }
  );
  assert("POST /chat/message status is 201", chatRes.status === 201);
  assert(
    "Assistant message returned",
    !!chatRes.data?.assistantMessage?.message,
    `returned: ${chatRes.data?.assistantMessage?.message?.slice(0, 50)}...`
  );

  // 12. Analytics Endpoints
  console.log("\n[12] Advanced Analytics Endpoints");
  const attAnalyticsRes = await api.get("/dashboard/analytics/attendance", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert("GET /dashboard/analytics/attendance status is 200", attAnalyticsRes.status === 200);

  const payAnalyticsRes = await api.get("/dashboard/analytics/payment", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert("GET /dashboard/analytics/payment status is 200", payAnalyticsRes.status === 200);

  console.log("\n==================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL API TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  }
};

runApiTests();
