import { useState } from 'react';
import { Briefcase, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getServiceIcon } from './ServiceIcons';
import { toast } from 'sonner@2.0.3';

type ServicesCardProps = {
  services: string[];
  availableServices: string[];
  onToggleService: (service: string) => void;
};

export function ServicesCard({ services, availableServices, onToggleService }: ServicesCardProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [localAvailableServices, setLocalAvailableServices] = useState(availableServices);

  const handleAddCustomService = () => {
    const trimmedName = newServiceName.trim();
    if (!trimmedName) {
      toast.error('Please enter a service name');
      return;
    }

    if (localAvailableServices.includes(trimmedName) || services.includes(trimmedName)) {
      toast.error('This service already exists');
      return;
    }

    // Add to available services
    setLocalAvailableServices([...localAvailableServices, trimmedName]);
    toast.success('Service Added', {
      description: `${trimmedName} has been added to available services.`
    });
    
    setShowAddDialog(false);
    setNewServiceName('');
  };

  return (
    <>
      <Card className="overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Services</h3>
              <Badge variant="secondary" className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs">
                {services.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="h-7 px-2 text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Active Services */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Active Services
            </div>
            {services.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No services selected
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {services.map((service) => {
                  const Icon = getServiceIcon(service);
                  return (
                    <div
                      key={service}
                      className="group relative p-3 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{service}</div>
                        </div>
                        <button
                          onClick={() => onToggleService(service)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 flex items-center gap-1 text-xs whitespace-nowrap"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Services */}
          {localAvailableServices.filter(s => !services.includes(s)).length > 0 && (
            <>
              <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Available Services
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {localAvailableServices
                    .filter(service => !services.includes(service))
                    .map((service) => {
                      const Icon = getServiceIcon(service);
                      return (
                        <button
                          key={service}
                          onClick={() => onToggleService(service)}
                          className="group p-3 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-left"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900 flex items-center justify-center flex-shrink-0 transition-colors">
                              <Icon className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                                {service}
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Custom Service Dialog */}
      {showAddDialog && (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md" aria-describedby="add-service-description">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                Add Custom Service
              </DialogTitle>
              <DialogDescription id="add-service-description">
                Add a new service to the available services list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g., Estate Planning, Forensic Accounting"
                  className="mt-1.5"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomService();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setNewServiceName('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCustomService}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}