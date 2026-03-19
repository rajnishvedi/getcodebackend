const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI);

(async () => {
  const exists = await Admin.findOne({ email: "admin@gmail.com" });
  if (exists) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await Admin.create({
    fullName: "Super Admin",
    email: "admin@gmail.com",
    password: hashedPassword,
    role: "super_admin",
  });

  console.log("Admin created successfully");
  process.exit();
})();
