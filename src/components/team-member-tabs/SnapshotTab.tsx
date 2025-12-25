import { TeamMember } from '../folder-tabs/TeamsTab';
import { Card } from '../ui/card';
import { 
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../ui/badge';

type SnapshotTabProps = {
  member: TeamMember;
};

export function SnapshotTab({ member }: SnapshotTabProps) {
  // Mock data for employee snapshot
  const employeeData = {
    employeeId: 'EMP-' + member.id.padStart(5, '0'),
    salary: '$85,000',
    payPeriod: 'Bi-weekly',
    nextReview: '2024-06-15',
    ptoBalance: '12.5 days',
    sickLeave: '5 days',
    officeLocation: 'New York Office',
    reportsTo: 'Sarah Johnson',
    directReports: 3,
    performanceRating: 4.5,
    lastRaise: '2024-01-01',
    raiseAmount: '5%'
  };

  const recentActivity = [
    { date: '2024-10-20', type: 'Time Off', description: 'Requested 3 days PTO for Nov 15-17', status: 'Approved' },
    { date: '2024-10-15', type: 'Expense', description: 'Submitted travel expense ($450)', status: 'Pending' },
    { date: '2024-10-10', type: 'Document', description: 'Uploaded W-4 form', status: 'Completed' },
    { date: '2024-10-05', type: 'Training', description: 'Completed cybersecurity training', status: 'Completed' },
  ];

  const upcomingEvents = [
    { date: '2024-11-01', event: 'Performance Review', type: 'Meeting' },
    { date: '2024-11-15', event: 'PTO: Thanksgiving Break', type: 'Time Off' },
    { date: '2024-12-01', event: 'Benefits Enrollment Deadline', type: 'Action Required' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Employment Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Employment Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border border-gray-200/60 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Employee ID</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{employeeData.employeeId}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-gray-200/60 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Salary</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{employeeData.salary}</p>
                <p className="text-xs text-gray-500 mt-0.5">{employeeData.payPeriod}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-gray-200/60 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">PTO Balance</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{employeeData.ptoBalance}</p>
                <p className="text-xs text-gray-500 mt-0.5">{employeeData.sickLeave} sick</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-gray-200/60 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Performance</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{employeeData.performanceRating}/5.0</p>
                <p className="text-xs text-gray-500 mt-0.5">Exceeds Expectations</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employment Details */}
        <Card className="p-5 border border-gray-200/60 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Employment Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Office Location</p>
                <p className="text-sm text-gray-900">{employeeData.officeLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Reports To</p>
                <p className="text-sm text-gray-900">{employeeData.reportsTo}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="text-sm text-gray-900">
                  {member.employmentDate ? new Date(member.employmentDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Last Raise</p>
                <p className="text-sm text-gray-900">
                  {employeeData.raiseAmount} on {new Date(employeeData.lastRaise).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-5 border border-gray-200/60 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <Calendar className="w-4 h-4 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{event.event}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="mt-0.5">
                {activity.status === 'Completed' || activity.status === 'Approved' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      activity.status === 'Completed' || activity.status === 'Approved'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-orange-50 text-orange-700 border-orange-200'
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
