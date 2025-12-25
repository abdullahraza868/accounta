import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Phone, User, Calendar, Clock, AlertCircle, CheckCircle2, X, Edit2 } from 'lucide-react';
import { cn } from '../ui/utils';

type CallbackPriority = 'low' | 'medium' | 'high';
type CallbackStatus = 'open' | 'not-reached' | 'completed';

type CallbackMessage = {
  id: string;
  clientName: string;
  scheduledDate: string;
  completionDate?: string;
  assignedBy: string;
  assignedByInitials: string;
  assignedTo?: string;
  assignedToInitials?: string;
  status: CallbackStatus;
  priority: CallbackPriority;
  message: string;
  phoneNumber?: string;
  createdAt: string;
};

type CallbackDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callback: CallbackMessage | null;
  onEdit?: (callback: CallbackMessage) => void;
};

export function CallbackDetailDialog({ open, onOpenChange, callback, onEdit }: CallbackDetailDialogProps) {
  if (!callback) return null;

  const getPriorityColor = (priority: CallbackPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status: CallbackStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'not-reached':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'open':
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (status: CallbackStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'not-reached':
        return <AlertCircle className="w-4 h-4" />;
      case 'open':
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="callback-detail-description"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.dataset.doubleClick === 'close') {
            onOpenChange(false);
          } else {
            target.dataset.doubleClick = 'close';
            setTimeout(() => {
              delete target.dataset.doubleClick;
            }, 300);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Phone className="w-6 h-6" style={{ color: 'var(--primaryColor)' }} />
            Callback Message Details
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400" id="callback-detail-description">
            View complete information for this callback message
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Status and Priority Badges */}
          <div className="flex items-center gap-3">
            <Badge className={cn("flex items-center gap-1.5", getStatusColor(callback.status))}>
              {getStatusIcon(callback.status)}
              <span className="capitalize">{callback.status.replace('-', ' ')}</span>
            </Badge>
            <Badge className={cn("flex items-center gap-1.5", getPriorityColor(callback.priority))}>
              <AlertCircle className="w-4 h-4" />
              <span className="capitalize">{callback.priority} Priority</span>
            </Badge>
          </div>

          {/* Client Information */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Client Information</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Client Name</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{callback.clientName}</span>
              </div>
              {callback.phoneNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Phone Number</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{callback.phoneNumber}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Assignment Information */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Assignment</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Assigned By</span>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                      {callback.assignedByInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{callback.assignedBy}</span>
                </div>
              </div>
              {callback.assignedTo && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Assigned To</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {callback.assignedToInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{callback.assignedTo}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Dates */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Timeline</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{callback.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Scheduled Date</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{callback.scheduledDate}</span>
              </div>
              {callback.completionDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">{callback.completionDate}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Message */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Message</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              {callback.message}
            </p>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onEdit(callback);
                onOpenChange(false);
              }}
              className="gap-2"
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}