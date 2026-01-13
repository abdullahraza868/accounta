import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBranding } from "../../contexts/BrandingContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Search,
  Plus,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Filter,
  FileText,
} from "lucide-react";
import { formatDateDisplay } from "../../lib/dateFormatting";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { StandaloneProjectsView } from '../StandaloneProjectsView';
import { Toaster } from '../ui/sonner';
import { WorkflowWizard } from '../WorkflowWizard';
import { WorkflowProvider, useWorkflowContext } from '../WorkflowContext';

type Project = {
  id: string;
  name: string;
  type: string;
  status:
    | "Not Started"
    | "In Progress"
    | "Review"
    | "Completed"
    | "On Hold";
  client: string;
  spouse?: string;
  assignedTo: string;
  startDate: string;
  dueDate: string;
  totalHours: number;
  billableHours: number;
  totalValue: number;
  documentCount: number;
  progress: number;
};

function ProjectsViewContent() {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const { addWorkflow } = useWorkflowContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showWorkflowWizard, setShowWorkflowWizard] = useState(false);

  // Mock projects data
  const allProjects: Project[] = [
    {
      id: "tax-2024-smith",
      name: "2024 Tax Return - John & Sarah Smith",
      type: "Tax Return",
      status: "In Progress",
      client: "John Smith",
      spouse: "Sarah Smith",
      assignedTo: "Emily Johnson",
      startDate: "2024-01-15",
      dueDate: "2024-04-15",
      totalHours: 12.5,
      billableHours: 10.0,
      totalValue: 1500,
      documentCount: 8,
      progress: 65,
    },
    {
      id: "tax-2024-chen",
      name: "2024 Tax Return - Michael Chen",
      type: "Tax Return",
      status: "Review",
      client: "Michael Chen",
      assignedTo: "Emily Johnson",
      startDate: "2024-02-01",
      dueDate: "2024-04-15",
      totalHours: 8.0,
      billableHours: 8.0,
      totalValue: 1200,
      documentCount: 12,
      progress: 90,
    },
    {
      id: "bookkeeping-2024-acme",
      name: "Monthly Bookkeeping - Acme Corp",
      type: "Bookkeeping",
      status: "In Progress",
      client: "Acme Corporation",
      assignedTo: "Michael Chen",
      startDate: "2024-11-01",
      dueDate: "2024-11-30",
      totalHours: 6.5,
      billableHours: 6.5,
      totalValue: 975,
      documentCount: 24,
      progress: 45,
    },
    {
      id: "audit-2023-wilson",
      name: "2023 Financial Audit - Wilson LLC",
      type: "Audit",
      status: "In Progress",
      client: "Wilson LLC",
      assignedTo: "Emily Johnson",
      startDate: "2024-10-15",
      dueDate: "2024-12-31",
      totalHours: 22.0,
      billableHours: 20.0,
      totalValue: 3000,
      documentCount: 45,
      progress: 55,
    },
    {
      id: "tax-2024-garcia",
      name: "2024 Tax Return - Maria Garcia",
      type: "Tax Return",
      status: "Not Started",
      client: "Maria Garcia",
      assignedTo: "Michael Chen",
      startDate: "2024-11-12",
      dueDate: "2024-04-15",
      totalHours: 0,
      billableHours: 0,
      totalValue: 0,
      documentCount: 2,
      progress: 5,
    },
    {
      id: "payroll-2024-q4-techstart",
      name: "Q4 Payroll Processing - TechStart Inc",
      type: "Payroll",
      status: "In Progress",
      client: "TechStart Inc",
      assignedTo: "Emily Johnson",
      startDate: "2024-10-01",
      dueDate: "2024-12-31",
      totalHours: 15.5,
      billableHours: 15.5,
      totalValue: 2325,
      documentCount: 18,
      progress: 70,
    },
    {
      id: "tax-2024-thompson",
      name: "2024 Tax Return - Robert & Lisa Thompson",
      type: "Tax Return",
      status: "Completed",
      client: "Robert Thompson",
      spouse: "Lisa Thompson",
      assignedTo: "Emily Johnson",
      startDate: "2024-01-10",
      dueDate: "2024-04-15",
      totalHours: 10.0,
      billableHours: 10.0,
      totalValue: 1500,
      documentCount: 15,
      progress: 100,
    },
    {
      id: "consulting-2024-greenfield",
      name: "Tax Strategy Consulting - Greenfield Partners",
      type: "Consulting",
      status: "In Progress",
      client: "Greenfield Partners",
      assignedTo: "Emily Johnson",
      startDate: "2024-09-15",
      dueDate: "2024-12-15",
      totalHours: 28.5,
      billableHours: 28.5,
      totalValue: 5700,
      documentCount: 32,
      progress: 60,
    },
    {
      id: "tax-2024-patel",
      name: "2024 Tax Return - Rajesh Patel",
      type: "Tax Return",
      status: "On Hold",
      client: "Rajesh Patel",
      assignedTo: "Michael Chen",
      startDate: "2024-02-20",
      dueDate: "2024-04-15",
      totalHours: 4.0,
      billableHours: 4.0,
      totalValue: 600,
      documentCount: 3,
      progress: 25,
    },
  ];

  // Filter projects
  const filteredProjects = allProjects.filter((project) => {
    const matchesSearch =
      project.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      project.client
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    const matchesType =
      typeFilter === "all" || project.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate summary stats
  const stats = {
    total: allProjects.length,
    inProgress: allProjects.filter(
      (p) => p.status === "In Progress",
    ).length,
    totalHours: allProjects.reduce(
      (sum, p) => sum + p.totalHours,
      0,
    ),
    totalValue: allProjects.reduce(
      (sum, p) => sum + p.totalValue,
      0,
    ),
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "Not Started":
        return branding.colors.mutedText;
      case "In Progress":
        return branding.colors.primaryButton;
      case "Review":
        return branding.colors.warningColor;
      case "Completed":
        return branding.colors.successColor;
      case "On Hold":
        return branding.colors.dangerColor;
      default:
        return branding.colors.mutedText;
    }
  };

  // Handler for when a project card is clicked
  const handleProjectClick = (project: any) => {
    console.log('Project clicked:', project);
    // Navigate to project details page
    if (project.id) {
      navigate(`/projects/${project.id}`);
    }
  };

  // Handler for activity log click
  const handleActivityLogClick = (project: any) => {
    console.log('Activity log clicked:', project);
    // Navigate to project details page with activity tab
    if (project.id) {
      navigate(`/projects/${project.id}?tab=activity`);
    }
  };

  // Handler for edit workflow click
  const handleEditWorkflow = () => {
    console.log('Edit workflow clicked');
    // For now, navigate to a default workflow ID
    // In a real app, this would be the currently selected workflow
    navigate('/workflows/edit/1');
  };

  // Handler for start workflow wizard
  const handleStartWizard = () => {
    setShowWorkflowWizard(true);
  };

  // Handler for workflow wizard completion
  const handleWorkflowComplete = (workflow: any) => {
    // Add workflow to context
    addWorkflow(workflow);
    setShowWorkflowWizard(false);
    // Optionally navigate to edit the new workflow
    // navigate(`/workflows/edit/${workflow.id}`);
  };

  // Handler for workflow wizard cancel
  const handleWorkflowCancel = () => {
    setShowWorkflowWizard(false);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-h-screen bg-slate-50">
        <Toaster />
        {showWorkflowWizard ? (
          <WorkflowWizard
            onComplete={handleWorkflowComplete}
            onCancel={handleWorkflowCancel}
          />
        ) : (
          <StandaloneProjectsView 
            onProjectClick={handleProjectClick}
            onActivityLogClick={handleActivityLogClick}
            onEditWorkflow={handleEditWorkflow}
            onStartWizard={handleStartWizard}
            skipProvider={true}
          />
        )}
      </div>
    </div>
  );
}

export function ProjectsView() {
  return (
    <WorkflowProvider>
      <ProjectsViewContent />
    </WorkflowProvider>
  );
}