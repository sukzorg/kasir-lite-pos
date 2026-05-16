type StatusBadgeProps = {
  children: string;
  tone?: "green" | "orange" | "red" | "blue" | "gray";
};

const toneClass: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  green: "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-primary-fixed text-on-primary-fixed-variant",
  gray: "bg-surface-container-high text-on-surface-variant"
};

export function StatusBadge({ children, tone = "gray" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClass[tone]}`}>
      {children}
    </span>
  );
}
