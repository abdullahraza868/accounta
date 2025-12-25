import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSignature, 
  CheckCircle, 
  Clock,
  Eye,
  User,
  Calendar,
  Check,
  Building2,
  FileText,
  Download
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { cn } from './ui/utils';

type Recipient = {
  id: string;
  name: string;
  email: string;
  signedAt?: string;
};

type SignatureRequest = {
  id: string;
  documentName: string;
  documentType: 'custom' | '8879' | 'template';
  clientName: string;
  clientId: string;
  clientType: 'Individual' | 'Business';
  year: number;
  sentAt: string;
  recipients: Recipient[];
  totalSent: number;
  totalSigned: number;
};

// CONCEPT 1: Action on Hover - Clean & Minimal (Expands when flipped)
export function Concept1Card({ request }: { request: SignatureRequest }) {
  const navigate = useNavigate();
  const { formatDate } = useAppSettings();
  const [isFlipped, setIsFlipped] = React.useState(false);

  const mostRecentSignedDate = request.recipients
    .filter(r => r.signedAt)
    .map(r => new Date(r.signedAt!))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const completionStatus = request.totalSigned === request.totalSent ? 'complete' : 
                           request.totalSigned > 0 ? 'partial' : 'pending';

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="perspective-card cursor-pointer"
      onClick={handleCardClick}
      style={{
        perspective: '1000px',
        height: '280px'
      }}
    >
      <div 
        className="relative w-full h-full transition-transform duration-500 preserve-3d"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* FRONT SIDE - NORMAL */}
        <Card className="absolute inset-0 p-0 border-gray-200/60 dark:border-gray-700 hover:shadow-lg hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-200 flex flex-col backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          {/* Status Badge - Top Right Corner */}
          <div className="absolute top-2 right-2 z-10">
            {completionStatus === 'complete' && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-[10px]">
                <CheckCircle className="w-2.5 h-2.5" />
                <span>Complete</span>
              </div>
            )}
            {completionStatus === 'partial' && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-[10px]">
                <Clock className="w-2.5 h-2.5" />
                <span>Partial</span>
              </div>
            )}
            {completionStatus === 'pending' && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[10px]">
                <Clock className="w-2.5 h-2.5" />
                <span>Pending</span>
              </div>
            )}
          </div>

          {/* Card Header */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2.5">
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                {request.clientType === 'Business' ? (
                  <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                ) : (
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              
              {/* Client Name & Year Badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {request.clientName}
                  </h3>
                  <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 text-[10px] px-1.5 py-0 shrink-0">
                    {request.year}
                  </Badge>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  {request.documentType === '8879' ? 'Form 8879' : 
                   request.documentType === 'template' ? 'Template Doc' : 
                   'Custom Document'}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area - 3 Column Layout */}
          <div className="flex-1 px-3 pb-0 flex gap-3">
            {/* Left Column - Recipients List */}
            <div className="flex-1 min-w-0">
              <div className="space-y-1.5">
                {request.recipients.map((recipient) => (
                  <div 
                    key={recipient.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      recipient.signedAt 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {recipient.signedAt ? (
                        <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium text-gray-900 dark:text-gray-100 truncate">
                        {recipient.name}
                      </div>
                      <div className="text-[9px] text-gray-500 dark:text-gray-400 truncate">
                        {recipient.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Column - Document Thumbnail */}
            <div className="flex flex-col items-center justify-start gap-1.5 flex-shrink-0">
              {/* Document Thumbnail Box */}
              <div className="w-20 h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center border border-gray-300 dark:border-gray-600 shadow-sm relative overflow-hidden group">
                {/* Document Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileSignature className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-purple-600/90 dark:bg-purple-700/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-[10px] font-medium">Preview</span>
                </div>
              </div>
              
              {/* Document Name under thumbnail */}
              <div className="text-[10px] text-center text-gray-600 dark:text-gray-400 w-20 line-clamp-2">
                {request.documentName}
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div className="w-16 flex-shrink-0 flex flex-col">
              <div className="relative pl-3 flex-1 pb-8">
                {(() => {
                  // Build events array
                  const allEvents: Array<{ type: string; time: Date; color: string; icon: 'sent' | 'viewed' | 'signed' }> = [];
                  const sentTime = new Date(request.sentAt);
                  allEvents.push({ type: 'Sent', time: sentTime, color: 'blue', icon: 'sent' });
                  
                  // Add viewed/signed for each recipient (up to 3 recipients to avoid overflow)
                  const signedRecipients = request.recipients.filter(r => r.signedAt).slice(0, 3);
                  signedRecipients.forEach(recipient => {
                    const signedTime = new Date(recipient.signedAt!);
                    const sentMs = sentTime.getTime();
                    const signedMs = signedTime.getTime();
                    const viewedMs = sentMs + (signedMs - sentMs) * 0.6;
                    allEvents.push({ type: 'Viewed', time: new Date(viewedMs), color: 'purple', icon: 'viewed' });
                    allEvents.push({ type: 'Signed', time: signedTime, color: 'green', icon: 'signed' });
                  });
                  
                  // Sort events by time
                  allEvents.sort((a, b) => a.time.getTime() - b.time.getTime());
                  if (allEvents.length === 0) return null;
                  
                  // Calculate time range
                  const firstTime = allEvents[0].time.getTime();
                  const lastTime = allEvents[allEvents.length - 1].time.getTime();
                  const totalSpan = lastTime - firstTime;
                  
                  // Define containment boundaries
                  const MIN_TOP = 8; // Top margin percentage
                  const MAX_BOTTOM = 88; // Bottom limit percentage
                  const USABLE_HEIGHT = MAX_BOTTOM - MIN_TOP;
                  const MIN_SPACING = 16; // Minimum spacing between events
                  
                  // Calculate initial time-proportional positions
                  const positions = allEvents.map((event, index) => {
                    if (totalSpan === 0) {
                      // If all events at same time, space evenly
                      return MIN_TOP + (index * MIN_SPACING);
                    }
                    // Position based on time proportion
                    const timeRatio = (event.time.getTime() - firstTime) / totalSpan;
                    return MIN_TOP + (timeRatio * USABLE_HEIGHT);
                  });
                  
                  // Enforce minimum spacing to prevent overlap
                  for (let i = 1; i < positions.length; i++) {
                    if (positions[i] - positions[i - 1] < MIN_SPACING) {
                      positions[i] = positions[i - 1] + MIN_SPACING;
                    }
                  }
                  
                  // If last position exceeds bounds, compress all positions uniformly
                  if (positions[positions.length - 1] > MAX_BOTTOM) {
                    const overflow = positions[positions.length - 1] - MAX_BOTTOM;
                    for (let i = 0; i < positions.length; i++) {
                      positions[i] -= overflow;
                    }
                  }
                  
                  // Calculate line boundaries
                  const lineTop = positions[0];
                  const lineBottom = positions[positions.length - 1];
                  const hasMoreEvents = request.recipients.filter(r => r.signedAt).length > 3;
                  
                  return (
                    <>
                      {/* Vertical Timeline Line */}
                      <div 
                        className="absolute left-0 w-[1.5px] bg-gradient-to-b from-blue-400/50 via-purple-400/50 to-green-400/50 dark:from-blue-600/40 dark:via-purple-600/40 dark:to-green-600/40"
                        style={{
                          top: `${lineTop}%`,
                          height: `${lineBottom - lineTop}%`
                        }}
                      />
                      
                      {/* Timeline Events */}
                      {allEvents.map((event, index) => (
                        <div 
                          key={`${event.type}-${index}`} 
                          className="absolute left-0 flex items-start gap-2"
                          style={{ top: `${positions[index]}%` }}
                        >
                          {/* Dot on the line */}
                          <div 
                            className="w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center flex-shrink-0 -translate-x-[0.4375rem]"
                            style={{
                              backgroundColor: event.color === 'blue' ? 'rgb(96, 165, 250)' : 
                                             event.color === 'purple' ? 'rgb(192, 132, 252)' : 
                                             'rgb(74, 222, 128)'
                            }}
                          >
                            {event.icon === 'sent' && <div className="w-1 h-1 rounded-full bg-white"></div>}
                            {event.icon === 'viewed' && <Eye className="w-1.5 h-1.5 text-white" />}
                            {event.icon === 'signed' && <Check className="w-2 h-2 text-white" />}
                          </div>
                          
                          {/* Event details */}
                          <div className="-mt-0.5">
                            <div className="text-[9px] font-medium text-gray-700 dark:text-gray-300 leading-tight">{event.type}</div>
                            <div className="text-[8px] text-gray-500 dark:text-gray-400 leading-tight">{formatDate(event.time)}</div>
                            <div className="text-[8px] text-gray-500 dark:text-gray-500 leading-tight">
                              {event.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* More indicator */}
                      {hasMoreEvents && (
                        <div 
                          className="absolute left-0 text-[9px] text-gray-400 dark:text-gray-500"
                          style={{ top: `${lineBottom + 2}%` }}
                        >
                          <span className="-translate-x-1 inline-block">...</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Action Button Row - Always Visible */}
          <div className="px-3 pb-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('View document');
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">View</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Download document');
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Download</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/signature-requests/${request.id}/details`);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg text-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Details</span>
            </button>
          </div>
        </Card>

        {/* BACK SIDE - EXPANDED */}
        <Card className="absolute inset-0 p-0 border-gray-200/60 dark:border-gray-700 shadow-xl flex flex-col backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Back Header */}
          <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border-b border-purple-200/50 dark:border-purple-800/50 rounded-t-lg">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="uppercase tracking-wide text-purple-700 dark:text-purple-400 font-medium">
                  Details
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Back Content - No Scroll */}
          <div className="p-4 flex-1 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900">
            {/* Document & Client Header */}
            <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  {request.clientType === 'Business' ? (
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{request.clientName}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{request.documentName}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 text-[10px] px-2 py-0.5">
                  {request.year}
                </Badge>
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 text-[10px] px-2 py-0.5">
                  {request.clientType}
                </Badge>
              </div>
            </div>

            {/* Recipients - Compact */}
            <div className="space-y-2.5">
              {request.recipients.map((recipient, index) => {
                const viewedTime = recipient.signedAt 
                  ? new Date(new Date(recipient.signedAt).getTime() - 2 * 60 * 60 * 1000)
                  : null;
                const viewedIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
                const signedIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
                
                return (
                  <div 
                    key={recipient.id}
                    className="bg-white dark:bg-gray-800/50 rounded-xl p-2.5 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    {/* Name and Badge - Compact */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{recipient.name}</span>
                          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 text-[9px] px-1.5 py-0 shrink-0">
                            {index === 0 ? 'Primary' : 'Spouse'}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{recipient.email}</p>
                      </div>
                    </div>

                    {/* Activity Grid - Compact */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Viewed */}
                      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2 border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-1 mb-1">
                          <Eye className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                          <span className="text-[9px] font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">Viewed</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-gray-900 dark:text-gray-100 font-medium">
                            {viewedTime ? formatDate(viewedTime) : 'Not viewed'}
                          </div>
                          {viewedTime && (
                            <div className="text-[9px] text-gray-500 dark:text-gray-400 font-mono">
                              {viewedIP}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Signed */}
                      <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-2 border border-green-100 dark:border-green-900/30">
                        <div className="flex items-center gap-1 mb-1">
                          <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                          <span className="text-[9px] font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">Signed</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-gray-900 dark:text-gray-100 font-medium">
                            {recipient.signedAt ? formatDate(new Date(recipient.signedAt)) : 'Not signed'}
                          </div>
                          {recipient.signedAt && (
                            <div className="text-[9px] text-gray-500 dark:text-gray-400 font-mono">
                              {signedIP}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Back Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Sent: {formatDate(new Date(request.sentAt))}</span>
              </div>
              {mostRecentSignedDate && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Completed: {formatDate(mostRecentSignedDate)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// CONCEPT 3: Compact Card with Timeline - Flip card with 3-column layout
export function Concept3Card({ request, marginTop }: { request: SignatureRequest; marginTop?: string }) {
  const navigate = useNavigate();
  const { formatDate } = useAppSettings();
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const downloadButtonRef = React.useRef<HTMLDivElement>(null);

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Role-based colors (lighter versions for badges)
  const getRoleColor = (index: number) => {
    const colors = [
      { bg: 'rgb(147, 197, 253)', lightBg: 'rgb(191, 219, 254)' }, // Lighter blue for primary
      { bg: 'rgb(216, 180, 254)', lightBg: 'rgb(233, 213, 255)' }, // Lighter purple for spouse
      { bg: 'rgb(134, 239, 172)', lightBg: 'rgb(187, 247, 208)' }, // Lighter green for additional
    ];
    return colors[index % colors.length];
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={cn("perspective-card cursor-pointer", marginTop)}
      onClick={handleCardClick}
      style={{
        perspective: '1000px',
        height: '320px'
      }}
    >
      <div 
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* FRONT SIDE */}
        <Card className="absolute inset-0 p-0 border-gray-200/60 dark:border-gray-700 hover:shadow-lg hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-200 flex flex-col"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          {/* Green Bar Header - Recently Signed Status */}
          {request.totalSigned > 0 && (
            <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span className="text-[10px] font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">RECENTLY SIGNED</span>
                <Badge className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-green-200 dark:border-green-700 text-[9px] px-1.5 py-0">
                  {request.year}
                </Badge>
              </div>
              <div className="text-[9px] text-gray-600 dark:text-gray-400">
                Sent: {formatDate(new Date(request.sentAt))}
              </div>
            </div>
          )}

          {/* Header - User/Client Info */}
          <div className="px-3 pt-0 pb-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                request.clientType === 'Business' 
                  ? "bg-blue-100 dark:bg-blue-900/30" 
                  : "bg-green-100 dark:bg-green-900/30"
              )}>
                {request.clientType === 'Business' ? (
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {request.clientName}
                  </h3>
                  {!request.totalSigned && (
                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 text-[10px] px-1.5 py-0 shrink-0">
                      {request.year}
                    </Badge>
                  )}
                </div>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate">
                  {request.documentName}
                </p>
              </div>
            </div>
          </div>

          {/* Document Preview Overlay - Activated on thumbnail hover */}
          {showPreview && (
            <div 
              className="absolute left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-none"
              style={{
                top: request.totalSigned > 0 ? '48px' : '0px', // After recently signed bar
                bottom: '52px' // Above buttons
              }}
            >
              <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <FileSignature className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Document Preview</p>
              </div>
            </div>
          )}

          {/* Main Content - New Layout: SIGNED BY (left) | Thumbnail | Timeline (right) */}
          <div className="flex-1 px-3 pb-0 flex gap-2 min-h-0">
            {/* Left: SIGNED BY BOX - Takes most space */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="w-full bg-gray-50/80 dark:bg-gray-800/30 rounded-lg border border-gray-200/60 dark:border-gray-700/60 p-3">
                {/* Column Headers */}
                <div className="flex items-center gap-2.5 pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-6 flex-shrink-0"></div>
                  <div className="flex-1 text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Signed By
                  </div>
                  <div className="text-right flex-shrink-0 text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Signed Date
                  </div>
                </div>
                <div className="space-y-1.5">
                  {request.recipients.filter(r => r.signedAt).slice(0, 20).map((recipient) => {
                    const roleColor = getRoleColor(request.recipients.findIndex(r => r.id === recipient.id));
                    const initials = getInitials(recipient.name);
                    
                    return (
                      <div key={recipient.id} className="flex items-center gap-2 py-1">
                        {/* Name */}
                        <div className="flex-1 min-w-0 text-[9px] font-medium text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5">
                          {recipient.name}
                          {/* Green checkmark circle */}
                          <span className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </span>
                        </div>
                        {/* Date & Time */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-[8px] text-gray-600 dark:text-gray-400 font-medium">
                            {formatDate(new Date(recipient.signedAt!))}
                          </div>
                          <div className="text-[7px] text-gray-500 dark:text-gray-500">
                            {new Date(recipient.signedAt!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {request.recipients.filter(r => r.signedAt).length > 20 && (
                    <div className="text-[8px] text-center text-gray-400 dark:text-gray-500 italic pt-0.5">
                      +{request.recipients.filter(r => r.signedAt).length - 20} more
                    </div>
                  )}
                  {request.recipients.filter(r => !r.signedAt).length > 0 && (
                    <div className="text-[9px] text-center text-gray-400 dark:text-gray-500 italic pt-1.5 border-t border-gray-200 dark:border-gray-700 mt-1.5">
                      {request.recipients.filter(r => !r.signedAt).length} pending
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center-Right: Document Thumbnail */}
            <div 
              className="flex-shrink-0 cursor-pointer relative self-start mt-2"
              onMouseEnter={() => setShowPreview(true)}
              onMouseLeave={() => setShowPreview(false)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-16 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center border border-gray-300 dark:border-gray-600 shadow-sm">
                <FileSignature className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            {/* Right: Timeline - Rightmost position */}
            <div className="w-14 flex-shrink-0">
              <div className="relative h-full py-2">
                {(() => {
                  type TimelineEvent = {
                    type: 'sent' | 'resent' | 'viewed' | 'signed';
                    time: Date;
                    recipientIndex: number;
                    recipientName: string;
                  };

                  const events: TimelineEvent[] = [];
                  const sentTime = new Date(request.sentAt);

                  request.recipients.forEach((recipient, index) => {
                    events.push({
                      type: 'sent',
                      time: sentTime,
                      recipientIndex: index,
                      recipientName: recipient.name
                    });

                    if (recipient.signedAt) {
                      const signedTime = new Date(recipient.signedAt);
                      const sentMs = sentTime.getTime();
                      const signedMs = signedTime.getTime();
                      const viewedMs = sentMs + (signedMs - sentMs) * 0.6;
                      
                      events.push({
                        type: 'viewed',
                        time: new Date(viewedMs),
                        recipientIndex: index,
                        recipientName: recipient.name
                      });
                      
                      events.push({
                        type: 'signed',
                        time: signedTime,
                        recipientIndex: index,
                        recipientName: recipient.name
                      });
                    }
                  });

                  events.sort((a, b) => a.time.getTime() - b.time.getTime());
                  if (events.length === 0) return null;

                  const firstTime = events[0].time.getTime();
                  const lastTime = events[events.length - 1].time.getTime();
                  const totalSpan = lastTime - firstTime;
                  const MIN_TOP = 5;
                  const MAX_BOTTOM = 95;
                  const USABLE_HEIGHT = MAX_BOTTOM - MIN_TOP;
                  const MIN_SPACING = 16; // Minimum spacing to prevent overlap

                  const positions = events.map((event, index) => {
                    if (totalSpan === 0) {
                      return MIN_TOP + (index * MIN_SPACING);
                    }
                    const timeRatio = (event.time.getTime() - firstTime) / totalSpan;
                    return MIN_TOP + (timeRatio * USABLE_HEIGHT);
                  });

                  for (let i = 1; i < positions.length; i++) {
                    if (positions[i] - positions[i - 1] < MIN_SPACING) {
                      positions[i] = positions[i - 1] + MIN_SPACING;
                    }
                  }

                  if (positions[positions.length - 1] > MAX_BOTTOM) {
                    const overflow = positions[positions.length - 1] - MAX_BOTTOM;
                    for (let i = 0; i < positions.length; i++) {
                      positions[i] -= overflow;
                    }
                  }

                  const lineTop = positions[0];
                  const lineBottom = positions[positions.length - 1];
                  const hasMore = events.length > 5; // Show "more" if more than 5 events

                  return (
                    <>
                      <div 
                        className="absolute left-[5px] w-[1.5px] bg-gradient-to-b from-blue-300/50 via-purple-300/50 to-green-300/50 dark:from-blue-700/40 dark:via-purple-700/40 dark:to-green-700/40"
                        style={{
                          top: `${lineTop}%`,
                          height: `${lineBottom - lineTop}%`
                        }}
                      />

                      {events.slice(0, 5).map((event, index) => {
                        const initials = getInitials(event.recipientName);
                        const roleColor = getRoleColor(event.recipientIndex);

                        return (
                          <div
                            key={`${event.type}-${event.recipientIndex}-${index}`}
                            className="absolute left-[5px] -translate-x-1/2 flex items-center gap-1.5"
                            style={{ top: `${positions[index]}%` }}
                          >
                            {/* Dot with initials */}
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white border-2 border-white dark:border-gray-900 shadow-sm flex-shrink-0"
                              style={{ backgroundColor: roleColor.bg }}
                              title={`${event.type} - ${event.recipientName}`}
                            >
                              {initials}
                            </div>
                            {/* Event label and time */}
                            <div className="flex flex-col">
                              <span className="text-[8px] font-medium text-gray-700 dark:text-gray-300 capitalize">{event.type}</span>
                              <span className="text-[7px] text-gray-500 dark:text-gray-400">{formatDate(event.time)}</span>
                              <span className="text-[7px] text-gray-500 dark:text-gray-500">
                                {event.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {hasMore && (
                        <div 
                          className="absolute left-[5px] -translate-x-1/2 text-[8px] text-gray-400"
                          style={{ top: `${positions[4] + 3}%` }}
                        >
                          ···
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-3 pb-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('View');
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[10px] text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Eye className="w-3 h-3" />
              View
            </button>
            <div
              ref={downloadButtonRef}
              className="flex-1 relative"
              onMouseEnter={() => setShowDownloadMenu(true)}
              onMouseLeave={() => setShowDownloadMenu(false)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDownloadMenu(!showDownloadMenu);
                }}
                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[10px] text-gray-700 dark:text-gray-300 transition-colors"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
              {showDownloadMenu && (
                <div
                  className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Download Audit');
                      setShowDownloadMenu(false);
                    }}
                    className="w-full px-3 py-2 text-[10px] text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Download Audit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Download Document');
                      setShowDownloadMenu(false);
                    }}
                    className="w-full px-3 py-2 text-[10px] text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Download Document
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Download Both');
                      setShowDownloadMenu(false);
                    }}
                    className="w-full px-3 py-2 text-[10px] text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Download Both
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-lg text-[10px] transition-colors"
            >
              <FileText className="w-3 h-3" />
              Details
            </button>
          </div>
        </Card>

        {/* BACK SIDE */}
        <Card className="absolute inset-0 p-0 border-gray-200/60 dark:border-gray-700 shadow-xl flex flex-col"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Back Header */}
          <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border-b border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span className="text-[10px] uppercase tracking-wide text-purple-700 dark:text-purple-400 font-medium">
                Details
              </span>
            </div>
          </div>

          {/* Back Content */}
          <div className="flex-1 px-3 py-3 flex gap-2 min-h-0 overflow-y-auto">
            {/* Left: Detailed Recipients */}
            <div className="flex-1 min-w-0 space-y-2">
              {request.recipients.map((recipient, index) => {
                const viewedTime = recipient.signedAt 
                  ? new Date(new Date(recipient.signedAt).getTime() - 2 * 60 * 60 * 1000)
                  : null;
                const viewedIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
                const signedIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
                
                return (
                  <div 
                    key={recipient.id}
                    className="bg-white dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-medium text-gray-900 dark:text-gray-100 truncate">
                            {recipient.name}
                          </span>
                          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 text-[8px] px-1 py-0 shrink-0">
                            {index === 0 ? 'Primary' : 'Spouse'}
                          </Badge>
                        </div>
                        <p className="text-[8px] text-gray-500 dark:text-gray-400 truncate">{recipient.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                      <div className="bg-blue-50 dark:bg-blue-900/10 rounded p-1.5 border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-0.5 mb-0.5">
                          <Eye className="w-2 h-2 text-blue-600 dark:text-blue-400" />
                          <span className="text-[8px] font-medium text-blue-700 dark:text-blue-300 uppercase">Viewed</span>
                        </div>
                        {viewedTime ? (
                          <>
                            <div className="text-[9px] text-gray-900 dark:text-gray-100">{formatDate(viewedTime)}</div>
                            <div className="text-[7px] text-gray-500 dark:text-gray-400 font-mono">{viewedIP}</div>
                          </>
                        ) : (
                          <div className="text-[8px] text-gray-400">Not viewed</div>
                        )}
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/10 rounded p-1.5 border border-green-100 dark:border-green-900/30">
                        <div className="flex items-center gap-0.5 mb-0.5">
                          <Check className="w-2 h-2 text-green-600 dark:text-green-400" />
                          <span className="text-[8px] font-medium text-green-700 dark:text-green-300 uppercase">Signed</span>
                        </div>
                        {recipient.signedAt ? (
                          <>
                            <div className="text-[9px] text-gray-900 dark:text-gray-100">{formatDate(new Date(recipient.signedAt))}</div>
                            <div className="text-[7px] text-gray-500 dark:text-gray-400 font-mono">{signedIP}</div>
                          </>
                        ) : (
                          <div className="text-[8px] text-gray-400">Not signed</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Timeline (same as front) */}
            <div className="w-14 flex-shrink-0">
              <div className="relative h-full">
                {(() => {
                  type TimelineEvent = {
                    type: 'sent' | 'resent' | 'viewed' | 'signed';
                    time: Date;
                    recipientIndex: number;
                    recipientName: string;
                  };

                  const events: TimelineEvent[] = [];
                  const sentTime = new Date(request.sentAt);

                  request.recipients.forEach((recipient, index) => {
                    events.push({
                      type: 'sent',
                      time: sentTime,
                      recipientIndex: index,
                      recipientName: recipient.name
                    });

                    if (recipient.signedAt) {
                      const signedTime = new Date(recipient.signedAt);
                      const sentMs = sentTime.getTime();
                      const signedMs = signedTime.getTime();
                      const viewedMs = sentMs + (signedMs - sentMs) * 0.6;
                      
                      events.push({
                        type: 'viewed',
                        time: new Date(viewedMs),
                        recipientIndex: index,
                        recipientName: recipient.name
                      });
                      
                      events.push({
                        type: 'signed',
                        time: signedTime,
                        recipientIndex: index,
                        recipientName: recipient.name
                      });
                    }
                  });

                  events.sort((a, b) => a.time.getTime() - b.time.getTime());
                  if (events.length === 0) return null;

                  const firstTime = events[0].time.getTime();
                  const lastTime = events[events.length - 1].time.getTime();
                  const totalSpan = lastTime - firstTime;
                  const MIN_TOP = 2.5;
                  const MAX_BOTTOM = 97.5;
                  const USABLE_HEIGHT = MAX_BOTTOM - MIN_TOP;
                  const MIN_SPACING = 18; // Increased minimum spacing to prevent overlap

                  const positions = events.map((event, index) => {
                    if (totalSpan === 0) {
                      return MIN_TOP + (index * MIN_SPACING);
                    }
                    const timeRatio = (event.time.getTime() - firstTime) / totalSpan;
                    return MIN_TOP + (timeRatio * USABLE_HEIGHT);
                  });

                  for (let i = 1; i < positions.length; i++) {
                    if (positions[i] - positions[i - 1] < MIN_SPACING) {
                      positions[i] = positions[i - 1] + MIN_SPACING;
                    }
                  }

                  if (positions[positions.length - 1] > MAX_BOTTOM) {
                    const overflow = positions[positions.length - 1] - MAX_BOTTOM;
                    for (let i = 0; i < positions.length; i++) {
                      positions[i] -= overflow;
                    }
                  }

                  const lineTop = positions[0];
                  const lineBottom = positions[positions.length - 1];

                  return (
                    <>
                      <div 
                        className="absolute left-[5px] w-[1.5px] bg-gradient-to-b from-blue-300/50 via-purple-300/50 to-green-300/50 dark:from-blue-700/40 dark:via-purple-700/40 dark:to-green-700/40"
                        style={{
                          top: `${lineTop}%`,
                          height: `${lineBottom - lineTop}%`
                        }}
                      />

                      {events.map((event, index) => {
                        const initials = getInitials(event.recipientName);
                        const roleColor = getRoleColor(event.recipientIndex);

                        return (
                          <div
                            key={`${event.type}-${event.recipientIndex}-${index}`}
                            className="absolute left-[5px] -translate-x-1/2"
                            style={{ top: `${positions[index]}%` }}
                          >
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white border-2 border-white dark:border-gray-900 shadow-sm"
                              style={{ backgroundColor: roleColor.bg }}
                            >
                              {initials}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Back Footer - Button aligned with front Details button */}
          <div className="px-3 pb-3 flex gap-2">
            <div className="flex-1"></div>
            <div className="flex-1"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-lg text-[10px] transition-colors"
            >
              <FileText className="w-3 h-3" />
              Back
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// CONCEPT 3B: Even more compact card - For completed grid
export function Concept3BCard({ request }: { request: SignatureRequest }) {
  const navigate = useNavigate();
  const { formatDate } = useAppSettings();

  return (
    <Card 
      className="p-3 border-gray-200/60 dark:border-gray-700 hover:shadow-lg hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/signature-requests/${request.id}/details`)}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
          {request.clientType === 'Business' ? (
            <Building2 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          ) : (
            <User className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
            {request.clientName}
          </h3>
          <p className="text-[9px] text-gray-500 dark:text-gray-400">
            {request.year}
          </p>
        </div>
      </div>

      <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2 truncate">
        {request.documentName}
      </p>

      <div className="flex items-center justify-between text-[9px] text-gray-500 dark:text-gray-400">
        <span>{formatDate(new Date(request.sentAt))}</span>
        <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
      </div>
    </Card>
  );
}