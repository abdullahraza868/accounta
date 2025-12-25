import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Upload, 
  Download, 
  X, 
  AlertCircle, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet,
  User,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from './ui/utils';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

type ImportStep = 'upload' | 'mapping' | 'duplicates' | 'preview';

interface ColumnMapping {
  fileColumn: string;
  systemField: string;
}

interface DuplicateGroup {
  id: string;
  field: string; // SSN, EIN, or Company Name
  value: string;
  rows: ImportRow[];
  selectedRowIndex: number;
}

interface ImportRow {
  rowNumber: number;
  data: Record<string, string>;
  entityType?: 'Individual' | 'Business';
}

// System field definitions grouped by category
const SYSTEM_FIELDS = {
  common: [
    { value: 'do-not-import', label: 'Do not import' },
    { value: 'entityType', label: 'Entity Type (Individual/Business)' },
    { value: 'clientNumber', label: 'Client Number' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'address1', label: 'Address Line 1' },
    { value: 'address2', label: 'Address Line 2' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    { value: 'postalCode', label: 'Postal Code' },
    { value: 'clientGroups', label: 'Client Groups (comma-separated)' },
  ],
  individual: [
    { value: 'firstName', label: 'First Name' },
    { value: 'middleName', label: 'Middle Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'preferredName', label: 'Preferred Name' },
    { value: 'ssn', label: 'SSN' },
    { value: 'dob', label: 'Date of Birth' },
    { value: 'gender', label: 'Gender' },
    { value: 'maritalStatus', label: 'Marital Status' },
    { value: 'filingStatus', label: 'Filing Status' },
    { value: 'profession', label: 'Profession' },
  ],
  business: [
    { value: 'companyName', label: 'Company Name' },
    { value: 'dbaName', label: 'DBA Name' },
    { value: 'ein', label: 'EIN' },
    { value: 'entityNumber', label: 'Entity Number' },
    { value: 'businessEntityType', label: 'Business Entity Type (LLC, Corp, etc.)' },
    { value: 'stateOfIncorporation', label: 'State of Incorporation' },
    { value: 'businessStartDate', label: 'Business Start Date' },
    { value: 'incorporationDate', label: 'Incorporation Date' },
    { value: 'companyActivity', label: 'Company Activity' },
    { value: 'totalEmployees', label: 'Total Employees' },
    { value: 'fiscalYearEnd', label: 'Fiscal Year End' },
  ],
  bank: [
    { value: 'bankName', label: 'Bank Name' },
    { value: 'accountNumber', label: 'Account Number' },
    { value: 'routingNumber', label: 'Routing Number' },
    { value: 'accountType', label: 'Account Type (Checking/Savings)' },
  ],
  additional: [
    { value: 'referredBy', label: 'Referred By' },
    { value: 'notes', label: 'Notes' },
    { value: 'isActive', label: 'Is Active (Yes/No)' },
  ],
};

export function ImportClientsWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportRow[]>([]);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for preview
  const mockPreviewData = [
    {
      'Client Group': 'Active, Tax Client',
      'Entity Type': 'Individual',
      'Entity Number': 'ENT-2024-001',
      'Client Number': 'CLT-10234',
      'Email Address': 'john.doe@email.com'
    },
    {
      'Client Group': 'Active, Bookkeeping',
      'Entity Type': 'Business',
      'Entity Number': 'ENT-2024-002',
      'Client Number': 'CLT-10235',
      'Email Address': 'info@acmecorp.com'
    },
    {
      'Client Group': 'Active, Tax Client, Audit',
      'Entity Type': 'Individual',
      'Entity Number': 'ENT-2024-003',
      'Client Number': 'CLT-10236',
      'Email Address': 'sarah.jones@email.com'
    },
    {
      'Client Group': 'Active, Consulting',
      'Entity Type': 'Business',
      'Entity Number': 'ENT-2024-004',
      'Client Number': 'CLT-10237',
      'Email Address': 'contact@techstartup.com'
    },
    {
      'Client Group': 'Active, Tax Client',
      'Entity Type': 'Individual',
      'Entity Number': 'ENT-2024-005',
      'Client Number': 'CLT-10238',
      'Email Address': 'michael.smith@email.com'
    }
  ];

  const previewColumns = ['Client Group', 'Entity Type', 'Entity Number', 'Client Number', 'Email Address'];

  const handleCancel = () => {
    if (currentStep !== 'upload' || uploadedFile) {
      if (!confirm('Are you sure you want to cancel? All progress will be lost.')) {
        return;
      }
    }
    navigate('/clients');
  };

  const downloadTemplate = () => {
    const headers = [
      'Entity Type',
      'First Name',
      'Last Name',
      'Company Name',
      'Email',
      'Phone',
      'SSN',
      'EIN',
      'Address Line 1',
      'City',
      'State',
      'Postal Code',
      'Client Groups',
    ];
    
    const sampleData = [
      ['Individual', 'John', 'Doe', '', 'john.doe@email.com', '555-0123', '123-45-6789', '', '123 Main St', 'Los Angeles', 'CA', '90001', 'Active, Tax Client'],
      ['Business', '', '', 'Acme Corp', 'info@acme.com', '555-0456', '', '12-3456789', '456 Business Ave', 'New York', 'NY', '10001', 'Active, Bookkeeping'],
    ];

    const csv = [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded successfully');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    setUploadedFile(file);

    // Parse the file (simplified for demonstration)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('File must contain at least a header row and one data row');
        return;
      }

      // Parse CSV (basic implementation)
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      setFileColumns(headers);

      const rows: ImportRow[] = [];
      for (let i = 1; i < lines.length && i < 101; i++) { // Limit to 100 rows for demo
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        
        // Determine entity type
        const entityTypeValue = rowData['Entity Type'] || rowData['Type'] || rowData['Client Type'] || '';
        const entityType = entityTypeValue.toLowerCase().includes('business') ? 'Business' : 
                          entityTypeValue.toLowerCase().includes('individual') ? 'Individual' : undefined;
        
        rows.push({
          rowNumber: i,
          data: rowData,
          entityType,
        });
      }

      setParsedData(rows);

      // Initialize column mappings with smart matching
      const initialMappings: ColumnMapping[] = headers.map(header => {
        const lowerHeader = header.toLowerCase();
        let systemField = '';

        // Smart matching logic
        if (lowerHeader.includes('entity') && lowerHeader.includes('type')) systemField = 'entityType';
        else if (lowerHeader.includes('first') && lowerHeader.includes('name')) systemField = 'firstName';
        else if (lowerHeader.includes('last') && lowerHeader.includes('name')) systemField = 'lastName';
        else if (lowerHeader.includes('middle') && lowerHeader.includes('name')) systemField = 'middleName';
        else if (lowerHeader.includes('company') && lowerHeader.includes('name')) systemField = 'companyName';
        else if (lowerHeader.includes('email')) systemField = 'email';
        else if (lowerHeader.includes('phone')) systemField = 'phone';
        else if (lowerHeader === 'ssn' || lowerHeader.includes('social')) systemField = 'ssn';
        else if (lowerHeader === 'ein' || lowerHeader.includes('employer')) systemField = 'ein';
        else if (lowerHeader.includes('address') && lowerHeader.includes('1')) systemField = 'address1';
        else if (lowerHeader.includes('address') && lowerHeader.includes('2')) systemField = 'address2';
        else if (lowerHeader.includes('city')) systemField = 'city';
        else if (lowerHeader === 'state' || lowerHeader.includes('state')) systemField = 'state';
        else if (lowerHeader.includes('zip') || lowerHeader.includes('postal')) systemField = 'postalCode';
        else if (lowerHeader.includes('group')) systemField = 'clientGroups';
        else if (lowerHeader.includes('bank') && lowerHeader.includes('name')) systemField = 'bankName';

        return {
          fileColumn: header,
          systemField,
        };
      });

      setColumnMappings(initialMappings);
      toast.success(`Successfully loaded ${rows.length} rows from file`);
    };

    reader.readAsText(file);
  };

  const proceedToMapping = () => {
    // Allow proceeding even without a file upload for testing/demo purposes
    if (!uploadedFile || parsedData.length === 0) {
      // Use mock data if no file is uploaded
      const mockHeaders = ['Client Group', 'Entity Type', 'Entity Number', 'Client Number', 'Email Address'];
      setFileColumns(mockHeaders);
      
      const mockRows: ImportRow[] = mockPreviewData.map((row, idx) => ({
        rowNumber: idx + 1,
        data: row,
        entityType: row['Entity Type'] as 'Individual' | 'Business',
      }));
      
      setParsedData(mockRows);
      
      // Initialize column mappings for mock data
      const initialMappings: ColumnMapping[] = mockHeaders.map(header => {
        let systemField = '';
        
        if (header === 'Entity Type') systemField = 'entityType';
        else if (header === 'Client Group') systemField = 'clientGroups';
        else if (header === 'Entity Number') systemField = 'entityNumber';
        else if (header === 'Client Number') systemField = 'clientNumber';
        else if (header === 'Email Address') systemField = 'email';
        
        return {
          fileColumn: header,
          systemField,
        };
      });
      
      setColumnMappings(initialMappings);
      toast.success('Using sample data for mapping');
    }

    setCurrentStep('mapping');
  };

  const proceedToDuplicates = () => {
    // Validate that Entity Type is mapped
    const entityTypeMapping = columnMappings.find(m => m.systemField === 'entityType');
    if (!entityTypeMapping) {
      toast.error('Entity Type field must be mapped to proceed');
      return;
    }

    // Detect duplicates based on SSN, EIN, or Company Name
    detectDuplicates();
    setCurrentStep('duplicates');
  };

  const detectDuplicates = () => {
    const groups: DuplicateGroup[] = [];
    const ssnMap = new Map<string, ImportRow[]>();
    const einMap = new Map<string, ImportRow[]>();
    const companyMap = new Map<string, ImportRow[]>();

    parsedData.forEach((row) => {
      // Apply mappings to get actual values
      const mappedData = applyMappings(row);

      if (mappedData.ssn) {
        const existing = ssnMap.get(mappedData.ssn) || [];
        existing.push(row);
        ssnMap.set(mappedData.ssn, existing);
      }

      if (mappedData.ein) {
        const existing = einMap.get(mappedData.ein) || [];
        existing.push(row);
        einMap.set(mappedData.ein, existing);
      }

      if (mappedData.companyName) {
        const normalized = mappedData.companyName.toLowerCase().trim();
        const existing = companyMap.get(normalized) || [];
        existing.push(row);
        companyMap.set(normalized, existing);
      }
    });

    // Create duplicate groups
    let groupId = 0;
    ssnMap.forEach((rows, ssn) => {
      if (rows.length > 1) {
        groups.push({
          id: `ssn-${groupId++}`,
          field: 'SSN',
          value: ssn,
          rows,
          selectedRowIndex: 0,
        });
      }
    });

    einMap.forEach((rows, ein) => {
      if (rows.length > 1) {
        groups.push({
          id: `ein-${groupId++}`,
          field: 'EIN',
          value: ein,
          rows,
          selectedRowIndex: 0,
        });
      }
    });

    companyMap.forEach((rows, company) => {
      if (rows.length > 1) {
        groups.push({
          id: `company-${groupId++}`,
          field: 'Company Name',
          value: company,
          rows,
          selectedRowIndex: 0,
        });
      }
    });

    setDuplicateGroups(groups);
  };

  const applyMappings = (row: ImportRow): Record<string, string> => {
    const mapped: Record<string, string> = {};
    columnMappings.forEach(mapping => {
      if (mapping.systemField) {
        mapped[mapping.systemField] = row.data[mapping.fileColumn] || '';
      }
    });
    return mapped;
  };

  const proceedToPreview = () => {
    setCurrentStep('preview');
  };

  const handleFinishImport = () => {
    setShowFinalConfirmation(true);
  };

  const confirmFinalImport = () => {
    // TODO: Implement actual import logic
    toast.success('Clients imported successfully!');
    navigate('/clients');
  };

  const updateColumnMapping = (fileColumn: string, systemField: string) => {
    setColumnMappings(prev => 
      prev.map(m => m.fileColumn === fileColumn ? { ...m, systemField } : m)
    );
  };

  const updateDuplicateSelection = (groupId: string, rowIndex: number) => {
    setDuplicateGroups(prev =>
      prev.map(g => g.id === groupId ? { ...g, selectedRowIndex: rowIndex } : g)
    );
  };

  const getPreviewData = () => {
    // Get final data after resolving duplicates
    const selectedRows = new Set<number>();
    
    duplicateGroups.forEach(group => {
      group.rows.forEach((row, index) => {
        if (index !== group.selectedRowIndex) {
          selectedRows.add(row.rowNumber);
        }
      });
    });

    const finalData = parsedData.filter(row => !selectedRows.has(row.rowNumber));

    const individuals = finalData.filter(row => row.entityType === 'Individual').slice(0, 5);
    const businesses = finalData.filter(row => row.entityType === 'Business').slice(0, 5);

    return { individuals, businesses, total: finalData.length };
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'upload', label: 'Upload File', number: 1 },
      { id: 'mapping', label: 'Map Columns', number: 2 },
      { id: 'duplicates', label: 'Resolve Duplicates', number: 3 },
      { id: 'preview', label: 'Preview & Confirm', number: 4 },
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  index <= currentIndex
                    ? "bg-[var(--color-purple-primary)] text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                )}
              >
                {index < currentIndex ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{step.number}</span>
                )}
              </div>
              <div className="hidden md:block">
                <div className={cn(
                  "text-sm font-medium",
                  index <= currentIndex ? "text-gray-900 dark:text-white" : "text-gray-500"
                )}>
                  {step.label}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4",
                  index < currentIndex
                    ? "bg-[var(--color-purple-primary)]"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderUploadStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Before you begin:
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Download our template to ensure proper formatting</li>
              <li>Entity Type column is mandatory (Individual or Business)</li>
              <li>Files can contain mixed Individual and Business clients</li>
              <li>Maximum 1000 rows per import</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={downloadTemplate}
          variant="outline"
          className="flex-1 h-auto py-6 border-2 border-dashed hover:border-[var(--color-purple-primary)] hover:bg-purple-50 dark:hover:bg-purple-950/20"
        >
          <div className="flex flex-col items-center gap-2">
            <Download className="w-8 h-8 text-[var(--color-purple-primary)]" />
            <div>
              <div className="font-semibold">Download Template</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">CSV format with sample data</div>
            </div>
          </div>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or</span>
        </div>
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 hover:border-[var(--color-purple-primary)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
        >
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                CSV or Excel files (max 1000 rows)
              </p>
            </div>
          </div>
        </button>
      </div>

      {uploadedFile && parsedData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div className="flex-1">
              <p className="font-medium text-green-900 dark:text-green-100">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {parsedData.length} rows loaded successfully
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUploadedFile(null);
                setParsedData([]);
                setFileColumns([]);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Preview (First 5 rows)
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                    <tr>
                      {fileColumns.map((col, idx) => (
                        <th key={idx} className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        {fileColumns.map((col, colIdx) => (
                          <td key={colIdx} className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {col.toLowerCase().includes('type') && row.data[col] && (
                                row.data[col].toLowerCase().includes('business') ? (
                                  <Building2 className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <User className="w-3 h-3 text-[var(--color-purple-primary)]" />
                                )
                              )}
                              <span className="text-gray-900 dark:text-gray-100">
                                {row.data[col] || '—'}
                              </span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mock Data Preview - Always show when no file is uploaded */}
      {!uploadedFile && (
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Sample Import Preview
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This is what your imported data will look like. Upload a file to see your actual data.
          </p>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {previewColumns.map((col, idx) => (
                      <th key={idx} className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockPreviewData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      {previewColumns.map((col, colIdx) => (
                        <td key={colIdx} className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {col === 'Entity Type' && row[col] && (
                              row[col] === 'Business' ? (
                                <Building2 className="w-3 h-3 text-blue-600" />
                              ) : (
                                <User className="w-3 h-3 text-[var(--color-purple-primary)]" />
                              )
                            )}
                            <span className="text-gray-900 dark:text-gray-100">
                              {row[col as keyof typeof row] || '—'}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMappingStep = () => {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                Map your columns carefully
              </p>
              <p className="text-yellow-800 dark:text-yellow-200">
                Entity Type field is required. Other unmapped columns will be ignored during import.
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
          <div className="space-y-6">
            {/* Group columns by category */}
            <div>
              <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-purple-primary)]"></div>
                Column Mapping
              </h3>
              <div className="grid gap-3">
                {columnMappings.map((mapping, idx) => {
                  const isEntityType = mapping.systemField === 'entityType';
                  return (
                    <div key={idx} className={cn(
                      "grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 rounded-lg border",
                      isEntityType 
                        ? "bg-purple-50 dark:bg-purple-950/20 border-[var(--color-purple-primary)] dark:border-purple-800" 
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    )}>
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                          File Column 
                          {isEntityType && <Badge className="bg-[var(--color-purple-primary)]">Required</Badge>}
                        </Label>
                        <p className="font-medium text-sm">{mapping.fileColumn}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Maps to System Field
                        </Label>
                        <Select
                          value={mapping.systemField}
                          onValueChange={(value) => updateColumnMapping(mapping.fileColumn, value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(SYSTEM_FIELDS).map(([category, fields]) => (
                              <React.Fragment key={category}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                                  {category.charAt(0).toUpperCase() + category.slice(1)} Fields
                                </div>
                                {fields.map(field => (
                                  <SelectItem key={field.value} value={field.value}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </React.Fragment>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDuplicatesStep = () => {
    if (duplicateGroups.length === 0) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Duplicates Found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Great! No duplicate SSNs, EINs, or company names were detected in your file.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                {duplicateGroups.length} Duplicate Group{duplicateGroups.length > 1 ? 's' : ''} Found
              </p>
              <p className="text-orange-800 dark:text-orange-200">
                Select which record to keep for each duplicate group. Unselected records will be skipped.
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
          <div className="space-y-6">
            {duplicateGroups.map((group) => (
              <div key={group.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold">
                    Duplicate {group.field}: {group.value}
                  </h3>
                  <Badge variant="outline" className="ml-auto">
                    {group.rows.length} records
                  </Badge>
                </div>

                <div className="space-y-3">
                  {group.rows.map((row, idx) => {
                    const mappedData = applyMappings(row);
                    const isSelected = group.selectedRowIndex === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => updateDuplicateSelection(group.id, idx)}
                        className={cn(
                          "w-full text-left p-4 rounded-lg border-2 transition-all",
                          isSelected
                            ? "border-[var(--color-purple-primary)] bg-purple-50 dark:bg-purple-950/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                            isSelected
                              ? "border-[var(--color-purple-primary)] bg-[var(--color-purple-primary)]"
                              : "border-gray-300 dark:border-gray-600"
                          )}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Row:</span>
                              <span className="ml-2 font-medium">{row.rowNumber}</span>
                            </div>
                            {mappedData.firstName && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                                <span className="ml-2 font-medium">{mappedData.firstName} {mappedData.lastName}</span>
                              </div>
                            )}
                            {mappedData.companyName && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Company:</span>
                                <span className="ml-2 font-medium">{mappedData.companyName}</span>
                              </div>
                            )}
                            {mappedData.email && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                <span className="ml-2 font-medium">{mappedData.email}</span>
                              </div>
                            )}
                            {mappedData.phone && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                                <span className="ml-2 font-medium">{mappedData.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewStep = () => {
    const { individuals, businesses, total } = getPreviewData();

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                Ready to import {total} clients
              </p>
              <p className="text-green-800 dark:text-green-200">
                {individuals.length} Individual • {businesses.length} Business
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
          <div className="space-y-8">
            {/* Individual Clients Preview */}
            {individuals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[var(--color-purple-primary)]" />
                  <h3 className="font-semibold text-lg">Individual Clients Preview</h3>
                  <Badge variant="outline" className="ml-auto">
                    Showing top {Math.min(5, individuals.length)}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {individuals.map((row, idx) => {
                    const data = applyMappings(row);
                    return (
                      <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</div>
                            <div className="font-medium">{data.firstName} {data.lastName}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</div>
                            <div className="font-medium truncate">{data.email || '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                            <div className="font-medium">{data.phone || '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">SSN</div>
                            <div className="font-medium font-mono">{data.ssn ? `•••-••-${data.ssn.slice(-4)}` : '—'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Business Clients Preview */}
            {businesses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Business Clients Preview</h3>
                  <Badge variant="outline" className="ml-auto">
                    Showing top {Math.min(5, businesses.length)}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {businesses.map((row, idx) => {
                    const data = applyMappings(row);
                    return (
                      <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Company Name</div>
                            <div className="font-medium">{data.companyName || '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</div>
                            <div className="font-medium truncate">{data.email || '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                            <div className="font-medium">{data.phone || '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">EIN</div>
                            <div className="font-medium font-mono">{data.ein ? `••-•••${data.ein.slice(-4)}` : '—'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'upload':
        return true; // Always allow proceeding from upload step
      case 'mapping':
        return columnMappings.some(m => m.systemField === 'entityType');
      case 'duplicates':
        return true;
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'upload':
        proceedToMapping();
        break;
      case 'mapping':
        proceedToDuplicates();
        break;
      case 'duplicates':
        proceedToPreview();
        break;
      case 'preview':
        handleFinishImport();
        break;
    }
  };

  const handleBack = () => {
    const steps: ImportStep[] = ['upload', 'mapping', 'duplicates', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                Import Clients
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Import multiple clients from Excel or CSV files
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
          {renderStepIndicator()}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-32">
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'mapping' && renderMappingStep()}
        {currentStep === 'duplicates' && renderDuplicatesStep()}
        {currentStep === 'preview' && renderPreviewStep()}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {currentStep !== 'upload' ? (
            <Button
              variant="outline"
              onClick={handleBack}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-[var(--color-purple-primary)] hover:bg-[var(--color-purple-hover)] gap-2"
          >
            {currentStep === 'preview' ? (
              <>
                Finish Import
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Final Confirmation Dialog */}
      {showFinalConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold text-lg">Confirm Import</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                This action cannot be undone. Are you sure you want to import {getPreviewData().total} clients into your system?
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> This is an irreversible operation. Please ensure you have reviewed the data carefully.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowFinalConfirmation(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmFinalImport}
                className="flex-1 bg-[var(--color-purple-primary)] hover:bg-[var(--color-purple-hover)]"
              >
                Yes, Import Clients
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}