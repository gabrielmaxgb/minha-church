import { Check, Minus } from "lucide-react";

import { planComparison } from "@/constants/plans-comparison";

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto size-4 text-foreground" />
    ) : (
      <Minus className="mx-auto size-4 text-muted-foreground/40" />
    );
  }

  return <span className="text-sm">{value}</span>;
}

export function PlanComparison() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[540px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-5 py-3 font-medium">Recurso</th>
            <th className="px-5 py-3 text-center font-medium">Gratuito</th>
            <th className="px-5 py-3 text-center font-medium">Pro</th>
            <th className="px-5 py-3 text-center font-medium">Igreja</th>
          </tr>
        </thead>
        <tbody>
          {planComparison.map((row) => (
            <tr key={row.feature} className="border-b border-border last:border-0">
              <td className="px-5 py-3 text-muted-foreground">{row.feature}</td>
              <td className="px-5 py-3 text-center">
                <CellValue value={row.free} />
              </td>
              <td className="px-5 py-3 text-center">
                <CellValue value={row.pro} />
              </td>
              <td className="px-5 py-3 text-center">
                <CellValue value={row.church} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
