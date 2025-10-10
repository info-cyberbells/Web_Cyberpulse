import mongoose from 'mongoose';
import Project from '../model/projectModel.js';
import Employee from '../model/employeeModel.js';
import Status from '../model/statusModel.js';
import Technology from '../model/technologyModel.js';
import Organization from '../model/organizationModel.js';

console.log('Inside project controller');

export const addProject = async (req, res) => {
    try {
        const {
            name,
            description,
            clientName,
            clientAddress,
            assignedTo,
            department,
            status,
            remarks,
            startDate,
            deliveryDate,
            urls,
            technology,
            organizationId,
        } = req.body;

        console.log('Request body:', req.body);


        if (organizationId) {
            if (!mongoose.Types.ObjectId.isValid(organizationId)) {
                return res.status(400).json({ error: 'Invalid organizationId format' });
            }
            // Optional: Verify if organizationId exists in Organization collection
            const orgExists = await Organization.findById(organizationId);
            if (!orgExists) {
                return res.status(400).json({ error: 'Organization not found' });
            }
        }

        const assignedToArray = Array.isArray(assignedTo) ? assignedTo : [];
        const technologyArray = Array.isArray(technology) ? technology : [];
        const statusArray = Array.isArray(status) ? status : [status];


        const technologyDetails = await Technology.find({ _id: { $in: technologyArray } }).select('_id name');
        console.log('Fetched technology details:', technologyDetails);


        const assignedToDetails = await Employee.find({ _id: { $in: assignedToArray } }).select('_id name');
        console.log('Fetched assignedTo details:', assignedToDetails);


        const statusDetails = await Status.find({ _id: { $in: statusArray } }).select('_id status_name');
        console.log('Fetched status details:', statusDetails);

        // Create new project
        const newProject = new Project({
            name,
            description,
            clientName,
            clientAddress,
            assignedTo: assignedToArray,
            status: statusArray,
            remarks,
            startDate,
            department,
            deliveryDate,
            urls,
            technology: technologyArray,
            ...(organizationId ? { organizationId } : {}),
        });


        const savedProject = await newProject.save();
        console.log('Saved project:', savedProject);


        const populatedProject = await getProjectDetails(savedProject._id);
        console.log('Fetched detailed project info:', populatedProject);

        if (!populatedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }


        const finalProjectResponse = {
            _id: savedProject._id,
            name: savedProject.name,
            description: savedProject.description,
            clientName: savedProject.clientName,
            department: savedProject.department,
            clientAddress: savedProject.clientAddress,
            assignedTo: assignedToDetails.map(emp => ({
                _id: emp._id,
                name: emp.name,
            })),
            status: statusDetails.map(st => ({
                _id: st._id,
                name: st.status_name,
            })),
            remarks: savedProject.remarks,
            startDate: savedProject.startDate,
            deliveryDate: savedProject.deliveryDate,
            urls: savedProject.urls,
            technology: technologyDetails.map(tech => ({
                _id: tech._id,
                name: tech.name,
            })),
            ...(savedProject.organizationId ? { organizationId: savedProject.organizationId.toString() } : {}),
            created_at: savedProject.createdAt,
        };

        console.log('Final project response:', finalProjectResponse);

        res.status(201).json({ success: true, data: finalProjectResponse });
    } catch (error) {
        console.error('Error in addProject:', error);
        res.status(400).json({ error: error.message });
    }
};

// Fetch Project Details
export const detailProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id); // Fetch Project by ID

        if (!project) {
            throw new Error('Project not found');
        }

        // Fetch employees
        const employees = await Employee.find({ _id: { $in: project.assignedTo } }, 'id name').lean();
        console.log('Employees Object:', employees);

        project.empNames = employees.map(employee => employee.name);

        // Fetch technologies
        const technologies = await Technology.find({ _id: { $in: project.technology } }, 'id name').lean();
        console.log('Technology Object:', technologies);

        project.techNames = technologies.map(technology => technology.name);

        // Fetch statuses
        const statuses = await Status.find({ _id: project.status }, 'id status_name').lean();
        console.log('Status Object:', statuses);

        project.statusNames = statuses.map(status => status.status_name);

        // Create the final response structure similar to addProject
        const finalProjectResponse = {
            id: project._id,
            name: project.name,
            description: project.description,
            clientName: project.clientName,
            clientAddress: project.clientAddress,
            assignedTo: employees.map(emp => ({
                _id: emp._id,
                name: emp.name
            })),
            status: statuses.map(st => ({
                _id: st._id,
                name: st.status_name
            })),
            remarks: project.remarks,
            startDate: project.startDate,
            deliveryDate: project.deliveryDate,
            urls: project.urls,
            technology: technologies.map(tech => ({
                _id: tech._id,
                name: tech.name
            })),
            created_at: project.created_at
        };

        console.log('Final project response:', finalProjectResponse);

        res.status(200).json({ success: true, data: finalProjectResponse });
    } catch (error) {
        console.error('Error in detailProject:', error);
        res.status(400).json({ error: error.message });
    }
};


