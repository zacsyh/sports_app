import db from './services/database';

const testDB = async () => {
  try {
    console.log('Testing database connection...');
    const projects = await db.fitness_projects.toArray();
    console.log('Database connection successful. Projects count:', projects.length);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

testDB();
