"use client";

import bannerImage from "@/components/assets/images/help-support-banner.png";
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

// FAQS Layout
const FAQS = [
  {
    icon: Calendar,
    iconBg: "bg-[#E6EFFD] text-[#0050D3]",
    shadow: "#E6EFFD",
    question: "How do I accept a shift offer?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.", // Must change later
  },
  {
    icon: XCircle,
    iconBg: "bg-[#FBDEDE] text-[#FF0000]",
    shadow: "#FBDEDE", // Remove if same color
    question: "What happens if I decline a shift?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.", // Must change later
  },
  {
    icon: User,
    iconBg: "bg-[#FEF3E6] text-[#FD950F]", // text = icon
    shadow: "#FEF3E6",
    question: "How can I contact the manager?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.", // Must change later
  },
];

const RESOURCES = [
  { icon: FileText, label: "Worker Manual", type: "PDF" }, // icon: FileText - Add Changes
  { icon: ShieldCheck, label: "Shift Policies", type: "PDF" }, // icon: ShieldCheck - Add Changes
  { icon: BookOpen, label: "Guide Logs", type: "PDF" }, // icon: BookOpen - Add Changes
];

// Breakpoint notes: the sidebar takes ~320px on desktop, so the page content
// is much narrower than the viewport. That's why the two-column layout starts
// at `xl` rather than `lg`.

export default function HelpSupportClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wire up the ticket-submission endpoint later
    console.log({ subject, message });
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
      {/* Left Side */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-6 xl:col-span-2">
        {/* Hero banner */}
        <div
          className="relative overflow-hidden rounded-2xl border-[1px] border-[#D9D9D9] from-blue-50 to-blue-100 bg-cover bg-[position:40%_center] p-5 sm:p-8"
          style={{ backgroundImage: `url(${bannerImage.src})` }}
        >
          <div className="max-w-lg">
            <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))] sm:text-3xl">
              HELP &amp; SUPPORT
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--dark-blue))]">
              Get assistance, report issues, and find answers{" "}
              <br className="hidden sm:block" /> to common questions.
            </p>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div>
            <h2 className="mb-4 text-base font-bold tracking-wide text-[hsl(var(--dark-blue))] sm:text-[18px]">
              FREQUENTLY ASKED QUESTIONS (FAQs)
            </h2>

            <div className="flex flex-col gap-4 sm:gap-6">
              {FAQS.map((faq, i) => {
                const Icon = faq.icon;
                const isOpen = openIndex === i;
                return (
                  <div
                    key={faq.question}
                    className={`rounded-xl border border-border bg-white overflow-hidden transition-shadow ${
                      isOpen
                        ? "shadow-[0_4px_12px_var(--faq-shadow)]" // "shadow-[0_4px_12px_#E6EFFD]" - if all same color
                        : "hover:shadow-[0_2px_6px_var(--faq-shadow)]" // "hover:shadow-[0_2px_6px_#E6EFFD]" - if all same color
                    }`}
                    style={
                      { "--faq-shadow": faq.shadow } as React.CSSProperties
                    } // remove if same all are same color
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)} // Open/close toggle for your FAQ accordion
                      className="flex w-full items-center justify-between gap-3 p-3 text-left sm:p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${faq.iconBg}`}
                        >
                          <Icon className="h-7 w-7" />
                        </span>
                        <span className="min-w-0 text-xs font-semibold text-[hsl(var(--dark-blue))] sm:text-sm">
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
                      <div className="px-4 pb-4 text-left text-sm leading-6 text-neutral-600 sm:pb-5 sm:pl-8 sm:pr-9 sm:text-justify">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-xl border border-border p-4 sm:p-6">
            {" "}
            {/* border-[1.4px] border-[#D9D9D9] */}
            <h2 className="mb-4 text-base font-bold text-[hsl(var(--dark-blue))] sm:text-[18px]">
              CONTACT THE OWNER
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Subject:"
                value={subject} // Input inside the box
                onChange={(e) => setSubject(e.target.value)} // Saves the user's input
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#003FA7]/60 sm:text-sm" // text-base on mobile stops iOS from zooming on focus
              />
              <textarea
                placeholder="Message:"
                value={message} // Input inside the box
                onChange={(e) => setMessage(e.target.value)} // Saves the user's input
                rows={5}
                className="w-full resize-none rounded-lg border border-border bg-white px-4 py-3 text-base placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#003FA7]/60 sm:text-sm"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0050D3]"
              >
                <Send className="h-4 w-4" />
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* CLOSE LEFT SIDE */}

      {/* RIGHT SIDE: side by side on tablets, stacked column on xl */}
      <div className="grid min-w-0 grid-cols-1 content-start gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-1">
        {/* DOCUMENTATION RESOURCES */}
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <h3 className="mb-4 text-center text-[14px] font-bold tracking-wide text-[hsl(var(--dark-blue))]">
            DOCUMENTATION RESOURCES
          </h3>
          <div className="flex flex-col gap-3 sm:gap-4">
            {/*icon assigned to that resource*/}
            {RESOURCES.map((res) => {
              const Icon = res.icon;
              return (
                <div
                  key={res.label}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E6EFFD] p-1 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </span>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold leading-tight text-[hsl(var(--dark-blue))] sm:whitespace-nowrap">
                      {res.label.toUpperCase()} {/* Uppercase */}
                      <br />({res.type}) {/* Shows the type */}
                    </p>
                  </div>

                  {/* Download Button */}
                  <button
                    type="button"
                    className="mt-6 shrink-0 rounded-full border-[1.3px] border-[#0050D3] px-2 py-0.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50"
                  >
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* PLATFORM VERSION */}
        <div className="rounded-xl border border-[#012247] bg-[#E6EFFD] p-4 sm:p-5">
          <h3 className="mb-3 text-[14px] font-bold tracking-wide text-[hsl(var(--dark-blue))]">
            PLATFORM VERSION
          </h3>
          <p className="text-xs text-[#003FA799]">
            {" "}
            {/* 99 = 60% opacity and Change this later */}
            Version: <span className="font-bold text-[#003FA7]">X.Y.Z</span>
          </p>
          <p className="mb-4 text-xs text-[#003FA799]">
            {" "}
            {/* 99 = 60% opacity*/}
            Last Updated:{" "}
            <span className="font-bold text-[#003FA7]">[DATE]</span>{" "}
            {/* Change this later */}
          </p>

          <h3 className="mb-1 text-[14px] font-bold tracking-wide text-[hsl(var(--dark-blue))]">
            {" "}
            {/* 99 = 60% opacity*/}
            DEVELOPER TEAM
          </h3>
          <p className="text-xs text-[#003FA799]">
            {" "}
            {/* 99 = 60% opacity*/}
            Developed By:{" "}
            <span className="font-bold text-[#003FA7]">FANTASTIC 5</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Colors
/* 
    iconBg - E6EFFD (light blue)
    iconBg - FBDEDE (light red)
    iconBg - FEF3E6 (light yellow)
    icon - 0050D3 (blue)
    icon - FF0000 (red)
    icon - FD950F (yellow) 
*/
