import { ClientPortalSettingsLayout } from './ClientPortalSettingsLayout';
import { PlatformBrandingView } from '../PlatformBrandingView';

export function PortalBrandingWrapperView() {
  return (
    <ClientPortalSettingsLayout>
      {/* Embed existing Platform Branding view */}
      <div className="-mt-8">
        <PlatformBrandingView />
      </div>
    </ClientPortalSettingsLayout>
  );
}
