import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, XCircle, X } from "lucide-react";

interface BulkBarProps {
  count: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkBar({
  count,
  onActivate,
  onDeactivate,
  onDelete,
  onClear,
}: BulkBarProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-2.5 shadow-sm">
      <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
        {count}
      </div>
      <span className="text-sm font-medium">
        {count === 1 ? "פריט נבחר" : `${count} פריטים נבחרו`}
      </span>
      <div className="flex items-center gap-1.5 ms-auto">
        <Button size="sm" variant="outline" onClick={onActivate} className="h-7 text-xs gap-1.5">
          <CheckCircle className="size-3" />
          הפעל
        </Button>
        <Button size="sm" variant="outline" onClick={onDeactivate} className="h-7 text-xs gap-1.5">
          <XCircle className="size-3" />
          השבת
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          className="h-7 text-xs gap-1.5"
        >
          <Trash2 className="size-3" />
          מחק
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClear}
          className="size-7 text-muted-foreground"
          aria-label="בטל בחירה"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
