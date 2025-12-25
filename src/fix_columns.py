#!/usr/bin/env python3
import re

# Read the file
with open('/components/company-settings-tabs/EditRoleInline.tsx', 'r') as f:
    content = f.read()

# Replace 1: Line 1786 - Add grid to individual client selection container
content = content.replace(
    'className="border border-gray-200 dark:border-gray-700 rounded-lg">\n                          {ALL_CLIENTS\n                            .filter(client => \n                              client.name.toLowerCase().includes(clientSearchQuery.toLowerCase())',
    'className="border border-gray-200 dark:border-gray-700 rounded-lg grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">\n                          {ALL_CLIENTS\n                            .filter(client => \n                              client.name.toLowerCase().includes(clientSearchQuery.toLowerCase())'
)

# Replace 2: Line 1900 - Add grid to selected clients in Individual Clients mode
content = content.replace(
    '{/* List view of selected clients */}\n                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">\n                            {ALL_CLIENTS\n                              .filter(c => selectedClients.has(c.id))\n                              .filter(client => \n                                client.name.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase())',
    '{/* List view of selected clients */}\n                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">\n                            {ALL_CLIENTS\n                              .filter(c => selectedClients.has(c.id))\n                              .filter(client => \n                                client.name.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase())'
)

# Replace 3: Line 1704 - Update button className in By Client Group mode (selected clients)
content = content.replace(
    'className="w-full flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-all"',
    'className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"'
)

# Replace 4: Line 1806 - Update button className in individual client selection
content = content.replace(
    '"w-full flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-all"',
    '"flex items-center gap-3 p-3 transition-all"'
)

# Write the file
with open('/components/company-settings-tabs/EditRoleInline.tsx', 'w') as f:
    f.write(content)

print("Fixed all column layouts!")
