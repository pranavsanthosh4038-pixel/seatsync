import { toast } from "sonner";

type Kind = "success" | "error" | "warning" | "info";

const DOT: Record<Kind, string> = {
  success: "#2ecc71",
  error: "#e23744",
  warning: "#f39c12",
  info: "#e23744",
};

export function notify(kind: Kind, message: string) {
  toast.custom(
    () => (
      <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-lg animate-[toast-up_0.25s_ease]">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${kind === "success" ? "bg-seat-available" : kind === "warning" ? "bg-seat-locked" : "bg-primary"}`}
        />
        {message}
      </div>
    ),
    { duration: 3000, position: "bottom-center" },
  );
}