// Fetch All Projects
export const fetchAllProjects = async (req, res) => {
    try {
        console.log("fetchAll");
        const { organizationId } = req.query;


        if (organizationId && !mongoose.Types.ObjectId.isValid(organizationId)) {
            return res.status(400).json({ success: false, error: 'Invalid organizationId format' });
        }


        const query = organizationId ? { organizationId: new mongoose.Types.ObjectId(organizationId) } : {};


        const projects = await Project.find(query).lean();

        const detailedProjects = await Promise.all(
            projects.map(async (project) => {
                const technologyDetails = await Technology.find({ _id: { $in: project.technology } }).select('_id name');
                const assignedToDetails = await Employee.find({ _id: { $in: project.assignedTo } }).select('_id name');
                const statusDetails = await Status.find({ _id: { $in: project.status } }).select('_id status_name');

                return {
                    _id: project._id,
                    name: project.name,
                    description: project.description,
                    clientName: project.clientName,
                    clientAddress: project.clientAddress,
                    assignedTo: assignedToDetails.map(emp => ({
                        _id: emp._id,
                        name: emp.name,
                    })),
                    status: statusDetails.map(st => ({
                        _id: st._id,
                        name: st.status_name,
                    })),
                    remarks: project.remarks,
                    startDate: project.startDate,
                    deliveryDate: project.deliveryDate,
                    department: project.department,
                    urls: project.urls,
                    technology: technologyDetails.map(tech => ({
                        _id: tech._id,
                        name: tech.name,
                    })),
                    ...(project.organizationId ? { organizationId: project.organizationId.toString() } : {}),
                    created_at: project.created_at,
                };
            })
        );

        res.status(200).json({ success: true, data: detailedProjects });
    } catch (error) {
        console.error('Error in fetchAllProjects:', error);
        res.status(400).json({ success: false, error: error.message });
    }
};



// Fetch Single Project
export const detailEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await getProjectDetails(id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getProjectDetails = async (projectId) => {
    try {
        // Fetch project details from the database
        const project = await Project.findById(projectId).populate('assignedTo technology');
        return project;
    } catch (error) {
        throw new Error('Error fetching project details: ' + error.message);
    }
};
export const updateProject = async (req, res) => {
    try {
        const { id } = req.params; // Fetch project ID from params
        const { name, description, clientName, status, technology, clientAddress, urls, remarks, startDate, deliveryDate, assignedTo, department } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Project ID is required' });
        }


        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (department) project.department = department;

        // Proceed with updates
        if (name) project.name = name;
        if (description) project.description = description;
        if (clientName) project.clientName = clientName;
        if (clientAddress) project.clientAddress = clientAddress;
        if (urls) project.urls = urls;
        if (startDate) project.startDate = startDate;
        if (deliveryDate) project.deliveryDate = deliveryDate;
        if (remarks) project.remarks = remarks;
        if (assignedTo) project.assignedTo = assignedTo; // Update assignedTo if provided
        if (status) project.status = status; // Update status if provided
        if (technology) project.technology = technology; // Update technology if provided
        if (department) project.department = department;

        const updatedProject = await project.save();

        // Fetch updated employee details
        const employees = await Employee.find({ _id: { $in: updatedProject.assignedTo } }, 'id name').lean();
        const assignedToDetails = employees.map(emp => ({
            _id: emp._id,
            name: emp.name
        }));

        // Fetch updated status details
        const statuses = await Status.find({ _id: updatedProject.status }, 'id status_name').lean();
        const statusDetails = statuses.map(st => ({
            _id: st._id,
            name: st.status_name
        }));

        // Fetch updated technology details
        const technologies = await Technology.find({ _id: { $in: updatedProject.technology } }, 'id name').lean();
        const technologyDetails = technologies.map(tech => ({
            _id: tech._id,
            name: tech.name
        }));

        // Create the final response structure
        const finalProjectResponse = {
            _id: updatedProject._id,
            name: updatedProject.name,
            description: updatedProject.description,
            clientName: updatedProject.clientName,
            clientAddress: updatedProject.clientAddress, // Assuming you have this field
            assignedTo: assignedToDetails,
            status: statusDetails,
            remarks: updatedProject.remarks, // Assuming you have this field
            startDate: updatedProject.startDate, // Assuming you have this field
            deliveryDate: updatedProject.deliveryDate, // Assuming you have this field
            urls: updatedProject.urls, // Assuming you have this field
            technology: technologyDetails,
            department: updatedProject.department,
            created_at: updatedProject.createdAt // Assuming you have this field
        };

        // Response structure remains consistent
        res.status(200).json({ success: true, data: finalProjectResponse });
    } catch (error) {
        console.error('Error in updateProject:', error);
        res.status(400).json({ error: error.message });
    }
};


export const deleteProject = async (req, res) => {
    console.log('Received request to delete project with ID:');
    const { id } = req.params; // Get project ID from route parameters
    console.log('Received request to delete project with ID:', id);

    try {
        if (!id) {
            console.error('Error: Project ID is required'); // Log the error
            return res.status(400).json({ error: 'Project ID is required' });
        }

        const deletedProject = await Project.findByIdAndDelete(id);
        if (!deletedProject) {
            console.error('Error: Project not found for ID:', id); // Log if not found
            return res.status(404).json({ error: 'Project not found' });
        }

        console.log('Successfully deleted project with ID:', id); // Log success
        res.status(200).json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error in deleteProject:', error); // Log any other errors
        res.status(400).json({ error: error.message });
    }
};

