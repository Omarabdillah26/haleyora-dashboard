import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"), false);
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// Database configuration
const dbConfig = {
  host: "pintu2.minecuta.com",
  port: 3306,
  database: "fdcdb",
  user: "omarjelek",
  password: "121212",
  connectionLimit: 10,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
app.get("/api/test-connection", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");

    // Test a simple query
    const [rows] = await connection.execute("SELECT 1 as test");
    console.log("✅ Test query successful:", rows);

    connection.release();
    res.json({
      success: true,
      message: "Database connected successfully",
      data: rows,
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Users API
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM users");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Failed to get users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length > 0) {
      const user = rows[0];
      // Remove password from response
      delete user.password;
      res.json({ success: true, data: user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login failed:", error);
    res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
});

// Create new user
app.post("/api/users", async (req, res) => {
  try {
    const { name, username, role, password } = req.body;

    // Generate UUID for id
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Check if username already exists
    const [existingUsers] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO users (id, name, username, role, password) VALUES (?, ?, ?, ?, ?)",
      [id, name, username, role, password]
    );

    const newUser = {
      id: id,
      name,
      username,
      role,
    };

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
});

// Update user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, role, password } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if username already exists for other users
    const [usernameCheck] = await pool.execute(
      "SELECT * FROM users WHERE username = ? AND id != ?",
      [username, id]
    );

    if (usernameCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Update user with or without password
    let query, params;
    if (password && password.trim() !== "") {
      query = "UPDATE users SET name = ?, username = ?, role = ?, password = ? WHERE id = ?";
      params = [name, username, role, password, id];
    } else {
      query = "UPDATE users SET name = ?, username = ?, role = ? WHERE id = ?";
      params = [name, username, role, id];
    }

    await pool.execute(query, params);

    const updatedUser = {
      id,
      name,
      username,
      role,
    };

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
});

// Delete user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userToDelete = existingUsers[0];

    // Prevent deletion of SUPER_ADMIN users (optional security measure)
    if (userToDelete.role === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete SUPER_ADMIN users",
      });
    }

    // Delete user
    await pool.execute("DELETE FROM users WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
});

// Categories API
app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM categories");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Failed to get categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get categories",
      error: error.message,
    });
  }
});

app.get("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);

    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, message: "Category not found" });
    }
  } catch (error) {
    console.error("Failed to get category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get category",
      error: error.message,
    });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    // Generate UUID for id
    const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const [result] = await pool.execute(
      "INSERT INTO categories (id, categoryName, description, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
      [id, categoryName, description]
    );

    const newCategory = {
      id: id,
      categoryName,
      description,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    res.json({ success: true, data: newCategory });
  } catch (error) {
    console.error("Failed to create category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, description } = req.body;

    const [result] = await pool.execute(
      "UPDATE categories SET categoryName = ?, description = ?, updatedAt = NOW() WHERE id = ?",
      [categoryName, description, id]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Category updated successfully" });
    } else {
      res.status(404).json({ success: false, message: "Category not found" });
    }
  } catch (error) {
    console.error("Failed to update category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM categories WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Category deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Category not found" });
    }
  } catch (error) {
    console.error("Failed to delete category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
});

// Category Table Data API
app.get("/api/category-table-data/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await pool.execute(
      "SELECT * FROM category_table_data WHERE categoryId = ?",
      [categoryId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Failed to get category table data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get category table data",
      error: error.message,
    });
  }
});

