"use client";

import React, { useState, useEffect } from "react";
import { useWorkflowStore } from "@/lib/store";
import { nodeDefinitions } from "@/lib/node-definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { X, Download, Upload, Trash2, File as FileIcon } from "lucide-react";

interface NodeConfigPanelProps {
  nodeId: string;
  onClose: () => void;
}

export default function NodeConfigPanel({
  nodeId,
  onClose,
}: NodeConfigPanelProps) {
  const { nodes, updateNode } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);

  const [config, setConfig] = useState<Record<string, any>>(
    node?.data.config || {}
  );

  useEffect(() => {
    if (node?.data.config) {
      setConfig(node.data.config);
    }
  }, [node]);

  if (!node) return null;

  const definition = nodeDefinitions[node.data.type];
  if (!definition) return null;

  const handleSave = () => {
    updateNode(nodeId, { config });
    onClose();
  };

  const handleChange = (name: string, value: any) => {
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownloadOutput = () => {
    if (!node.data.output) return;
    const outputStr = JSON.stringify(node.data.output, null, 2);
    const blob = new Blob([outputStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${definition.type}-output.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (name: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: { name: string; content: string; type: string }[] = [];
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB limit

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is larger than 1MB limit and was skipped.`);
        continue;
      }

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const base64Content = await base64Promise;
      newFiles.push({
        name: file.name,
        type: file.type,
        content: base64Content,
      });
    }

    const existingFiles = Array.isArray(config[name]) ? config[name] : [];
    handleChange(name, [...existingFiles, ...newFiles]);
  };

  const removeUploadedFile = (fieldName: string, index: number) => {
    const existingFiles = Array.isArray(config[fieldName]) ? [...config[fieldName]] : [];
    existingFiles.splice(index, 1);
    handleChange(fieldName, existingFiles);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configure Node
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {definition.label}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {definition.configFields.map((field) => (
          <div key={field.name}>
            <Label className="text-gray-700 dark:text-gray-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === "text" && (
              <Input
                type="text"
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}

            {field.type === "number" && (
              <Input
                type="number"
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1 font-mono text-sm"
                rows={6}
              />
            )}

            {field.type === "select" && (
              <Select
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="mt-1"
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}

            {field.type === "file" && (
              <div className="mt-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple={field.multiple}
                    onChange={(e) => handleFileUpload(field.name, e.target.files)}
                    className="flex-1 text-xs file:bg-indigo-50 file:text-indigo-600 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 file:text-xs file:font-semibold hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>
                
                {Array.isArray(config[field.name]) && config[field.name].length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-800 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Attached Files</p>
                    {config[field.name].map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center overflow-hidden">
                          <FileIcon className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                          <span className="text-xs truncate text-gray-700 dark:text-gray-300">
                            {file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeUploadedFile(field.name, index)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-md transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Configuration
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </div>

        {node.data.output && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Last Output
              </h4>
              <div className="flex gap-2">
                {node.data.output.fileData && node.data.output.fileName && (
                  <Button 
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${node.data.output.fileData}`;
                      link.download = node.data.output.fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                  >
                    <Download className="w-3 h-3 mr-1.5" />
                    Download Excel
                  </Button>
                )}
                <Button 
                  onClick={handleDownloadOutput} 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30"
                >
                  <Download className="w-3 h-3 mr-1.5" />
                  Download TXT
                </Button>
              </div>
            </div>
            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
              {JSON.stringify(node.data.output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
