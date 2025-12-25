/**
 * TEST FILE - Simple version of invite dialog to test if the structure works
 * If this works, the issue is elsewhere. If this fails, there's a fundamental problem.
 */

import { useState } from 'react';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Label } from './components/ui/label';

const testClientGroups = ['Tax Clients', 'Advisory Clients'];
const testClients = ['Acme Corp', 'Tech Startup'];

export default function TestInviteDialog() {
  const [open, setOpen] = useState(false);
  const [clientAccessMode, setClientAccessMode] = useState<'all' | 'groups' | 'individual'>('all');
  const [assignedGroups, setAssignedGroups] = useState<string[]>([]);
  const [assignedClients, setAssignedClients] = useState<string[]>([]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Invite Dialog</h1>
      
      <Button onClick={() => setOpen(true)}>Open Test Dialog</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby="test-dialog-description">
          <DialogHeader>
            <DialogTitle>Test Client Assignment</DialogTitle>
            <DialogDescription id="test-dialog-description">
              Test dialog for client assignment functionality
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Mode Selection */}
            <div>
              <Label>Client Access Mode</Label>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setClientAccessMode('all')}
                  className={`px-4 py-2 rounded ${clientAccessMode === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                >
                  All Clients
                </button>
                <button
                  onClick={() => setClientAccessMode('groups')}
                  className={`px-4 py-2 rounded ${clientAccessMode === 'groups' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                >
                  Groups
                </button>
                <button
                  onClick={() => setClientAccessMode('individual')}
                  className={`px-4 py-2 rounded ${clientAccessMode === 'individual' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                >
                  Individual
                </button>
              </div>
            </div>

            {/* Client Groups */}
            {clientAccessMode === 'groups' && (
              <div>
                <Label>Select Client Groups</Label>
                <div className="border rounded p-2 mt-2">
                  {testClientGroups.map((group) => (
                    <label key={group} className="flex items-center gap-2 p-2">
                      <input
                        type="checkbox"
                        checked={assignedGroups.includes(group)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedGroups([...assignedGroups, group]);
                          } else {
                            setAssignedGroups(assignedGroups.filter(g => g !== group));
                          }
                        }}
                      />
                      <span>{group}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">{assignedGroups.length} selected</p>
              </div>
            )}

            {/* Individual Clients */}
            {clientAccessMode === 'individual' && (
              <div>
                <Label>Select Clients</Label>
                <div className="border rounded p-2 mt-2">
                  {testClients.map((client) => (
                    <label key={client} className="flex items-center gap-2 p-2">
                      <input
                        type="checkbox"
                        checked={assignedClients.includes(client)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedClients([...assignedClients, client]);
                          } else {
                            setAssignedClients(assignedClients.filter(c => c !== client));
                          }
                        }}
                      />
                      <span>{client}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">{assignedClients.length} selected</p>
              </div>
            )}

            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Display State */}
      <div className="mt-8 p-4 border rounded">
        <h2 className="font-bold mb-2">Current State:</h2>
        <p>Mode: {clientAccessMode}</p>
        <p>Groups: {assignedGroups.join(', ') || 'none'}</p>
        <p>Clients: {assignedClients.join(', ') || 'none'}</p>
      </div>
    </div>
  );
}