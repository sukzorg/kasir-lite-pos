import { StatusBadge } from "../../../components/ui/StatusBadge";
import type { Sale } from "../../../types";

const statusLabels: Record<Sale["status"], string> = {
  completed: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Diretur"
};

function statusTone(status: Sale["status"]) {
  if (status === "completed") return "green";
  if (status === "refunded") return "orange";
  return "red";
}

export function TransactionStatusBadge({ status }: { status: Sale["status"] }) {
  return <StatusBadge tone={statusTone(status)}>{statusLabels[status]}</StatusBadge>;
}
