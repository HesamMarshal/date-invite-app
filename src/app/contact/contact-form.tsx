"use client";

import { useState } from "react";

const ERROR_FA: Record<string, string> = {
  name_required: "اسمت رو بنویس",
  contact_required: "ایمیل یا آیدی تلگرام لازم است",
  message_required: "پیام حداقل ۱۰ حرف باشه",
  rate_limited: "زیاد پیام فرستادی — کمی بعد دوباره امتحان کن",
  invalid_json: "درخواست نامعتبره",
  server_error: "ذخیره نشد. دوباره امتحان کن",
};

export default function ContactForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          message: message.trim(),
          website: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) {
        setError(ERROR_FA[data.error] || data.error || "خطایی رخ داد");
        return;
      }
      setDone(true);
      setName("");
      setContact("");
      setMessage("");
    } catch {
      setLoading(false);
      setError("ارتباط با سرور برقرار نشد");
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-pink-100 bg-pink-50 p-6 text-center space-y-3">
        <p className="text-2xl" aria-hidden>
          ✓
        </p>
        <p className="font-bold text-pink-800">پیامت ثبت شد</p>
        <p className="text-sm text-pink-700/80">
          ممنون — در اولین فرصت جواب می‌دیم.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="text-sm font-bold text-pink-600 hover:underline"
        >
          پیام دیگه بفرست
        </button>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 outline-none focus:border-pink-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">نام</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          autoComplete="name"
          className={field}
          placeholder="اسمت"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">ایمیل یا تلگرام</label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={200}
          required
          autoComplete="email"
          className={field}
          placeholder="you@email.com یا @username"
          dir="ltr"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">پیام</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          required
          rows={5}
          className={`${field} resize-y min-h-[120px]`}
          placeholder="چی می‌خوای بگی؟"
        />
      </div>
      {/* Honeypot — hidden from users */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden
      />
      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !name.trim() || !contact.trim() || message.trim().length < 10}
        className="w-full rounded-full bg-pink-500 px-6 py-3 font-bold text-white transition hover:bg-pink-600 disabled:opacity-40"
      >
        {loading ? "..." : "ارسال پیام"}
      </button>
    </form>
  );
}
