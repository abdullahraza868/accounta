import { CompanySettingsLayout } from './CompanySettingsLayout';
import { EmailCustomizationView } from '../EmailCustomizationView';

export function EmailCustomizationWrapperView() {
  return (
    <CompanySettingsLayout>
      {/* Embed existing Email Customization view */}
      <div className="-mt-8">
        <EmailCustomizationView />
      </div>
    </CompanySettingsLayout>
  );
}
