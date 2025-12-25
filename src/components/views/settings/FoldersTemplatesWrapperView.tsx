import { ClientPortalSettingsLayout } from './ClientPortalSettingsLayout';
import { FolderManagementView } from '../FolderManagementView';

export function FoldersTemplatesWrapperView() {
  return (
    <ClientPortalSettingsLayout>
      {/* Embed existing Folder Management view */}
      <div className="-mt-8">
        <FolderManagementView />
      </div>
    </ClientPortalSettingsLayout>
  );
}
