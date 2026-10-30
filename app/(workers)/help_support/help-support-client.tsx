"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import bannerImage from "@/components/assets/images/help-support-banner.png";
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
    iconBg: "bg-[#E6EFFD] text-[#0050D3]",
    shadow: "#E6EFFD",
    question: "How do I accept a shift offer?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.",
  },
  {
    icon: XCircle,
    iconBg: "bg-[#FBDEDE] text-[#FF0000]",
    shadow: "#FBDEDE",
    question: "What happens if I decline a shift?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Est culpa consequat temporibus laborum et ad. Id et quas nisi culpa nobis non. Nostrud dolorem soluta nobis nulla eligendi est fugiat qui et. Ut amet labore dolorem dolores aliqua.",
  },
  {
    icon: User,
    iconBg: "bg-[#FEF3E6] text-[#FD950F]",
    shadow: "#FEF3E6",
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

export default function HelpSupportClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Connect the ticket submission endpoint later.
    console.log({ subject, message });
  };

  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
      {/* Left side */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
        {/* Banner */}
        <div
          className="relative overflow-hidden rounded-2xl border border-[#D9D9D9] bg-cover bg-[position:40%_center] p-5 sm:p-8"
          style={{ backgroundImage: `url(${bannerImage.src})` }}
        >
          <div className="max-w-lg">
            <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))] sm:text-3xl">
              HELP &amp; SUPPORT
            </h1>

            <p className="mt-2 text-sm text-[hsl(var(--dark-blue))]">
              Get assistance, report issues, and find answers{" "}
              <br className="hidden sm:block" />
              to common questions.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          {/* FAQs */}
          <div>
            <h2 className="mb-4 text-base font-bold tracking-wide text-[hsl(var(--dark-blue))] sm:text-[18px]">
              FREQUENTLY ASKED QUESTIONS (FAQs)
            </h2>

            <div className="flex flex-col gap-4 sm:gap-6">
              {FAQS.map((faq, index) => {
                const Icon = faq.icon;
                const isOpen = openIndex === index;

                return (
                  <div
                    key={faq.question}
                    className={`overflow-hidden rounded-xl border border-border bg-white transition-shadow ${
                      isOpen
                        ? "shadow-[0_4px_12px_var(--faq-shadow)]"
                        : "hover:shadow-[0_2px_6px_var(--faq-shadow)]"
                    }`}
                    style={
                      { "--faq-shadow": faq.shadow } as CSSProperties
                    }
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() =>
                        setOpenIndex(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between gap-3 p-3 text-left sm:p-4"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${faq.iconBg}`}
                        >
                          <Icon
                            className="h-7 w-7"
                            aria-hidden="true"
                          />
                        </span>

                        <span className="min-w-0 text-xs font-semibold text-[hsl(var(--dark-blue))] sm:text-sm">
                          {faq.question.toUpperCase()}
                        </span>
                      </span>

                      <ChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={`faq-answer-${index}`}
                        className="px-4 pb-4 text-left text-sm leading-6 text-neutral-600 sm:pb-5 sm:pl-8 sm:pr-9 sm:text-justify"
                      >
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
            <h2 className="mb-4 text-base font-bold text-[hsl(var(--dark-blue))] sm:text-[18px]">
              CONTACT THE OWNER
            </h2>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                aria-label="Subject"
                placeholder="Subject:"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#003FA7]/60 sm:text-sm"
              />

              <textarea
                aria-label="Message"
                placeholder="Message:"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                className="w-full resize-none rounded-lg border border-border bg-white px-4 py-3 text-base placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#003FA7]/60 sm:text-sm"
              />

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0050D3]"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Same right-column sizing as My Shifts */}
      <div className="grid min-w-0 grid-cols-1 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
        {/* Documentation resources */}
        <section className="min-w-0 rounded-xl border border-border bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-center text-sm font-bold tracking-wide text-[hsl(var(--dark-blue))]">
            DOCUMENTATION RESOURCES
          </h2>

          <div className="flex flex-col gap-3 sm:gap-4">
            {RESOURCES.map((resource) => {
              const Icon = resource.icon;

              return (
                <div
                  key={resource.label}
                  className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-border p-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E6EFFD] p-1 text-blue-600">
                    <Icon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-xs font-bold leading-tight text-[hsl(var(--dark-blue))]">
                      {resource.label.toUpperCase()}
                      <br />
                      ({resource.type})
                    </p>
                  </div>

                  <div className="flex w-full justify-end">
                    <button
                      type="button"
                      aria-label={`Download ${resource.label}`}
                      className="rounded-full border border-[#0050D3] px-2 py-0.5 text-[10px] font-bold text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Platform version and developer team */}
        <section className="min-w-0 rounded-xl border border-[#012247] bg-[#E6EFFD] p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-bold tracking-wide text-[hsl(var(--dark-blue))]">
            PLATFORM VERSION
          </h2>

          <p className="text-xs text-[#003FA799]">
            Version:{" "}
            <span className="font-bold text-[#003FA7]">
              X.Y.Z
            </span>
          </p>

          <p className="mb-4 text-xs text-[#003FA799]">
            Last Updated:{" "}
            <span className="font-bold text-[#003FA7]">
              [DATE]
            </span>
          </p>

          <h2 className="mb-1 text-sm font-bold tracking-wide text-[hsl(var(--dark-blue))]">
            DEVELOPER TEAM
          </h2>

          <p className="text-xs text-[#003FA799]">
            Developed By:{" "}
            <span className="font-bold text-[#003FA7]">
              FANTASTIC 5
            </span>
          </p>
        </section>
      </div>
    </div>
  );
}