import { STATUS_LABEL } from "../../lib/format";
import { PillBadge } from "../ui";

const TONE = {
  pending: "neutral",
  active: "warning",
  returned: "success",
  rejected: "danger",
  cancelled: "neutral",
  overdue: "danger",
};

export function StatusBadge({ status }) {
  return <PillBadge tone={TONE[status] || "neutral"}>{STATUS_LABEL[status] || status}</PillBadge>;
}
