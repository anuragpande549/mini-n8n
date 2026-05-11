import { NodeExecutionContext, NodeExecutionResult } from "./types";
import { nodeDefinitions } from "./node-definitions";
import * as XLSX from "xlsx";

export function replaceTemplateVariables(text: any, input: any): any {
  if (typeof text !== "string") return text;

  // Exact placeholder match - returns raw object/array to preserve type
  const exactMatch = text.match(/^\{\{\s*([^}]+)\s*\}\}$/);
  if (exactMatch) {
    const path = exactMatch[1].trim();
    const lowerPath = path.toLowerCase();
    
    if (lowerPath === "input") return input;
    
    if (lowerPath.startsWith("input.")) {
      const fields = path.substring(6).split(".");
      let result = input;
      
      for (const field of fields) {
        if (result && typeof result === "object") {
          result = result[field];
        } else {
          return text;
        }
      }
      
      return result !== undefined && result !== null ? result : text;
    }
  }

  // Fallback for string interpolation
  return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const trimmedPath = path.trim();
    const lowerPath = trimmedPath.toLowerCase();

    // Handle {{input}} or {{INPUT}} - return entire input
    if (lowerPath === "input") {
      return typeof input === "object" ? JSON.stringify(input) : String(input);
    }

    // Handle {{input.fieldName}} or {{Input.fieldName}} - access nested properties
    if (lowerPath.startsWith("input.")) {
      // Use original trimmedPath to preserve case of the actual field names!
      const fields = trimmedPath.substring(6).split(".");
      let result = input;

      for (const field of fields) {
        if (result && typeof result === "object") {
          result = result[field];
        } else {
          return match; // Return original if path is invalid
        }
      }

      if (result === undefined || result === null) return match;
      return typeof result === "object" ? JSON.stringify(result) : String(result);
    }

    return match; // Return original if pattern doesn't match
  });
}

export class WorkflowExecutor {
  private async executeAINode(
    type: string,
    config: Record<string, any>,
    input: any
  ): Promise<any> {
    try {
      const response = await fetch("/api/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, config, input }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "AI execution failed");
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || "Failed to execute AI node");
    }
  }

