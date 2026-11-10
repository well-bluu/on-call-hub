
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

// ==========================================
// BANNER
// ==========================================


function Banner({ image }: { image: typeof bannerImage }) {
  return (
    <section
      className="relative flex min-h-[145px] items-center overflow-hidden rounded-2xl border border-[#D9D9D9] px-5 py-5 shadow-sm sm:min-h-[165px] sm:px-8 lg:min-h-[175px]"
      style={{
        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(255,255,255,0.98) 0%,
            rgba(255,255,255,0.95) 25%,
            rgba(255,255,255,0.88) 40%,
            rgba(255,255,255,0.70) 55%,
            rgba(255,255,255,0.40) 70%,
            rgba(255,255,255,0.12) 85%,
            rgba(255,255,255,0) 100%
          ),
          url(${image.src})
        `,
        backgroundSize: "100% 100%, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      }}
    >
      <div className="relative z-10 max-w-[70%] sm:max-w-sm">
       <h1 className="whitespace-nowrap text-2xl font-extrabold uppercase leading-tight text-[hsl(var(--dark-blue))] sm:text-3xl lg:text-4xl">
          HELP &amp; SUPPORT
      </h1>

        <p className="mt-2 text-[11px] font-medium leading-relaxed text-[hsl(var(--dark-blue))] sm:text-sm">
          Get assistance, report issues, and find answers{" "}
          <span className="sm:hidden">
            to common questions.
          </span>
          <span className="hidden sm:inline">
            <br />
            to common questions.
          </span>
        </p>
      </div>
    </section>
  );
}

// ==========================================
// FAQS
// ==========================================

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

// ==========================================
// DOCUMENTATION RESOURCES
// ==========================================

const RESOURCES = [
  { icon: FileText, label: "Owner Manual", type: "PDF" },
  { icon: ShieldCheck, label: "Shift Management", type: "PDF" },
  { icon: Book, label: "Worker Management", type: "PDF" },
];

// ==========================================
// PAGE
// ==========================================

export default function OwnerHelpSupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_260px] xl:gap-5">
      {/* LEFT SIDE */}
      <div className="flex min-w-0 flex-col gap-6">

        {/* HERO BANNER */}
        <Banner image={bannerImage} />

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="flex flex-col gap-5 xl:gap-4">
          <h2 className="text-center text-sm font-bold tracking-wide text-[hsl(var(--dark-blue))] sm:text-lg xl:text-left xl:text-[18px]">
            FREQUENTLY ASKED QUESTIONS (FAQs)
          </h2>

          <div className="flex flex-col gap-4 sm:gap-5 xl:gap-6">
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
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-6 sm:py-6 xl:p-4"
                  >
                    <div className="flex min-w-0 items-center gap-4 sm:gap-5 xl:gap-3">

                      {/* FAQ ICON */}
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-lg sm:size-14 xl:size-9 xl:rounded-md ${faq.iconBg}`}
                      >
                        <Icon
                          className="size-6 sm:size-8 xl:size-5"
                          aria-hidden="true"
                        />
                      </span>

                      {/* FAQ TITLE */}
                      <span className="text-[13px] font-semibold leading-snug text-[hsl(var(--dark-blue))] sm:text-lg xl:text-sm">
                        {faq.question.toUpperCase()}
                      </span>
                    </div>

                    {/* EXPAND ICON */}
                    <ChevronDown
                      aria-hidden="true"
                      className={`size-4 shrink-0 text-[hsl(var(--dark-blue))] transition-transform sm:size-5 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* FAQ ANSWER */}
                  {isOpen && (
                    <div
                      id={`faq-answer-${i}`}
                      className="px-4 pb-4 text-justify text-xs leading-relaxed text-neutral-600 sm:px-6 sm:pb-6 sm:text-sm xl:pb-5 xl:pl-8 xl:pr-9 xl:leading-6"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex min-w-0 flex-col gap-6 xl:gap-4">

        {/* DOCUMENTATION RESOURCES */}
        <section className="min-w-0 rounded-xl border border-border bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:p-6 xl:p-5 xl:shadow-none">
          <h3 className="mb-5 text-sm font-bold tracking-wide text-[hsl(var(--dark-blue))] sm:text-lg xl:mb-4 xl:text-sm">
            DOCUMENTATION RESOURCES
          </h3>

          <div className="flex flex-col gap-4 xl:gap-3">
            {RESOURCES.map((res) => {
              const Icon = res.icon;

              return (
                <div
                  key={res.label}
                  className="flex items-center gap-4 rounded-xl border border-border px-4 py-4 sm:gap-5 sm:px-6 sm:py-6 xl:grid xl:grid-cols-[2rem_minmax(0,1fr)_auto] xl:grid-rows-[auto_auto] xl:items-center xl:gap-x-2 xl:gap-y-1 xl:rounded-lg xl:p-3"
                >
                  {/* RESOURCE ICON */}
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#E6EFFD] text-blue-600 sm:size-14 xl:col-start-1 xl:row-span-2 xl:row-start-1 xl:size-8 xl:rounded-md">
                    <Icon
                      className="size-6 sm:size-8 xl:size-5"
                      aria-hidden="true"
                    />
                  </span>

                  {/* RESOURCE NAME */}
                  <div className="min-w-0 flex-1 xl:contents">
                    <p className="text-[12px] font-semibold leading-tight text-[hsl(var(--dark-blue))] sm:text-lg xl:contents xl:text-xs xl:font-bold">
                      <span className="xl:col-span-2 xl:col-start-2 xl:row-start-1 xl:break-words">
                        {res.label.toUpperCase()}
                      </span>
                      <br className="xl:hidden" />
                      <span className="xl:col-start-2 xl:row-start-2">
                        ({res.type})
                      </span>
                    </p>
                  </div>

                  {/* DOWNLOAD BUTTON */}
                  <button
                    type="button"
                    aria-label={`Download ${res.label}`}
                    className="shrink-0 rounded-full border border-[#0050D3] px-4 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 sm:px-5 sm:py-1.5 sm:text-sm xl:col-start-3 xl:row-start-2 xl:px-2 xl:py-0.5 xl:text-[10px] xl:font-bold"
                  >
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* PLATFORM VERSION */}
        <section className="min-w-0 rounded-xl border border-[#012247] bg-[#E6EFFD] p-4 sm:p-6 xl:p-5">
          <h3 className="mb-3 text-sm font-bold tracking-wide text-[hsl(var(--dark-blue))] sm:text-lg xl:text-sm">
            PLATFORM VERSION
          </h3>

          <p className="text-xs text-[#003FA799] sm:text-sm xl:text-xs">
            Version:{" "}
            <span className="font-bold text-[#003FA7]">X.Y.Z</span>
          </p>

          <p className="mb-4 text-xs text-[#003FA799] sm:text-sm xl:text-xs">
            Last Updated:{" "}
            <span className="font-bold text-[#003FA7]">[DATE]</span>
            {/* Change this later */}
          </p>

          <h3 className="mb-1 text-sm font-bold tracking-wide text-[hsl(var(--dark-blue))] sm:text-lg xl:text-sm">
            DEVELOPER TEAM
          </h3>

          <p className="text-xs text-[#003FA799] sm:text-sm xl:text-xs">
            Developed By:{" "}
            <span className="font-bold text-[#003FA7]">FANTASTIC 5</span>
          </p>
        </section>
      </div>
    </div>
  );
}
