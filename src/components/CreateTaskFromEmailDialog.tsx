import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  CheckSquare,
  Calendar as CalendarIcon,
  User,
  Flag,
  Link,
  Mail,
  ListTodo,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import { cn } from "./ui/utils";

type CreateTaskFromEmailDialogProps = {
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
    clientId?: string;
    clientName?: string;
  } | null;
};

export function CreateTaskFromEmailDialog({
  open,
  onOpenChange,
  email,
}: CreateTaskFromEmailDialogProps) {
  const [taskTitle, setTaskTitle] = useState(
    email?.subject || "",
  );
  const [taskDescription, setTaskDescription] = useState(
    email
      ? `From: ${email.from.name} (${email.from.email})\n\n${email.body}`
      : "",
  );
  const [assignee, setAssignee] = useState("JD"); // Current user (default to John Doe)
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState("");
  const [selectedListId, setSelectedListId] =
    useState<string>(""); // Empty means Email List only

  // Mock task lists - matching AllTasksView (excluding email-tasks since that's always included)
  const taskLists = [
    { id: "inbox", name: "Inbox", color: "bg-slate-500" },
    { id: "callback", name: "Callback", color: "bg-amber-500" },
    {
      id: "recurring-tasks",
      name: "Recurring Tasks",
      color: "bg-indigo-500",
    },
    { id: "list-1", name: "My Tasks", color: "bg-violet-500" },
    { id: "list-2", name: "Team Tasks", color: "bg-blue-500" },
    {
      id: "list-3",
      name: "Client Work",
      color: "bg-emerald-500",
    },
  ];

  // Update form when email changes
  useEffect(() => {
    if (email && open) {
      setTaskTitle(email.subject);
      setTaskDescription(
        `From: ${email.from.name} (${email.from.email})\n\n${email.body}`,
      );
      setSelectedListId(""); // Reset to Email List only
    }
  }, [email, open]);

  // Mock team members
  const teamMembers = [
    { id: "JD", name: "John Doe (Me)", email: "john@firm.com" },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike@firm.com",
      role: "Senior Accountant",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      email: "emily@firm.com",
      role: "Tax Associate",
    },
    {
      id: "4",
      name: "David Kim",
      email: "david@firm.com",
      role: "CPA",
    },
  ];

  const handleCreateTask = () => {
    if (!taskTitle.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (!email) {
      toast.error("Email information is missing");
      return;
    }

    const assignedMember = teamMembers.find(
      (m) => m.id === assignee,
    );

    // Determine the actual list ID(s) to save
    // Tasks from emails should ALWAYS be in 'email-tasks' list
    // If user selects an additional list, task goes to BOTH lists
    const listIds =
      selectedListId === ""
        ? ["email-tasks"]
        : [selectedListId, "email-tasks"];

    // Save task data to localStorage for Tasks module to pick up
    const newTaskData = {
      name: taskTitle,
      description: taskDescription,
      projectId: "email-tasks-project",
      workflowId: "email-tasks-workflow",
      stageId: "email-tasks-stage",
      assignee: assignee, // Use the assignee ID (e.g., 'JD')
      priority: priority as "high" | "medium" | "low",
      status: "todo" as const,
      dueDate: dueDate
        ? dueDate.toISOString()
        : new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
      automations: 0,
      dependencies: [],
      emailId: email.id,
      listIds: listIds, // Array to support multiple lists
      comments: 0,
      attachments: 0,
    };

    console.log(
      "[CreateTaskFromEmail] Saving task to localStorage:",
      newTaskData,
    );

    // Get existing pending tasks array or create new one
    const existingTasksJson = localStorage.getItem(
      "pendingEmailTasks",
    );
    const existingTasks = existingTasksJson
      ? JSON.parse(existingTasksJson)
      : [];

    // Add new task to the array
    existingTasks.push(newTaskData);

    // Store updated array in localStorage
    localStorage.setItem(
      "pendingEmailTasks",
      JSON.stringify(existingTasks),
    );

    // Verify it was saved
    const saved = localStorage.getItem("pendingEmailTasks");
    console.log(
      "[CreateTaskFromEmail] Verified localStorage save:",
      saved ? "Success" : "Failed",
    );

    // Save email-task mapping
    // Generate a temporary task ID that will be replaced when the task is actually created
    const tempTaskId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const emailTaskMapping = JSON.parse(
      localStorage.getItem("emailTaskMapping") || "{}",
    );
    emailTaskMapping[email.id] = tempTaskId;
    localStorage.setItem(
      "emailTaskMapping",
      JSON.stringify(emailTaskMapping),
    );
    console.log(
      "[CreateTaskFromEmail] Saved email-task mapping:",
      email.id,
      "->",
      tempTaskId,
    );

    // Determine which list(s) the task was added to
    const selectedList = taskLists.find(
      (list) => list.id === selectedListId,
    );
    const listNames =
      selectedListId === ""
        ? "Email Tasks"
        : `${selectedList?.name || "Selected List"} and Email Tasks`;

    toast.success("Task created successfully", {
      description: `Added to ${listNames}`,
    });

    onOpenChange(false);

    // Navigate to tasks page after a brief delay to ensure toast shows
    setTimeout(() => {
      window.location.hash = "#/tasks";
    }, 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col"
        aria-describedby="create-task-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Add Email to Task
          </DialogTitle>
          <DialogDescription id="create-task-description">
            Create a task in the Task Center and link it to this
            email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Email Reference */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
            <div className="flex items-start gap-2">
              <Link className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-blue-800 dark:text-blue-300 font-medium">
                  This task will be linked to the email
                </p>
                <p className="text-blue-700 dark:text-blue-400 text-xs mt-1">
                  From: {email?.from.name} • Subject:{" "}
                  {email?.subject}
                </p>
              </div>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <Label
              htmlFor="task-title"
              className="text-sm font-medium mb-2 block"
            >
              Task Title <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Task Description */}
          <div>
            <Label
              htmlFor="task-description"
              className="text-sm font-medium mb-2 block"
            >
              Description
            </Label>
            <Textarea
              id="task-description"
              placeholder="Enter task description"
              value={taskDescription}
              onChange={(e) =>
                setTaskDescription(e.target.value)
              }
              rows={8}
              className="font-sans"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Email content is pre-filled. You can edit or add
              more details.
            </p>
          </div>

          {/* Assignee */}
          <div>
            <Label
              htmlFor="assignee"
              className="text-sm font-medium mb-2 block"
            >
              Assign To
            </Label>
            <Select
              value={assignee}
              onValueChange={setAssignee}
            >
              <SelectTrigger id="assignee">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <span>{member.name}</span>
                        {member.role && (
                          <span className="text-xs text-gray-500 ml-2">
                            • {member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start gap-2",
                      !dueDate && "text-gray-500",
                    )}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {dueDate
                      ? format(dueDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Priority */}
            <div>
              <Label
                htmlFor="priority"
                className="text-sm font-medium mb-2 block"
              >
                Priority
              </Label>
              <Select
                value={priority}
                onValueChange={setPriority}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Flag
                        className={cn(
                          "w-4 h-4",
                          getPriorityColor("high"),
                        )}
                      />
                      <span>High Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Flag
                        className={cn(
                          "w-4 h-4",
                          getPriorityColor("medium"),
                        )}
                      />
                      <span>Medium Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Flag
                        className={cn(
                          "w-4 h-4",
                          getPriorityColor("low"),
                        )}
                      />
                      <span>Low Priority</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* List Selection */}
          <div>
            <Label
              htmlFor="listId"
              className="text-sm font-medium mb-2 block"
            >
              List
            </Label>
            <Select
              value={selectedListId}
              onValueChange={setSelectedListId}
            >
              <SelectTrigger id="listId">
                <SelectValue placeholder="None (optional)" />
              </SelectTrigger>
              <SelectContent>
                {taskLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 ${list.color} rounded-full`}
                      />
                      <span>{list.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {selectedListId === ""
                ? "Task will be added to Email List only"
                : "Task will be added to both the selected list and Email List"}
            </p>
          </div>

          {email?.clientName && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Client:</span>{" "}
                {email.clientName}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTask}
            style={{ backgroundColor: "var(--primaryColor)" }}
            className="gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}