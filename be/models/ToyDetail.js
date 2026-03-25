const mongoose = require('mongoose');

const toyDetailSchema = new mongoose.Schema(
  {
    toyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Toy',
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    specifications: {
      material: String,
      size: String,
      weight: String,
      requiresBattery: Boolean,
    },
    ageRange: {
      type: String,
    },
    origin: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ToyDetail', toyDetailSchema);
