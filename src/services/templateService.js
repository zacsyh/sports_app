import db from './database';

// 模板服务类
class TemplateService {
  // 创建模板
  async createTemplate(templateData) {
    try {
      const template = {
        id: Date.now().toString(),
        name: templateData.name.trim(),
        description: templateData.description ? templateData.description.trim() : '',
        projectList: templateData.projectList || [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const id = await db.templates.add(template);
      return { success: true, id, template };
    } catch (error) {
      console.error('创建模板失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 获取所有模板
  async getAllTemplates() {
    try {
      const templates = await db.templates.orderBy('createdAt').reverse().toArray();
      return { success: true, templates };
    } catch (error) {
      console.error('获取模板列表失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 根据ID获取模板
  async getTemplateById(id) {
    try {
      const template = await db.templates.get(id);
      return { success: true, template };
    } catch (error) {
      console.error('获取模板失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 更新模板
  async updateTemplate(id, updateData) {
    try {
      const template = await db.templates.get(id);
      if (!template) {
        return { success: false, error: '模板不存在' };
      }
      
      const updatedTemplate = {
        ...template,
        ...updateData,
        updatedAt: Date.now()
      };
      
      await db.templates.put(updatedTemplate);
      return { success: true, template: updatedTemplate };
    } catch (error) {
      console.error('更新模板失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 删除模板
  async deleteTemplate(id) {
    try {
      await db.templates.delete(id);
      return { success: true };
    } catch (error) {
      console.error('删除模板失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 向模板添加项目配置
  async addProjectToTemplate(templateId, projectConfig) {
    try {
      const template = await db.templates.get(templateId);
      if (!template) {
        return { success: false, error: '模板不存在' };
      }
      
      const updatedTemplate = {
        ...template,
        projectList: [...(template.projectList || []), projectConfig],
        updatedAt: Date.now()
      };
      
      await db.templates.put(updatedTemplate);
      return { success: true, template: updatedTemplate };
    } catch (error) {
      console.error('向模板添加项目失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 从模板移除项目配置
  async removeProjectFromTemplate(templateId, projectIndex) {
    try {
      const template = await db.templates.get(templateId);
      if (!template) {
        return { success: false, error: '模板不存在' };
      }
      
      const projectList = [...(template.projectList || [])];
      projectList.splice(projectIndex, 1);
      
      const updatedTemplate = {
        ...template,
        projectList,
        updatedAt: Date.now()
      };
      
      await db.templates.put(updatedTemplate);
      return { success: true, template: updatedTemplate };
    } catch (error) {
      console.error('从模板移除项目失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 基于模板创建项目
  async createProjectFromTemplate(templateId, projectName, projectDescription) {
    try {
      const templateResult = await this.getTemplateById(templateId);
      if (!templateResult.success) {
        return { success: false, error: templateResult.error };
      }
      
      const template = templateResult.template;
      if (!template) {
        return { success: false, error: '模板不存在' };
      }
      
      // 创建项目数据
      const projectData = {
        id: Date.now().toString(),
        name: projectName || template.name,
        description: projectDescription || template.description,
        type: 'SETS_REPS', // 默认类型，可以根据模板配置调整
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'ACTIVE'
      };
      
      // 如果模板中有项目配置，应用这些配置
      if (template.projectList && template.projectList.length > 0) {
        const templateProject = template.projectList[0]; // 简化处理，实际可能需要更复杂的逻辑
        Object.assign(projectData, templateProject);
      } else {
        // 默认配置
        projectData.sets = 3;
        projectData.repsPerSet = 10;
        projectData.completedSets = [];
      }
      
      const projectId = await db.fitness_projects.add(projectData);
      return { success: true, projectId, project: projectData };
    } catch (error) {
      console.error('基于模板创建项目失败:', error);
      return { success: false, error: error.message };
    }
  }
}

const templateService = new TemplateService();
export default templateService;