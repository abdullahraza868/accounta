import { useState } from 'react';
import { ClientPortalLayout } from '../../../components/client-portal/ClientPortalLayout';
import { useBranding } from '../../../contexts/BrandingContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  FileText,
  Download,
  Eye,
  Search,
  Upload,
  Calendar,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function ClientPortalDocuments() {
  const { branding } = useBranding();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock documents data - replace with actual API call
  const documents = [
    {
      id: 1,
      name: 'Tax Return 2024.pdf',
      folder: 'Tax Documents',
      uploadedBy: 'John Smith, CPA',
      uploadedDate: '2025-10-28',
      size: '2.4 MB',
      type: 'PDF',
    },
    {
      id: 2,
      name: 'W-2 Form 2024.pdf',
      folder: 'Tax Documents',
      uploadedBy: 'Sarah Johnson',
      uploadedDate: '2025-10-25',
      size: '156 KB',
      type: 'PDF',
    },
    {
      id: 3,
      name: 'Form 8879 - E-File Authorization.pdf',
      folder: 'Signatures Required',
      uploadedBy: 'John Smith, CPA',
      uploadedDate: '2025-10-23',
      size: '89 KB',
      type: 'PDF',
    },
    {
      id: 4,
      name: 'Engagement Letter 2024.pdf',
      folder: 'Agreements',
      uploadedBy: 'John Smith, CPA',
      uploadedDate: '2025-10-20',
      size: '124 KB',
      type: 'PDF',
    },
    {
      id: 5,
      name: 'Financial Statements Q3 2024.xlsx',
      folder: 'Financial Reports',
      uploadedBy: 'Sarah Johnson',
      uploadedDate: '2025-10-15',
      size: '3.1 MB',
      type: 'Excel',
    },
  ];

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (docName: string) => {
    toast.success(`Downloading ${docName}...`);
  };

  const handleView = (docName: string) => {
    toast.info(`Opening ${docName}...`);
  };

  const handleUpload = () => {
    toast.info('Upload functionality coming soon!');
  };

  return (
    <ClientPortalLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 style={{ color: branding.colors.headingText }}>Documents</h1>
            <p className="mt-2" style={{ color: branding.colors.mutedText }}>
              View and download your documents
            </p>
          </div>
          <Button
            onClick={handleUpload}
            style={{
              background: branding.colors.primaryButton,
              color: branding.colors.primaryButtonText,
            }}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        </div>

        {/* Search Bar */}
        <div
          className="rounded-lg p-4 border"
          style={{
            background: branding.colors.cardBackground,
            borderColor: branding.colors.borderColor,
          }}
        >
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: branding.colors.mutedText }}
            />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{
                background: branding.colors.inputBackground,
                borderColor: branding.colors.inputBorder,
                color: branding.colors.inputText,
              }}
            />
          </div>
        </div>

        {/* Documents List */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            background: branding.colors.cardBackground,
            borderColor: branding.colors.borderColor,
          }}
        >
          {/* Table Header */}
          <div
            className="grid grid-cols-12 gap-4 p-4 border-b"
            style={{ borderColor: branding.colors.borderColor }}
          >
            <div className="col-span-4" style={{ color: branding.colors.bodyText }}>
              Document Name
            </div>
            <div
              className="col-span-2 hidden md:block"
              style={{ color: branding.colors.bodyText }}
            >
              Folder
            </div>
            <div
              className="col-span-2 hidden md:block"
              style={{ color: branding.colors.bodyText }}
            >
              Uploaded By
            </div>
            <div
              className="col-span-2 hidden sm:block"
              style={{ color: branding.colors.bodyText }}
            >
              Date
            </div>
            <div className="col-span-2 text-right" style={{ color: branding.colors.bodyText }}>
              Actions
            </div>
          </div>

          {/* Table Body */}
          <div>
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:opacity-80 transition-opacity"
                style={{ borderColor: branding.colors.borderColor }}
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: `${branding.colors.primaryButton}15` }}
                  >
                    <FileText
                      className="w-5 h-5"
                      style={{ color: branding.colors.primaryButton }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-sm truncate"
                      style={{ color: branding.colors.bodyText }}
                    >
                      {doc.name}
                    </div>
                    <div className="text-xs" style={{ color: branding.colors.mutedText }}>
                      {doc.size}
                    </div>
                  </div>
                </div>

                <div
                  className="col-span-2 hidden md:flex items-center gap-2"
                  style={{ color: branding.colors.mutedText }}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-sm truncate">{doc.folder}</span>
                </div>

                <div
                  className="col-span-2 hidden md:flex items-center text-sm"
                  style={{ color: branding.colors.mutedText }}
                >
                  {doc.uploadedBy}
                </div>

                <div
                  className="col-span-2 hidden sm:flex items-center gap-2 text-sm"
                  style={{ color: branding.colors.mutedText }}
                >
                  <Calendar className="w-4 h-4" />
                  {doc.uploadedDate}
                </div>

                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleView(doc.name)}
                    className="p-2 rounded-lg transition-all hover:opacity-70"
                    style={{
                      background: `${branding.colors.primaryButton}15`,
                      color: branding.colors.primaryButton,
                    }}
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc.name)}
                    className="p-2 rounded-lg transition-all hover:opacity-70"
                    style={{
                      background: `${branding.colors.primaryButton}15`,
                      color: branding.colors.primaryButton,
                    }}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div
            className="rounded-lg p-12 text-center border"
            style={{
              background: branding.colors.cardBackground,
              borderColor: branding.colors.borderColor,
            }}
          >
            <FileText
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: branding.colors.mutedText }}
            />
            <h3 className="mb-2" style={{ color: branding.colors.headingText }}>
              No documents found
            </h3>
            <p style={{ color: branding.colors.mutedText }}>
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>
    </ClientPortalLayout>
  );
}
