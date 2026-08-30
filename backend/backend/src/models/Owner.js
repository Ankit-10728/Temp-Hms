const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  alternateMobile: { type: String },
  email: { type: String }, 
  govtId: { type: String }, 
  address: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Owner', ownerSchema);