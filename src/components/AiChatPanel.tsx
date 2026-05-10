"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

interface GenerativeOption {
  id: string;
  name: string;
  depth_m: number;
  cost_inr: number;
  carbon_tco2e: number;
  construction_time_days: number;
  confidence_score: number;
  reason: string;
}

interface AiChatPanelProps {
  deviation: number;
  soilBearingCapacity: number;
  safetyFactor: number;
  weights?: { cost: number; carbon: number; time: number };
  onOptionsGenerated: (options: GenerativeOption[]) => void;
  onIterationComplete: (explanation: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_BASE_URL || "http://127.0.0.1:8000";

export default function AiChatPanel({
  deviation,
  soilBearingCapacity,
  safetyFactor,
  weights,
  onOptionsGenerated,
  onIterationComplete,
}: AiChatPanelProps) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "I'm your AI structural design assistant powered by Qwen 3.5 running locally. I can generate and refine beam designs. Try typing:\n\n• *Generate 3 beam options* for current conditions\n• *Optimize for lower carbon* with reasoning\n• *Make it cheaper* and reduce material cost",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Health check on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) })
      .then((r) => r.ok && setConnectionOk(true))
      .catch(() => setConnectionOk(false));
  }, []);

  const sendMessage = useCallback(async () => {
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const conversation = [...messages, { role: "user" as const, content: userMessage }];

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation.map((m) => ({ role: m.role, content: m.content })),
          deviation_mm: deviation,
          soil_bearing_capacity: soilBearingCapacity,
          safety_factor: safetyFactor,
          weights: weights || { cost: 33, carbon: 33, time: 34 },
        }),
        signal: AbortSignal.timeout(120000),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "unknown");
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();

      if (!data.reply) {
        throw new Error("Empty response from AI backend");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setConnectionOk(true);

      if (data.parsed_options && Array.isArray(data.parsed_options) && data.parsed_options.length > 0) {
        onOptionsGenerated(data.parsed_options);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Chat error:", msg);

      const isModelMissing = msg.includes("404") || msg.includes("Not Found");
      const isOllamaDown = msg.includes("ECONNREFUSED") || msg.includes("unavailable");
      const isEmptyReply = msg.includes("Empty response");

      let helpText = "";
      if (isModelMissing) {
        helpText = `\n\n**Fix:** The AI model \`qwen3.5:0.8b\` is not installed. Run this in your terminal:\n\`\`\`\nollama pull qwen3.5:0.8b\n\`\`\`\nThen restart Ollama and the backend.`;
      } else if (isOllamaDown) {
        helpText = `\n\n**Fix:** Make sure Ollama is running:\n\`\`\`\nunset OLLAMA_MODELS && ollama serve\n\`\`\`\nAnd the backend is running:\n\`\`\`\ncd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000\n\`\`\``;
      } else if (isEmptyReply) {
        helpText = `\n\n**Fix:** The AI model returned an empty response. Try:\n1. Restart Ollama: \`unset OLLAMA_MODELS && ollama serve\`\n2. Test the model: \`ollama run qwen3.5:0.8b "hello"\`\n3. If it fails, re-pull: \`ollama pull qwen3.5:0.8b\``;
      } else {
        helpText = `\n\n**Fix:** Check that both services are running:\n- Ollama: \`ollama serve\`\n- Backend: \`uvicorn main:app --reload --port 8000\``;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Error:** ${msg}${helpText}`,
        },
      ]);
      setConnectionOk(false);
    } finally {
      setIsLoading(false);
    }
  }, [messages, input, isLoading, deviation, soilBearingCapacity, safetyFactor, onOptionsGenerated]);

  return (
    <div className="flex flex-col h-full">
      {/* Connection status */}
      <div className="px-4 py-1.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 text-[10px]">
        {connectionOk === null ? (
          <span className="text-slate-400">Checking backend…</span>
        ) : connectionOk ? (
          <span className="text-green-600 flex items-center gap-1"><Wifi className="w-3 h-3" /> Backend connected</span>
        ) : (
          <span className="text-red-500 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Backend offline</span>
        )}
        <span className="text-slate-300 mx-1">|</span>
        <span className="text-slate-400">Qwen 3.5</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-800 border border-slate-200"
              }`}
            >
              {msg.content.split("```").map((part, j) =>
                j % 2 === 1 ? (
                  <code
                    key={j}
                    className="block bg-slate-800 text-green-300 p-2 rounded text-xs my-1 overflow-x-auto whitespace-pre"
                  >
                    {part}
                  </code>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-purple-600 animate-spin" />
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-purple-700">
              <RefreshCw className="w-4 h-4 inline animate-spin mr-2" />
              Qwen is generating options… (may take 15–30s)
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask AI to design a beam..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 disabled:bg-slate-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
