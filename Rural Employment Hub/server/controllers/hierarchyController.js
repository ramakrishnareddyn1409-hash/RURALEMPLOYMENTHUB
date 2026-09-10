import District from "../models/District.js";
import Mandal from "../models/Mandal.js";
import Village from "../models/Village.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import { logAdminAction } from "../utils/auditLogger.js";

// Get all districts with aggregated statistics
export const getDistricts = async (req, res) => {
  try {
    let districts = await District.find().sort({ name: 1 });
    
    // If no districts in database, auto-initialize default districts
    if (districts.length === 0) {
      const initialDistricts = [
        { name: "Kurnool", code: "KRN", state: "Andhra Pradesh", totalMandals: 12, totalVillages: 54, totalWorkers: 1240 },
        { name: "Anantapur", code: "ATP", state: "Andhra Pradesh", totalMandals: 10, totalVillages: 48, totalWorkers: 980 },
        { name: "YSR Kadapa", code: "KDP", state: "Andhra Pradesh", totalMandals: 14, totalVillages: 62, totalWorkers: 1420 },
        { name: "Chittoor", code: "CTR", state: "Andhra Pradesh", totalMandals: 15, totalVillages: 70, totalWorkers: 1650 },
        { name: "Guntur", code: "GNT", state: "Andhra Pradesh", totalMandals: 18, totalVillages: 85, totalWorkers: 2100 },
      ];
      districts = await District.insertMany(initialDistricts);
    }

    res.status(200).json({
      success: true,
      count: districts.length,
      data: districts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get mandals, optionally filtered by district
export const getMandals = async (req, res) => {
  try {
    const { district } = req.query;
    const filter = district ? { district: new RegExp(`^${district}$`, "i") } : {};
    let mandals = await Mandal.find(filter).sort({ name: 1 });

    if (mandals.length === 0 && (!district || district.toLowerCase() === "kurnool")) {
      const initialMandals = [
        { name: "Dhone", code: "DHN", district: "Kurnool", totalVillages: 8, totalWorkers: 320 },
        { name: "Bethamcherla", code: "BTM", district: "Kurnool", totalVillages: 6, totalWorkers: 210 },
        { name: "Nandyal", code: "NDL", district: "Kurnool", totalVillages: 9, totalWorkers: 390 },
        { name: "Allagadda", code: "ALG", district: "Kurnool", totalVillages: 7, totalWorkers: 280 },
        { name: "Koilkuntla", code: "KLT", district: "Kurnool", totalVillages: 6, totalWorkers: 240 },
      ];
      await Mandal.insertMany(initialMandals);
      mandals = await Mandal.find(filter).sort({ name: 1 });
    }

    res.status(200).json({
      success: true,
      count: mandals.length,
      data: mandals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get villages, optionally filtered by mandal or district
export const getVillages = async (req, res) => {
  try {
    const { mandal, district } = req.query;
    const filter = {};
    if (mandal) filter.mandal = new RegExp(`^${mandal}$`, "i");
    if (district) filter.district = new RegExp(`^${district}$`, "i");

    let villages = await Village.find(filter).sort({ name: 1 });

    if (villages.length === 0 && (!mandal || mandal.toLowerCase() === "dhone")) {
      const initialVillages = [
        { name: "Kothapalli", code: "KTP", mandal: "Dhone", district: "Kurnool", panchayat: "Kothapalli GP", totalWorkers: 85 },
        { name: "Venkatapuram", code: "VKP", mandal: "Dhone", district: "Kurnool", panchayat: "Venkatapuram GP", totalWorkers: 64 },
        { name: "Ramapuram", code: "RMP", mandal: "Dhone", district: "Kurnool", panchayat: "Ramapuram GP", totalWorkers: 92 },
        { name: "Pedda Vangali", code: "PVN", mandal: "Dhone", district: "Kurnool", panchayat: "Pedda Vangali GP", totalWorkers: 58 },
        { name: "Chinna Malkapuram", code: "CMK", mandal: "Dhone", district: "Kurnool", panchayat: "Chinna Malkapuram GP", totalWorkers: 45 },
      ];
      await Village.insertMany(initialVillages);
      villages = await Village.find(filter).sort({ name: 1 });
    }

    res.status(200).json({
      success: true,
      count: villages.length,
      data: villages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new district (State Admin only)
export const createDistrict = async (req, res) => {
  try {
    const { name, code, state } = req.body;
    const district = await District.create({ name, code, state });

    await logAdminAction({
      req,
      action: "CREATE_DISTRICT",
      targetType: "District",
      targetId: district._id,
      targetDetails: `Created district ${name} (${code})`,
    });

    res.status(201).json({ success: true, data: district });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Create a new mandal (State/Assistant Admin)
export const createMandal = async (req, res) => {
  try {
    const { name, code, district } = req.body;
    const mandal = await Mandal.create({ name, code, district });

    await logAdminAction({
      req,
      action: "CREATE_MANDAL",
      targetType: "Mandal",
      targetId: mandal._id,
      targetDetails: `Created mandal ${name} in district ${district}`,
    });

    res.status(201).json({ success: true, data: mandal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Create a new village
export const createVillage = async (req, res) => {
  try {
    const { name, code, mandal, district, panchayat } = req.body;
    const village = await Village.create({ name, code, mandal, district, panchayat });

    await logAdminAction({
      req,
      action: "CREATE_VILLAGE",
      targetType: "Village",
      targetId: village._id,
      targetDetails: `Created village ${name} in mandal ${mandal}, district ${district}`,
    });

    res.status(201).json({ success: true, data: village });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get Audit Logs (State Admin & Assistant Admin)
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, role } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (role) filter.role = role;

    // Assistant admin can only see logs relevant to their tier
    if (req.user.role === "assistant_admin") {
      filter.role = { $in: ["assistant_admin", "field_admin"] };
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await AuditLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
