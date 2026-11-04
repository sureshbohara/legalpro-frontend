import {
  LayoutDashboard, Scale, FolderOpen, CheckCircle, Users, Shield, Key,
  Activity, Settings, Server, Briefcase, Gavel, CheckSquare, FileText,
  Receipt, History, Clock, Calendar, Sparkles
} from "lucide-react";

export const menuItems = [


  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },


  {
    name: "Case Management",
    icon: Scale,
    subItems: [
      { name: "All Cases", href: "/cases", icon: Briefcase },
      { name: "Categories", href: "/case-categories", icon: FolderOpen },
      { name: "Statuses", href: "/case-statuses", icon: CheckCircle },
    ]
  },


  {
    name: "Client Management",
    icon: Users,
    subItems: [
      { name: "All Clients", href: "/clients", icon: Users },
    ]
  },


  {
    name: "Court Management",
    icon: Gavel,
    subItems: [
      { name: "Hearings", href: "/hearings", icon: Gavel },
      { name: "Calendar", href: "/calendar", icon: Calendar },
    ]
  },

  
  {
    name: "Work Management",
    icon: Briefcase,
    subItems: [
      { name: "Tasks", href: "/tasks", icon: CheckSquare },
      { name: "Time Tracking", href: "/time-entries", icon: Clock },
    ]
  },


  {
    name: "Document Management",
    icon: FileText,
    subItems: [
      { name: "All Documents", href: "/documents", icon: FileText },
      { name: "Document Templates", href: "/document-templates", icon: FolderOpen },
      { name: "AI Summarizer", href: "/ai-summarizer", icon: Sparkles },
    ]
  },

 
  {
    name: "Financial Management",
    icon: Receipt,
    subItems: [
      { name: "Invoices", href: "/invoices", icon: Receipt },
      { name: "Payment History", href: "/payment-history", icon: History },
    ]
  },


  {
    name: "Administration",
    icon: Shield,
    subItems: [
      { name: "Users", href: "/users", icon: Users },
      { name: "Roles", href: "/roles", icon: Shield },
      { name: "Permissions", href: "/permissions", icon: Key },
    ]
  },


  {
    name: "System Management",
    icon: Settings,
    subItems: [
      { name: "Activity Logs", href: "/activity-logs", icon: Activity },
      { name: "Settings", href: "/settings", icon: Settings }
    ]
  },

];