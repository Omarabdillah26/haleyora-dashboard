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

// Test database connection on startup
pool.getConnection()
  .then(connection => {
    console.log("✅ Database connected successfully");
    connection.release();
  })
  .catch(error => {
    console.error("❌ Database connection failed:", error);
  });

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

// Tindak Lanjut API
app.get("/api/tindak-lanjut", async (req, res) => {
  try {
    // First check if table exists
    const [tables] = await pool.execute("SHOW TABLES LIKE 'tindak_lanjut'");
    
    if (tables.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Table tindak_lanjut does not exist. Please create the table first.",
        error: "Table not found"
      });
    }
    
    const [rows] = await pool.execute("SELECT * FROM tindak_lanjut");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Failed to get tindak lanjut:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get tindak lanjut",
      error: error.message,
    });
  }
});

app.get("/api/tindak-lanjut/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute("SELECT * FROM tindak_lanjut WHERE id = ?", [id]);
    
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, message: "Tindak lanjut not found" });
    }
  } catch (error) {
    console.error("Failed to get tindak lanjut:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get tindak lanjut",
      error: error.message,
    });
  }
});

app.post("/api/tindak-lanjut", async (req, res) => {
  try {
    const {
      kategoriArahan,
      detailArahan,
      pic,
      target,
      status,
      deskripsiTindakLanjut,
      catatanSekretaris,
      categoryId,
      division,
      fileAttachment
    } = req.body;

    // Generate UUID for id
    const id = `tl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Format target date for MySQL (YYYY-MM-DD)
    let formattedTarget = null;
    if (target) {
      try {
        const date = new Date(target);
        if (!isNaN(date.getTime())) {
          formattedTarget = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
        }
      } catch (error) {
        console.error("Error formatting target date:", error);
      }
    }

    const [result] = await pool.execute(
      "INSERT INTO tindak_lanjut (id, kategoriArahan, detailArahan, pic, target, status, deskripsiTindakLanjut, catatanSekretaris, categoryId, division, fileAttachment, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [
        id,
        kategoriArahan,
        detailArahan,
        pic,
        formattedTarget,
        status,
        deskripsiTindakLanjut,
        catatanSekretaris,
        categoryId,
        division,
        fileAttachment || null,
      ]
    );

    const newTindakLanjut = {
      id: id,
      kategoriArahan,
      detailArahan,
      pic,
      target: formattedTarget,
      status,
      deskripsiTindakLanjut,
      catatanSekretaris,
      categoryId,
      division,
      fileAttachment,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    res.json({ success: true, data: newTindakLanjut });
  } catch (error) {
    console.error("Failed to create tindak lanjut:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create tindak lanjut",
      error: error.message,
    });
  }
});

app.put("/api/tindak-lanjut/:id", async (req, res) => {
  try {
    // Test database connection first
    const connection = await pool.getConnection();
    connection.release();
    
    const { id } = req.params;
    const {
      kategoriArahan,
      detailArahan,
      pic,
      target,
      status,
      deskripsiTindakLanjut,
      catatanSekretaris,
      categoryId,
      division,
      fileAttachment
    } = req.body;

    console.log("Updating tindak lanjut with ID:", id);
    console.log("Request body:", req.body);
    console.log("Target date:", target);
    console.log("Status:", status);

    // Validate required fields
    if (!kategoriArahan || !pic || !division) {
      console.error("Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields: kategoriArahan, pic, division",
      });
    }

    // Validate status enum
    const validStatuses = ['belum_ditindaklanjuti', 'dalam_proses', 'selesai', 'selesai_berkelanjutan'];
    if (status && !validStatuses.includes(status)) {
      console.error("Invalid status:", status);
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Format target date for MySQL (YYYY-MM-DD)
    let formattedTarget = null;
    if (target) {
      try {
        const date = new Date(target);
        if (!isNaN(date.getTime())) {
          formattedTarget = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
        }
      } catch (error) {
        console.error("Error formatting target date:", error);
      }
    }

    console.log("Formatted target date:", formattedTarget);

    // Check if record exists first
    const [existingRecords] = await pool.execute(
      "SELECT * FROM tindak_lanjut WHERE id = ?",
      [id]
    );

    if (existingRecords.length === 0) {
      console.error("Record not found with ID:", id);
      return res.status(404).json({
        success: false,
        message: "Tindak lanjut not found",
      });
    }

    console.log("Existing record:", existingRecords[0]);

    const [result] = await pool.execute(
      "UPDATE tindak_lanjut SET kategoriArahan = ?, detailArahan = ?, pic = ?, target = ?, status = ?, deskripsiTindakLanjut = ?, catatanSekretaris = ?, categoryId = ?, division = ?, fileAttachment = ?, updatedAt = NOW() WHERE id = ?",
      [
        kategoriArahan,
        detailArahan,
        pic,
        formattedTarget,
        status,
        deskripsiTindakLanjut,
        catatanSekretaris,
        categoryId,
        division,
        fileAttachment,
        id,
      ]
    );

    console.log("Update result:", result);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Tindak lanjut updated successfully" });
    } else {
      res.status(404).json({ success: false, message: "Tindak lanjut not found" });
    }
  } catch (error) {
    console.error("Failed to update tindak lanjut:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: "Cannot connect to database server",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to update tindak lanjut",
      error: error.message,
    });
  }
});

app.delete("/api/tindak-lanjut/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM tindak_lanjut WHERE id = ?", [id]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Tindak lanjut deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Tindak lanjut not found" });
    }
  } catch (error) {
    console.error("Failed to delete tindak lanjut:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete tindak lanjut",
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

// Test endpoint for tindak lanjut
app.get("/api/test-tindak-lanjut", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM tindak_lanjut");
    res.json({
      success: true,
      message: "Tindak lanjut table exists",
      count: rows[0].count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Tindak lanjut table does not exist or error occurred",
      error: error.message,
    });
  }
});

// Simple test endpoint (no database required)
app.get("/api/test-simple", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is running",
    timestamp: new Date().toISOString(),
  });
});

// Simple test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Server is working correctly",
    timestamp: new Date().toISOString(),
  });
});

// Test database connection endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT 1 as test");
    res.json({
      success: true,
      message: "Database connection successful",
      data: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Create tindak_lanjut table endpoint
app.post("/api/create-tindak-lanjut-table", async (req, res) => {
  try {
    // Check if table already exists
    const [tables] = await pool.execute("SHOW TABLES LIKE 'tindak_lanjut'");
    
    if (tables.length > 0) {
      return res.json({
        success: true,
        message: "Table tindak_lanjut already exists",
      });
    }
    
    // Create the table
    await pool.execute(`
      CREATE TABLE tindak_lanjut (
        id VARCHAR(36) PRIMARY KEY,
        kategoriArahan VARCHAR(255) NOT NULL,
        detailArahan TEXT,
        pic VARCHAR(100) NOT NULL,
        target DATE,
        status ENUM('belum_ditindaklanjuti', 'dalam_proses', 'selesai', 'selesai_berkelanjutan') DEFAULT 'belum_ditindaklanjuti',
        deskripsiTindakLanjut TEXT,
        catatanSekretaris TEXT,
        categoryId VARCHAR(36) NULL,
        division VARCHAR(50) NOT NULL,
        fileAttachment VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample data
    await pool.execute(`
      INSERT INTO tindak_lanjut (id, kategoriArahan, detailArahan, pic, target, status, deskripsiTindakLanjut, catatanSekretaris, categoryId, division, fileAttachment) VALUES
      ('tl-1', 'Proyek Digital', 'Implementasi sistem digital untuk meningkatkan efisiensi kerja', 'BOD-1', '2025-12-31', 'dalam_proses', 'Sistem sedang dalam tahap pengembangan', 'Progress sesuai timeline', 'cat-1', 'BOD-1', NULL),
      ('tl-2', 'Optimasi Proses', 'Optimasi proses bisnis untuk meningkatkan produktivitas', 'VP OP', '2025-10-31', 'selesai', 'Proses optimasi telah selesai dan berjalan dengan baik', 'Proyek berhasil diselesaikan tepat waktu', 'cat-2', 'VP OP', NULL),
      ('tl-3', 'Pelatihan', 'Program pelatihan untuk meningkatkan skill karyawan', 'VP AGA', '2025-06-30', 'selesai_berkelanjutan', 'Program pelatihan berkelanjutan untuk maintenance skill', 'Program berjalan dengan baik dan perlu dilanjutkan', 'cat-3', 'VP AGA', NULL),
      ('tl-4', 'Audit Internal', 'Audit internal untuk memastikan compliance', 'SEKPER', '2025-03-31', 'belum_ditindaklanjuti', 'Belum dimulai, menunggu approval dari management', 'Perlu koordinasi dengan tim audit', 'cat-1', 'SEKPER', NULL)
    `);
    
    res.json({
      success: true,
      message: "Table tindak_lanjut created successfully with sample data",
    });
  } catch (error) {
    console.error("Failed to create tindak_lanjut table:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create tindak_lanjut table",
      error: error.message,
    });
  }
});

