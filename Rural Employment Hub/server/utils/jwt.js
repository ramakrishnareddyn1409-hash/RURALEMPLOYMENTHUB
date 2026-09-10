import jwt from "jsonwebtoken";

// Sign JWT Token
export const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "rural_hub_jwt_secret_key_2026_secure",
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

// Verify JWT Token
export const verifyToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || "rural_hub_jwt_secret_key_2026_secure"
    );
  } catch (error) {
    return null;
  }
};

// Send JWT response
export const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  res.status(statusCode).json({
    status: "success",
    token,
    user: {
      id: user._id,
      _id: user._id,
      name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      parentId: user.parentId,
      adminCode: user.adminCode,
      adminTitle: user.adminTitle,
      employeeID: user.employeeID,
      profilePhoto: user.profilePhoto,
      village: user.village,
      mandal: user.mandal,
      district: user.district,
      state: user.state,
      dailyWage: user.dailyWage,
      isActive: user.isActive,
      fingerprintEnrolled: user.fingerprintEnrolled,
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      ifscCode: user.ifscCode,
    },
  });
};
