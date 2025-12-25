import { RolesTab } from '../../company-settings-tabs/RolesTab_NEW';

export function RolesPermissionsView() {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1400px] mx-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-gray-900 dark:text-gray-100 mb-2">Roles & Permissions</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Define and manage user roles and their access permissions
            </p>
          </div>

          {/* Content */}
          <RolesTab />
        </div>
      </div>
    </div>
  );
}