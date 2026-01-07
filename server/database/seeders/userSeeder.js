const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const colors = require('colors');

// Load env vars
dotenv.config();

// Load User Model
const User = require('../../models/User');

// Unique student names pool (360 unique names for 9 grades × 40 students)
const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Reyansh', 'Aadhya', 'Ananya', 'Pari', 'Anika', 'Sara',
    'Diya', 'Ira', 'Myra', 'Navya', 'Saanvi', 'Aarohi', 'Kiara', 'Riya', 'Shanaya', 'Anvi',
    'Prisha', 'Avni', 'Ishita', 'Kavya', 'Siya', 'Aryan', 'Dhruv', 'Kabir', 'Rohan', 'Yash',
    'Advait', 'Arush', 'Darsh', 'Kian', 'Laksh', 'Mihir', 'Nirvaan', 'Rudra', 'Veer', 'Viraj',
    'Aadhira', 'Ahana', 'Alisha', 'Amaya', 'Anushka', 'Aradhya', 'Charvi', 'Drishti', 'Hiya', 'Isha',
    'Janvi', 'Kashvi', 'Khushi', 'Mahika', 'Manya', 'Nisha', 'Pihu', 'Rashi', 'Riddhi', 'Samaira',
    'Tanvi', 'Vanya', 'Zara', 'Aayan', 'Aarush', 'Abhinav', 'Advay', 'Agastya', 'Akarsh', 'Anirudh',
    'Aryan', 'Ayush', 'Daksh', 'Devansh', 'Divyansh', 'Eshaan', 'Gaurav', 'Harsh', 'Ishan', 'Jai',
    'Karthik', 'Krish', 'Manav', 'Naman', 'Om', 'Parth', 'Pratham', 'Raghav', 'Ranbir', 'Rishabh',
    'Ritvik', 'Samar', 'Shivansh', 'Tanish', 'Tejas', 'Utkarsh', 'Varun', 'Ved', 'Yuvraj', 'Aadhya',
    'Aanya', 'Aditi', 'Aisha', 'Akshara', 'Anaya', 'Anjali', 'Arya', 'Bhavya', 'Divya', 'Gargi',
    'Gauri', 'Ira', 'Jiya', 'Kaira', 'Keya', 'Kriti', 'Lavanya', 'Maahi', 'Meera', 'Mishka',
    'Naina', 'Neha', 'Nitya', 'Palak', 'Pooja', 'Prachi', 'Pragya', 'Radhika', 'Rhea', 'Ruhi',
    'Sakshi', 'Sanvi', 'Shalini', 'Shreya', 'Simran', 'Sneha', 'Tanya', 'Trisha', 'Vaani', 'Vidya',
    'Zoya', 'Aarav', 'Aayush', 'Abhay', 'Aditya', 'Akash', 'Aman', 'Amit', 'Ankit', 'Arjun', 'Ashish',
    'Chirag', 'Dev', 'Dhruv', 'Dinesh', 'Hardik', 'Hemant', 'Karan', 'Kartik', 'Kunal', 'Mayank',
    'Mohit', 'Nakul', 'Nikhil', 'Piyush', 'Pranav', 'Rahul', 'Raj', 'Ravi', 'Rohit', 'Sanjay',
    'Shubham', 'Siddharth', 'Sumit', 'Suresh', 'Tarun', 'Tushar', 'Uday', 'Vijay', 'Vikas', 'Vinay',
    'Aanchal', 'Aditi', 'Akanksha', 'Amrita', 'Anita', 'Ankita', 'Aparna', 'Archana', 'Arpita', 'Ashwini',
    'Bhavana', 'Chitra', 'Deepa', 'Deepika', 'Geeta', 'Harini', 'Heena', 'Jaya', 'Jyoti', 'Kajal',
    'Kamala', 'Kavita', 'Kiran', 'Komal', 'Lata', 'Madhuri', 'Manisha', 'Megha', 'Monika', 'Namita',
    'Nandini', 'Neelam', 'Nikita', 'Nisha', 'Payal', 'Poonam', 'Priya', 'Rachna', 'Radha', 'Rajni',
    'Rakhi', 'Rani', 'Rekha', 'Renuka', 'Rita', 'Ritu', 'Roshni', 'Rupali', 'Sadhana', 'Sangeeta',
    'Sapna', 'Sarita', 'Savita', 'Seema', 'Shanti', 'Shikha', 'Shilpa', 'Shobha', 'Shruti', 'Sita',
    'Smita', 'Sonal', 'Sonia', 'Sudha', 'Sunita', 'Supriya', 'Swati', 'Tanuja', 'Usha', 'Vandana',
    'Varsha', 'Veena', 'Vidya', 'Vijaya', 'Vinita', 'Yamini', 'Aarav', 'Aayush', 'Abhimanyu', 'Aditya',
    'Ajay', 'Akshay', 'Aman', 'Amol', 'Anand', 'Anil', 'Aniket', 'Ankur', 'Anmol', 'Anuj', 'Arjun',
    'Arvind', 'Ashok', 'Atul', 'Bharat', 'Chandan', 'Deepak', 'Ganesh', 'Gautam', 'Gopal', 'Harish',
    'Hemant', 'Jagdish', 'Kailash', 'Kamal', 'Kapil', 'Keshav', 'Kishore', 'Krishna', 'Lalit', 'Lokesh',
    'Mahesh', 'Manoj', 'Mukesh', 'Naresh', 'Naveen', 'Nitin', 'Pankaj', 'Prakash', 'Prashant', 'Praveen',
    'Rajeev', 'Rajesh', 'Rakesh', 'Ramesh', 'Ranjan', 'Ravi', 'Sachin', 'Sandeep', 'Sanjay', 'Santosh',
    'Satish', 'Shailesh', 'Sharad', 'Shashi', 'Shekhar', 'Shyam', 'Sudhir', 'Sunil', 'Suraj', 'Surendra',
    'Suresh', 'Umesh', 'Vijay', 'Vikram', 'Vinod', 'Vishal', 'Yash', 'Yogesh'
];

