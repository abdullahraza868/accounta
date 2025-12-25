import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';

export function FirmTab() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Firm settings saved successfully');
  };

  return (
    <Card className="p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Firm Name */}
          <div className="space-y-2">
            <Label htmlFor="firmName">
              Firm name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firmName"
              value={formData.firmName}
              onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
              required
              className="bg-white dark:bg-gray-900"
            />
          </div>

          {/* Firm Sub Domain */}
          <div className="space-y-2">
            <Label htmlFor="subDomain">
              Firm Sub Domain <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subDomain"
              value={formData.subDomain}
              onChange={(e) => setFormData({ ...formData, subDomain: e.target.value })}
              disabled
              className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            />
          </div>

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className="bg-white dark:bg-gray-900"
            />
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              placeholder="Enter Address line 2"
              className="bg-white dark:bg-gray-900"
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="bg-white dark:bg-gray-900"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="bg-white dark:bg-gray-900"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="bg-white dark:bg-gray-900"
            />
          </div>

          {/* Zip Code */}
          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              className="bg-white dark:bg-gray-900"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white dark:bg-gray-900"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <Button
            type="submit"
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8"
          >
            Save Firm
          </Button>
        </div>
      </form>
    </Card>
  );
}