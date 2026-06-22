import { useState, useRef, useEffect } from "react";
import {
  collection, addDoc, doc, setDoc, updateDoc,
  onSnapshot, orderBy, query, serverTimestamp, increment, getDoc,
} from "firebase/firestore";
import { db, ADMIN_UID } from "../lib/firebase";

type ChatMsg = { id: string; text: string; sender: "user" | "admin"; time: string; createdAt?: any; };

export default function ContactPage() {
  // ── Contact form ───────────────────────────────────────────────────────
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success">("idle");
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // ── Live chat ──────────────────────────────────────────────────────────
  const [chatInfo, setChatInfo]         = useState({ name: "", email: "", phone: "" });
  const [chatInfoFilled, setChatInfoFilled] = useState(false);
  const [chatInput, setChatInput]       = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatId, setChatId]             = useState<string | null>(null);
  const [isTyping, setIsTyping]         = useState(false);
  const [chatTab, setChatTab]           = useState<"info" | "chat">("info");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Submit contact form ────────────────────────────────────────────────
  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading");
    try {
      const docRef = await addDoc(collection(db, "prospectiveContacts"), {
        ...form, status: "new", createdAt: serverTimestamp(), source: "contact_form",
      });
      await addDoc(collection(db, "notifications"), {
        recipientId: ADMIN_UID, recipientType: "admin", type: "new_prospective_contact",
        title: "New Contact Form Submission",
        message: `${form.name} (${form.email}) submitted: "${form.subject}"`,
        contactId: docRef.id, userId: "", userFullName: form.name,
        amount: 0, transactionType: "contact_form",
        status: "unread", declineReason: null, createdAt: serverTimestamp(), readAt: null,
      });
      setFormStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch { setFormStatus("idle"); alert("Failed to send. Please try again."); }
  };

  // ── Start live chat ────────────────────────────────────────────────────
  const startChat = async () => {
    if (!chatInfo.name.trim() || !chatInfo.email.trim()) return;
    const id = `prospect_${chatInfo.email.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
    setChatId(id);
    await setDoc(doc(db, "prospectiveChats", id), {
      prospectName: chatInfo.name, prospectEmail: chatInfo.email, prospectPhone: chatInfo.phone,
      lastMessage: "", lastMessageAt: serverTimestamp(),
      unreadByAdmin: 0, isTypingAdmin: false, status: "active", createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "prospectiveChats", id, "messages"), {
      text: `Hi ${chatInfo.name}! 👋 Welcome to Nexus Bank. How can we help you today?`,
      sender: "admin", createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "notifications"), {
      recipientId: ADMIN_UID, recipientType: "admin", type: "new_prospective_chat",
      title: "New Prospective User Chat",
      message: `${chatInfo.name} (${chatInfo.email}) started a live chat`,
      chatId: id, userId: "", userFullName: chatInfo.name,
      amount: 0, transactionType: "live_chat",
      status: "unread", declineReason: null, createdAt: serverTimestamp(), readAt: null,
    });
    setChatInfoFilled(true);
    setChatTab("chat");
  };

  // ── Listen to messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, "prospectiveChats", chatId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setChatMessages(snap.docs.map((d) => {
        const ts = d.data().createdAt?.toDate();
        return { id: d.id, text: d.data().text, sender: d.data().sender,
          time: ts ? ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "..." };
      }));
    });
    const chatDocUnsub = onSnapshot(doc(db, "prospectiveChats", chatId), (snap) => {
      if (snap.exists()) setIsTyping(snap.data().isTypingAdmin === true);
    });
    return () => { unsub(); chatDocUnsub(); };
  }, [chatId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, isTyping]);

  const sendMsg = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !chatId) return;
    const text = chatInput.trim();
    setChatInput("");
    await addDoc(collection(db, "prospectiveChats", chatId, "messages"), {
      text, sender: "user", createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "prospectiveChats", chatId), {
      lastMessage: text, lastMessageAt: serverTimestamp(), unreadByAdmin: increment(1),
    });
  };

  return (
    <>
      {/* ── Page Banner ── */}
      <div className="page-banner">
        <div className="container">
          <div className="page-banner-inner">
            <div className="breadcrumb"><a href="/">Home</a><span>›</span><span>Contact</span></div>
            <h1>Get in Touch</h1>
            <p>Our team is here to help — 24 hours a day, 7 days a week.</p>
          </div>
        </div>
      </div>

      {/* ── Contact Info Cards (top strip) ── */}
      <section style={{ background: "var(--primary)", padding: "48px 0 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 48 }}>
            {[
              { icon: "📍", title: "Head Office", lines: ["214 North Tryon Street", "Charlotte, NC 28202"] },
              { icon: "📞", title: "Phone",       lines: ["1-800-555-1234", "Mon–Fri, 8am–8pm EST"] },
              { icon: "✉️", title: "Email",       lines: ["support@nexusbank.com", "Response within 24 hours"] },
              { icon: "🕒", title: "Hours",       lines: ["24/7 Online Banking", "Mon–Fri 8am–8pm (Branches)"] },
            ].map((c) => (
              <div key={c.title} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16, padding: "24px 20px", display: "flex", gap: 16, alignItems: "flex-start",
                transition: "background 0.2s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--teal-light)", marginBottom: 6 }}>{c.title}</div>
                  {c.lines.map((l, i) => (
                    <div key={i} style={{ fontSize: i === 0 ? 14 : 12, color: i === 0 ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: i === 0 ? 600 : 400, lineHeight: 1.5 }}>{l}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content: Form + Live Chat ── */}
      <section style={{ background: "var(--bg-light)", padding: "64px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

            {/* ── LEFT: Contact Form ── */}
            <div style={{
              background: "#fff", borderRadius: 20, padding: "40px 36px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid var(--border)",
            }}>
              <div style={{ marginBottom: 28 }}>
                <div className="section-label">Send a Message</div>
                <h2 style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, color: "var(--text-dark)", marginBottom: 8 }}>
                  We'll get back to you within 24 hours
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-body)", margin: 0 }}>
                  Fill in the form below and one of our specialists will reach out to you promptly.
                </p>
              </div>

              {formStatus === "success" ? (
                <div style={{ padding: "40px 24px", textAlign: "center", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderRadius: 16, border: "1px solid #86efac" }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
                  <h3 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, color: "#15803d", marginBottom: 8 }}>Message Sent!</h3>
                  <p style={{ color: "#166534", fontSize: 14, marginBottom: 20 }}>
                    Thank you for reaching out. A member of our team will reply within one business day.
                  </p>
                  <button onClick={() => setFormStatus("idle")}
                    style={{ padding: "11px 28px", borderRadius: 100, background: "#16a34a", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
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
                        {["Account Opening","Login Issue","Transaction Query","Loan Application","Mortgage Enquiry","Card Services","Technical Support","Complaint","Other"].map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea className="form-control" rows={5} placeholder="Tell us how we can help you..." value={form.message} onChange={(e) => set("message", e.target.value)} required style={{ resize: "vertical" }} />
                  </div>
                  <button className="btn btn-primary w-full" type="submit" style={{ justifyContent: "center" }} disabled={formStatus === "loading"}>
                    {formStatus === "loading" ? "Sending..." : "Send Message →"}
                  </button>
                </form>
              )}
            </div>

            {/* ── RIGHT: Live Chat ── */}
            <div style={{
              background: "#fff", borderRadius: 20, overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid var(--border)",
              display: "flex", flexDirection: "column",
            }}>
              {/* Chat header */}
              <div style={{
                background: "linear-gradient(135deg, var(--teal), var(--blue))",
                padding: "20px 24px", display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>💬</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Live Chat Support</div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ecc71", display: "inline-block" }} />
                    {isTyping ? "Agent is typing..." : "We reply immediately"}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: 100 }}>
                  Avg. &lt;2 min
                </div>
              </div>

              {/* Tabs (only shown once info filled) */}
              {chatInfoFilled && (
                <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
                  {(["info", "chat"] as const).map((t) => (
                    <button key={t} onClick={() => setChatTab(t)}
                      style={{
                        flex: 1, padding: "12px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        background: chatTab === t ? "#f0f9ff" : "#fff",
                        color: chatTab === t ? "var(--teal)" : "var(--text-muted)",
                        borderBottom: chatTab === t ? "2px solid var(--teal)" : "2px solid transparent",
                        border: "none", borderTop: "none", borderLeft: "none", borderRight: "none",
                        transition: "all 0.2s", textTransform: "capitalize",
                      }}>
                      {t === "info" ? "👤 My Info" : "💬 Chat"}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Info panel */}
                {(!chatInfoFilled || chatTab === "info") && (
                  <div style={{ padding: "28px 28px", flex: 1, overflowY: "auto" }}>
                    {chatInfoFilled ? (
                      // Show filled info summary
                      <div>
                        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
                          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, var(--teal), var(--blue))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 700 }}>
                            {chatInfo.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-dark)" }}>{chatInfo.name}</div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{chatInfo.email}</div>
                            {chatInfo.phone && <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{chatInfo.phone}</div>}
                          </div>
                        </div>
                        <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(8,145,178,0.06)", border: "1px solid rgba(8,145,178,0.15)", marginBottom: 16 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--teal)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Status</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ecc71", display: "inline-block" }} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>Connected</span>
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                          💡 Our support team will respond shortly. Average response time: &lt;2 min.
                        </p>
                        <button onClick={() => setChatTab("chat")}
                          className="btn btn-teal w-full" style={{ marginTop: 20, justifyContent: "center" }}>
                          Go to Chat →
                        </button>
                      </div>
                    ) : (
                      // Show info collection form
                      <div>
                        <h3 style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>
                          Before we start
                        </h3>
                        <p style={{ fontSize: 13, color: "var(--text-body)", marginBottom: 24 }}>
                          Share a few details so we can assist you better.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <div>
                            <label className="form-label">Full Name *</label>
                            <input className="form-control" placeholder="John Doe" value={chatInfo.name} onChange={(e) => setChatInfo((p) => ({ ...p, name: e.target.value }))} />
                          </div>
                          <div>
                            <label className="form-label">Email Address *</label>
                            <input className="form-control" type="email" placeholder="john@example.com" value={chatInfo.email} onChange={(e) => setChatInfo((p) => ({ ...p, email: e.target.value }))} />
                          </div>
                          <div>
                            <label className="form-label">Phone (optional)</label>
                            <input className="form-control" type="tel" placeholder="+1 (555) 000-0000" value={chatInfo.phone} onChange={(e) => setChatInfo((p) => ({ ...p, phone: e.target.value }))} />
                          </div>
                          <button onClick={() => void startChat()} disabled={!chatInfo.name.trim() || !chatInfo.email.trim()}
                            className="btn btn-teal w-full" style={{ justifyContent: "center", opacity: chatInfo.name.trim() && chatInfo.email.trim() ? 1 : 0.4, cursor: chatInfo.name.trim() && chatInfo.email.trim() ? "pointer" : "not-allowed" }}>
                            Start Live Chat 💬
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Chat messages panel */}
                {chatInfoFilled && chatTab === "chat" && (
                  <>
                    <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 12, minHeight: 300 }}>
                      {chatMessages.map((m) => (
                        <div key={m.id} style={{ display: "flex", justifyContent: m.sender === "user" ? "flex-end" : "flex-start" }}>
                          <div style={{
                            maxWidth: "78%", padding: "12px 16px",
                            borderRadius: m.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            background: m.sender === "user" ? "linear-gradient(135deg, var(--teal), var(--blue))" : "#fff",
                            color: m.sender === "user" ? "#fff" : "var(--text-dark)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          }}>
                            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.text}</div>
                            <div style={{ fontSize: 10, marginTop: 4, textAlign: "right", opacity: 0.6 }}>{m.time}</div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div style={{ display: "flex", justifyContent: "flex-start" }}>
                          <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", gap: 4 }}>
                            {[0,1,2].map((i) => (
                              <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--teal)", display: "inline-block", animation: "bounce 1.4s infinite", animationDelay: `${i * 0.2}s` }} />
                            ))}
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={(e) => void sendMsg(e)} style={{ display: "flex", gap: 10, padding: "14px 20px", borderTop: "1px solid var(--border)", background: "#fff" }}>
                      <input type="text" placeholder="Type your message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                        style={{ flex: 1, padding: "12px 16px", borderRadius: 100, border: "1.5px solid var(--border)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--teal)")}
                        onBlur={(e)  => (e.target.style.borderColor = "var(--border)")} />
                      <button type="submit" disabled={!chatInput.trim()}
                        style={{ width: 46, height: 46, borderRadius: "50%", background: chatInput.trim() ? "linear-gradient(135deg, var(--teal), var(--blue))" : "var(--bg-light)", border: "none", color: chatInput.trim() ? "#fff" : "var(--text-muted)", fontSize: 20, cursor: chatInput.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        ➤
                      </button>
                    </form>
                    <div style={{ padding: "8px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", background: "#fff" }}>
                      Powered by Nexus Bank
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Map / Extra CTA ── */}
      <section style={{ background: "var(--primary)", padding: "56px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="section-label">Nationwide Network</div>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
              Find a Branch Near You
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
              With branches across the United States and a world-class digital platform, Nexus Bank is always within reach.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {[
              { city: "Charlotte, NC", addr: "214 North Tryon Street", flag: "🏛️" },
              { city: "New York, NY",  addr: "1 World Trade Center",   flag: "🗽" },
              { city: "Los Angeles, CA", addr: "350 S Grand Avenue",   flag: "🌴" },
              { city: "Chicago, IL",  addr: "233 S Wacker Drive",      flag: "🌆" },
            ].map((b) => (
              <div key={b.city} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16, padding: "20px 24px", display: "flex", gap: 14, alignItems: "center", minWidth: 220,
                transition: "background 0.2s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                <div style={{ fontSize: 28 }}>{b.flag}</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{b.city}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>{b.addr}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @media (max-width: 860px) {
          .contact-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
