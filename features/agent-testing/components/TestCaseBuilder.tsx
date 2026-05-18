"use client";

import React, { useState } from "react";
import { Button } from "@/components/Button";

interface TestCaseBuilderProps {
  onRun: (data: any) => void;
  isLoading: boolean;
}

export const TestCaseBuilder: React.FC<TestCaseBuilderProps> = ({
  onRun,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    contractId: "",
    functionName: "",
    args: "",
    network: "testnet",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedArgs = formData.args ? JSON.parse(formData.args) : [];
      onRun({
        ...formData,
        args: Array.isArray(parsedArgs) ? parsedArgs : [parsedArgs],
      });
    } catch (err) {
      alert("Invalid arguments JSON format");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8 rounded-xl border border-cosmic-purple/30 nebula-bg shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 glow-text">Test Case Builder</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">
              Test Case Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Transfer Validation"
              className="w-full bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-white focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue outline-none transition-smooth"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">
              Network
            </label>
            <select
              name="network"
              className="w-full bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-white focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue outline-none transition-smooth"
              value={formData.network}
              onChange={handleChange}
            >
              <option value="testnet">Testnet</option>
              <option value="futurenet">Futurenet</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Contract ID
          </label>
          <input
            type="text"
            name="contractId"
            required
            placeholder="C..."
            className="w-full bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-white focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue outline-none transition-smooth font-mono"
            value={formData.contractId}
            onChange={handleChange}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">
              Function Name
            </label>
            <input
              type="text"
              name="functionName"
              required
              placeholder="e.g. hello"
              className="w-full bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-white focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue outline-none transition-smooth"
              value={formData.functionName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Arguments (JSON Array)
          </label>
          <textarea
            name="args"
            placeholder='["arg1", 123]'
            rows={4}
            className="w-full bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg px-4 py-3 text-white focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue outline-none transition-smooth font-mono"
            value={formData.args}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500">
            Provide arguments as a JSON array matching the function signature.
          </p>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Executing Simulation..." : "Run Benchmarks"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TestCaseBuilder;
