const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const models = {
  Booking: require('./models/Booking'),
  Inspection: require('./models/Inspection'),
  Invoice: require('./models/Invoice'),
  Rating: require('./models/Rating'),
  Toy: require('./models/Toy'),
  ToyDetail: require('./models/ToyDetail'),
  Transaction: require('./models/Transaction'),
  User: require('./models/User')
};

async function exportData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for export...');

    const dbDir = path.join(__dirname, 'DB');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir);
    }

    for (const [name, model] of Object.entries(models)) {
      const data = await model.find({});
      const fileName = `${name.charAt(0).toLowerCase() + name.slice(1)}s.json`;
      const filePath = path.join(dbDir, fileName);
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Exported ${data.length} records to ${fileName}`);
    }

    console.log('Export completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Export failed:', err);
    process.exit(1);
  }
}

exportData();
