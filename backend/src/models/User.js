const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, default: 0 },
    size: { type: String, default: '' },
    color: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'LUXE Fashion' },
    contactEmail: { type: String, default: 'admin@luxe.com' },
    currency: { type: String, default: 'USD' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    addresses: {
      type: [
        {
          label: { type: String, default: '' },
          name: { type: String, default: '' },
          street: { type: String, default: '' },
          city: { type: String, default: '' },
          state: { type: String, default: '' },
          zip: { type: String, default: '' },
          country: { type: String, default: '' },
          isDefault: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    cart: {
      type: [cartItemSchema],
      default: [],
    },
    wishlist: {
      type: [String],
      default: [],
    },
    storeSettings: {
      type: storeSettingsSchema,
      default: () => ({
        storeName: 'LUXE Fashion',
        contactEmail: 'admin@luxe.com',
        currency: 'USD',
      }),
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);