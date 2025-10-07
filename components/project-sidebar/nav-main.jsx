"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  SquareTerminal,
  Table,
  FileCode2,
  Settings,
  ClipboardList,
  Plus,
  Workflow,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects } from "@/providers/ProjectContext";
import { useTables } from "@/providers/TableContext";
import axios from "@/utils/axios";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Hardcoded main nav items (without project-dependent URLs)
const navMain = [
  { title: "Analytics", url: "#", icon: SquareTerminal },
  { title: "Tables", icon: Table, hasSubMenu: true },
  { title: "SQL Editor", icon: FileCode2 },
  { title: "Schema Visualization", icon: Workflow },
  {
    title: "Project Settings",
    icon: Settings,
    items: [
      { title: "General", url: "#" },
      { title: "Invite Members", url: "#" },
      { title: "API Keys", url: "#" },
    ],
  },
  { title: "Audit Logs", url: "#", icon: ClipboardList },
];

// Skeleton loader while fetching tables
const SkeletonLoader = () => (
  <div className="space-y-2 p-2">
    <div className="h-4 w-4/5 rounded-md bg-gray-200 animate-pulse"></div>
    <div className="h-4 w-3/5 rounded-md bg-gray-200 animate-pulse"></div>
    <div className="h-4 w-4/6 rounded-md bg-gray-200 animate-pulse"></div>
  </div>
);

export function NavMain() {
  const { selectedProject } = useProjects();
  const { tables, isLoading, mutate } = useTables();
  const router = useRouter();
  const [isTablesOpen, setIsTablesOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [confirmName, setConfirmName] = useState("");

  useEffect(() => {
    if (tables && tables.length > 0) setIsTablesOpen(true);
  }, [tables]);

  const handleDeleteClick = (table) => {
    setTableToDelete(table);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (confirmName !== tableToDelete.table_name) {
      toast.error("The table name does not match.");
      return;
    }

    try {
      await axios.delete(
        `/projects/${selectedProject.project_id}/tables/${tableToDelete.table_name}`,
        { data: { tableName: tableToDelete.table_name } }
      );

      toast.success("Table deleted successfully.");
      setIsDeleteModalOpen(false);
      setTableToDelete(null);
      setConfirmName("");
      mutate(); // Refresh tables
      router.push(`/project/${selectedProject.project_id}/dashboard`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to delete table.";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Project</SidebarGroupLabel>
        <SidebarMenu>
          {navMain.map((item) => {
            // Dynamic route for SQL Editor
            if (item.title === "SQL Editor") {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link
                      href={
                        selectedProject
                          ? `/project/${selectedProject.project_id}/sql-editor`
                          : "#"
                      }
                      className={`${
                        !selectedProject
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:text-primary"
                      }`}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            // Dynamic route for Schema Visualization
            if (item.title === "Schema Visualization") {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link
                      href={
                        selectedProject
                          ? `/project/${selectedProject.project_id}/schema-visualization`
                          : "#"
                      }
                      className={`${
                        !selectedProject
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:text-primary"
                      }`}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            // Tables collapsible menu
            if (item.title === "Tables") {
              return (
                <Collapsible
                  key={item.title}
                  open={isTablesOpen}
                  onOpenChange={setIsTablesOpen}
                  asChild
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <Table />
                        <span>{item.title}</span>
                        {isLoading && (
                          <Loader2 className="h-4 w-4 ml-auto animate-spin text-muted-foreground" />
                        )}
                        {!isLoading && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {/* Create Table link */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={`/project/${selectedProject?.project_id}/create-table`}
                              className="font-semibold text-primary hover:text-primary-foreground transition-colors duration-200"
                            >
                              <Plus size={16} />
                              <span>Create Table</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* List all tables */}
                        {isLoading ? (
                          <SkeletonLoader />
                        ) : tables && tables.length > 0 ? (
                          tables.map((table) => (
                            <SidebarMenuSubItem key={table.table_name}>
                              <SidebarMenuSubButton asChild>
                                <div className="flex w-full items-center justify-between group">
                                  <Link
                                    href={`/project/${selectedProject?.project_id}/tables/${table.table_name}`}
                                    className="truncate flex-grow"
                                  >
                                    <span>{table.table_name}</span>
                                  </Link>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground ">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          toast.info("Edit functionality coming soon!")
                                        }
                                      >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteClick(table)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))
                        ) : (
                          <SidebarMenuSubItem>
                            <span className="text-muted-foreground text-xs p-2">
                              No tables found.
                            </span>
                          </SidebarMenuSubItem>
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            // Project Settings collapsible
            if (item.items) {
              return (
                <Collapsible key={item.title} asChild className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            // Default single menu item
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action{" "}
              <strong className="text-destructive">cannot be undone</strong>. This
              will permanently delete the table named{" "}
              <strong className="text-destructive">
                {tableToDelete?.table_name}
              </strong>{" "}
              and all of its data. To confirm, please type the table's name in the
              input below.
            </AlertDialogDescription>
            <div className="mt-4">
              Table Name :{" "}
              <strong className="text-destructive">
                {tableToDelete?.table_name}
              </strong>
              <Input
                type="text"
                placeholder="Enter table name to confirm"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={confirmName !== tableToDelete?.table_name}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
