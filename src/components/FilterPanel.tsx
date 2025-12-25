import { X, Calendar, Tag, Users, DollarSign, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

type FilterPanelProps = {
  onClose: () => void;
};

export function FilterPanel({ onClose }: FilterPanelProps) {
  return (
    <div className="w-full h-full flex flex-col bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-900/5 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-200/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-brand-gradient tracking-tight">
              Filter Clients
            </h2>
            <p className="text-xs text-gray-500 mt-1">Apply filters to refine your client list</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Active Filters */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Active Filters</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2 pr-1">
              <span>Premium Clients</span>
              <button className="hover:bg-gray-300 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </Badge>
            <Badge variant="secondary" className="gap-2 pr-1">
              <span>Created this month</span>
              <button className="hover:bg-gray-300 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Client Groups */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-purple-600" />
            <Label className="text-sm font-medium text-gray-700">Client Groups</Label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm">Premium</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm">Trial</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm">FreeTrial</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm">Fit-St Premium</span>
            </label>
          </div>
        </div>

        <Separator />

        {/* Assigned To */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-purple-600" />
            <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm">Sarah Johnson</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm">Mike Brown</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm">Emily Davis</span>
            </label>
          </div>
        </div>

        <Separator />

        {/* Date Range */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-purple-600" />
            <Label className="text-sm font-medium text-gray-700">Created Date</Label>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">From</Label>
              <Input type="date" className="h-10 rounded-xl border-gray-200/60" />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">To</Label>
              <Input type="date" className="h-10 rounded-xl border-gray-200/60" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-purple-600" />
            <Label className="text-sm font-medium text-gray-700">Tags</Label>
          </div>
          <Input 
            placeholder="Search tags..." 
            className="h-10 rounded-xl border-gray-200/60 mb-3"
          />
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-purple-50">Tax Planning</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-purple-50">Bookkeeping</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-purple-50">VIP</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-purple-50">Onboarding</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-purple-50">Tax 2024</Badge>
          </div>
        </div>

        <Separator />

        {/* Revenue Range */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <Label className="text-sm font-medium text-gray-700">Annual Revenue</Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Min</Label>
              <Input 
                type="number" 
                placeholder="$0" 
                className="h-10 rounded-xl border-gray-200/60"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Max</Label>
              <Input 
                type="number" 
                placeholder="$1,000,000" 
                className="h-10 rounded-xl border-gray-200/60"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Location */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-purple-600" />
            <Label className="text-sm font-medium text-gray-700">Location</Label>
          </div>
          <Input 
            placeholder="City, State, or ZIP" 
            className="h-10 rounded-xl border-gray-200/60"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200/50 p-5 bg-gradient-to-r from-white to-gray-50/50">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 h-10 rounded-xl"
            onClick={onClose}
          >
            Clear All
          </Button>
          <Button 
            className="flex-1 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
