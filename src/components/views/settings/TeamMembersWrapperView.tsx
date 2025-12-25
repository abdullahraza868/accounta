import { CompanySettingsLayout } from './CompanySettingsLayout';
import { CompanySettingsView } from '../CompanySettingsView';

export function TeamMembersWrapperView() {
  return (
    <CompanySettingsLayout>
      {/* Embed existing Company Settings (Team Members) view without duplicate layout */}
      <div className="-mt-8"> {/* Compensate for header padding */}
        <CompanySettingsView />
      </div>
    </CompanySettingsLayout>
  );
}
