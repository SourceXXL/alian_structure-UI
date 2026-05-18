import React, { useState } from "react";
import { validateAgentMetadataSchema } from "@/lib/agentMetadataSchema";
import { buildAgentMintTx, signTransactionWithFreighter, submitTransaction } from "@/lib/stellar";
// @ts-ignore
import { uploadToIPFS } from "../../lib/ipfs";

interface StepProps {
  onNext: (data: any) => void;
  data: any;
}
// TODO: Replace with actual network and wallet integration
const DEMO_NETWORK = "testnet";

function DeployStep({ onNext, data }: StepProps) {
  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleDeploy() {
    setStatus("Building transaction...");
    setError("");
    try {
      // TODO: Replace with actual wallet integration
      const creatorPublicKey = data.creatorPublicKey || window.localStorage.getItem("stellar_wallet_address") || "";
      if (!creatorPublicKey) throw new Error("Wallet not connected");
      const tx = await buildAgentMintTx({
        network: DEMO_NETWORK,
        creatorPublicKey,
        ipfsCid: data.ipfsCid,
        royaltyPercent: data.royaltyPercent || 0,
      });
      setStatus("Signing transaction...");
      const signed = await signTransactionWithFreighter(tx, DEMO_NETWORK);
      if (!signed.success) throw new Error(signed.error);
      setStatus("Submitting transaction...");
      const result = await submitTransaction(tx.toEnvelope().toXDR("base64"), DEMO_NETWORK);
      if (!result.success) throw new Error(result.error);
      setTxHash(result.hash || "");
      setStatus("Deployed!");
      onNext({ ...data, txHash: result.hash });
    } catch (e: any) {
      setError(e.message || String(e));
      setStatus("");
    }
  }

  return (
    <div>
      <h2>Deploy Agent Token</h2>
      <button onClick={handleDeploy}>Deploy to Stellar</button>
      {status && <div>{status}</div>}
      {txHash && (
        <div>
          Success! Tx Hash: <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

function AgentDetailsStep({ onNext, data }: StepProps) {
  const [form, setForm] = useState({
    name: data.name || "",
    description: data.description || "",
    attributes: data.attributes || {},
    image: data.image || null,
  });
  const [errors, setErrors] = useState<string[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, image: e.target.files[0] });
    }
  }
  function handleNext() {
    const errs = validateAgentMetadataSchema(form) || [];
    setErrors(errs);
    if (errs.length === 0) onNext(form);
  }
  return (
    <div>
      <h2>Agent Details</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
      <input type="file" accept="image/*" onChange={handleImage} />
      {/* Attributes input can be improved */}
      <button onClick={handleNext}>Next</button>
      {errors.length > 0 && <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
    </div>
  );
}

function MetadataUploadStep({ onNext, data }: StepProps) {
  const [status, setStatus] = useState<string>("");
  const [ipfsUrl, setIpfsUrl] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  async function handleUpload() {
    setStatus("Uploading to IPFS...");
    const schemaErrors = validateAgentMetadataSchema(data);
    if (schemaErrors.length > 0) {
      setErrors(schemaErrors);
      setStatus("");
      return;
    }
    try {
      const result = await uploadToIPFS(data);
      setIpfsUrl(result.url);
      setStatus("Uploaded!");
      onNext({ ...data, ipfsUrl: result.url, ipfsCid: result.cid });
    } catch (e) {
      setStatus("Upload failed");
      setErrors([String(e)]);
    }
  }
  return (
    <div>
      <h2>Upload Metadata</h2>
      <button onClick={handleUpload}>Upload to IPFS</button>
      {status && <div>{status}</div>}
      {ipfsUrl && <div>IPFS URL: <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">{ipfsUrl}</a></div>}
      {errors.length > 0 && <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
    </div>
  );
}

function ReviewStep({ onNext, data }: StepProps) {
  return (
    <div>
      <h2>Review</h2>
      <img src={data.ipfsUrl} alt="Agent" style={{ maxWidth: 200 }} />
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={() => onNext(data)}>Deploy</button>
    </div>
  );
}

export default function AgentMintingWizard() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  function nextStep(data: any) {
    setFormData({ ...formData, ...data });
    setStep(step + 1);
  }

  const steps = [
    <DeployStep key="deploy" onNext={nextStep} data={formData} />,
    <AgentDetailsStep key="details" onNext={nextStep} data={formData} />,
    <MetadataUploadStep key="upload" onNext={nextStep} data={formData} />,
    <ReviewStep key="review" onNext={nextStep} data={formData} />,
  ];

  return <div>{steps[step]}</div>;
}
