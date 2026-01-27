/**
 * TripPolicies - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function TripPolicies({
  cancellationPolicy,
  faqs,
}: {
  cancellationPolicy?: string | Record<string, unknown>;
  faqs?: { question: string; answer: string }[];
}) {
  if (!cancellationPolicy && (!faqs || faqs.length === 0)) return null;

  return (
    <div className="space-y-12">
      {/* Cancellation Policy */}
      {cancellationPolicy && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-500"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Cancellation Policy
          </h3>
          <div className="prose prose-sm dark:prose-invert text-muted-foreground max-w-none whitespace-pre-wrap">
            {typeof cancellationPolicy === "string"
              ? cancellationPolicy
              : JSON.stringify(cancellationPolicy, null, 2)}
          </div>
        </div>
      )}

      {/* FAQs */}
      {faqs && faqs.length > 0 && (
        <div>
          <h3 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group border-border bg-card rounded-lg border px-4 open:pb-4"
              >
                <summary className="data-[state=open]:text-primary flex cursor-pointer list-none items-center justify-between py-4 font-semibold transition-colors [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="prose prose-sm dark:prose-invert text-muted-foreground max-w-none pt-2 whitespace-pre-line">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
