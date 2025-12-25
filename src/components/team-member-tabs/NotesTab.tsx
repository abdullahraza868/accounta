import { TeamMember } from '../folder-tabs/TeamsTab';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  StickyNote,
  Plus,
  Search,
  Edit,
  Trash2,
  Pin,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type NotesTabProps = {
  member: TeamMember;
};

type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdBy: string;
  createdDate: string;
  isPinned: boolean;
};

export function NotesTab({ member }: NotesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  const notes: Note[] = [
    {
      id: '1',
      title: 'Performance Review Notes',
      content: 'Excellent performance in Q3. Exceeded sales targets by 25%. Strong teamwork and leadership shown during the Smith project.',
      category: 'Performance',
      createdBy: 'Sarah Johnson',
      createdDate: '2024-09-28',
      isPinned: true
    },
    {
      id: '2',
      title: 'Training & Development',
      content: 'Completed cybersecurity training. Recommended for advanced project management certification.',
      category: 'Training',
      createdBy: 'HR Department',
      createdDate: '2024-10-05',
      isPinned: true
    },
    {
      id: '3',
      title: 'PTO Request',
      content: 'Requested time off for November 15-17 for family vacation. Approved.',
      category: 'General',
      createdBy: 'HR Department',
      createdDate: '2024-10-20',
      isPinned: false
    },
    {
      id: '4',
      title: 'Salary Review',
      content: 'Due for annual salary review in January 2025. Consider 5-7% increase based on performance.',
      category: 'Compensation',
      createdBy: 'Sarah Johnson',
      createdDate: '2024-10-01',
      isPinned: false
    },
    {
      id: '5',
      title: 'Equipment Request',
      content: 'Requested new laptop for improved performance. Approved - MacBook Pro ordered.',
      category: 'IT',
      createdBy: 'IT Department',
      createdDate: '2024-09-15',
      isPinned: false
    },
  ];

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const regularNotes = filteredNotes.filter(note => !note.isPinned);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Performance': 'bg-purple-50 text-purple-700 border-purple-200',
      'Training': 'bg-blue-50 text-blue-700 border-blue-200',
      'General': 'bg-gray-50 text-gray-700 border-gray-200',
      'Compensation': 'bg-green-50 text-green-700 border-green-200',
      'IT': 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
          <p className="text-sm text-gray-500 mt-1">Internal notes for {member.name}</p>
        </div>
        <Button 
          onClick={() => setShowAddNote(!showAddNote)}
          className="bg-gradient-to-br from-purple-600 to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <Card className="p-5 border border-purple-200 bg-purple-50/30 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">New Note</h3>
          <div className="space-y-3">
            <Input placeholder="Note title..." />
            <Textarea placeholder="Note content..." rows={4} />
            <div className="flex items-center justify-between">
              <select className="text-sm border border-gray-200 rounded-md px-3 py-2">
                <option>General</option>
                <option>Performance</option>
                <option>Training</option>
                <option>Compensation</option>
                <option>IT</option>
              </select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddNote(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-to-br from-purple-600 to-purple-700">
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900">Pinned Notes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedNotes.map((note) => (
              <Card key={note.id} className="p-4 border border-purple-200/60 bg-purple-50/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Pin className="w-4 h-4 text-purple-600" />
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(note.category)}`}>
                      {note.category}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-3 h-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pin className="w-3 h-3 mr-2" />
                        Unpin
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{note.title}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{note.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{note.createdBy}</span>
                  <span>{new Date(note.createdDate).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && (
          <h3 className="text-sm font-semibold text-gray-900">All Notes</h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regularNotes.map((note) => (
            <Card key={note.id} className="p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className={`text-xs ${getCategoryColor(note.category)}`}>
                  {note.category}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-3 h-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pin className="w-3 h-3 mr-2" />
                      Pin Note
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{note.title}</h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{note.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{note.createdBy}</span>
                <span>{new Date(note.createdDate).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {filteredNotes.length === 0 && (
        <Card className="p-12 border border-gray-200/60 shadow-sm">
          <div className="text-center">
            <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm
                ? 'No notes found matching your search'
                : 'No notes added yet'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
