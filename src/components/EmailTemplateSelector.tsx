import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Mail, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface EmailTemplateSelectorProps {
  onSelect?: (template: string) => void;
}

export function EmailTemplateSelector({ onSelect }: EmailTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const templates = [
    {
      id: "project-update",
      name: "Project Update",
      subject: "Update on Your Project",
      body: "Hi,\n\nI wanted to provide you with an update on your project...\n\nBest regards,",
    },
    {
      id: "document-request",
      name: "Document Request",
      subject: "Documents Needed",
      body: "Hi,\n\nWe need the following documents to proceed with your project:\n\n- Document 1\n- Document 2\n\nThank you,",
    },
    {
      id: "status-change",
      name: "Status Change Notification",
      subject: "Project Status Update",
      body: "Hi,\n\nYour project status has been updated.\n\nPlease log in to view the latest updates.\n\nBest regards,",
    },
  ];

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setMessage(template.body);
      onSelect?.(templateId);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          Email Template
        </label>
        <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template or compose custom email" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          Subject
        </label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          Message
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Compose your message..."
          className="min-h-[200px]"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedTemplate("");
            setSubject("");
            setMessage("");
          }}
        >
          Clear
        </Button>
        <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Send className="w-4 h-4" />
          Send Email
        </Button>
      </div>
    </div>
  );
}
