import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { PhoneInput } from '../../ui/phone-input';
import { Building2, Mail, Phone, MapPin, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function FirmDemographicsView() {
  const [formData, setFormData] = useState({
    firmName: 'Accounting1',
    subDomain: 'Accounting1',
    addressLine1: 'Village - Kasaria, PO - Ratti, Teh - Balh, Distt. - Mandi, HP1',
    addressLine2: '',
    city: 'Mandi',
    state: 'Himachal Pradesh',
    phoneNumber: '+1 353-534-5433',
    zipCode: '175008',
    email: 'abhit.fc720@gmail.com'
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Firm demographics saved successfully');
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData({
      firmName: 'Accounting1',
      subDomain: 'Accounting1',
      addressLine1: 'Village - Kasaria, PO - Ratti, Teh - Balh, Distt. - Mandi, HP1',
      addressLine2: '',
      city: 'Mandi',
      state: 'Himachal Pradesh',
      phoneNumber: '+1 353-534-5433',
      zipCode: '175008',
      email: 'abhit.fc720@gmail.com'
    });
    setHasChanges(false);
    toast.success('Reset to original values');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1200px] mx-auto p-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 mb-2">Firm Demographics</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your firm's basic information and contact details
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!hasChanges}
                className="gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Firm Identity Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-medium">Firm Identity</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your firm's name and domain information</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Firm Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firmName" className="text-gray-700 dark:text-gray-300">
                      Firm Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firmName"
                      value={formData.firmName}
                      onChange={(e) => handleChange('firmName', e.target.value)}
                      required
                      className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      placeholder="Enter your firm name"
                    />
                  </div>

                  {/* Firm Sub Domain */}
                  <div className="space-y-2">
                    <Label htmlFor="subDomain" className="text-gray-700 dark:text-gray-300">
                      Firm Sub Domain <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="subDomain"
                        value={formData.subDomain}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          Read-only
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your subdomain cannot be changed after setup
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-medium">Contact Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone and email details</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-gray-700 dark:text-gray-300">
                      Phone Number
                    </Label>
                    <PhoneInput
                      value={formData.phoneNumber}
                      onChange={(value) => handleChange('phoneNumber', value)}
                      placeholder="201-555-0123"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        placeholder="contact@firm.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Address Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-medium">Physical Address</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your firm's mailing address</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {/* Address Lines */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1" className="text-gray-700 dark:text-gray-300">
                        Address Line 1
                      </Label>
                      <Input
                        id="addressLine1"
                        value={formData.addressLine1}
                        onChange={(e) => handleChange('addressLine1', e.target.value)}
                        className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        placeholder="Street address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2" className="text-gray-700 dark:text-gray-300">
                        Address Line 2
                      </Label>
                      <Input
                        id="addressLine2"
                        value={formData.addressLine2}
                        onChange={(e) => handleChange('addressLine2', e.target.value)}
                        className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        placeholder="Apartment, suite, unit, etc. (optional)"
                      />
                    </div>
                  </div>

                  {/* City, State, Zip */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">
                        City
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        placeholder="City"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-gray-700 dark:text-gray-300">
                        State / Province
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        placeholder="State"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-gray-700 dark:text-gray-300">
                        Zip / Postal Code
                      </Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleChange('zipCode', e.target.value)}
                        className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        placeholder="Zip code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Why do we need this information?
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This information appears on client invoices, reports, and official correspondence. 
                    Keeping it accurate ensures professional communication with your clients.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}