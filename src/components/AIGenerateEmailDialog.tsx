import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Sparkles,
  Copy,
  RefreshCw,
  Send,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type AIGenerateEmailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseGenerated?: (subject: string, body: string) => void;
};

export function AIGenerateEmailDialog({
  open,
  onOpenChange,
  onUseGenerated,
}: AIGenerateEmailDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const tones = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'formal', label: 'Formal', description: 'Very formal and traditional' },
    { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
    { value: 'concise', label: 'Concise', description: 'Brief and to the point' },
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setHasGenerated(false);

    // Simulate AI generation
    setTimeout(() => {
      // Generate based on prompt and tone
      setGeneratedSubject('Q4 Tax Documents Review Request');
      setGeneratedBody(
        getToneBasedEmail(tone)
      );

      setIsGenerating(false);
      setHasGenerated(true);
      toast.success('Email generated successfully');
    }, 2000);
  };

  const getToneBasedEmail = (selectedTone: string) => {
    const emails: Record<string, string> = {
      professional: `Dear [Client Name],

I hope this message finds you well. I am writing to follow up on the Q4 tax documents that were recently uploaded to our portal.

I have reviewed the materials you provided, including the income statements, expense reports, and quarterly revenue breakdown. Everything appears to be in order and complete.

I would like to schedule a brief call this week to discuss the next steps in your Q4 tax filing process and address any questions you might have.

Please let me know your availability, and I will be happy to arrange a convenient time for our discussion.

Best regards,
Sarah Johnson, CPA
Senior Tax Accountant`,

      friendly: `Hi [Client Name],

Thanks so much for uploading your Q4 tax documents! I've had a chance to look through everything, and it all looks great.

I'd love to hop on a quick call this week to chat about the next steps and answer any questions you might have about your Q4 filing.

What does your schedule look like? I'm pretty flexible and happy to work around your availability.

Looking forward to connecting!

Best,
Sarah`,

      formal: `Dear [Client Name],

I am writing to formally acknowledge receipt of your Q4 tax documentation submitted via our secure portal.

Upon thorough review of the submitted materials—inclusive of income statements, expense reports, and quarterly revenue analysis—I am pleased to confirm that all requisite documentation has been provided in satisfactory order.

I would be most grateful if you would kindly advise of your availability for a consultative discussion regarding the progression of your Q4 tax filing procedures.

I remain at your disposal for any clarifications you may require.

Respectfully yours,
Sarah Johnson, CPA
Senior Tax Accountant`,

      casual: `Hey [Client Name],

Just wanted to give you a quick update - I checked out those Q4 docs you uploaded and everything looks good to go!

Want to catch up on a call sometime this week? We can go over what's next for your Q4 filing and I can answer any questions.

Let me know when works for you!

Cheers,
Sarah`,

      concise: `Hi [Client Name],

Q4 documents received and reviewed - all complete.

Available for a brief call this week to discuss next steps?

Please advise your availability.

Sarah Johnson, CPA`,
    };

    return emails[selectedTone] || emails.professional;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleUseEmail = () => {
    if (onUseGenerated) {
      onUseGenerated(generatedSubject, generatedBody);
    }
    toast.success('Email loaded into composer');
    onOpenChange(false);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="ai-generate-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            AI Email Generator
          </DialogTitle>
          <DialogDescription id="ai-generate-description">
            Use AI to generate professional emails based on your instructions
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left - Input */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt" className="text-sm font-medium mb-2 block">
                What do you want to say?
              </Label>
              <Textarea
                id="prompt"
                placeholder="E.g., Follow up with client about uploaded Q4 documents and request a meeting..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="tone" className="text-sm font-medium mb-2 block">
                Tone
              </Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{t.label}</span>
                        <span className="text-xs text-gray-500">{t.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="context" className="text-sm font-medium mb-2 block">
                Additional Context (Optional)
              </Label>
              <Textarea
                id="context"
                placeholder="E.g., This is a long-time client who prefers email communication..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2"
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Email
                </>
              )}
            </Button>
          </div>

          {/* Right - Preview */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Generated Email</Label>
              
              {!hasGenerated && !isGenerating && (
                <Card className="p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                  <Sparkles className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your generated email will appear here
                  </p>
                </Card>
              )}

              {isGenerating && (
                <Card className="p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
                  <div className="relative">
                    <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
                    <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-xl animate-pulse" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                    AI is crafting your email...
                  </p>
                </Card>
              )}

              {hasGenerated && !isGenerating && (
                <div className="space-y-3">
                  {/* Subject */}
                  <Card className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Subject</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(generatedSubject)}
                        className="h-6 px-2"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {generatedSubject}
                    </p>
                  </Card>

                  {/* Body */}
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Body</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(generatedBody)}
                        className="h-6 px-2"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedBody}
                    </pre>
                  </Card>

                  {/* Tone Badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Tone: {tones.find(t => t.value === tone)?.label}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRegenerate}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUseEmail}
                      className="gap-2 flex-1"
                      style={{ backgroundColor: 'var(--primaryColor)' }}
                    >
                      <Send className="w-4 h-4" />
                      Use This Email
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
