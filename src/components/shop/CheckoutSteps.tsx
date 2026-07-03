import Link from "next/link";

const allSteps = [
  { label: "Sepet", href: "/magaza/sepet" },
  { label: "Bilgiler", href: "/magaza/odeme" },
  { label: "Ödeme", href: "/magaza/odeme" },
];

export function CheckoutSteps({
  current,
  paymentEnabled = true,
}: {
  current: 1 | 2 | 3;
  paymentEnabled?: boolean;
}) {
  const steps = paymentEnabled ? allSteps : allSteps.slice(0, 2);
  const maxStep = steps.length;

  return (
    <ol className="flex items-center justify-center gap-2 text-sm sm:gap-4">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const active = stepNum === current || (current > maxStep && stepNum === maxStep);
        const done = stepNum < current;

        return (
          <li key={step.label} className="flex items-center gap-2 sm:gap-4">
            {index > 0 && (
              <span className="hidden h-px w-6 bg-slate-300 sm:block sm:w-10" />
            )}
            <Link
              href={step.href}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                active
                  ? "bg-emerald-600 text-white"
                  : done
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                {stepNum}
              </span>
              <span className="hidden font-medium sm:inline">{step.label}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
