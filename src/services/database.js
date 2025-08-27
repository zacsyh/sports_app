import Dexie from 'dexie';

class FitnessTrackerDB extends Dexie {
  constructor() {
    super('fitness_tracker');
    
    this.version(5).stores({
      user_preferences: '++id',
      fitness_projects: '++id, name, type, status, createdAt, completedDate',
      progress_records: '++id, projectId, timestamp, type, value',
      reminders: '++id, projectId, enabled, deadline, remindBefore',
      achievements: '++id',
      statistics: '++id',
      weekly_stats: '++id',
      monthly_stats: '++id'
    }).upgrade(async (trans) => {
      console.log('Upgrading database to version 5');
    });
    
    // 定义表结构
    this.user_preferences = this.table('user_preferences');
    this.fitness_projects = this.table('fitness_projects');
    this.progress_records = this.table('progress_records');
    this.reminders = this.table('reminders');
    this.achievements = this.table('achievements');
    this.statistics = this.table('statistics');
    this.weekly_stats = this.table('weekly_stats');
    this.monthly_stats = this.table('monthly_stats');
  }
}

const db = new FitnessTrackerDB();

export default db;