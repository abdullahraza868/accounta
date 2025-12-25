import { useNavigate } from 'react-router-dom';
import { Upload, Download, Smartphone, Monitor, ExternalLink, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

export function WorkflowTestingView() {
  const navigate = useNavigate();

  const workflows = [
    {
      id: 'upload-desktop',
      title: 'Upload Workflow - Desktop',
      description: 'Test the document upload workflow on desktop view with multi-document grid layout',
      icon: Upload,
      deviceIcon: Monitor,
      color: 'purple',
      path: '/workflows/upload?device=desktop',
      features: [
        'Grid layout for multiple documents',
        'Drag & drop support',
        'Simultaneous upload preview',
        'Progress tracking'
      ]
    },
    {
      id: 'upload-mobile',
      title: 'Upload Workflow - Mobile',
      description: 'Test the document upload workflow on mobile view with one-by-one upload',
      icon: Upload,
      deviceIcon: Smartphone,
      color: 'purple',
      path: '/workflows/upload?device=mobile',
      features: [
        'One-by-one upload flow',
        'Mobile-optimized layout',
        'Touch-friendly interface',
        'Document navigation'
      ]
    },
    {
      id: 'download-desktop',
      title: 'Download Workflow - Desktop',
      description: 'Test the document download workflow on desktop view with table layout',
      icon: Download,
      deviceIcon: Monitor,
      color: 'blue',
      path: '/workflows/download?device=desktop',
      features: [
        'Table layout for documents',
        'Bulk download option',
        'Individual downloads',
        'Document metadata display'
      ]
    },
    {
      id: 'download-mobile',
      title: 'Download Workflow - Mobile',
      description: 'Test the document download workflow on mobile view with card layout',
      icon: Download,
      deviceIcon: Smartphone,
      color: 'blue',
      path: '/workflows/download?device=mobile',
      features: [
        'Card-based layout',
        'Mobile-optimized UI',
        'Download all option',
        'Touch-friendly buttons'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    if (color === 'purple') {
      return {
        border: 'border-purple-200 dark:border-purple-800',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        button: 'bg-purple-600 hover:bg-purple-700 text-white'
      };
    }
    return {
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Workflow Testing
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Test all document workflow variations - upload and download for both desktop and mobile
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Back to Application
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Workflows */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upload Workflows
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Client document upload with phone verification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.filter(w => w.id.startsWith('upload')).map((workflow) => {
              const colors = getColorClasses(workflow.color);
              const Icon = workflow.icon;
              const DeviceIcon = workflow.deviceIcon;

              return (
                <Card key={workflow.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.icon}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className={colors.badge}>
                        <DeviceIcon className="w-3 h-3 mr-1" />
                        {workflow.id.includes('mobile') ? 'Mobile' : 'Desktop'}
                      </Badge>
                    </div>
                    <CardTitle className="text-gray-900 dark:text-white">
                      {workflow.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {workflow.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Features */}
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Features:
                        </div>
                        <ul className="space-y-1">
                          {workflow.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      {/* Test Button */}
                      <Button
                        className={`w-full ${colors.button}`}
                        onClick={() => {
                          // Open in new window to simulate real workflow
                          window.open(workflow.path, '_blank', 'width=1200,height=800');
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Test Workflow
                      </Button>

                      {/* Direct Navigation */}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(workflow.path)}
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Open in Current Tab
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Download Workflows */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Download Workflows
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Client document download with phone verification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.filter(w => w.id.startsWith('download')).map((workflow) => {
              const colors = getColorClasses(workflow.color);
              const Icon = workflow.icon;
              const DeviceIcon = workflow.deviceIcon;

              return (
                <Card key={workflow.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.icon}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className={colors.badge}>
                        <DeviceIcon className="w-3 h-3 mr-1" />
                        {workflow.id.includes('mobile') ? 'Mobile' : 'Desktop'}
                      </Badge>
                    </div>
                    <CardTitle className="text-gray-900 dark:text-white">
                      {workflow.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {workflow.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Features */}
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Features:
                        </div>
                        <ul className="space-y-1">
                          {workflow.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      {/* Test Button */}
                      <Button
                        className={`w-full ${colors.button}`}
                        onClick={() => {
                          // Open in new window to simulate real workflow
                          window.open(workflow.path, '_blank', 'width=1200,height=800');
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Test Workflow
                      </Button>

                      {/* Direct Navigation */}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(workflow.path)}
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Open in Current Tab
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Testing Instructions */}
        <Card className="mt-10 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <FileText className="w-5 h-5" />
              Testing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-amber-800 dark:text-amber-200">
            <div>
              <strong>Phone Verification:</strong> For testing purposes, enter any 6-digit code to verify your identity.
            </div>
            <div>
              <strong>Desktop Workflows:</strong> Show all documents at once in a grid/table layout for efficient bulk operations.
            </div>
            <div>
              <strong>Mobile Workflows:</strong> Show documents one-by-one with mobile-optimized navigation and touch-friendly controls.
            </div>
            <div>
              <strong>Testing Tips:</strong> Use "Test Workflow" to open in a new window (simulates real client experience) or "Open in Current Tab" for easier debugging.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
