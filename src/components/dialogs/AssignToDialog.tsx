import React, { useState } from 'react';
import { X, Search, UserPlus, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AssignToDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onAssign: (teamMemberIds: string[]) => void;
}

// Mock team members data
const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Senior Accountant' },
  { id: '2', name: 'Michael Chen', email: 'michael@company.com', role: 'Tax Specialist' },
  { id: '3', name: 'Emily Rodriguez', email: 'emily@company.com', role: 'Bookkeeper' },
  { id: '4', name: 'David Thompson', email: 'david@company.com', role: 'CPA' },
  { id: '5', name: 'Jessica Williams', email: 'jessica@company.com', role: 'Account Manager' },
];

export function AssignToDialog({ isOpen, onClose, selectedCount, onAssign }: AssignToDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const filteredMembers = TEAM_MEMBERS.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleAssign = () => {
    onAssign(Array.from(selectedMembers));
    setSelectedMembers(new Set());
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSelectedMembers(new Set());
    setSearchQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))'
          }}
        >
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">
              Assign Clients to Team Member
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Assign <span className="font-semibold text-brand-primary">{selectedCount} client{selectedCount > 1 ? 's' : ''}</span> to team member(s)
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>

          {/* Team Members List */}
          <div className="space-y-2">
            {filteredMembers.map((member) => {
              const isSelected = selectedMembers.has(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-gray-200 hover:border-brand-primary/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-brand-primary border-brand-primary'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ background: 'var(--primaryColor)' }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>

                    {/* Email */}
                    <div className="text-sm text-gray-500 hidden md:block">
                      {member.email}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No team members found
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {selectedMembers.size > 0 && (
              <span>{selectedMembers.size} team member{selectedMembers.size > 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={selectedMembers.size === 0}
              className="rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Assign to {selectedMembers.size || '...'} Member{selectedMembers.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
