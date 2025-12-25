import { TeamMember } from '../folder-tabs/TeamsTab';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Clock,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';

type ActivityTabProps = {
  member: TeamMember;
};

export function ActivityTab({ member }: ActivityTabProps) {
  const activities = [
    {
      id: '1',
      type: 'Time Off Request',
      description: 'Requested 3 days PTO for November 15-17',
      date: '2024-10-20 09:30 AM',
      status: 'Approved',
      icon: Calendar,
      color: 'green'
    },
    {
      id: '2',
      type: 'Expense Submitted',
      description: 'Travel expense report for client meeting ($450.00)',
      date: '2024-10-15 02:15 PM',
      status: 'Pending',
      icon: DollarSign,
      color: 'orange'
    },
    {
      id: '3',
      type: 'Document Uploaded',
      description: 'Updated W-4 tax form',
      date: '2024-10-10 11:00 AM',
      status: 'Completed',
      icon: FileText,
      color: 'blue'
    },
    {
      id: '4',
      type: 'Training Completed',
      description: 'Completed Cybersecurity Awareness training',
      date: '2024-10-05 04:30 PM',
      status: 'Completed',
      icon: CheckCircle2,
      color: 'green'
    },
    {
      id: '5',
      type: 'Performance Review',
      description: 'Q3 Performance review scheduled',
      date: '2024-09-28 10:00 AM',
      status: 'Scheduled',
      icon: Calendar,
      color: 'purple'
    },
    {
      id: '6',
      type: 'Benefits Update',
      description: 'Updated health insurance beneficiaries',
      date: '2024-09-15 01:45 PM',
      status: 'Completed',
      icon: FileText,
      color: 'blue'
    },
    {
      id: '7',
      type: 'Time Off Request',
      description: 'Requested 1 sick day',
      date: '2024-09-08 08:00 AM',
      status: 'Approved',
      icon: Calendar,
      color: 'green'
    },
    {
      id: '8',
      type: 'Direct Deposit',
      description: 'Updated direct deposit information',
      date: '2024-08-22 03:20 PM',
      status: 'Completed',
      icon: DollarSign,
      color: 'blue'
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Pending':
      case 'Scheduled':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Pending':
      case 'Scheduled':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
        <p className="text-sm text-gray-500 mt-1">Complete activity history for {member.name}</p>
      </div>

      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(activity.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {activity.date}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
