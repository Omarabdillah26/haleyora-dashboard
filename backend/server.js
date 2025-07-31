import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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

// Categories API
app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM categories");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Failed to get categories:", error);
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    } = req.body;

    // Generate UUID for id
    const id = `ctd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const [result] = await pool.execute(
      "INSERT INTO category_table_data (id, categoryId, division, jumlah, proses, selesai, belumDitindaklanjuti, selesaiBerkelanjutan, progress, status, targetPenyelesaian, detailArahan, checkPoint, deskripsiTindakLanjut, catatanSekretaris) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
    };

    res.json({ success: true, data: newData });
  } catch (error) {
    console.error("Failed to create category table data:", error);
    res
      .status(500)
      .json({
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
    } = req.body;

    const [result] = await pool.execute(
      "UPDATE category_table_data SET categoryId = ?, division = ?, jumlah = ?, proses = ?, selesai = ?, belumDitindaklanjuti = ?, selesaiBerkelanjutan = ?, progress = ?, status = ?, targetPenyelesaian = ?, detailArahan = ?, checkPoint = ?, deskripsiTindakLanjut = ?, catatanSekretaris = ?, updated_at = NOW() WHERE id = ?",
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete category table data",
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
