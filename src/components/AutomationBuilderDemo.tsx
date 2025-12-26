import { useState } from 'react';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { AutomationBuilder, AutomationList } from './AutomationBuilder';

/**
 * Demo component showing how to use AutomationBuilder and AutomationList
 * 
 * Usage:
 * 1. AutomationList displays all automations in a table with:
 *    - On Event column (trigger chips)
 *    - Status column (radio buttons for On/Off)
 *    - Label column (automation name)
 *    - Actions column (action chips)
 *    - Conditions column (condition count)
 *    - Actions column (Edit/Delete dropdown)
 * 
 * 2. AutomationBuilder is a dialog for creating/editing automations with:
 *    - Trigger selector (grouped dropdown)
 *    - Condition builder (optional, with AND/OR logic)
 *    - Action builder (drag-and-drop sortable)
 *    - Live preview
 */
export function AutomationBuilderDemo() {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [automations, setAutomations] = useState([]);

  const handleEdit = (automation: any) => {
    console.log('Edit automation:', automation);
    // TODO: Open builder with existing automation data
    setBuilderOpen(true);
  };

  const handleDelete = (automationId: string) => {
    console.log('Delete automation:', automationId);
    // TODO: Confirm and delete
  };

  const handleStatusChange = (automationId: string, enabled: boolean) => {
    console.log('Status change:', automationId, enabled);
    // TODO: Update automation status
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Automations</h1>
        <Button
          onClick={() => setBuilderOpen(true)}
          style={{ backgroundColor: 'var(--primaryColor)' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Automation
        </Button>
      </div>

      {/* Automation List Table */}
      <AutomationList
        automations={automations}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      {/* Automation Builder Dialog */}
      <AutomationBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        automations={automations}
        onAutomationsChange={setAutomations}
      />
    </div>
  );
}

export default AutomationBuilderDemo;

