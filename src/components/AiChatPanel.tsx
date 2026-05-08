"use client";

import { useState, useRef, useEffect } from "react";
import { Cpu, Send, Bot, User, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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
  onOptionsGenerated: (options: GenerativeOption[]) => void;
  onIterationComplete: (explanation: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function AiChatPanel({
  deviation,
  soilBearingCapacity,
  safetyFactor,
  onOptionsGenerated,
  onIterationComplete,
}: AiChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I'm your AI structural design assistant powered by Qwen 3.5. I can help generate and refine beam designs. Try asking me to 'generate 3 beam options' or 'optimize the current design for lower carbon'.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
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
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

      if (data.parsed_options && Array.isArray(data.parsed_options)) {
        onOptionsGenerated(data.parsed_options);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Could not reach the AI backend. Make sure Ollama is running (`ollama serve`) and the Python backend is started.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const runIteration = async (feedback: string) => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/iterative-design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            deviation_mm: deviation,
            soil_bearing_capacity: soilBearingCapacity,
            safety_factor: safetyFactor,
          },
          previous_options: [],
          feedback,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `**Iteration ${data.iteration}** — ${data.explanation}`,
        },
      ]);

      if (data.options && Array.isArray(data.options)) {
        onOptionsGenerated(data.options);
        onIterationComplete(data.explanation);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Iteration failed. Check backend connection." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-800 border border-slate-200"
              }`}
            >
              {msg.content.split("```").map((part, j) =>
                j % 2 === 1 ? (
                  <code key={j} className="block bg-slate-800 text-green-300 p-2 rounded text-xs my-1 overflow-x-auto whitespace-pre">
                    {part}
                  </code>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            )}
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-purple-600 animate-pulse" />
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500">
              <RefreshCw className="w-4 h-4 inline animate-spin mr-2" />
              Qwen 3.5 is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask AI to design or optimize a beam..."
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
