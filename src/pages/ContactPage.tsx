import { useState, useRef, useEffect } from "react";
import {
  collection, addDoc, doc, setDoc, updateDoc,
  onSnapshot, orderBy, query, serverTimestamp, increment, getDoc,
} from "firebase/firestore";
import { db, ADMIN_UID } from "../lib/firebase";

type ChatMsg = {
  id: string;
  text: string;
  sender: "user" | "admin";
  time: string;
  createdAt?: any;
};

export default function ContactPage() {
  // ── Contact form ───────────────────────────────────────────────────────
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success">("idle");

  // ── Live chat ──────────────────────────────────────────────────────────
  const [isChatOpen, setIsChatOpen]   = useState(false);
  const [chatInfo, setChatInfo]       = useState({ name: "", email: "", phone: "" });
  const [chatInfoFilled, setChatInfoFilled] = useState(false);
  const [chatInput, setChatInput]     = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatId, setChatId]           = useState<string | null>(null);
  const [isTyping, setIsTyping]       = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // ── Submit contact form to Firestore ────────────────────────────────────
  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading");
    try {
      // Save contact submission
      const docRef = await addDoc(collection(db, "prospectiveContacts"), {
        ...form,
        status: "new",
        createdAt: serverTimestamp(),
        source: "contact_form",
      });

      // Notify admin
      await addDoc(collection(db, "notifications"), {
        recipientId: ADMIN_UID,
        recipientType: "admin",
        type: "new_prospective_contact",
        title: "New Contact Form Submission",
        message: `${form.name} (${form.email}) submitted: "${form.subject}"`,
        contactId: docRef.id,
        userId: "",
        userFullName: form.name,
        amount: 0,
        transactionType: "contact_form",
        status: "unread",
        declineReason: null,
        createdAt: serverTimestamp(),
        readAt: null,
      });

      setFormStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      setFormStatus("idle");
      alert("Failed to send. Please try again.");
    }
  };

  // ── Start live chat — save info + create chat doc ───────────────────────
  const startChat = async () => {
    if (!chatInfo.name.trim() || !chatInfo.email.trim()) return;

    const id = `prospect_${chatInfo.email.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
    setChatId(id);

    // Create the chat document
    await setDoc(doc(db, "prospectiveChats", id), {
      prospectName:  chatInfo.name,
      prospectEmail: chatInfo.email,
      prospectPhone: chatInfo.phone,
      lastMessage:   "",
      lastMessageAt: serverTimestamp(),
      unreadByAdmin: 0,
      isTypingAdmin: false,
      status: "active",
      createdAt: serverTimestamp(),
    });

    // Welcome message from system
    await addDoc(collection(db, "prospectiveChats", id, "messages"), {
      text: `Hi ${chatInfo.name}! 👋 Welcome to Nexus Bank. How can we help you today?`,
      sender: "admin",
      createdAt: serverTimestamp(),
    });

    // Notify admin
    await addDoc(collection(db, "notifications"), {
      recipientId: ADMIN_UID,
      recipientType: "admin",
      type: "new_prospective_chat",
      title: "New Prospective User Chat",
      message: `${chatInfo.name} (${chatInfo.email}) started a live chat`,
      chatId: id,
      userId: "",
      userFullName: chatInfo.name,
      amount: 0,
      transactionType: "live_chat",
      status: "unread",
      declineReason: null,
      createdAt: serverTimestamp(),
      readAt: null,
    });

    setChatInfoFilled(true);
  };

  // ── Listen to chat messages in real time ────────────────────────────────
  useEffect(() => {
    if (!chatId) return;

    const q = query(collection(db, "prospectiveChats", chatId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const msgs: ChatMsg[] = snap.docs.map((d) => {
        const data = d.data();
        const ts   = data.createdAt?.toDate();
        return {
          id:   d.id,
          text: data.text,
          sender: data.sender,
          time: ts ? ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "...",
        };
      });
      setChatMessages(msgs);
    });

    // Listen for admin typing indicator
    const chatDocUnsub = onSnapshot(doc(db, "prospectiveChats", chatId), (snap) => {
      if (snap.exists()) setIsTyping(snap.data().isTypingAdmin === true);
    });

    return () => { unsub(); chatDocUnsub(); };
  }, [chatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // ── Send a chat message ─────────────────────────────────────────────────
  const sendMsg = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !chatId) return;
    const text = chatInput.trim();
    setChatInput("");

    await addDoc(collection(db, "prospectiveChats", chatId, "messages"), {
      text,
      sender: "user",
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "prospectiveChats", chatId), {
      lastMessage:   text,
      lastMessageAt: serverTimestamp(),
      unreadByAdmin: increment(1),
    });
  };

  return (
    <>
      {/* Page Banner */}
      <div className="page-banner">
        <div className="container">
          <div className="page-banner-inner">
            <div className="breadcrumb"><a href="/">Home</a><span>›</span><span>Contact</span></div>
            <h1>Get in Touch</h1>
            <p>Our team is here to help — 24 hours a day, 7 days a week.</p>
          </div>
        </div>
      </div>

      <section className="section-pad">
        <div className="container">
          <div className="contact-grid">

            {/* ── Left: Contact Info + Live Chat ── */}
            <div className="contact-info">
              <div className="section-label">Contact Information</div>
              <h2 style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 28, lineHeight: 1.2 }}>
                We're always here when you need us
              </h2>

              {[
                { icon: "📍", title: "Head Office",  val: "214 North Tryon Street\nCharlotte, NC 28202" },
                { icon: "📞", title: "Phone",        val: "1-800-555-1234\nMon–Fri, 8am–8pm EST" },
                { icon: "✉️", title: "Email",        val: "support@nexusbank.com\nResponse within 24 hours" },
              ].map((c) => (
                <div className="contact-item" key={c.title}>
                  <div className="contact-icon">{c.icon}</div>
                  <div>
                    <div className="contact-item-title">{c.title}</div>
                    {c.val.split("\n").map((line, i) => (
                      <div key={i} className="contact-item-val"
                        style={{ fontSize: i === 0 ? 15 : 13, color: i === 0 ? "#fff" : "rgba(255,255,255,0.5)" }}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="contact-item" style={{ marginTop: 12 }}>
                <button
                  onClick={() => setIsChatOpen(true)}
                  style={{
                    width: "100%", padding: "14px 24px", borderRadius: "12px",
                    background: "linear-gradient(135deg, var(--teal), var(--blue))",
                    color: "#fff", border: "none", fontWeight: 700, fontSize: "15px",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = "none"; }}
                >
                  💬 Start Live Chat
                </button>
              </div>
            </div>

            {/* ── Right: Contact Form ── */}
            <div className="contact-form-wrap">
              <h3 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
                Send Us a Message
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-body)", marginBottom: 24 }}>
                We'll get back to you within one business day.
              </p>

              {formStatus === "success" ? (
                <div style={{
                  padding: "32px 24px", borderRadius: "16px", textAlign: "center",
                  background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                  border: "1px solid #86efac",
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h4 style={{ fontSize: 20, fontWeight: 700, color: "#15803d", marginBottom: 8 }}>Message Sent!</h4>
                  <p style={{ color: "#166534", fontSize: 14, marginBottom: 20 }}>
                    Thank you for reaching out. A member of our team will get back to you within one business day.
                  </p>
                  <button onClick={() => setFormStatus("idle")}
                    style={{ padding: "10px 24px", borderRadius: "8px", background: "#16a34a", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => void submitForm(e)}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input className="form-control" placeholder="John Doe" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input className="form-control" type="email" placeholder="john@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone (optional)</label>
                      <input className="form-control" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject *</label>
                      <select className="form-control form-select" value={form.subject} onChange={(e) => set("subject", e.target.value)} required>
                        <option value="">Select subject...</option>
                        {["Account Opening","Login Issue","Transaction Query","Loan Application","Mortgage Enquiry","Card Services","Technical Support","Complaint","Other"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea className="form-control" rows={5} placeholder="Tell us how we can help you..." value={form.message} onChange={(e) => set("message", e.target.value)} required style={{ resize: "vertical" }} />
                  </div>
                  <button className="btn btn-primary w-full" type="submit" style={{ justifyContent: "center" }} disabled={formStatus === "loading"}>
                    {formStatus === "loading" ? <><span className="spinner" /> Sending...</> : "Send Message →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Chat Modal ── */}
      {isChatOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px",
        }} onClick={() => setIsChatOpen(false)}>
          <div style={{
            width: "100%", maxWidth: chatInfoFilled ? "860px" : "520px",
            height: chatInfoFilled ? "620px" : "auto",
            background: "#fff", borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            display: "flex", flexDirection: "column", overflow: "hidden",
            transition: "max-width 0.3s ease",
          }} onClick={(e) => e.stopPropagation()}>

            {/* Chat Header */}
            <div style={{
              background: "linear-gradient(135deg, var(--teal), var(--blue))",
              padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px",
              flexShrink: 0,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Nexus Bank Support</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ecc71", display: "inline-block" }} />
                  {isTyping ? "Typing..." : "We reply immediately"}
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} style={{
                width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)",
                border: "none", color: "#fff", fontSize: 20, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>

            {/* Body */}
            {!chatInfoFilled ? (
              /* ── Info collection panel ── */
              <div style={{ padding: "28px 32px", flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dark)", marginBottom: 8 }}>
                  Before we start…
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-body)", marginBottom: 24 }}>
                  Please share a little about yourself so we can assist you better.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", display: "block", marginBottom: 6 }}>Full Name *</label>
                    <input className="form-control" placeholder="John Doe" value={chatInfo.name}
                      onChange={(e) => setChatInfo((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", display: "block", marginBottom: 6 }}>Email Address *</label>
                    <input className="form-control" type="email" placeholder="john@example.com" value={chatInfo.email}
                      onChange={(e) => setChatInfo((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", display: "block", marginBottom: 6 }}>Phone (optional)</label>
                    <input className="form-control" type="tel" placeholder="+1 (555) 000-0000" value={chatInfo.phone}
                      onChange={(e) => setChatInfo((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <button onClick={() => void startChat()}
                    disabled={!chatInfo.name.trim() || !chatInfo.email.trim()}
                    style={{
                      padding: "14px", borderRadius: "12px",
                      background: chatInfo.name.trim() && chatInfo.email.trim()
                        ? "linear-gradient(135deg, var(--teal), var(--blue))"
                        : "#e5e7eb",
                      color: chatInfo.name.trim() && chatInfo.email.trim() ? "#fff" : "#9ca3af",
                      border: "none", fontWeight: 700, fontSize: 15, cursor: chatInfo.name.trim() && chatInfo.email.trim() ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                    }}>
                    Start Chatting 💬
                  </button>
                </div>
              </div>
            ) : (
              /* ── Chat interface (two-column) ── */
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Left: user info panel */}
                <div style={{
                  width: 220, flexShrink: 0,
                  background: "#f8fafc", borderRight: "1px solid #e5e7eb",
                  padding: "20px 16px",
                }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--teal), var(--blue))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 24, color: "#fff", fontWeight: 700, marginBottom: 12,
                    }}>
                      {chatInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>{chatInfo.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{chatInfo.email}</div>
                    {chatInfo.phone && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{chatInfo.phone}</div>}
                  </div>
                  <div style={{
                    padding: "10px 12px", borderRadius: 10,
                    background: "rgba(0,196,180,0.08)", border: "1px solid rgba(0,196,180,0.2)",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ecc71", display: "inline-block" }} />
                      <span style={{ fontSize: 13, color: "var(--text-dark)", fontWeight: 600 }}>Connected</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    💡 Our team will respond shortly. Average response time: &lt;2 min.
                  </div>
                </div>

                {/* Right: messages */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  {/* Messages area */}
                  <div style={{
                    flex: 1, padding: "16px", overflowY: "auto",
                    background: "#f8f9fa", display: "flex", flexDirection: "column", gap: "12px",
                  }}>
                    {chatMessages.map((m) => (
                      <div key={m.id} style={{ display: "flex", justifyContent: m.sender === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: "75%", padding: "12px 16px",
                          borderRadius: m.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: m.sender === "user"
                            ? "linear-gradient(135deg, var(--teal), var(--blue))"
                            : "#fff",
                          color: m.sender === "user" ? "#fff" : "var(--text-dark)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}>
                          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.text}</div>
                          <div style={{ fontSize: 11, marginTop: 6, textAlign: "right", opacity: 0.7 }}>{m.time}</div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div style={{ display: "flex", justifyContent: "flex-start" }}>
                        <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", gap: 4 }}>
                          {[0,1,2].map((i) => (
                            <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8", display: "inline-block", animation: "bounce 1.4s infinite", animationDelay: `${i * 0.2}s` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div style={{ padding: "12px 16px", background: "#fff", borderTop: "1px solid #eaeaea" }}>
                    <form onSubmit={(e) => void sendMsg(e)} style={{ display: "flex", gap: 10 }}>
                      <input type="text" placeholder="Type your message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                        style={{ flex: 1, padding: "12px 16px", borderRadius: 24, border: "1px solid #eaeaea", fontSize: 14, outline: "none" }} />
                      <button type="submit" disabled={!chatInput.trim()}
                        style={{
                          width: 48, height: 48, borderRadius: "50%",
                          background: chatInput.trim() ? "linear-gradient(135deg, var(--teal), var(--blue))" : "#e5e7eb",
                          border: "none", color: chatInput.trim() ? "#fff" : "#9ca3af",
                          fontSize: 20, cursor: chatInput.trim() ? "pointer" : "not-allowed",
                        }}>➤</button>
                    </form>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>Powered by Nexus Bank</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
