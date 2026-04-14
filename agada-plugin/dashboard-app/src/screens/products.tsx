import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/use-data";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BulkBar } from "@/components/bulk-bar";
import { Plus, Search } from "lucide-react";
import type { Product } from "@/types";

const emptyProduct: Partial<Product> = {
  slug: "",
  name: "",
  image_url: "",
  is_optional_extra: 0,
  price_per_person: 0,
  extra_cost: 0,
  is_predefined: 0,
  is_active: 1,
  position: 0,
};

export function ProductsScreen() {
  const { items, loading, upsert, bulk } = useProducts();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [items, search]);

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  };

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleBulk = async (action: string) => {
    const ids = Array.from(selected);
    try {
      await bulk(action, ids);
      setSelected(new Set());
      toast.success(`פעולה בוצעה על ${ids.length} פריטים`);
    } catch {
      toast.error("שגיאה בביצוע פעולה");
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await upsert(editing);
      setEditing(null);
      toast.success(editing.id ? "המוצר עודכן" : "המוצר נוצר");
    } catch {
      toast.error("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof Product>(key: K, value: Product[K]) => {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">מוצרים</h2>
          {!loading && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {filtered.length} פריטים
              {search && ` • תוצאות לחיפוש "${search}"`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="חיפוש..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-8 h-9 w-52"
            />
          </div>
          <Button size="sm" onClick={() => setEditing({ ...emptyProduct })}>
            <Plus className="size-3.5" />
            מוצר חדש
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      <BulkBar
        count={selected.size}
        onActivate={() => handleBulk("activate")}
        onDeactivate={() => handleBulk("deactivate")}
        onDelete={() => handleBulk("delete")}
        onClear={() => setSelected(new Set())}
      />

      {/* Table */}
      <Card className="overflow-x-auto border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-10 ps-4">
                  <Checkbox
                    checked={
                      filtered.length > 0 &&
                      selected.size === filtered.length
                    }
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-foreground/80">שם</TableHead>
                <TableHead className="font-semibold text-foreground/80">תוספת</TableHead>
                <TableHead className="font-semibold text-foreground/80">עלות</TableHead>
                <TableHead className="font-semibold text-foreground/80">סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    <TableCell className="ps-4">
                      <Skeleton className="size-4 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-14 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    {search ? "לא נמצאו תוצאות לחיפוש" : "אין מוצרים עדיין"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow
                    key={p.id}
                    data-state={selected.has(p.id) ? "selected" : undefined}
                    className="cursor-pointer border-border/40 transition-colors"
                    onClick={() => setEditing({ ...p })}
                  >
                    <TableCell
                      className="ps-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selected.has(p.id)}
                        onCheckedChange={() => toggle(p.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      {Number(p.is_optional_extra) ? (
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          אופציונלי
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/40 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {Number(p.extra_cost) > 0
                        ? `₪${Number(p.extra_cost).toFixed(0)}`
                        : <span className="text-muted-foreground/40">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          Number(p.is_active)
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }
                      >
                        {Number(p.is_active) ? "פעיל" : "מושבת"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit sheet */}
      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle>
              {editing?.id ? "עריכת מוצר" : "מוצר חדש"}
            </SheetTitle>
          </SheetHeader>
          <Separator className="mb-5" />
          {editing && (
            <div className="flex flex-col gap-5 pb-6">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">שם</Label>
                <Input
                  value={editing.name ?? ""}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">סלאג (slug)</Label>
                <Input
                  value={editing.slug ?? ""}
                  onChange={(e) => setField("slug", e.target.value)}
                  dir="ltr"
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">כתובת תמונה</Label>
                <Input
                  value={editing.image_url ?? ""}
                  onChange={(e) => setField("image_url", e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">עלות נוספת (₪)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editing.extra_cost ?? 0}
                  onChange={(e) =>
                    setField("extra_cost", Number(e.target.value) as never)
                  }
                  dir="ltr"
                  className="max-w-32"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">מיקום</Label>
                <Input
                  type="number"
                  min={0}
                  value={editing.position ?? 0}
                  onChange={(e) =>
                    setField("position", Number(e.target.value) as never)
                  }
                  dir="ltr"
                  className="max-w-32"
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-3">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide text-[11px]">
                  אפשרויות
                </Label>
                {[
                  { key: "is_active" as const, label: "פעיל" },
                  { key: "is_optional_extra" as const, label: "תוספת אופציונלית" },
                  { key: "price_per_person" as const, label: "מחיר לאדם" },
                  { key: "is_predefined" as const, label: "מוגדר מראש" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={!!editing[key]}
                      onCheckedChange={(v) =>
                        setField(key, (v ? 1 : 0) as never)
                      }
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "שומר..." : "שמור"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditing(null)}
                  className="flex-1"
                >
                  ביטול
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
