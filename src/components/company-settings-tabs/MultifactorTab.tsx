import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { Shield, Users, Building2 } from 'lucide-react';

type MFAOption = 'force' | 'allow';

type TeamMember = {
  id: string;
  name: string;
  role: string;
  mfaOption: MFAOption;
};

const mockAdminMembers: TeamMember[] = [
  { id: '1', name: 'Accounting1 User', role: 'ADMIN', mfaOption: 'allow' },
  { id: '2', name: 'safsdf dsfsdfsf', role: 'ADMIN', mfaOption: 'allow' },
  { id: '3', name: 'fssfsdf dsfsdfsd', role: 'ADMIN', mfaOption: 'allow' },
  { id: '4', name: 'test12 dsfsdsd', role: 'ADMIN', mfaOption: 'allow' },
  { id: '5', name: 'dfgdfgsdfg dfgdfgddfg', role: 'ADMIN', mfaOption: 'allow' },
  { id: '6', name: 'hghfhfg dfgfdf', role: 'ADMIN', mfaOption: 'allow' }
];

export function MultifactorTab() {
  const [clientMFA, setClientMFA] = useState<MFAOption>('force');
  const [adminMembers, setAdminMembers] = useState<TeamMember[]>(mockAdminMembers);

  const handleClientMFAChange = (value: string) => {
    setClientMFA(value as MFAOption);
  };

  const handleMemberMFAChange = (memberId: string, value: string) => {
    setAdminMembers(members =>
      members.map(m => m.id === memberId ? { ...m, mfaOption: value as MFAOption } : m)
    );
  };

  const handleSave = () => {
    toast.success('Multifactor authentication settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Client Section */}
      <Card className="p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 mb-1">Client</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure multifactor authentication requirements for all clients
            </p>
          </div>
        </div>

        <div className="pl-16">
          <div className="inline-block bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 mb-4">
            <span className="text-gray-700 dark:text-gray-300">All Clients</span>
          </div>

          <RadioGroup value={clientMFA} onValueChange={handleClientMFAChange} className="space-y-3">
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
              <RadioGroupItem value="force" id="client-force" className="text-purple-600" />
              <Label htmlFor="client-force" className="flex-1 cursor-pointer text-gray-700 dark:text-gray-300">
                Force 2-factor
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors bg-purple-50/50 dark:bg-purple-900/10">
              <RadioGroupItem value="allow" id="client-allow" className="text-purple-600" />
              <Label htmlFor="client-allow" className="flex-1 cursor-pointer text-gray-700 dark:text-gray-300">
                Allow user to choose
              </Label>
            </div>
          </RadioGroup>
        </div>
      </Card>

      {/* Team Members Section */}
      <Card className="p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 mb-1">Team Members</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure multifactor authentication for individual team members
            </p>
          </div>
        </div>

        <div className="pl-16 space-y-6">
          {/* ADMIN Role Section */}
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg px-4 py-2 mb-4">
              <Shield className="w-4 h-4" />
              <span>ADMIN</span>
            </div>

            <div className="space-y-4">
              {adminMembers.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
                >
                  {/* Member Info */}
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white mr-3">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">{member.name}</p>
                    </div>
                  </div>

                  {/* MFA Options */}
                  <RadioGroup
                    value={member.mfaOption}
                    onValueChange={(value) => handleMemberMFAChange(member.id, value)}
                    className="flex gap-3"
                  >
                    <div className="flex-1 flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                      <RadioGroupItem value="force" id={`${member.id}-force`} className="text-purple-600" />
                      <Label htmlFor={`${member.id}-force`} className="flex-1 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                        Force 2-factor
                      </Label>
                    </div>
                    <div className="flex-1 flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors bg-purple-50/50 dark:bg-purple-900/10">
                      <RadioGroupItem value="allow" id={`${member.id}-allow`} className="text-purple-600" />
                      <Label htmlFor={`${member.id}-allow`} className="flex-1 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                        Allow user to choose
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}