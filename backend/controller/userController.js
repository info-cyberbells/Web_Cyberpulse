import User from '../model/authModel.js';

import bcrypt from 'bcryptjs';


export const addUser = async (req, res) => {
  console.log('Request Body:', req.body);

  try {
      const { name, email, password, department, joiningDate, dob, jobRole,  address, country, city, phone, type, pincode, state, status, created_at, updated_at } = req.body;
      
      // Check if the email already exists
      const existingUser = await Employee.findOne({ email });
      if (existingUser) 
      {
          return res.status(400).json({ error: 'Email already exists' });
      }
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ 
          name, 
          email, 
          password: hashedPassword, 
          department,
          joiningDate,
          jobRole,
          dob,
          type,
          address, 
          country, 
          phone, 
          city, 
          pincode, 
          state, 
          status, 
          created_at, 
          updated_at
      });

      // Save the user to the database
      const savedUser = await newUser.save();

      // Create a user object without the password
      const userWithoutPassword = {
          _id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          
          department: savedUser.department,
          joiningDate: savedUser.joiningDate,
          jobRole: savedUser.jobRole,
          dob: savedUser.dob,


          address: savedUser.address,
          country: savedUser.country,
          phone: savedUser.phone,
          city: savedUser.city,
          pincode: savedUser.pincode,
          
          state: savedUser.state,
          status: savedUser.status,
          created_at: savedUser.created_at,
          updated_at: savedUser.updated_at
      };

      // Send the user details in the response
      res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });
  } 
  catch (error) {
      res.status(400).json({ error: error.message });
  }
};


// In your user controller (e.g., userController.js)
export const fetchAllUser = async (req, res) => {
  try {
      // Fetch all users and populate the 'churchId' field with corresponding church names
      const users = await User.find()
          .select('-password'); // Populate churchId with the church name

      // Return the users in the response
      res.json(users);
  }
   catch (error) {
      res.status(500).json({ message: error.message });
  }
};



export const fetchUserType = async (req, res) => {
  try {
      // Get the user type from request parameters
      const userType = req.params.type; 
      
      // Find users of the specified type and populate the churchId field with only the _id
      const users = await User.find({ type: userType }).populate('churchId', '_id'); 
      
      // Map through users to format the response
      const formattedUsers = users.map(user => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          churchId: user.churchId ? user.churchId._id : null, // Check if churchId is defined
          address: user.address,
          country: user.country,
          state: user.state,
          city: user.city,
          pincode: user.pincode,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at
      }));

      // Send the formatted user data as the response
      res.json(formattedUsers);
  } catch (error) {
      // Handle errors and send an error response
      res.status(500).json({ message: error.message });
  }
};



  

export const detailUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch user by ID and exclude the 'password' field
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // If the password is being updated, hash it
    if (updateFields.password) {
      updateFields.password = await bcrypt.hash(updateFields.password, 10);
    }

    // Update only the fields provided in the request
    const updatedUser = await User.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from the updated user object before sending it in the response
    const { password, ...userWithoutPassword } = updatedUser.toObject();

    res.status(200).json({ message: 'User updated successfully', user: userWithoutPassword });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await User.findByIdAndDelete(id);
  
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  