import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  List,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';

type AIEmailSummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: {
    id: string;
    subject: string;
    body: string;
    from: {
      name: string;
      email: string;
    };
    date: string;
    clientName?: string;
  } | null;
};

export function AIEmailSummaryDialog({
  open,
  onOpenChange,
  email,
}: AIEmailSummaryDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [bulletSummary, setBulletSummary] = useState<string[]>([]);
  const [paragraphSummary, setParagraphSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<string[]>([]);

  useEffect(() => {
    if (open && email) {
      generateSummary();
    }
  }, [open, email]);

  const generateSummary = () => {
    setIsGenerating(true);

    // Simulate AI processing
    setTimeout(() => {
      // Generate bullet summary
      setBulletSummary([
        'Client has uploaded Q4 tax documents to the portal',
        'Documents include income statements, expense reports, and quarterly revenue breakdown',
        'Client is requesting review and feedback on uploaded materials',
        'All required documents for Q4 tax filing appear to be complete',
      ]);

      // Generate paragraph summary
      setParagraphSummary(
        'The client has completed uploading all Q4 tax documents to the portal as previously requested. The submission includes comprehensive financial records such as income statements, detailed expense reports, and a quarterly revenue breakdown. The client is now awaiting review and any necessary feedback on the submitted materials to proceed with the Q4 tax filing process.'
      );

      // Generate key points
      setKeyPoints([
        'Q4 documentation complete',
        'Includes all major financial categories',
        'Ready for tax preparer review',
      ]);

      // Generate action items
      setActionItems([
        'Review uploaded Q4 documents',
        'Verify completeness of income statements',
        'Check expense categorization',
        'Provide feedback or approval to client',
      ]);

      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleRegenerateSummary = () => {
    generateSummary();
    toast.info('Regenerating summary...');
  };

  const formatBulletList = () => {
    return bulletSummary.map((item, index) => `${index + 1}. ${item}`).join('\n');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        aria-describedby="ai-summary-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Email Summary
          </DialogTitle>
          <DialogDescription id="ai-summary-description">
            AI-generated summary and analysis of this email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Info */}
          <Card className="p-4 bg-gray-50 dark:bg-gray-800">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {email?.subject}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {email && format(new Date(email.date), 'MMM d, yyyy')}
                </Badge>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                From: {email?.from.name}
              </div>
              {email?.clientName && (
                <div className="text-gray-600 dark:text-gray-400">
                  Client: {email.clientName}
                </div>
              )}
            </div>
          </Card>

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
                <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-xl animate-pulse" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Generating AI summary...
              </p>
            </div>
          ) : (
            <>
              <Tabs defaultValue="bullet" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="bullet">Bullet Points</TabsTrigger>
                  <TabsTrigger value="paragraph">Paragraph</TabsTrigger>
                  <TabsTrigger value="key-points">Key Points</TabsTrigger>
                  <TabsTrigger value="actions">Action Items</TabsTrigger>
                </TabsList>

                {/* Bullet Summary */}
                <TabsContent value="bullet" className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <List className="w-4 h-4" />
                      Summary Points
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(formatBulletList())}
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <Card className="p-4">
                    <ul className="space-y-2">
                      {bulletSummary.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="text-purple-600 dark:text-purple-400 font-medium flex-shrink-0">
                            {index + 1}.
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </TabsContent>

                {/* Paragraph Summary */}
                <TabsContent value="paragraph" className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Paragraph Summary
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(paragraphSummary)}
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <Card className="p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {paragraphSummary}
                    </p>
                  </Card>
                </TabsContent>

                {/* Key Points */}
                <TabsContent value="key-points" className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Key Takeaways
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(keyPoints.join('\n'))}
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {keyPoints.map((point, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {point}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Action Items */}
                <TabsContent value="actions" className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Suggested Actions
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(actionItems.join('\n'))}
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {actionItems.map((action, index) => (
                      <Card key={index} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {action}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Regenerate */}
              <div className="flex items-center justify-center pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerateSummary}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Summary
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}