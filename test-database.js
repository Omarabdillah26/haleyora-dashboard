import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: 'pintu2.minecuta.com',
  port: 3306,
  database: 'fdcdb',
  user: 'omarjelek',
  password: '121212',
  connectionLimit: 10,
};

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Create connection pool
    const pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    
    // Test categories query
    console.log('\n📊 Testing categories query...');
    const [categories] = await connection.execute('SELECT * FROM categories');
    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.categoryName} (${cat.id})`);
    });
    
    // Test category table data query
    console.log('\n📋 Testing category table data...');
    for (const cat of categories) {
      const [tableData] = await connection.execute(
        'SELECT * FROM category_table_data WHERE categoryId = ?',
        [cat.id]
      );
      console.log(`  ${cat.categoryName}: ${tableData.length} table data entries`);
      tableData.forEach(data => {
        console.log(`    - ${data.division}: ${data.jumlah} total, ${data.progress}% progress`);
      });
    }
    
    connection.release();
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase(); 