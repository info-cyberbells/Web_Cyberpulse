import User from '../model/authModel.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads'); // Use the equivalent of __dirname
const BASE_URL = '/uploads/'; // Set your base URL for image access

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // or your desired upload directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Append unique name
    }
});

// Initialize multer
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // Limit set to 10MB


// View Profile
export const viewProfile = async (req, res) => {
    try {
        const userId = req.params.id; 
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return user details excluding the password
        res.status(200).json({ user: { 
            id: user._id, 
            firstName: user.firstName, 
             lastName: user.lastName, 
            email: user.email, 
            address: user.address,
            country: user.country,
            phone: user.phone,
            pincode: user.pincode,
            state: user.state,
            city: user.city,
            type: user.type,
            status: user.status,
            image: user.image // Return the user's image
        }});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Handle Base64 Image Function
const handleBase64Image = async (imageurl, userId) => {
    const matches = imageurl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        console.error("Invalid base64 string format.");
        return { error: true, message: "Invalid base64 string" };
    }

    const imageType = matches[1];
    const imageBase64 = matches[2];
    const imageFileName = `${userId}_${Date.now()}.${imageType}`;
    const imagePath = path.join(uploadDir, imageFileName);

    try {
        console.log("Saving image to:", imagePath);
        fs.writeFileSync(imagePath, imageBase64, "base64");
        console.log("Image successfully written:", imageFileName);
    } catch (error) {
        console.error("Error writing the file:", error);
        return { error: true, message: "Failed to save image." };
    }

    const newImagePath = `${BASE_URL}${imageFileName}`;
    console.log("New image path for database:", newImagePath);
    return { imagePath: newImagePath };
};

// Updated updateProfile method to check for image input
export const updateProfile = async (req, res) => {
    try {
        console.log("Request Body:", req.body);

        const userId = req.params.id;
        const { 
            firstName, lastName, email, address, country, phone, 
            pincode, state, city, type, status, image 
        } = req.body;

        let newImagePath = null;

        // Handle base64 image if provided
        if (image) {
            const result = await handleBase64Image(image, userId);
            if (result.error) {
                return res.status(400).json({ message: result.message });
            }
            newImagePath = result.imagePath;
            console.log("New Image Path:", newImagePath);
        } else {
            console.log("No image provided in the request body.");
        }

        // Update the user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                firstName, lastName, email, address, country, phone, 
                pincode, state, city, type, status, 
                ...(newImagePath && { image: newImagePath }) 
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            console.error("User not found during update.");
            return res.status(404).json({ message: 'User not found' });
        }

        const fullUrl = req.protocol + '://' + req.get('host');
        const imageFullPath = updatedUser.image ? `${fullUrl}${updatedUser.image}` : null;

        res.status(200).json({ 
            message: 'Profile updated successfully', 
            user: { 
                id: updatedUser._id, 
                firstName: updatedUser.firstName, 
                lastName: updatedUser.lastName,
                email: updatedUser.email, 
                address: updatedUser.address,
                country: updatedUser.country,
                phone: updatedUser.phone,
                pincode: updatedUser.pincode,
                state: updatedUser.state,
                city: updatedUser.city,
                type: updatedUser.type,
                status: updatedUser.status,
                image: imageFullPath 
            }
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(400).json({ error: error.message });
    }
};




// Update Profile (with image upload)
export const Profile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { firstName, lastName, email, address, country, phone, pincode, state, city, type, status } = req.body;

        // Handle the image upload (store relative path in the DB)
        let imagePath;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`; // Only save relative path in the database
            console.log('Image Path:', imagePath); // Log the image path
        }

        // Update the user profile, including the image path if provided
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                firstName,
                lastName,
                email,
                address, 
                country, 
                phone, 
                pincode, 
                state, 
                city, 
                type, 
                status, 
                ...(imagePath && { image: imagePath }) // Only update the image if provided
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate full image URL only for the response
        const fullUrl = req.protocol + '://' + req.get('host'); // Full URL (e.g., http://localhost:5500)
        const imageFullPath = updatedUser.image ? `${fullUrl}${updatedUser.image}` : null; // Combine full URL with stored relative path

        // Send back all user fields in the response
        res.status(200).json({ 
            message: 'Profile updated successfully', 
            user: { 
                id: updatedUser._id, 
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,  
                email: updatedUser.email, 
                address: updatedUser.address,
                country: updatedUser.country,
                phone: updatedUser.phone,
                pincode: updatedUser.pincode,
                state: updatedUser.state,
                city: updatedUser.city,
                type: updatedUser.type,
                status: updatedUser.status,
                image: imageFullPath // Send the full image path in the response
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



// Change Password
export const changePassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        // Hash the new password and save it
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Route handler for uploading profile image (for updating profile)
export const uploadProfileImage = upload.single('image'); // Middleware to handle single image upload


// import User from '../model/authModel.js';
// import bcrypt from 'bcrypt';
// import multer from 'multer';
// import path from 'path';

// // Set up storage for uploaded images
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Save files in the 'uploads' folder
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + path.extname(file.originalname)); // Append unique name to the file
//     }
// });

// // Initialize multer with the storage settings
// const upload = multer({ storage: storage });

// // View Profile
// export const viewProfile = async (req, res) => {
//     try {
//         const userId = req.params.id; 
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         // Return user details excluding the password
//         res.status(200).json({ user: { 
//             id: user._id, 
//             name: user.name, 
//             email: user.email, 
//             address: user.address,
//             country: user.country,
//             phone: user.phone,
//             pincode: user.pincode,
//             state: user.state,
//             city: user.city,
//             type: user.type,
//             status: user.status,
//             image: user.image // Return the user's image
//         }});
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Update Profile (with image upload)
// export const updateProfile = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const { firstName, lastName, email, address, country, phone, pincode, state, suburb, type, status,image } = req.body;

//         // Handle the image upload
//         console.log(image)
//         let imagePath;
//         if (image) {
//             const fullUrl = req.protocol + '://' + req.get('host'); // Get full URL (http://localhost:5500)
//             imagePath = `${fullUrl}/uploads/${req.file.filename}`; // Save full path in the database
//         }

//         // Update the user profile, including the image path if provided
//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             { 
//                 firstName,
//                 lastName, 
//                 email, 
//                 address, 
//                 country, 
//                 phone, 
//                 pincode, 
//                 state, 
//                 suburb, 
//                 type, 
//                 status, 
//                 ...(imagePath && { image: imagePath }) // Only update the image if provided
//             },
//             { new: true, runValidators: true }
//         );

//         if (!updatedUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Send back all user fields in the response
//         res.status(200).json({ 
//             message: 'Profile updated successfully', 
//             user: { 
//                 id: updatedUser._id, 
//                 firstName: updatedUser.firstName, 
//                 lastName: updatedUser.lastName, 

//                 email: updatedUser.email, 
//                 address: updatedUser.address,
//                 country: updatedUser.country,
//                 phone: updatedUser.phone,
//                 pincode: updatedUser.pincode,
//                 state: updatedUser.state,
//                 suburb: updatedUser.suburb,
//                 type: updatedUser.type,
//                 status: updatedUser.status,
//                 image: updatedUser.image // Include the image path in the response
//             }
//         });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };


// // Change Password
// export const changePassword = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const { currentPassword, newPassword } = req.body;

//         const user = await User.findById(userId);

//         if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
//             return res.status(401).json({ message: 'Invalid current password' });
//         }

//         // Hash the new password and save it
//         const hashedPassword = await bcrypt.hash(newPassword, 10);
//         user.password = hashedPassword;
//         await user.save();

//         res.status(200).json({ message: 'Password updated successfully' });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

// // Route handler for uploading profile image (for updating profile)
// export const uploadProfileImage = upload.single('image'); // Middleware to handle single image upload