  async executeNode(
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult> {
    const { nodeId, input, config } = context;
    const definition = nodeDefinitions[config.type];

    if (!definition) {
      return {
        success: false,
        error: `Unknown node type: ${config.type}`,
      };
    }

    try {
      switch (definition.category) {
        case "trigger":
          return await this.executeTriggerNode(config, input);

        case "ai":
          return await this.executeAINodeType(config, input);

        case "action":
          return await this.executeActionNode(config, input);

        case "logic":
          return await this.executeLogicNode(config, input);

        default:
          return {
            success: false,
            error: `Unsupported node category: ${definition.category}`,
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Execution failed",
      };
    }
  }

  private async executeTriggerNode(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    if (config.type === "telegramTrigger") {
      return await this.executeTelegramTrigger(config, input);
    }

    // Trigger nodes pass through their input or generate initial data
    return {
      success: true,
      output: input || {
        triggeredAt: new Date().toISOString(),
        config: config,
      },
    };
  }

  private async executeTelegramTrigger(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    try {
      let { botToken, filterType, filterHours } = config;
      botToken = replaceTemplateVariables(botToken, input);

      if (!botToken || typeof botToken !== "string") {
        return {
          success: false,
          error: "Bot Token is required for Telegram Trigger",
        };
      }

      const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
      const data = await response.json();

      if (!data.ok) {
        return {
          success: false,
          error: data.description || "Failed to fetch updates from Telegram",
        };
      }

      const updates = data.result || [];
      if (updates.length === 0) {
        return {
          success: true,
          output: {
            items: [],
            message: "No new messages",
            triggeredAt: new Date().toISOString(),
          },
        };
      }

      let items = updates.map((update: any) => {
        const message = update.message || update.channel_post || update.edited_message;
        if (!message) return null;

        return {
          updateId: update.update_id,
          messageId: message.message_id,
          text: message.text || "",
          chatId: message.chat?.id,
          senderName: message.from?.first_name || message.chat?.title || "Unknown",
          date: new Date(message.date * 1000).toISOString(),
          raw: message,
        };
      }).filter(Boolean);

      // Apply filtering if specified
      if (filterType === "lastHours" && filterHours) {
        const hoursMs = parseFloat(filterHours) * 60 * 60 * 1000;
        const cutoffTime = Date.now() - hoursMs;
        items = items.filter((item: any) => {
          const itemTime = new Date(item.date).getTime();
          return itemTime >= cutoffTime;
        });
      }

      // Acknowledge updates to clear the queue
      const maxUpdateId = Math.max(...updates.map((u: any) => u.update_id));
      await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=${maxUpdateId + 1}`);

      return {
        success: true,
        output: {
          items,
          totalItems: items.length,
          triggeredAt: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to execute Telegram Trigger",
      };
    }
  }

  private async executeAINodeType(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    const result = await this.executeAINode(config.type, config, input);
    return {
      success: true,
      output: typeof input === 'object' ? { ...input, ...result } : result,
    };
  }

  private async executeActionNode(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    switch (config.type) {
      case "httpRequest":
        return await this.executeHttpRequest(config, input);

      case "dataTransform":
        return this.executeDataTransform(config, input);

      case "sendEmail":
        return await this.executeSendEmail(config, input);

      case "excelReader":
        return await this.executeExcelReader(config, input);

      case "excelWriter":
        return await this.executeExcelWriter(config, input);

      default:
        return {
          success: false,
          error: `Unknown action node type: ${config.type}`,
        };
    }
  }

  private async executeHttpRequest(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    try {
      let { method = "GET", url, headers = "{}", body = "{}" } = config;

      // Process template variables
      url = replaceTemplateVariables(url, input);
      headers = replaceTemplateVariables(headers, input);
      body = replaceTemplateVariables(body, input);

      // Validate URL
      if (!url || typeof url !== "string") {
        return {
          success: false,
          error: "URL is required",
        };
      }

      // Make request through our API to avoid CORS issues
      const response = await fetch("/api/http-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          method,
          headers,
          body: method !== "GET" ? body : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "HTTP request failed",
        };
      }

      return {
        success: true,
        output: typeof input === 'object' ? { ...input, response: result } : result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "HTTP request failed",
      };
    }
  }

  private executeDataTransform(
    config: Record<string, any>,
    input: any
  ): NodeExecutionResult {
    try {
      const { code } = config;

      // Create a safe function from the code
      const transformFunction = new Function("input", code);
      const output = transformFunction(input);

      return {
        success: true,
        output: typeof input === 'object' ? { ...input, ...output } : output,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Data transformation failed",
      };
    }
  }

  private async executeSendEmail(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    try {
      let { to, subject, body, attachmentName, attachmentContent, uploadedFiles } = config;

      // Process template variables
      to = replaceTemplateVariables(to, input);
      subject = replaceTemplateVariables(subject, input);
      body = replaceTemplateVariables(body, input);
      
      if (attachmentName) {
        attachmentName = replaceTemplateVariables(attachmentName, input);
      }
      if (attachmentContent) {
        attachmentContent = replaceTemplateVariables(attachmentContent, input);
      }

      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, body, attachmentName, attachmentContent, uploadedFiles }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to send email",
        };
      }

      return {
        success: true,
        output: {
          sent: true,
          to,
          subject,
          body,
          sentAt: new Date().toISOString(),
          messageId: result.messageId,
          message: "✉️ Email sent successfully",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }
  }

  private async executeExcelReader(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    try {
      const { uploadedFiles } = config;

      if (!uploadedFiles || !Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
        return {
          success: false,
          error: "No file uploaded in the Excel Reader node",
        };
      }

      const file = uploadedFiles[0];
      if (!file.content) {
        return {
          success: false,
          error: "Invalid file content",
        };
      }

      let base64Data = file.content;
      if (base64Data.includes("base64,")) {
        base64Data = base64Data.split("base64,")[1];
      }

      const workbook = XLSX.read(base64Data, { type: "base64" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      return {
        success: true,
        output: { items: jsonData },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to process Excel file",
      };
    }
  }

  private async executeExcelWriter(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    try {
      const { dataSource, fileName, columnMapping } = config;
      
      let data = replaceTemplateVariables(dataSource, input);
      let parsedName = replaceTemplateVariables(fileName || "export.xlsx", input);

      if (typeof data === "string") {
        try { 
          data = JSON.parse(data); 
        } catch { 
          // If it's a comma separated string
          if (data.includes(",")) data = data.split(",").map(i => i.trim());
          else data = [data]; 
        }
      }
      
      if (!Array.isArray(data)) {
        data = [data];
      }

      if (data.length === 0) {
        return {
          success: false,
          error: "No data available to write to Excel",
        };
      }

      // Apply column mapping if provided
      if (columnMapping && typeof columnMapping === "string" && columnMapping.trim() !== "") {
        try {
          const mapping = JSON.parse(columnMapping);
          data = data.map(item => {
            const mappedItem: any = {};
            for (const [colName, path] of Object.entries(mapping)) {
              let val = item;
              if (typeof path === "string") {
                const parts = path.split(".");
                for (const p of parts) {
                  if (val && typeof val === "object") {
                    val = val[p];
                  } else {
                    val = undefined;
                    break;
                  }
                }
              }
              mappedItem[colName] = val !== undefined ? val : ""; // Use empty string for missing values
            }
            return mappedItem;
          });
        } catch (e: any) {
          return {
            success: false,
            error: "Invalid JSON in Column Mapping: " + e.message,
          };
        }
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const base64Data = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

      return {
        success: true,
        output: {
          fileData: base64Data,
          fileName: parsedName,
          totalRows: data.length,
          message: "Excel file generated successfully! Use the Download button to save it.",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to generate Excel file",
      };
    }
  }

  private async executeLogicNode(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    switch (config.type) {
      case "ifElse":
        return this.executeIfElse(config, input);

      case "delay":
        return await this.executeDelay(config, input);

      case "loop":
        return this.executeLoop(config, input);

      default:
        return {
          success: false,
          error: `Unknown logic node type: ${config.type}`,
        };
    }
  }

  private executeIfElse(
    config: Record<string, any>,
    input: any
  ): NodeExecutionResult {
    try {
      const { condition, operator } = config;

      let result = false;

      if (operator === "javascript") {
        const evaluateFunction = new Function("input", `return ${condition}`);
        result = Boolean(evaluateFunction(input));
      } else {
        const processedCondition = replaceTemplateVariables(String(condition), input);
        const inputString = typeof input === "object" ? JSON.stringify(input) : String(input);

        if (operator === "equals") {
          result = inputString === processedCondition;
        } else if (operator === "contains") {
          result = inputString.includes(processedCondition);
        }
      }

      return {
        success: true,
        output: {
          condition: result,
          branch: result ? "true" : "false",
          input,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Condition evaluation failed",
      };
    }
  }

  private async executeDelay(
    config: Record<string, any>,
    input: any
  ): Promise<NodeExecutionResult> {
    const { duration, unit } = config;
    const ms =
      unit === "seconds" ? parseInt(duration) * 1000 : parseInt(duration);

    await new Promise((resolve) => setTimeout(resolve, ms));

    return {
      success: true,
      output: {
        delayed: ms,
        input,
      },
    };
  }

  private executeLoop(
    config: Record<string, any>,
    input: any
  ): NodeExecutionResult {
    try {
      const { arraySource } = config;
      
      // Process template variables to get the array string
      let processedArray = replaceTemplateVariables(arraySource, input);
      
      let items: any[] = [];
      
      if (typeof processedArray === "string") {
        try {
          items = JSON.parse(processedArray);
        } catch (e) {
          // If it's not a JSON string but a comma separated string, try to split it
          if (processedArray.includes(",")) {
            items = processedArray.split(",").map(i => i.trim());
          } else {
            // Otherwise, treat the entire string as a single item
            items = [processedArray];
          }
        }
      } else if (Array.isArray(processedArray)) {
        items = processedArray;
      } else {
        items = [processedArray];
      }

      if (!Array.isArray(items)) {
        items = [items];
      }

      return {
        success: true,
        output: {
          items,
          totalItems: items.length,
          originalInput: input
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to process loop array",
      };
    }
  }
}
