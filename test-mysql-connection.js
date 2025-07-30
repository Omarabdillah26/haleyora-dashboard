import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'pintu2.minecuta.com',
  port: 3306,
  database: 'fdcdb',
  user: 'omarjelek',
  password: '121212',
  connectionLimit: 10,
};

async function testConnection() {
  console.log('Testing MySQL connection...');
  console.log('Config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    // password: '***'
  });

  try {
    // Create connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connection successful!');

    // Test simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);

    // Test database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('✅ Available databases:', databases.map(db => db.Database));

    // Test tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ Available tables:', tables.map(table => Object.values(table)[0]));

    // Test users table
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('✅ Users table has', users[0].count, 'records');

    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - check if MySQL server is running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied - check username and password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist');
    }
  }
}

testConnection(); 