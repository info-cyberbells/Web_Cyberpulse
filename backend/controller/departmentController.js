import Department from "../model/departmentModel.js";


export const createDepartment = async (req, res) => {
  console.log("Request Body:", req.body);

  try {
    const { department, position, organizationId } = req.body;

    const existingDepartment = await Department.findOne({ department, position });
    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department and position already exist",
      });
    }


    const newDepartment = new Department({
      department,
      position,
      organizationId,
    });


    const savedDepartment = await newDepartment.save();

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department: savedDepartment,
    });
  } catch (error) {
    console.error(`Error creating department: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error creating department",
      error: error.message,
    });
  }
};


export const getAllDepartments = async (req, res) => {
  try {
    const filter = {};

    if (req.query.organizationId) {
      filter.organizationId = req.query.organizationId;
    }

    const departments = await Department.find(filter);

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error(`Error fetching departments: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching departments",
      error: error.message,
    });
  }
};



export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    console.error(`Error fetching department: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching department",
      error: error.message,
    });
  }
};


export const updateDepartment = async (req, res) => {
  try {
    const { department, position } = req.body;

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      { department, position },
      { new: true, runValidators: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department: updatedDepartment,
    });
  } catch (error) {
    console.error(`Error updating department: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error updating department",
      error: error.message,
    });
  }
};


export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting department: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error deleting department",
      error: error.message,
    });
  }
};
