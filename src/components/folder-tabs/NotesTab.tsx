import { Client } from '../../App';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  StickyNote, 
  Plus, 
  Edit, 
  Trash2, 
  Star,
  Pin,
  Search,
  X
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Input } from '../ui/input';
import { useState } from 'react';

type NotesTabProps = {
  client: Client;
};

export function NotesTab({ client }: NotesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock notes data
  const notes = [
    { 
      id: 1, 
      content: 'Client prefers communication via email rather than phone calls. Best time to reach is mornings before 11am.', 
      date: '2024-10-15T10:30:00Z', 
      author: 'Sarah Johnson',
      isHighlighted: true,
      isPinned: true,
      category: 'Communication'
    },
    { 
      id: 2, 
      content: 'Quarterly review scheduled for Nov 15, 2024. Need to prepare financial statements and tax projections.', 
      date: '2024-10-10T14:20:00Z', 
      author: 'Mike Brown',
      isHighlighted: true,
      isPinned: false,
      category: 'Meetings'
    },
    { 
      id: 3, 
      content: 'Needs all tax documents submitted by Dec 1st for 2024 tax filing. Reminded client via email.', 
      date: '2024-10-05T09:15:00Z', 
      author: 'Sarah Johnson',
      isHighlighted: true,
      isPinned: false,
      category: 'Deadlines'
    },
    { 
      id: 4, 
      content: 'Client mentioned they are planning to expand business to two new locations in Q1 2025.', 
      date: '2024-09-28T16:45:00Z', 
      author: 'Emily Davis',
      isHighlighted: false,
      isPinned: false,
      category: 'Business Updates'
    },
    { 
      id: 5, 
      content: 'Updated banking information received and verified. New routing number on file.', 
      date: '2024-09-15T11:00:00Z', 
      author: 'Mike Brown',
      isHighlighted: false,
      isPinned: false,
      category: 'Banking'
    },
    { 
      id: 6, 
      content: 'Discussion about implementing new accounting software. Client interested in QuickBooks Online.', 
      date: '2024-09-01T13:30:00Z', 
      author: 'Sarah Johnson',
      isHighlighted: false,
      isPinned: false,
      category: 'Software'
    }
  ];

  const filteredNotes = searchTerm
    ? notes.filter(note => 
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : notes;

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const regularNotes = filteredNotes.filter(note => !note.isPinned);

  return (
    <div className="p-6 space-y-6">

      {/* Search - Right Side */}
      <div className="flex items-center justify-end">
        <div className="relative w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-8 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pinned Notes</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {pinnedNotes.map((note) => (
              <Card 
                key={note.id} 
                className={cn(
                  "p-4 border shadow-sm hover:shadow-md transition-all cursor-pointer",
                  note.isHighlighted 
                    ? "border-yellow-300 bg-yellow-50/50" 
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {note.category}
                      </Badge>
                      {note.isHighlighted && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <Pin className="w-3 h-3 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-xs text-gray-500">{note.author}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(note.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && (
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">All Notes</h3>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {regularNotes.map((note) => (
            <Card 
              key={note.id} 
              className={cn(
                "p-4 border shadow-sm hover:shadow-md transition-all cursor-pointer",
                note.isHighlighted 
                  ? "border-yellow-300 bg-yellow-50/50" 
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {note.category}
                    </Badge>
                    {note.isHighlighted && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-900 leading-relaxed">{note.content}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-xs text-gray-500">{note.author}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(note.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notes found</p>
        </div>
      )}
    </div>
  );
}
