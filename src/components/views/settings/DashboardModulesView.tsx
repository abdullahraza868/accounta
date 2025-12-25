import { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { 
  Search, 
  Settings,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  DASHBOARD_MODULES,
  MODULE_CATEGORIES,
  ModuleCategory,
  DashboardModule,
  getModulesByCategory,
} from '../../../lib/dashboardModules';

// Mock roles - would come from API
const MOCK_ROLES = [
  { id: 'owner', name: 'Owner', color: 'bg-purple-600' },
  { id: 'admin', name: 'Admin', color: 'bg-blue-600' },
  { id: 'manager', name: 'Manager', color: 'bg-green-600' },
  { id: 'team-member', name: 'Team Member', color: 'bg-gray-600' },
];

type ModuleRoleConfig = {
  [moduleId: string]: {
    enabled: boolean;
    allowedRoles: string[];
  };
};

export function DashboardModulesView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | 'all'>('all');
  
  // Module configuration state (enabled status and which roles can see it)
  const [moduleConfig, setModuleConfig] = useState<ModuleRoleConfig>(() => {
    const initial: ModuleRoleConfig = {};
    Object.values(DASHBOARD_MODULES).forEach(module => {
      initial[module.id] = {
        enabled: true,
        allowedRoles: [...module.defaultRoles],
      };
    });
    return initial;
  });

  const handleToggleModuleEnabled = (moduleId: string) => {
    setModuleConfig(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        enabled: !prev[moduleId].enabled,
      },
    }));
    
    const module = DASHBOARD_MODULES[moduleId];
    toast.success(`${module.name} ${!moduleConfig[moduleId].enabled ? 'enabled' : 'disabled'}`);
  };

  const handleToggleRoleAccess = (moduleId: string, roleId: string) => {
    setModuleConfig(prev => {
      const currentRoles = prev[moduleId].allowedRoles;
      const newRoles = currentRoles.includes(roleId)
        ? currentRoles.filter(r => r !== roleId)
        : [...currentRoles, roleId];
      
      return {
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          allowedRoles: newRoles,
        },
      };
    });
  };

  const handleSaveChanges = () => {
    // Would save to API here
    console.log('Saving module configuration:', moduleConfig);
    toast.success('Dashboard module settings saved successfully');
  };

  const handleResetToDefaults = () => {
    const reset: ModuleRoleConfig = {};
    Object.values(DASHBOARD_MODULES).forEach(module => {
      reset[module.id] = {
        enabled: true,
        allowedRoles: [...module.defaultRoles],
      };
    });
    setModuleConfig(reset);
    toast.success('Reset to default settings');
  };

  // Filter modules
  const filteredModules = Object.values(DASHBOARD_MODULES).filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const modulesByCategory = (selectedCategory === 'all' 
    ? Object.keys(MODULE_CATEGORIES) as ModuleCategory[]
    : [selectedCategory]
  ).map(category => ({
    category,
    modules: filteredModules.filter(m => m.category === category),
  })).filter(group => group.modules.length > 0);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Dashboard Modules
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure which dashboard modules are available and control role-based access
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleResetToDefaults}
              >
                Reset to Defaults
              </Button>
              <Button
                onClick={handleSaveChanges}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                  How Dashboard Modules Work
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Configure which modules are available on the dashboard and control which roles can see them. 
                  Users can then customize which enabled modules they want to display. Individual team member 
                  access can be customized in Team Management → Edit Team Member.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white' : ''}
                >
                  All
                </Button>
                {Object.entries(MODULE_CATEGORIES).map(([key, category]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(key as ModuleCategory)}
                    className={selectedCategory === key ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white' : ''}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module List by Category */}
        <div className="space-y-6">
          {modulesByCategory.map(({ category, modules }) => {
            const categoryMeta = MODULE_CATEGORIES[category];
            const CategoryIcon = categoryMeta.icon;
            
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <CategoryIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {categoryMeta.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {categoryMeta.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {modules.map(module => {
                    const ModuleIcon = module.icon;
                    const config = moduleConfig[module.id];
                    
                    return (
                      <Card key={module.id} className={`border-2 transition-all ${!config.enabled ? 'opacity-50' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-6">
                            {/* Module Info */}
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`p-3 rounded-lg ${config.enabled ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <ModuleIcon className={`w-6 h-6 ${config.enabled ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {module.name}
                                  </h3>
                                  <Badge variant="outline" className="text-xs">
                                    {module.defaultSize}
                                  </Badge>
                                  {!config.enabled && (
                                    <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                      <EyeOff className="w-3 h-3 mr-1" />
                                      Disabled
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                  {module.description}
                                </p>

                                {/* Role Access */}
                                {config.enabled && (
                                  <div>
                                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                      Accessible by roles:
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                      {MOCK_ROLES.map(role => {
                                        const hasAccess = config.allowedRoles.includes(role.id);
                                        return (
                                          <button
                                            key={role.id}
                                            onClick={() => handleToggleRoleAccess(module.id, role.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border-2 ${
                                              hasAccess
                                                ? `${role.color} text-white border-transparent`
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'
                                            }`}
                                          >
                                            {role.name}
                                            {hasAccess && ' ✓'}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {config.allowedRoles.length === 0 && (
                                      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                        ⚠️ No roles selected - module will not be visible to anyone
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Enable/Disable Toggle */}
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`toggle-${module.id}`} className="text-sm text-gray-600 dark:text-gray-400">
                                  {config.enabled ? 'Enabled' : 'Disabled'}
                                </Label>
                                <Switch
                                  id={`toggle-${module.id}`}
                                  checked={config.enabled}
                                  onCheckedChange={() => handleToggleModuleEnabled(module.id)}
                                />
                              </div>
                              {config.enabled ? (
                                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Hidden
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <Card className="mt-6 border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Object.values(moduleConfig).filter(c => c.enabled).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Enabled Modules
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {Object.keys(DASHBOARD_MODULES).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total Modules
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {Object.keys(MODULE_CATEGORIES).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Categories
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> These settings control the base availability of modules. 
            Individual team members can be granted additional access or have modules hidden in Team Management → Edit Team Member → Dashboard Modules tab.
            Users will only see modules they have access to in their dashboard customization settings.
          </p>
        </div>
      </div>
    </div>
  );
}