// Test tindak_lanjut table endpoint
app.get("/api/test-tindak-lanjut-table", async (req, res) => {
  try {
    // Check if table exists
    const [tables] = await pool.execute("SHOW TABLES LIKE 'tindak_lanjut'");
    console.log("Tables found:", tables);
    
    if (tables.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Table tindak_lanjut does not exist",
      });
    }
    
    // Check table structure
    const [columns] = await pool.execute("DESCRIBE tindak_lanjut");
    console.log("Table structure:", columns);
    
    // Check if there are any records
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM tindak_lanjut");
    console.log("Record count:", rows[0].count);
    
    res.json({
      success: true,
      message: "Tindak lanjut table exists and is accessible",
      tableExists: true,
      recordCount: rows[0].count,
      structure: columns
    });
  } catch (error) {
    console.error("Error testing tindak_lanjut table:", error);
    res.status(500).json({
      success: false,
      message: "Error testing tindak_lanjut table",
      error: error.message,
    });
  }
});

// Server status endpoint
app.get("/api/server-status", async (req, res) => {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    connection.release();
    
    res.json({
      success: true,
      message: "Server is running and database is connected",
      timestamp: new Date().toISOString(),
      database: "Connected"
    });
  } catch (error) {
    console.error("Server status check failed:", error);
    res.status(500).json({
      success: false,
      message: "Server is running but database connection failed",
      error: error.message,
      timestamp: new Date().toISOString(),
      database: "Disconnected"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});
