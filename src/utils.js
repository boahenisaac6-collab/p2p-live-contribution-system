export function money(value) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(Number(value || 0)).replace("GH₵", "GH₵ ");
}

export function shortDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

export function cleanName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toUpperCase();
}

export function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function downloadCSV(records) {
  const header = ["No.", "Name", "Amount", "Reason", "Paid At", "Updated At"];
  const rows = records.map((r) => [
    r.serial_number,
    r.name,
    Number(r.amount || 0).toFixed(2),
    r.reason || "",
    r.paid_at || "",
    r.updated_at || "",
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Intl.DateTimeFormat("en-GB", {
    weekday: "short", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short", year: "numeric",
  }).format(new Date()).replace(/[,:]/g, "").replace(/\s+/g, "_");
  link.href = url;
  link.download = `P2P_CONTRIBUTION_RECORDS_${stamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
