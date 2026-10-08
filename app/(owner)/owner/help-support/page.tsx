"use client";

import bannerImage from "@/components/assets/images/help-support-banner.png";
import { useState } from "react";
import {
  PlusCircle,
  UserPlus,
  UserMinus,
  FilePlus2,
  SquarePen,
  ChevronDown,
  FileText,
  ShieldCheck,
  Book,
} from "lucide-react";

// FAQS Layout
const FAQS = [
  {
    icon: PlusCircle,
    iconBg: "bg-[#FEF3E6] text-[#FD950F]",
    shadow: "#FEF3E6",
    question: "How do I create and publish shift?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.", // Must change later
  },
  {
    icon: UserPlus,
    iconBg: "bg-[#E3F4E6] text-[#1A9E3A]",
    shadow: "#E3F4E6",
    question: "How do I add worker?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.", // Must change later
  },
  {
    icon: UserMinus,
    iconBg: "bg-[#FBDEDE] text-[#FF0000]",
    shadow: "#FBDEDE",
    question: "How do I remove worker?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.", // Must change later
  },
  {
    icon: FilePlus2,
    iconBg: "bg-[#E3F4E6] text-[#1A9E3A]",
    shadow: "#E3F4E6",
    question: "How do I add an announcement?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.", // Must change later
  },
  {
    icon: SquarePen,
    iconBg: "bg-[#E6EFFD] text-[#0050D3]",
    shadow: "#E6EFFD",
    question: "How do I edit my calendar?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.", // Must change later
  },
];

const RESOURCES = [
  { icon: FileText, label: "Owner Manual", type: "PDF" },
  { icon: ShieldCheck, label: "Shift Management", type: "PDF" },
  { icon: Book, label: "Worker Management", type: "PDF" },
];

export default function OwnerHelpSupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="px-0.1 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT SIDE */}
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
              Get assistance, report issues, and find answers <br /> to common questions.
            </p>
          </div>
        </div>

        {/* FAQs Section */}
        <div>
          <h2 className="text-[18px] font-bold tracking-wide text-[hsl(var(--dark-blue))] mb-4">
            FREQUENTLY ASKED QUESTIONS (FAQs)
          </h2>

          <div className="flex flex-col gap-6">
            {FAQS.map((faq, i) => {
              const Icon = faq.icon;
              const isOpen = openIndex === i;
              return (
                <div
                  key={faq.question}
                  className={`rounded-xl border border-border bg-white overflow-hidden transition-shadow ${
                    isOpen
                      ? "shadow-[0_4px_12px_var(--faq-shadow)]"
                      : "hover:shadow-[0_2px_6px_var(--faq-shadow)]"
                  }`}
                  style={{ "--faq-shadow": faq.shadow } as React.CSSProperties}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)} // Open/close toggle for the FAQ accordion
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
                    <p className="text-xs font-bold whitespace-nowrap text-[hsl(var(--dark-blue))] leading-tight">
                      {res.label.toUpperCase()}
                      <br />({res.type})
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
          <p className="text-xs text-[#003FA799]"> {/* 99 = 60% opacity */}
            Version:{" "}
            <span className="font-bold text-[#003FA7]">X.Y.Z</span>
          </p>
          <p className="text-xs text-[#003FA799] mb-4">
            Last Updated:{" "}
            <span className="font-bold text-[#003FA7]">[DATE]</span> {/* Change this later */}
          </p>

          <h3 className="text-[14px] font-bold tracking-wide text-[hsl(var(--dark-blue))] mb-1">
            DEVELOPER TEAM
          </h3>
          <p className="text-xs text-[#003FA799]">
            Developed By:{" "}
            <span className="font-bold text-[#003FA7]">FANTASTIC 5</span>
          </p>
        </div>
      </div>
    </div>
  );
}