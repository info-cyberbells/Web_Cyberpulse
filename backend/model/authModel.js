import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String},
    email: { type: String, unique: true },
    password: { type: String},
    address: { type: String, },
    country: { type: String,  },
    phone: { type: String,  },
    pincode: { type: String,  },
    state: { type: String,  },
    city: { type: String,  },
    type: { type: String,  },
    image: { type: String,  },
    status: { type: String,  },
    
    created_at: { type: Date, default: Date.now },              
    updated_at: { type: Date, default: Date.now },  
   
});

const User = mongoose.model('users', UserSchema, 'users');
export default User;
