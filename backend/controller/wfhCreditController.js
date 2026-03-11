import WfhCredit from "../model/wfhCreditModel.js";
import Employee from "../model/employeeModel.js";

// Calculate total credits based on criteria
const calculateCredits = (criteria) => {
  let total = 0;
  if (criteria.targetAchievement?.status) total += 2;
  if (criteria.attendance?.status) total += 1;
  if (criteria.clientAppreciation?.status) total += 1;
  if (criteria.teamwork?.status) total += 1;
  return total;
};

// Validate that all criteria have reasons
const validateCriteria = (criteria) => {
  const fields = ["targetAchievement", "attendance", "clientAppreciation", "teamwork"];
  for (const field of fields) {
    if (!criteria[field] || typeof criteria[field].status !== "boolean") {
      return `${field} status is required and must be true or false`;
    }
    if (!criteria[field].reason || criteria[field].reason.trim() === "") {
      return `${field} reason is required`;
    }
  }
  return null;
};

// POST /api/wfh-credit/evaluate
export const evaluateCredits = async (req, res) => {
  try {
    const { employeeId, month, year, criteria } = req.body;
    const evaluatorId = req.user.id;

    if (!employeeId || !month || !year || !criteria) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate evaluator role (type 1=Admin, 3=TL, 4=HR, 5=Manager)
    const evaluator = await Employee.findById(evaluatorId);
    if (!evaluator || ![1, 3, 4, 5].includes(evaluator.type)) {
      return res.status(403).json({ message: "Only Admin, TL, HR or Manager can evaluate credits" });
    }

    // Validate target employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Validate all criteria have reasons
    const validationError = validateCriteria(criteria);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const totalCredits = calculateCredits(criteria);
    const isEligible = totalCredits === 5;

    const wfhCredit = await WfhCredit.findOneAndUpdate(
      { employeeId, month, year },
      {
        employeeId,
        evaluatorId,
        month,
        year,
        criteria,
        totalCredits,
        isEligible,
        organizationId: employee.organizationId,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      message: isEligible
        ? "Employee is eligible for WFH next month"
        : "Employee is not eligible for WFH next month",
      data: wfhCredit,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Credits already evaluated for this employee for the given month" });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/wfh-credit/employee/:employeeId
export const getEmployeeCredits = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    const query = { employeeId };
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const credits = await WfhCredit.find(query)
      .populate("evaluatorId", "name email")
      .populate("employeeId", "name email department image")
      .sort({ year: -1, month: -1 });

    return res.status(200).json({ data: credits });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/wfh-credit/all?month=&year=
export const getAllCredits = async (req, res) => {
  try {
    const { month, year, organizationId } = req.query;

    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (organizationId) query.organizationId = organizationId;

    const credits = await WfhCredit.find(query)
      .populate("evaluatorId", "name email")
      .populate("employeeId", "name email department image")
      .sort({ year: -1, month: -1 });

    return res.status(200).json({ data: credits });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/wfh-credit/my-credits
export const getMyCredits = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const credits = await WfhCredit.find({ employeeId })
      .populate("evaluatorId", "name email")
      .sort({ year: -1, month: -1 });

    return res.status(200).json({ data: credits });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