const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Rao', 'Nair', 'Menon',
    'Iyer', 'Joshi', 'Desai', 'Shah', 'Mehta', 'Agarwal', 'Bansal', 'Malhotra', 'Kapoor', 'Chopra',
    'Bhatia', 'Sethi', 'Arora', 'Khanna', 'Sinha', 'Jain', 'Agrawal', 'Mittal', 'Goyal', 'Saxena',
    'Pandey', 'Mishra', 'Tiwari', 'Dubey', 'Tripathi', 'Chaturvedi', 'Shukla', 'Dixit', 'Jha', 'Thakur',
    'Chauhan', 'Rathore', 'Rajput', 'Yadav', 'Bisht', 'Rawat', 'Bhatt', 'Joshi', 'Upadhyay', 'Pathak'
];

// Function to generate unique student name
const generateUniqueName = (usedNames, grade, index) => {
    let attempts = 0;
    let name;

    do {
        const firstNameIndex = (parseInt(grade) - 4) * 40 + index + attempts;
        const lastNameIndex = Math.floor(firstNameIndex / firstNames.length);

        const firstName = firstNames[firstNameIndex % firstNames.length];
        const lastName = lastNames[lastNameIndex % lastNames.length];

        name = `${firstName} ${lastName}`;
        attempts++;
    } while (usedNames.has(name) && attempts < 100);

    usedNames.add(name);
    return name;
};

// Function to seed students
const seedStudents = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...'.cyan);
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ Connected to ${mongoose.connection.host}`.green.bold);

        // Hash password once for all students
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('student123', salt);

        const grades = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
        const studentsToCreate = [];
        const usedNames = new Set();
        const usedEmails = new Set();

        console.log('\n📚 Generating 40 unique students per grade (4-12)...'.yellow);

        for (const grade of grades) {
            console.log(`\n  Grade ${grade}:`.cyan);

            for (let i = 0; i < 40; i++) {
                const name = generateUniqueName(usedNames, grade, i);

                // Generate unique email
                const emailBase = name.toLowerCase().replace(/\s+/g, '.');
                let email = `${emailBase}.grade${grade}@ecominds.edu`;
                let emailCounter = 1;

                while (usedEmails.has(email)) {
                    email = `${emailBase}${emailCounter}.grade${grade}@ecominds.edu`;
                    emailCounter++;
                }
                usedEmails.add(email);

                // Generate unique school ID
                const schoolID = `ECO-${grade}-${String(i + 1).padStart(3, '0')}`;

                // Random points and streak for variety
                const points = Math.floor(Math.random() * 3000) + 100;
                const streak = Math.floor(Math.random() * 30);

                studentsToCreate.push({
                    name,
                    email,
                    password: hashedPassword,
                    role: 'student',
                    schoolID,
                    grade,
                    points,
                    streak,
                    isApproved: true,
                    badges: [],
                    achievements: []
                });

                // Progress indicator
                if ((i + 1) % 10 === 0) {
                    process.stdout.write(`    ✓ ${i + 1}/40 students generated\r`);
                }
            }
            console.log(`    ✅ ${40}/40 students generated for Grade ${grade}`.green);
        }

        console.log(`\n🗑️  Removing existing student accounts...`.yellow);
        const deleteResult = await User.deleteMany({ role: 'student' });
        console.log(`   Deleted ${deleteResult.deletedCount} existing students`.gray);

        console.log(`\n💾 Inserting ${studentsToCreate.length} new students into database...`.yellow);
        await User.insertMany(studentsToCreate);

        console.log(`\n✅ Successfully seeded ${studentsToCreate.length} students!`.green.bold);
        console.log(`   📊 Distribution: 40 students × 9 grades (4-12)`.cyan);
        console.log(`   🔐 Default password for all students: student123`.yellow);
        console.log(`   📧 Email format: firstname.lastname.gradeX@ecominds.edu`.gray);
        console.log(`   🆔 School ID format: ECO-X-XXX (where X is grade)`.gray);

        // Verify counts
        console.log(`\n📈 Verification:`.cyan);
        for (const grade of grades) {
            const count = await User.countDocuments({ role: 'student', grade });
            console.log(`   Grade ${grade}: ${count} students`.gray);
        }

        const totalCount = await User.countDocuments({ role: 'student' });
        console.log(`   Total: ${totalCount} students`.green.bold);

        process.exit(0);
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`.red.bold);
        console.error(error);
        process.exit(1);
    }
};

// Run the seeder
seedStudents();
