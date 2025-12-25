#!/usr/bin/env python3
"""
Import Path Fixer Script
This script automatically updates import paths after file reorganization
"""

import os
import re
from pathlib import Path

# Define import path mappings
IMPORT_MAPPINGS = {
    # Account pages - relative to pages/account/*
    'pages/account': {
        r"from '../../contexts/": "from '../../../contexts/",
        r"from '../contexts/": "from '../../../contexts/",
        r"from '../ui/": "from '../../../components/ui/",
        r"from '../../lib/": "from '../../../lib/",
        r"from '../lib/": "from '../../../lib/",
        r"from '../../services/": "from '../../../services/",
        r"from '../services/": "from '../../../services/",
        r"from '../../config/": "from '../../../config/",
        r"from '../config/": "from '../../../config/",
        r"from '../components/": "from '../../../components/",
        r"from '../../components/": "from '../../../components/",
    },
    
    # App pages - relative to pages/app/*
    'pages/app': {
        r"from '../../contexts/": "from '../../../contexts/",
        r"from '../contexts/": "from '../../../contexts/",
        r"from '../ui/": "from '../../../components/ui/",
        r"from '../../lib/": "from '../../../lib/",
        r"from '../lib/": "from '../../../lib/",
        r"from '../../services/": "from '../../../services/",
        r"from '../services/": "from '../../../services/",
        r"from '../../config/": "from '../../../config/",
        r"from '../config/": "from '../../../config/",
        r"from '../components/": "from '../../../components/",
        r"from '../../components/": "from '../../../components/",
    },
    
    # Components reorganization
    'components/layout': {
        r"from './": "from '../",
        r"from '../ui/": "from '../ui/",
    },
    
    'components/common': {
        r"from './": "from '../",
        r"from '../ui/": "from '../ui/",
    },
    
    'components/team': {
        r"from './": "from '../",
        r"from '../ui/": "from '../ui/",
    },
    
    'components/navigation': {
        r"from './": "from '../",
        r"from '../ui/": "from '../ui/",
    },
}

# Component-specific import fixes
SPECIFIC_COMPONENT_IMPORTS = {
    # Client module components
    'pages/app/clients': {
        r"from '../ClientList'": "from './components/ClientList'",
        r"from '../../components/ClientList'": "from './components/ClientList'",
        r"from '../ClientFolder'": "from './components/ClientFolder'",
        r"from '../../components/ClientFolder'": "from './components/ClientFolder'",
        r"from '../AddTeamMember'": "from './components/AddTeamMember'",
        r"from '../../components/AddTeamMember'": "from './components/AddTeamMember'",
        r"from '../ClientNameWithLink'": "from './components/ClientNameWithLink'",
        r"from '../../components/ClientNameWithLink'": "from './components/ClientNameWithLink'",
        r"from '../folder-tabs/": "from './tabs/",
        r"from '../../components/folder-tabs/": "from './tabs/",
    },
    
    # Signature module components
    'pages/app/signatures': {
        r"from '../NewSignatureRequestDialog'": "from './components/NewSignatureRequestDialog'",
        r"from '../../components/NewSignatureRequestDialog'": "from './components/NewSignatureRequestDialog'",
        r"from '../UseTemplateDialog'": "from './components/UseTemplateDialog'",
        r"from '../../components/UseTemplateDialog'": "from './components/UseTemplateDialog'",
        r"from '../Form8879Dialog'": "from './components/Form8879Dialog'",
        r"from '../../components/Form8879Dialog'": "from './components/Form8879Dialog'",
    },
    
    # Settings module components
    'pages/app/settings': {
        r"from '../company-settings-tabs/": "from './tabs/",
        r"from '../../components/company-settings-tabs/": "from './tabs/",
    },
    
    # Layout components
    'components/layout': {
        r"from '../Header'": "from './Header'",
        r"from '../Sidebar'": "from './Sidebar'",
        r"from '../CollapsedSidebar'": "from './CollapsedSidebar'",
    },
}

def fix_imports_in_file(file_path: Path, base_dir: str):
    """Fix imports in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply general mappings
        if base_dir in IMPORT_MAPPINGS:
            for old_pattern, new_pattern in IMPORT_MAPPINGS[base_dir].items():
                content = re.sub(old_pattern, new_pattern, content)
        
        # Apply specific component mappings
        if base_dir in SPECIFIC_COMPONENT_IMPORTS:
            for old_pattern, new_pattern in SPECIFIC_COMPONENT_IMPORTS[base_dir].items():
                content = re.sub(old_pattern, new_pattern, content)
        
        # Write back if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def find_base_dir(file_path: Path, root: Path) -> str:
    """Determine which base directory a file belongs to"""
    relative_path = file_path.relative_to(root)
    path_str = str(relative_path.parent).replace('\\', '/')
    
    # Check for specific directories
    for base_dir in list(IMPORT_MAPPINGS.keys()) + list(SPECIFIC_COMPONENT_IMPORTS.keys()):
        if path_str.startswith(base_dir):
            return base_dir
    
    return ''

def process_directory(directory: Path):
    """Process all TypeScript/TSX files in directory"""
    root = Path.cwd()
    files_processed = 0
    files_updated = 0
    
    print(f"Processing files in: {directory}")
    print("-" * 60)
    
    for file_path in directory.rglob('*.tsx'):
        if 'node_modules' in str(file_path) or '.backup' in str(file_path):
            continue
        
        base_dir = find_base_dir(file_path, root)
        if base_dir:
            if fix_imports_in_file(file_path, base_dir):
                print(f"✓ Updated: {file_path.relative_to(root)}")
                files_updated += 1
            files_processed += 1
    
    print("-" * 60)
    print(f"Processed {files_processed} files, updated {files_updated} files")

def main():
    """Main execution"""
    print("Import Path Fixer")
    print("=" * 60)
    print()
    
    root = Path.cwd()
    
    # Process pages directory
    pages_dir = root / 'pages'
    if pages_dir.exists():
        process_directory(pages_dir)
    else:
        print("Warning: /pages directory not found")
    
    print()
    
    # Process components directory
    components_dir = root / 'components'
    if components_dir.exists():
        process_directory(components_dir)
    else:
        print("Warning: /components directory not found")
    
    print()
    print("=" * 60)
    print("Import path fixing complete!")
    print()
    print("Next steps:")
    print("1. Review the changes")
    print("2. Test the application")
    print("3. Fix any remaining import issues manually")

if __name__ == '__main__':
    main()
