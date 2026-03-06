import type { Tool } from "./tool-registry";

export const schedulerTool: Tool = {
  name: "scheduler",
  description: "Create lightweight reminders and schedule notes.",
  parameters: {
    action: "string",
    datetime: "string",
    note: "string"
  },
  async execute(input) {
    return `Scheduled: ${input.action ?? "task"} at ${input.datetime ?? "unspecified time"} (${input.note ?? "no note"}).`;
  }
};
