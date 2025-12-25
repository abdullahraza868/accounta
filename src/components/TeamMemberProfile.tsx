import { 
  Gauge,
  User,
  Activity,
  MessageSquare, 
  FolderOpen,
  StickyNote,
  MessageCircle,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Ban,
  CheckCircle2
} from 'lucide-react';
import { TeamMember } from './folder-tabs/TeamsTab';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { SnapshotTab } from './team-member-tabs/SnapshotTab';
import { DemographicsTab } from './team-member-tabs/DemographicsTab';
import { ActivityTab } from './team-member-tabs/ActivityTab';
import { CommunicationTab } from './team-member-tabs/CommunicationTab';
import { DocumentsTab } from './team-member-tabs/DocumentsTab';
import { NotesTab } from './team-member-tabs/NotesTab';
import { ChatChannelTab } from './team-member-tabs/ChatChannelTab';

type TeamMemberProfileProps = {
  member: TeamMember;
  onClose: () => void;
};

type ProfileTab = 'Snapshot' | 'Demographics' | 'Activity' | 'Communication' | 'Documents' | 'Notes' | 'Chat Channel';

export function TeamMemberProfile({ member, onClose }: TeamMemberProfileProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('Snapshot');

  const tabs: { label: ProfileTab; icon: React.ElementType }[] = [
    { label: 'Snapshot', icon: Gauge },
    { label: 'Demographics', icon: User },
    { label: 'Activity', icon: Activity },
    { label: 'Communication', icon: MessageSquare },
    { label: 'Documents', icon: FolderOpen },
    { label: 'Notes', icon: StickyNote },
    { label: 'Chat Channel', icon: MessageCircle },
  ];

  const getRelationshipColor = (relationship: string) => {
    const colors: Record<string, string> = {
      'Partner': 'bg-purple-50 text-purple-700 border-purple-200',
      'Employee': 'bg-blue-50 text-blue-700 border-blue-200',
      'Accountant': 'bg-green-50 text-green-700 border-green-200',
      'Bookkeeper': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Manager': 'bg-orange-50 text-orange-700 border-orange-200',
      'Director': 'bg-pink-50 text-pink-700 border-pink-200',
      'Shareholder': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Consultant': 'bg-teal-50 text-teal-700 border-teal-200',
      'Advisor': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'Other': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[relationship] || colors['Other'];
  };

  return (
    <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-900/5 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6">
        <div className="flex items-start justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Button>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs border-white/30",
                member.status === 'Active' 
                  ? 'bg-green-500/20 text-white'
                  : 'bg-gray-500/20 text-white'
              )}
            >
              {member.status === 'Active' ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : (
                <Ban className="w-3 h-3 mr-1" />
              )}
              {member.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-2 border-white/30">
            <span className="text-2xl font-semibold text-white">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-white mb-1">{member.name}</h1>
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                variant="outline" 
                className={cn("text-xs border-white/30 bg-white/10 text-white", getRelationshipColor(member.relationship))}
              >
                {member.relationship}
              </Badge>
              {member.title && (
                <span className="text-sm text-white/90">• {member.title}</span>
              )}
              {member.department && (
                <span className="text-sm text-white/70">• {member.department}</span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{member.phone}</span>
              </div>
              {member.employmentDate && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Since {new Date(member.employmentDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-200/50">
        <div className="flex items-center gap-1 px-5">
          {tabs.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 text-sm font-medium",
                activeTab === label
                  ? "border-purple-600 text-purple-700 bg-purple-50/50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white">
        {activeTab === 'Snapshot' && <SnapshotTab member={member} />}
        {activeTab === 'Demographics' && <DemographicsTab member={member} />}
        {activeTab === 'Activity' && <ActivityTab member={member} />}
        {activeTab === 'Communication' && <CommunicationTab member={member} />}
        {activeTab === 'Documents' && <DocumentsTab member={member} />}
        {activeTab === 'Notes' && <NotesTab member={member} />}
        {activeTab === 'Chat Channel' && <ChatChannelTab member={member} />}
      </div>
    </div>
  );
}
