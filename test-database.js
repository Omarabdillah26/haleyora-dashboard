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
      console.log(`\n  ${cat.categoryName}: ${tableData.length} table data entries`);
      tableData.forEach(data => {
        console.log(`    - ${data.division}: ${data.jumlah} total, ${data.progress}% progress`);
        console.log(`      Progress breakdown: Selesai=${data.selesai}, Berkelanjutan=${data.selesaiBerkelanjutan}, Proses=${data.proses}`);
      });
    }
    
    // Test if there are any entries with progress > 0
    console.log('\n🔍 Checking for entries with progress > 0...');
    const [progressData] = await connection.execute(
      'SELECT c.categoryName, ctd.division, ctd.progress FROM categories c JOIN category_table_data ctd ON c.id = ctd.categoryId WHERE ctd.progress > 0'
    );
    console.log(`Found ${progressData.length} entries with progress > 0:`);
    progressData.forEach(data => {
      console.log(`  - ${data.categoryName} (${data.division}): ${data.progress}%`);
    });
    
    connection.release();
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase(); 