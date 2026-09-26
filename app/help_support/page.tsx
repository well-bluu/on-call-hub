"use client";

import bannerImage from "./temp/help-support-banner.png";
import { useState } from "react";
import {
  Calendar,
  XCircle,
  User,
  ChevronDown,
  FileText,
  ShieldCheck,
  BookOpen,
  Send,
} from "lucide-react";

const FAQS = [
  {
    icon: Calendar,
    iconBg: "bg-blue-100 text-blue-600",
    question: "How do I set my availability status?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua..",
  },
  {
    icon: XCircle,
    iconBg: "bg-red-100 text-red-500",
    question: "What happens if I decline a shift?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.",
  },
  {
    icon: User,
    iconBg: "bg-orange-100 text-orange-500",
    question: "How can I contact the manager?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.",
  },
];

const RESOURCES = [
  { icon: FileText, label: "Worker Manual", type: "PDF" },
  { icon: ShieldCheck, label: "Shift Policies", type: "PDF" },
  { icon: BookOpen, label: "Guide Logs", type: "PDF" },
];

export default function HelpSupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up to your ticket-submission endpoint
    console.log({ subject, message });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero banner */}
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 bg-cover bg-center p-8"
        style={{ backgroundImage: `url(${bannerImage.src})` }}
      >
        <div className="max-w-lg">
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))]">
            HELP &amp; SUPPORT
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--dark-blue))]">
            Get assistance, report issues, and find answers to common
            questions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-bold tracking-wide text-[hsl(var(--dark-blue))] mb-3">
              FREQUENTLY ASKED QUESTIONS (FAQs)
            </h2>

            <div className="flex flex-col gap-3">
              {FAQS.map((faq, i) => {
                const Icon = faq.icon;
                const isOpen = openIndex === i;
                return (
                  <div
                    key={faq.question}
                    className="rounded-xl border border-border bg-white overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${faq.iconBg}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-sm text-[hsl(var(--dark-blue))]">
                          {faq.question.toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pl-16 text-sm text-neutral-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="font-bold text-[hsl(var(--dark-blue))] mb-4">
              Contact the Owner
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Subject:"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <textarea
                placeholder="Message:"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                Submit Ticket
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-sm font-bold tracking-wide text-[hsl(var(--dark-blue))] mb-4">
              DOCUMENTATION RESOURCES
            </h3>
            <div className="flex flex-col gap-3">
              {RESOURCES.map((res) => {
                const Icon = res.icon;
                return (
                  <div
                    key={res.label}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[hsl(var(--dark-blue))] leading-tight">
                        {res.label.toUpperCase()}
                        <br />({res.type})
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-[10px] font-medium rounded-full border border-blue-200 text-blue-600 px-2 py-0.5 hover:bg-blue-50"
                    >
                      Download
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 p-5">
            <h3 className="text-sm font-bold tracking-wide text-[hsl(var(--dark-blue))] mb-3">
              PLATFORM VERSION
            </h3>
            <p className="text-xs text-neutral-600">
              Version:{" "}
              <span className="font-semibold text-blue-700">X.Y.Z</span>
            </p>
            <p className="text-xs text-neutral-600 mb-4">
              Last Updated:{" "}
              <span className="font-semibold text-blue-700">[Date]</span>
            </p>

            <h3 className="text-sm font-bold tracking-wide text-[hsl(var(--dark-blue))] mb-1">
              Developer Team
            </h3>
            <p className="text-xs text-neutral-600">
              Developed By:{" "}
              <span className="font-semibold text-blue-700">Fantastic 5</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}