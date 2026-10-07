"use client";

import bannerImage from "../../components/assets/images/help-support-banner.png";
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
    question: "How do I set my availability status?",
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

export default function HelpSupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wire up the ticket-submission endpoint later
    console.log({ subject, message });
  };

  return (
      <div className="px-0.1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side */}
        <div className="lg:col-span-2 flex flex-col gap-6">

        {/* Hero banner */}
        <div
          className="relative overflow-hidden rounded-2xl border-[1px] border-[#D9D9D9] from-blue-50 to-blue-100 bg-cover bg-[position:40%_center] p-8"
          style={{ backgroundImage: `url(${bannerImage.src})` }}
        >
          <div className="max-w-lg">
            <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))]">
              HELP &amp; SUPPORT
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--dark-blue))]">
              Get assistance, report issues, and find answers <br/> to common questions.
            </p>
          </div>
        </div>

          {/* FAQs Section */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-[18px] font-bold tracking-wide text-[hsl(var(--dark-blue))] mb-4">
                FREQUENTLY ASKED QUESTIONS (FAQs)
              </h2>

              <div className="flex flex-col gap-6 ">
                {FAQS.map((faq, i) => {
                  const Icon = faq.icon;
                  const isOpen = openIndex === i;
                  return (
                    <div
                      key={faq.question}
                      className={`rounded-xl border border-border bg-white overflow-hidden transition-shadow ${
                        isOpen ? 
                        "shadow-[0_4px_12px_var(--faq-shadow)]" // "shadow-[0_4px_12px_#E6EFFD]" - if all same color
                        : "hover:shadow-[0_2px_6px_var(--faq-shadow)]" // "hover:shadow-[0_2px_6px_#E6EFFD]" - if all same color
                      }`}
                      style={{ "--faq-shadow": faq.shadow } as React.CSSProperties} // remove if same all are same color
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : i)} // Open/close toggle for your FAQ accordion
                        className="w-full flex items-center justify-between gap-3 p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${faq.iconBg}`}
                          >
                             <Icon className="h-7 w-7" />
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
                        <div className="px-4 pb-5 pr-9 pl-8 text-sm leading-6 text-neutral-600 text-justify">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact form */}
            <div className="rounded-xl border border-border p-6"> {/* border-[1.4px] border-[#D9D9D9] */}
              <h2 className="font-bold text-[18px] text-[hsl(var(--dark-blue))] mb-4">
                CONTACT THE OWNER
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Subject:"
                  value={subject} // Input inside the box
                  onChange={(e) => setSubject(e.target.value)} // Saves the user's input
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#003FA7]/60" // border-[1.4px] border-[#D9D9D9]
                />
                <textarea
                  placeholder="Message:"
                  value={message} // Input inside the box
                  onChange={(e) => setMessage(e.target.value)} // Saves the user's input
                  rows={5}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#003FA7]/60 resize-none" // border-[1.4px] border-[#D9D9D9]
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-[#0050D3] transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Submit Ticket
                </button>
              </form>
            </div>
          </div>  
        </div>  
      {/* CLOSE LEFT SIDE */}


      {/* RIGHT SIDE */}
        <div className="flex flex-col gap-6">

          {/* DOCUMENTATION RESOURCES */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-[14px] font-bold tracking-wide text-[hsl(var(--dark-blue))] mb-4 text-center">
              DOCUMENTATION RESOURCES
            </h3>
            <div className="flex flex-col gap-4">
              {/*icon assigned to that resource*/}
              {RESOURCES.map((res) => {
                const Icon = res.icon;
                return (
                  <div
                    key={res.label}
                    className="flex items-center gap-3 rounded-lg p-3 border border-border"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-1 bg-[#E6EFFD] text-blue-600"> 
                      <Icon className="h-5 w-5" />
                    </span>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold whitespace-nowrap text-[hsl(var(--dark-blue))] leading-tight ">
                        {res.label.toUpperCase()} {/* Uppercase */}
                        <br />({res.type}) {/* Shows the type */}
                      </p>
                    </div>

                    {/* Download Button */}
                    <button 
                      type="button"
                      className="mt-6 text-[10px] font-bold rounded-full border-[1.3px] border-[#0050D3] text-blue-600 px-2 py-0.5 hover:bg-blue-50"
                    >
                      Download
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PLATFORM VERSION */}
          <div className="rounded-xl border border-[#012247] bg-[#E6EFFD] p-5">
            <h3 className="text-[14px] font-bold tracking-wide text-[hsl(var(--dark-blue))] mb-3">
              PLATFORM VERSION
            </h3>
            <p className="text-xs text-[#003FA799]"> {/* 99 = 60% opacity and Change this later */}
              Version:{" "}
              <span className="font-bold text-[#003FA7]">X.Y.Z</span>
            </p>
            <p className="text-xs text-[#003FA799] mb-4"> {/* 99 = 60% opacity*/}
              Last Updated:{" "}
              <span className="font-bold text-[#003FA7]">[DATE]</span> {/* Change this later */}
            </p>

            <h3 className="text-[14px] font-bold tracking-wide text-[hsl(var(--dark-blue))] mb-1"> {/* 99 = 60% opacity*/}
              DEVELOPER TEAM
            </h3>
            <p className="text-xs text-[#003FA799]"> {/* 99 = 60% opacity*/}
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