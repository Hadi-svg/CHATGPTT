import type { FC } from "react";
import { useState } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useThreadListItemRuntime,
  useThreadListItem,
} from "@assistant-ui/react";
import { ArchiveIcon, PlusIcon, Trash2Icon, PencilIcon, CheckIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className="flex flex-col items-stretch gap-1.5">
      <ThreadListNew />
      <ThreadListItems />
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button className="data-active:bg-muted hover:bg-muted flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start" variant="ghost">
        <PlusIcon />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItems: FC = () => {
  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListItem: FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  
  const threadListItemRuntime = useThreadListItemRuntime();
  const threadListItem = useThreadListItem();

  const handleRename = () => {
    setIsEditing(true);
    // Get current title from thread state
    const currentTitle = threadListItem.title || "New Chat";
    setEditTitle(currentTitle);
  };

  const handleSaveRename = async () => {
    try {
      // Use the assistant-ui runtime to rename the thread
      await threadListItemRuntime.rename(editTitle);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to rename thread:", error);
      // Keep editing mode open on error
    }
  };

  const handleCancelRename = () => {
    setIsEditing(false);
    setEditTitle("");
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        // Use the assistant-ui runtime to delete the thread
        await threadListItemRuntime.delete();
      } catch (error) {
        console.error("Failed to delete thread:", error);
      }
    }
  };

  return (
    <ThreadListItemPrimitive.Root 
      className="data-active:bg-muted hover:bg-muted focus-visible:bg-muted focus-visible:ring-ring flex items-center gap-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2 px-3 py-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveRename();
              if (e.key === "Escape") handleCancelRename();
            }}
          />
          <TooltipIconButton
            tooltip="Save"
            variant="ghost"
            size="sm"
            onClick={handleSaveRename}
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
          >
            <CheckIcon className="h-4 w-4" />
          </TooltipIconButton>
          <TooltipIconButton
            tooltip="Cancel"
            variant="ghost"
            size="sm"
            onClick={handleCancelRename}
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
          >
            <XIcon className="h-4 w-4" />
          </TooltipIconButton>
        </div>
      ) : (
        <>
          <ThreadListItemPrimitive.Trigger className="flex-grow px-3 py-2 text-start">
            <ThreadListItemTitle />
          </ThreadListItemPrimitive.Trigger>
          
          {/* Management buttons - show on hover */}
          <div className={`flex items-center gap-1 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <TooltipIconButton
              tooltip="Rename chat"
              variant="ghost"
              size="sm"
              onClick={handleRename}
              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
            >
              <PencilIcon className="h-4 w-4" />
            </TooltipIconButton>
            
            <TooltipIconButton
              tooltip="Delete chat"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
            >
              <Trash2Icon className="h-4 w-4" />
            </TooltipIconButton>
            
            <ThreadListItemArchive />
          </div>
        </>
      )}
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = () => {
  return (
    <p className="text-sm">
      <ThreadListItemPrimitive.Title fallback="New Chat" />
    </p>
  );
};

const ThreadListItemArchive: FC = () => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-600"
        variant="ghost"
        size="sm"
        tooltip="Archive thread"
      >
        <ArchiveIcon className="h-4 w-4" />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  );
};
