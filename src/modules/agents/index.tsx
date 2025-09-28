import React, { useState, useRef, useEffect } from "react"

interface Message {
  role: "user" | "agent";
  content: string;
}

const LOCAL_STORAGE_KEY = "agentChatMessages"

export default function AgentChat() {
  // 初始化时尝试从 localStorage 读取
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
    return [
      {
        role: "agent",
        content:
          "我是精通正则表达式的智能助手，请描述您的需求，我可以帮您生成正则表达式？"
      }
    ]
  })

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 持久化消息到 localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    const agentMessage: Message = { role: "agent", content: "" }
    setMessages((prev) => [...prev, agentMessage])

    try {
      const response = await fetch(
        "http://172.21.3.56:5000/tools/regex_generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: input, stream: true })
        }
      )

      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")

      let done = false
      let content = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          content += decoder.decode(value, { stream: true })
          setMessages((prev) =>
            prev.map((msg, idx) =>
              idx === prev.length - 1 && msg.role === "agent"
                ? { ...msg, content }
                : msg
            )
          )
        }
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 && msg.role === "agent"
            ? { ...msg, content: "[ERROR]: 正则生成失败" }
            : msg
        )
      )
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border rounded-lg shadow-lg bg-white"
         style={{ height: "800px" }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-2xl max-w-xs text-sm ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t flex items-center space-x-2">
        <textarea
          className="flex-1 border border-gray-300 rounded-md px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="输入你的问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition"
        >
          发送
        </button>
      </div>
    </div>
  )
}
