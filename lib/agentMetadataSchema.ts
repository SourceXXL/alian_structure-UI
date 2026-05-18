import { AgentMetadata } from "../lib/ipfs";

// JSON schema for agent metadata
export const agentMetadataSchema = {
  type: "object",
  required: ["name", "description", "image", "attributes"],
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100 },
    description: { type: "string", minLength: 1, maxLength: 1000 },
    image: { type: "object" }, // File object, validated separately
    attributes: { type: "object" },
  },
};

export function validateAgentMetadataSchema(meta: Partial<AgentMetadata>): string[] {
  const errors: string[] = [];
  if (!meta.name || typeof meta.name !== "string" || meta.name.length > 100) {
    errors.push("Name is required and must be <= 100 chars");
  }
  if (!meta.description || typeof meta.description !== "string" || meta.description.length > 1000) {
    errors.push("Description is required and must be <= 1000 chars");
  }
  if (!meta.image) {
    errors.push("Image is required");
  }
  if (!meta.attributes || typeof meta.attributes !== "object") {
    errors.push("Attributes must be an object");
  }
  return errors;
}
