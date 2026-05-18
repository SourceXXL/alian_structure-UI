import { create as ipfsHttpClient, IPFSHTTPClient } from 'ipfs-http-client';
import { NFTStorage, File as NFTFile } from 'nft.storage';
import axios from 'axios';

export interface IPFSUploadResult {
  cid: string;
  url: string;
}

export interface AgentMetadata {
  name: string;
  description: string;
  image: File;
  attributes: Record<string, any>;
}

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Use env or config for these
const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN || '';

export async function uploadToIPFS(
  metadata: AgentMetadata,
  retries = 3
): Promise<IPFSUploadResult> {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });
      const imageFile = new NFTFile([metadata.image], metadata.image.name, {
        type: metadata.image.type,
      });
      const data = {
        name: metadata.name,
        description: metadata.description,
        image: imageFile,
        attributes: metadata.attributes,
      };
      const result = await client.store(data as any);
      // NFT.storage returns .ipnft (CID for metadata)
      return {
        cid: result.ipnft,
        url: `${IPFS_GATEWAY}${result.ipnft}`,
      };
    } catch (err) {
      lastError = err;
      await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
    }
  }
  throw lastError;
}

// Validate image size (max 2MB)
export function validateImageSize(file: File, maxSizeMB = 2): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

// Validate metadata schema (basic)
export function validateAgentMetadata(meta: Partial<AgentMetadata>): string[] {
  const errors: string[] = [];
  if (!meta.name) errors.push('Name is required');
  if (!meta.description) errors.push('Description is required');
  if (!meta.image) errors.push('Image is required');
  if (meta.image && !validateImageSize(meta.image)) errors.push('Image must be <= 2MB');
  return errors;
}
