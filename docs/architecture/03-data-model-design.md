## 4. 数据模型设计

### 4.1 用户设置模型
- 用户偏好设置
  - theme: String (主题设置)
  - language: String (语言设置)
  - notificationEnabled: Boolean (通知开关)
  - dailyReminderTime: String (每日提醒时间)
  - autoSaveProgress: Boolean (自动保存进度)
- 应用配置信息
  - firstLaunch: Boolean (首次启动标识)
  - lastSyncTime: Long (最后同步时间，预留)
  - appVersion: String (应用版本)

### 4.2 健身项目模型
#### 项目基础信息
- id: String (唯一标识符)
- name: String (项目名称)
- description: String (项目描述)
- type: Enum (项目类型：SETS_REPS 或 TOTAL_COUNT)
- createdAt: Long (创建时间)
- updatedAt: Long (更新时间)
- status: Enum (状态：ACTIVE, COMPLETED, ARCHIVED)

#### Sets×Reps模式数据结构
- sets: Int (设定组数)
- repsPerSet: Int (每组次数)
- completedSets: List<Int> (已完成的组数记录，记录每组实际完成次数)

#### Total count/weight模式数据结构
- targetCount: Int (目标次数)
- targetWeight: Double (目标重量，可选)
- currentCount: Int (当前完成次数)
- history: List<ProgressRecord> (进度历史记录)

#### 进度记录模型
- timestamp: Long (时间戳)
- count: Int (完成次数)
- weight: Double (重量，可选)

### 4.3 提醒模型
#### 整体项目提醒
- enabled: Boolean (是否启用)
- time: String (提醒时间，格式 HH:mm)
- daysOfWeek: List<Int> (每周提醒的天数，1-7代表周一到周日)

#### 个体项目提醒
- projectId: String (关联的项目ID)
- enabled: Boolean (是否启用)
- deadline: Long (截止时间戳)
- remindBefore: Int (提前分钟数)

### 4.4 成长记录模型
#### 成就数据
- id: String (成就ID)
- name: String (成就名称)
- description: String (成就描述)
- unlockedAt: Long (解锁时间)
- criteria: String (解锁条件)

#### 统计信息
- totalProjectsCompleted: Int (完成项目总数)
- totalRepsCompleted: Int (完成总次数)
- totalSetsCompleted: Int (完成总组数)
- weeklyStats: List<WeeklyStat> (周统计数据)
- monthlyStats: List<MonthlyStat> (月统计数据)

#### 周统计数据
- weekStart: Long (周开始时间)
- projectsCompleted: Int (本周完成项目数)
- repsCompleted: Int (本周完成次数)

#### 月统计数据
- monthStart: Long (月开始时间)
- projectsCompleted: Int (本月完成项目数)
- repsCompleted: Int (本月完成次数)

### 4.5 IndexedDB对象存储结构设计

#### 用户设置对象存储 (user_preferences)
- keyPath: id
- 索引: 无
- 字段:
  - id: number (主键)
  - theme: string (主题设置)
  - language: string (语言设置)
  - notification_enabled: boolean (通知开关)
  - daily_reminder_time: string (每日提醒时间，格式 HH:mm)
  - auto_save_progress: boolean (自动保存进度)
  - first_launch: boolean (首次启动标识)
  - last_sync_time: number (最后同步时间)
  - app_version: string (应用版本)
  - pwa_installed: boolean (PWA安装状态)

#### 健身项目对象存储 (fitness_projects)
- keyPath: id
- 索引: 
  - name: string
  - type: string
  - status: string
- 字段:
  - id: string (主键)
  - name: string (项目名称)
  - description: string (项目描述)
  - type: string (项目类型：SETS_REPS 或 TOTAL_COUNT)
  - created_at: number (创建时间)
  - updated_at: number (更新时间)
  - status: string (状态：ACTIVE, COMPLETED, ARCHIVED)
  - sets: number (设定组数，SETS_REPS模式使用)
  - reps_per_set: number (每组次数，SETS_REPS模式使用)
  - target_count: number (目标次数，TOTAL_COUNT模式使用)
  - target_weight: number (目标重量，TOTAL_COUNT模式使用)

#### 项目进度记录对象存储 (progress_records)
- keyPath: id
- 索引:
  - project_id: string
  - timestamp: number
- 字段:
  - id: number (主键)
  - project_id: string (关联健身项目)
  - timestamp: number (时间戳)
  - count: number (完成次数)
  - weight: number (重量)

#### 提醒设置对象存储 (reminders)
- keyPath: id
- 索引:
  - project_id: string
  - enabled: boolean
- 字段:
  - id: number (主键)
  - project_id: string (关联的项目ID，可为空)
  - enabled: boolean (是否启用)
  - time: string (提醒时间，格式 HH:mm)
  - days_of_week: Array<number> (每周提醒的天数，1-7代表周一到周日)
  - deadline: number (截止时间戳)
  - remind_before: number (提前分钟数)

#### 成就对象存储 (achievements)
- keyPath: id
- 索引:
  - unlocked_at: number
- 字段:
  - id: string (主键)
  - name: string (成就名称)
  - description: string (成就描述)
  - unlocked_at: number (解锁时间)
  - criteria: string (解锁条件)

#### 统计数据对象存储 (statistics)
- keyPath: id
- 索引: 无
- 字段:
  - id: number (主键)
  - total_projects_completed: number (完成项目总数)
  - total_reps_completed: number (完成总次数)
  - total_sets_completed: number (完成总组数)

#### 周统计数据对象存储 (weekly_stats)
- keyPath: id
- 索引:
  - week_start: number
- 字段:
  - id: number (主键)
  - week_start: number (周开始时间)
  - projects_completed: number (本周完成项目数)
  - reps_completed: number (本周完成次数)

#### 月统计数据对象存储 (monthly_stats)
- keyPath: id
- 索引:
  - month_start: number
- 字段:
  - id: number (主键)
  - month_start: number (月开始时间)
  - projects_completed: number (本月完成项目数)
  - reps_completed: number (本月完成次数)