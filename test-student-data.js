// Test script to check student data in database
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function testStudentData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // Import models
    const User = require('./src/lib/models/User').default;
    const Assignment = require('./src/lib/models/Assignment').default;
    const Submission = require('./src/lib/models/Submission').default;
    const Class = require('./src/lib/models/Class').default;

    // Find a student user
    console.log('\n=== Finding Student Users ===');
    const students = await User.find({ role: 'student' }).limit(5);
    console.log(`Found ${students.length} students`);

    if (students.length === 0) {
      console.log('No students found in database!');
      await mongoose.connection.close();
      return;
    }

    const student = students[0];
    console.log('\nStudent:', {
      id: student._id,
      name: student.name,
      email: student.email,
      classes: student.classes,
    });

    // Check classes
    console.log('\n=== Checking Classes ===');
    if (student.classes && student.classes.length > 0) {
      const classes = await Class.find({ _id: { $in: student.classes } });
      console.log(`Student is in ${classes.length} classes:`);
      classes.forEach(c => {
        console.log(`  - ${c.name} (${c._id})`);
      });
    } else {
      console.log('Student has NO classes assigned!');
    }

    // Check assignments
    console.log('\n=== Checking Assignments ===');
    if (student.classes && student.classes.length > 0) {
      const assignments = await Assignment.find({
        classId: { $in: student.classes },
        isPublished: true,
      });
      console.log(`Found ${assignments.length} published assignments in student's classes`);
      assignments.forEach(a => {
        console.log(`  - ${a.title} (Due: ${a.dueDate})`);
      });
    } else {
      console.log('Cannot check assignments - student has no classes');
    }

    // Check submissions
    console.log('\n=== Checking Submissions ===');
    const submissions = await Submission.find({ studentId: student._id });
    console.log(`Found ${submissions.length} submissions for this student`);
    submissions.forEach(sub => {
      console.log(`  - ${sub.title} [${sub.status}] (Assignment: ${sub.assignmentId || 'none'})`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testStudentData();
