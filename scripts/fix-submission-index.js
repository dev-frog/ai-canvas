// Script to fix the duplicate key error by dropping the compound unique index
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '..', '.env');
let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match) {
    MONGODB_URI = match[1].trim();
  }
}

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable or in .env.local');
  process.exit(1);
}

async function fixIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    const collection = db.collection('submissions');

    // List all indexes
    console.log('\nCurrent indexes:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the problematic compound unique index
    const indexToDrop = 'assignmentId_1_studentId_1';
    console.log(`\nAttempting to drop index: ${indexToDrop}`);

    try {
      await collection.dropIndex(indexToDrop);
      console.log(`✓ Successfully dropped index: ${indexToDrop}`);
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log(`Index ${indexToDrop} not found (may have been already dropped)`);
      } else {
        throw error;
      }
    }

    // Show remaining indexes
    console.log('\nRemaining indexes:');
    const remainingIndexes = await collection.indexes();
    console.log(JSON.stringify(remainingIndexes, null, 2));

    console.log('\n✓ Index fix completed successfully!');

  } catch (error) {
    console.error('Error fixing index:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

fixIndex();
