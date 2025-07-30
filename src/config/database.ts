export const dbConfig = {
  host: 'pintu2.minecuta.com',
  port: 3306,
  database: 'fdcdb',
  user: 'omarjelek',
  password: '121212',
  connectionLimit: 10,
};

export const dbConfigString = `mysql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`; 