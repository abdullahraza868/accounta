import { IdCard, Edit2, Save, X, Calendar, MapPin, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

type DriverLicenseData = {
  dlNumber: string;
  dlIssuedState: string;
  dlIssuedDate: string;
  dlExpirationDate: string;
  dlFrontImage: string;
  dlBackImage: string;
};

type DriverLicenseCardProps = {
  data: DriverLicenseData;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (data: DriverLicenseData) => void;
};

export function DriverLicenseCard({
  data,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
}: DriverLicenseCardProps) {
  const [showFullView, setShowFullView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a URL for the uploaded file (in a real app, this would upload to a server)
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      if (side === 'front') {
        onChange({ ...data, dlFrontImage: imageUrl });
      } else {
        onChange({ ...data, dlBackImage: imageUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Card className="overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Driver&apos;s License</h3>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 px-2 text-xs gap-1.5">
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 px-2 text-xs gap-1.5">
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </Button>
                  <Button variant="default" size="sm" onClick={onSave} className="h-7 px-2 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700">
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!isEditing ? (
            // VIEW MODE
            <div className="flex gap-4 p-4">
              {/* Left: License Details - 60% */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">License Number</div>
                  <div className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                    {data.dlNumber || '—'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Issued State
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{data.dlIssuedState || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Issue Date
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {data.dlIssuedDate ? new Date(data.dlIssuedDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : '—'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Expiration Date
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {data.dlExpirationDate ? new Date(data.dlExpirationDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : '—'}
                  </div>
                </div>
              </div>

              {/* Right: License Image - 40% */}
              <div className="w-[40%] flex-shrink-0">
                {(data.dlFrontImage || data.dlBackImage) ? (
                  <>
                    <div 
                      className="aspect-[1.6/1] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                      onClick={() => setShowFullView(true)}
                    >
                      <img 
                        src={isHovering && data.dlBackImage ? data.dlBackImage : data.dlFrontImage} 
                        alt={isHovering ? "Driver's License Back" : "Driver's License Front"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      {isHovering ? 'Back side (click to view full)' : 'Hover for back • Click to view full'}
                    </div>
                  </>
                ) : (
                  <div className="aspect-[1.6/1] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                    <div className="text-center">
                      <IdCard className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">No image uploaded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // EDIT MODE
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="dlNumber" className="text-xs">License Number</Label>
                <Input
                  id="dlNumber"
                  value={data.dlNumber}
                  onChange={(e) => onChange({ ...data, dlNumber: e.target.value })}
                  className="mt-1"
                  placeholder="Enter license number"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dlIssuedState" className="text-xs">Issued State</Label>
                  <Select 
                    value={data.dlIssuedState} 
                    onValueChange={(val) => onChange({ ...data, dlIssuedState: val })}
                  >
                    <SelectTrigger id="dlIssuedState" className="mt-1">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dlIssuedDate" className="text-xs">Issue Date</Label>
                  <Input
                    id="dlIssuedDate"
                    type="date"
                    value={data.dlIssuedDate}
                    onChange={(e) => onChange({ ...data, dlIssuedDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dlExpirationDate" className="text-xs">Expiration Date</Label>
                <Input
                  id="dlExpirationDate"
                  type="date"
                  value={data.dlExpirationDate}
                  onChange={(e) => onChange({ ...data, dlExpirationDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* License Image Uploads */}
              <div className="grid grid-cols-2 gap-3">
                {/* Front Image Upload */}
                <div>
                  <Label className="text-xs mb-2 block">Front Image</Label>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'front')}
                    className="hidden"
                  />
                  {data.dlFrontImage ? (
                    <div className="space-y-2">
                      <div className="aspect-[1.6/1] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                        <img 
                          src={data.dlFrontImage} 
                          alt="License Front"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => frontInputRef.current?.click()}
                        className="w-full text-xs gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Replace Front
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => frontInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 flex flex-col gap-1.5"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Upload Front</span>
                    </Button>
                  )}
                </div>

                {/* Back Image Upload */}
                <div>
                  <Label className="text-xs mb-2 block">Back Image</Label>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'back')}
                    className="hidden"
                  />
                  {data.dlBackImage ? (
                    <div className="space-y-2">
                      <div className="aspect-[1.6/1] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                        <img 
                          src={data.dlBackImage} 
                          alt="License Back"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => backInputRef.current?.click()}
                        className="w-full text-xs gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Replace Back
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => backInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 flex flex-col gap-1.5"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Upload Back</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full View Dialog */}
      <Dialog open={showFullView} onOpenChange={setShowFullView}>
        <DialogContent className="max-w-5xl" aria-describedby="driver-license-full-view-description">
          <DialogHeader>
            <DialogTitle>Driver&apos;s License</DialogTitle>
            <DialogDescription id="driver-license-full-view-description">View the front and back of your driver&apos;s license in full size.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Front Image */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Front</Label>
              {data.dlFrontImage ? (
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                  <img 
                    src={data.dlFrontImage} 
                    alt="License Front - Full View"
                    className="w-full h-auto object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-[1.6/1] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                  <div className="text-center">
                    <IdCard className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No front image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Back Image */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Back</Label>
              {data.dlBackImage ? (
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                  <img 
                    src={data.dlBackImage} 
                    alt="License Back - Full View"
                    className="w-full h-auto object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-[1.6/1] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                  <div className="text-center">
                    <IdCard className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No back image</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}