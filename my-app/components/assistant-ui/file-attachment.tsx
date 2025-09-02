"use client";

import React, { useState, useRef } from "react";
import { X, FileIcon, ImageIcon, PaperclipIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";

export interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'file';
}

interface FileAttachmentProps {
  attachedFiles: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
}

// File attachment button component
export const FileAttachmentButton: React.FC<FileAttachmentProps> = ({
  attachedFiles,
  onFilesChange,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    
    Array.from(files).forEach((file) => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
        return;
      }

      // Check if we've reached max files
      if (attachedFiles.length + newFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const isImage = file.type.startsWith('image/');
      
      const attachedFile: AttachedFile = {
        id: fileId,
        file,
        type: isImage ? 'image' : 'file'
      };

      // Create preview for images
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachedFile.preview = e.target?.result as string;
          onFilesChange([...attachedFiles, ...newFiles, attachedFile]);
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push(attachedFile);
      }
    });

    if (newFiles.length > 0) {
      onFilesChange([...attachedFiles, ...newFiles]);
    }
  };

  return (
    <>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Attach Button */}
      <TooltipIconButton
        tooltip="Attach file"
        variant="ghost"
        className="hover:bg-foreground/15 dark:hover:bg-background/50 scale-115 p-3.5"
        onClick={() => fileInputRef.current?.click()}
      >
        <PaperclipIcon />
      </TooltipIconButton>
    </>
  );
};

// File preview component
export const FileAttachmentPreview: React.FC<{
  attachedFiles: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;
}> = ({ attachedFiles, onFilesChange }) => {
  const removeFile = (fileId: string) => {
    onFilesChange(attachedFiles.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      {attachedFiles.map((attachedFile) => (
        <div
          key={attachedFile.id}
          className="flex items-center gap-2 p-2 bg-background rounded-lg border"
        >
          {/* File Icon/Preview */}
          <div className="flex-shrink-0">
            {attachedFile.type === 'image' && attachedFile.preview ? (
              <img
                src={attachedFile.preview}
                alt={attachedFile.file.name}
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                <FileIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {attachedFile.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(attachedFile.file.size)}
            </p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFile(attachedFile.id)}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

// Legacy component for backward compatibility
export const FileAttachment = FileAttachmentButton;