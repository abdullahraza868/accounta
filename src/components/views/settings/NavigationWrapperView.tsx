import { CompanySettingsLayout } from './CompanySettingsLayout';
import { NavigationView } from '../NavigationView';

export function NavigationWrapperView() {
  return (
    <CompanySettingsLayout>
      {/* Embed existing Navigation view */}
      <div className="-mt-8 -mx-8"> {/* Remove padding to let NavigationView control its own layout */}
        <NavigationView />
      </div>
    </CompanySettingsLayout>
  );
}
