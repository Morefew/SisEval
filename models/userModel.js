import mongoose from 'mongoose';

// Nested Schemas remain the same for clean organization
const PreferencesSchema = new mongoose.Schema({
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'pt']
  },
  timezone: {
    type: String,
    required: true
  },
  notifications: {
    type: Boolean,
    default: true
  }
});

const PersonalInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  }
});

const SubscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'enterprise']
  },
  startDate: {
    type: Date,
    required: true
  },
  renewalDate: {
    type: Date,
    required: true
  }
});

// Main User Schema - flattened structure
const UserSchema = new mongoose.Schema({
  // Identification
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },

  // Basic Info
  isActive: {
    type: Boolean,
    default: true
  },
  accountType: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  age: {
    type: Number,
    min: 13,
    max: 120
  },

  // Arrays
  favoriteColors: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']
  },
  deviceIds: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']
  },
  loginHistory: {
    type: [Date],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']
  },
  savedAddresses: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']
  },
  recentPurchases: {
    type: [Number],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']
  },

  // Complex Objects
  preferences: PreferencesSchema,
  personalInfo: PersonalInfoSchema,
  subscription: SubscriptionSchema,

  // Timestamps
  lastLoginDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret, options) {
      // Get access level from options
      const accessLevel = options.accessLevel || 'generalUser';

      // Base object for all levels
      const transformed = {
        username: ret.username,
        isActive: ret.isActive,
        accountType: ret.accountType,
        favoriteColors: ret.favoriteColors,
        preferences: ret.preferences
      };

      // Add Administrative Assistant level fields
      if (['adminAssistant', 'administrator'].includes(accessLevel)) {
        Object.assign(transformed, {
          lastLoginDate: ret.lastLoginDate,
          deviceIds: ret.deviceIds,
          loginHistory: ret.loginHistory,
          savedAddresses: ret.savedAddresses,
          personalInfo: ret.personalInfo
        });
      }

      // Add Administrator level fields
      if (accessLevel === 'administrator') {
        Object.assign(transformed, {
          userId: ret.userId,
          email: ret.email,
          age: ret.age,
          recentPurchases: ret.recentPurchases,
          subscription: ret.subscription
        });
      }

      return transformed;
    }
  }
});

// Array limit validator function
function arrayLimit(val) {
  return val.length <= 5;
}

// Helper method to get user data based on access level
UserSchema.methods.getDataForAccessLevel = function(accessLevel) {
  return this.toJSON({ accessLevel });
};


export default mongoose.model('User', UserSchema);