app.post("/api/category-table-data", async (req, res) => {
  try {
    const {
      categoryId,
      division,
      jumlah,
      proses,
      selesai,
      belumDitindaklanjuti,
      selesaiBerkelanjutan,
      progress,
      status,
      targetPenyelesaian,
      detailArahan,
      checkPoint,
      deskripsiTindakLanjut,
      catatanSekretaris,
      uploadedFiles,
      fileNames,
    } = req.body;

    // Generate UUID for id
    const id = `ctd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const [result] = await pool.execute(
      "INSERT INTO category_table_data (id, categoryId, division, jumlah, proses, selesai, belumDitindaklanjuti, selesaiBerkelanjutan, progress, status, targetPenyelesaian, detailArahan, checkPoint, deskripsiTindakLanjut, catatanSekretaris, uploadedFiles, fileNames) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        categoryId,
        division,
        jumlah,
        proses,
        selesai,
        belumDitindaklanjuti,
        selesaiBerkelanjutan,
        progress,
        status,
        targetPenyelesaian,
        detailArahan,
        checkPoint,
        deskripsiTindakLanjut,
        catatanSekretaris,
        uploadedFiles || "[]",
        fileNames || "[]",
      ]
    );

    const newData = {
      id: id,
      categoryId,
      division,
      jumlah,
      proses,
      selesai,
      belumDitindaklanjuti,
      selesaiBerkelanjutan,
      progress,
      status,
      targetPenyelesaian,
      detailArahan,
      checkPoint,
      deskripsiTindakLanjut,
      catatanSekretaris,
      uploadedFiles: uploadedFiles || "[]",
      fileNames: fileNames || "[]",
    };

    res.json({ success: true, data: newData });
  } catch (error) {
    console.error("Failed to create category table data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category table data",
      error: error.message,
    });
  }
});

app.put("/api/category-table-data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      division,
      jumlah,
      proses,
      selesai,
      belumDitindaklanjuti,
      selesaiBerkelanjutan,
      progress,
      status,
      targetPenyelesaian,
      detailArahan,
      checkPoint,
      deskripsiTindakLanjut,
      catatanSekretaris,
      uploadedFiles,
      fileNames,
    } = req.body;

    const [result] = await pool.execute(
      "UPDATE category_table_data SET categoryId = ?, division = ?, jumlah = ?, proses = ?, selesai = ?, belumDitindaklanjuti = ?, selesaiBerkelanjutan = ?, progress = ?, status = ?, targetPenyelesaian = ?, detailArahan = ?, checkPoint = ?, deskripsiTindakLanjut = ?, catatanSekretaris = ?, uploadedFiles = ?, fileNames = ?, updated_at = NOW() WHERE id = ?",
      [
        categoryId,
        division,
        jumlah,
        proses,
        selesai,
        belumDitindaklanjuti,
        selesaiBerkelanjutan,
        progress,
        status,
        targetPenyelesaian,
        detailArahan,
        checkPoint,
        deskripsiTindakLanjut,
        catatanSekretaris,
        uploadedFiles || "[]",
        fileNames || "[]",
        id,
      ]
    );

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "Category table data updated successfully",
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Category table data not found" });
    }
  } catch (error) {
    console.error("Failed to update category table data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category table data",
      error: error.message,
    });
  }
});

app.delete("/api/category-table-data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      "DELETE FROM category_table_data WHERE id = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "Category table data deleted successfully",
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Category table data not found" });
    }
  } catch (error) {
    console.error("Failed to delete category table data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category table data",
      error: error.message,
    });
  }
});

// File upload endpoint
app.post("/api/upload-files", upload.array("files", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFiles,
    });
  } catch (error) {
    console.error("Failed to upload files:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload files",
      error: error.message,
    });
  }
});

// Delete file endpoint
app.delete("/api/delete-file/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: "File deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
  } catch (error) {
    console.error("Failed to delete file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: error.message,
    });
  }
});

// Arahans API
app.get("/api/arahans", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM arahans");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Failed to get arahans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get arahans",
      error: error.message,
    });
  }
});

app.post("/api/arahans", async (req, res) => {
  try {
    const { title, description, division, pic, status } = req.body;

    // Generate UUID for id
    const id = `arah-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const [result] = await pool.execute(
      "INSERT INTO arahans (id, title, description, division, pic, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [id, title, description, division, pic, status]
    );

    const newArahan = {
      id: id,
      title,
      description,
      division,
      pic,
      status,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    res.json({ success: true, data: newArahan });
  } catch (error) {
    console.error("Failed to create arahan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create arahan",
      error: error.message,
    });
  }
});

app.put("/api/arahans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, division, pic, status } = req.body;

    const [result] = await pool.execute(
      "UPDATE arahans SET title = ?, description = ?, division = ?, pic = ?, status = ?, updatedAt = NOW() WHERE id = ?",
      [title, description, division, pic, status, id]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Arahan updated successfully" });
    } else {
      res.status(404).json({ success: false, message: "Arahan not found" });
    }
  } catch (error) {
    console.error("Failed to update arahan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update arahan",
      error: error.message,
    });
  }
});

app.delete("/api/arahans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM arahans WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Arahan deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Arahan not found" });
    }
  } catch (error) {
    console.error("Failed to delete arahan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete arahan",
      error: error.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});
