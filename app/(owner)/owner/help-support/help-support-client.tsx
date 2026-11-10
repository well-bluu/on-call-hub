
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
    <div className="w-full flex flex-col gap-6">

      {/* HERO BANNER */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[#D9D9D9] bg-cover bg-[position:40%_center] p-5 shadow-sm sm:p-6 lg:p-8"
        style={{ backgroundImage: `url(${bannerImage.src})` }}
      >
        <div className="max-w-sm">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[hsl(var(--dark-blue))]">
            HELP &amp; SUPPORT
          </h1>

          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[hsl(var(--dark-blue))]">
            Get assistance, report issues, and find answers to common
            questions.
          </p>
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="flex flex-col gap-5">

        <h2 className="text-center text-sm sm:text-lg font-bold tracking-wide text-[hsl(var(--dark-blue))]">
          FREQUENTLY ASKED QUESTIONS (FAQs)
        </h2>

        <div className="flex flex-col gap-4 sm:gap-5">
          {FAQS.map((faq, i) => {
            const Icon = faq.icon;
            const isOpen = openIndex === i;

            return (
              <div
                key={faq.question}
                className={`overflow-hidden rounded-xl border border-border bg-white transition-shadow ${
                  isOpen
                    ? "shadow-[0_4px_12px_var(--faq-shadow)]"
                    : "shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
                }`}
                style={{ "--faq-shadow": faq.shadow } as React.CSSProperties}
              >
                {/* FAQ QUESTION */}
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6 text-left"
                >
                  <div className="flex min-w-0 items-center gap-4 sm:gap-5">

                    {/* FAQ ICON */}
                    <span
                      className={`flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-lg ${faq.iconBg}`}
                    >
                      <Icon className="size-6 sm:size-8" />
                    </span>

                    {/* FAQ TITLE */}
                    <span className="text-[13px] sm:text-lg font-semibold leading-snug text-[hsl(var(--dark-blue))]">
                      {faq.question.toUpperCase()}
                    </span>
                  </div>

                  {/* EXPAND ICON */}
                  <ChevronDown
                    className={`size-4 sm:size-5 shrink-0 text-[hsl(var(--dark-blue))] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* FAQ ANSWER */}
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-xs sm:text-sm leading-relaxed text-neutral-600 text-justify">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* DOCUMENTATION RESOURCES */}
      <section className="rounded-xl border border-border bg-white p-4 sm:p-6 shadow-[0_2px_6px_rgba(0,0,0,0.12)]">

        <h3 className="mb-5 text-sm sm:text-lg font-bold tracking-wide text-[hsl(var(--dark-blue))]">
          DOCUMENTATION RESOURCES
        </h3>

        <div className="flex flex-col gap-4">
          {RESOURCES.map((res) => {
            const Icon = res.icon;

            return (
              <div
                key={res.label}
                className="flex items-center gap-4 sm:gap-5 rounded-xl border border-border px-4 py-4 sm:px-6 sm:py-6"
              >
                {/* RESOURCE ICON */}
                <span className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-lg bg-[#E6EFFD] text-blue-600">
                  <Icon className="size-6 sm:size-8" />
                </span>

                {/* RESOURCE NAME */}
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] sm:text-lg font-semibold leading-tight text-[hsl(var(--dark-blue))]">
                    {res.label.toUpperCase()}
                    <br />
                    ({res.type})
                  </p>
                </div>

                {/* DOWNLOAD BUTTON */}
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-[#0050D3] px-4 py-2 sm:px-5 sm:py-1.5 text-xs sm:text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                >
                  Download
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* PLATFORM VERSION */}
      <section className="rounded-xl border border-[#012247] bg-[#E6EFFD] p-4 sm:p-6">

        <h3 className="mb-3 text-sm sm:text-lg font-bold tracking-wide text-[hsl(var(--dark-blue))]">
          PLATFORM VERSION
        </h3>

        <p className="text-xs sm:text-sm text-[#003FA799]">
          Version:{" "}
          <span className="font-bold text-[#003FA7]">X.Y.Z</span>
        </p>

        <p className="mb-4 text-xs sm:text-sm text-[#003FA799]">
          Last Updated:{" "}
          <span className="font-bold text-[#003FA7]">[DATE]</span>
          {/* Change this later */}
        </p>

        <h3 className="mb-1 text-sm sm:text-lg font-bold tracking-wide text-[hsl(var(--dark-blue))]">
          DEVELOPER TEAM
        </h3>

        <p className="text-xs sm:text-sm text-[#003FA799]">
          Developed By:{" "}
          <span className="font-bold text-[#003FA7]">FANTASTIC 5</span>
        </p>
      </section>

    </div>
  );
}
