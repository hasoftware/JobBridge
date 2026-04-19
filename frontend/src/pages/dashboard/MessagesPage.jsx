import { useState, useEffect, useRef } from 'react'

const MOCK_THREADS = [
  { id: 1, name: 'Tech Corp', last: 'Cảm ơn bạn đã ứng tuyển. Bạn có thể gửi CV bản mới?', time: '10:24', unread: 2 },
  { id: 2, name: 'StartupHub', last: 'Mời bạn phỏng vấn vào Thứ 5 tuần sau lúc 14h.', time: '09:15', unread: 0 },
  { id: 3, name: 'Brand VN', last: 'Vị trí đã được đóng, cảm ơn bạn quan tâm.', time: 'Hôm qua', unread: 0 },
]

const MOCK_MESSAGES = {
  1: [
    { id: 1, sender: 'them', text: 'Chào bạn, cảm ơn đã ứng tuyển vị trí Frontend.', time: '09:30' },
    { id: 2, sender: 'them', text: 'Cảm ơn bạn đã ứng tuyển. Bạn có thể gửi CV bản mới?', time: '10:24' },
  ],
}

export default function MessagesPage() {
  const [threads, setThreads] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    setThreads(MOCK_THREADS)
    setActiveId(MOCK_THREADS[0]?.id)
  }, [])

  useEffect(() => {
    if (activeId) {
      setMessages(MOCK_MESSAGES[activeId] || [])
    }
  }, [activeId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setMessages((prev) => [...prev, {
      id: Date.now(),
      sender: 'me',
      text: text.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }])
    setText('')
  }

  const activeThread = threads.find((t) => t.id === activeId)

  return (
    <div className="messages-page">
      <aside className="messages-list">
        <h2>Tin nhắn</h2>
        {threads.map((t) => (
          <div
            key={t.id}
            className={`thread-item ${activeId === t.id ? 'active' : ''}`}
            onClick={() => setActiveId(t.id)}
          >
            <div className="thread-name">{t.name}</div>
            <div className="thread-last">{t.last}</div>
            <div className="thread-meta">
              <span>{t.time}</span>
              {t.unread > 0 && <span className="thread-unread">{t.unread}</span>}
            </div>
          </div>
        ))}
      </aside>

      <main className="messages-thread">
        {activeThread ? (
          <>
            <header className="thread-header">{activeThread.name}</header>
            <div className="thread-messages">
              {messages.map((m) => (
                <div key={m.id} className={`message ${m.sender}`}>
                  <div className="message-text">{m.text}</div>
                  <div className="message-time">{m.time}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={handleSend} className="thread-input">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Gửi</button>
            </form>
          </>
        ) : (
          <div className="thread-empty">Chọn một cuộc trò chuyện</div>
        )}
      </main>
    </div>
  )
}
