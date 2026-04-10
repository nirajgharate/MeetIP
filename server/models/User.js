import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  mobileNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  // --- ADDED FIELDS FOR PROFILE FUNCTIONALITY ---
  avatar: {
    type: String, // Stores the Base64 string or Image URL
    default: ""
  },
  bio: {
    type: String,
    default: "No decryption key provided for bio. Add one to customize your presence."
  },
  profession: {
    type: String,
    default: ""
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { 
  timestamps: true 
});

// Auto-hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual field for stats
userSchema.virtual('stats').get(function() {
  return {
    connections: this.connections ? this.connections.length : 0,
    blocked: this.blockedUsers ? this.blockedUsers.length : 0,
    groups: 0 // Will be calculated from Chat model
  };
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);
export default User;