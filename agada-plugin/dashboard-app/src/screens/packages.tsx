import { useState, useMemo } from "react";
import { usePackages, useProducts } from "@/hooks/use-data";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BulkBar } from "@/components/bulk-bar";
import { Plus, Search, X } from "lucide-react";
import type { Package as Pkg } from "@/types";

interface PkgForm {
  id?: number;
  slug: string;
  name: string;
  image_url: string;
  base_price_per_person: number;
  includes: string[];
  meals: string[];
  is_active: number;
  position: number;
}

function toForm(p: Pkg): PkgForm {
  const includes = safeParseArray(p.includes_json);
  const meals = safeParseArray(p.meals_json);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    image_url: p.image_url,
    base_price_per_person: Number(p.base_price_per_person),
    includes,
    meals,
    is_active: Number(p.is_active),
    position: Number(p.position),
  };
}

function safeParseArray(val: string | string[]): string[] {
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const emptyForm: PkgForm = {
  slug: "",
  name: "",
  image_url: "",
  base_price_per_person: 0,
  includes: [],
  meals: [],
  is_active: 1,
  position: 0,
};

export function PackagesScreen() {
  const { items, loading, upsert, bulk } = usePackages();
  const { items: products } = useProducts();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<PkgForm | null>(null);
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
      toast.success(`פעולה בוצעה על ${ids.length} חבילות`);
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
      toast.success(editing.id ? "החבילה עודכנה" : "החבילה נוצרה");
    } catch {
      toast.error("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const addInclude = (slug: string) => {
    if (!editing || editing.includes.includes(slug)) return;
    setEditing({ ...editing, includes: [...editing.includes, slug] });
  };

  const removeInclude = (slug: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      includes: editing.includes.filter((s) => s !== slug),
    });
  };

  const addMeal = () => {
    if (!editing) return;
    setEditing({ ...editing, meals: [...editing.meals, ""] });
  };

  const updateMeal = (idx: number, value: string) => {
    if (!editing) return;
    const next = [...editing.meals];
    next[idx] = value;
    setEditing({ ...editing, meals: next });
  };

  const removeMeal = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, meals: editing.meals.filter((_, i) => i !== idx) });
  };

  const availableProducts = products.filter(
    (p) => !editing?.includes.includes(p.slug)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">חבילות</h2>
          {!loading && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {filtered.length} חבילות
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
          <Button size="sm" onClick={() => setEditing({ ...emptyForm })}>
            <Plus className="size-3.5" />
            חבילה חדשה
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
                <TableHead className="font-semibold text-foreground/80">מחיר/אדם</TableHead>
                <TableHead className="font-semibold text-foreground/80">מוצרים</TableHead>
                <TableHead className="font-semibold text-foreground/80">סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    <TableCell className="ps-4">
                      <Skeleton className="size-4 rounded" />
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    {search ? "לא נמצאו תוצאות לחיפוש" : "אין חבילות עדיין"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((pkg) => {
                  const includes = safeParseArray(pkg.includes_json);
                  return (
                    <TableRow
                      key={pkg.id}
                      data-state={selected.has(pkg.id) ? "selected" : undefined}
                      className="cursor-pointer border-border/40 transition-colors"
                      onClick={() => setEditing(toForm(pkg))}
                    >
                      <TableCell
                        className="ps-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selected.has(pkg.id)}
                          onCheckedChange={() => toggle(pkg.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell className="tabular-nums text-sm">
                        ₪{Number(pkg.base_price_per_person).toFixed(0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs font-normal">
                          {includes.length} מוצרים
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            Number(pkg.is_active)
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                              : "text-muted-foreground"
                          }
                        >
                          {Number(pkg.is_active) ? "פעיל" : "מושבת"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit sheet */}
      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle>
              {editing?.id ? "עריכת חבילה" : "חבילה חדשה"}
            </SheetTitle>
          </SheetHeader>
          <Separator className="mb-5" />
          {editing && (
            <div className="flex flex-col gap-5 pb-6">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">שם</Label>
                <Input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">סלאג (slug)</Label>
                <Input
                  value={editing.slug}
                  onChange={(e) =>
                    setEditing({ ...editing, slug: e.target.value })
                  }
                  dir="ltr"
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">כתובת תמונה</Label>
                <Input
                  value={editing.image_url}
                  onChange={(e) =>
                    setEditing({ ...editing, image_url: e.target.value })
                  }
                  dir="ltr"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <Label className="text-sm">מחיר בסיס לאדם (₪)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editing.base_price_per_person}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        base_price_per_person: Number(e.target.value),
                      })
                    }
                    dir="ltr"
                  />
                </div>
                <div className="flex flex-col gap-1.5 w-28">
                  <Label className="text-sm">מיקום</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editing.position}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        position: Number(e.target.value),
                      })
                    }
                    dir="ltr"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <Checkbox
                  checked={!!editing.is_active}
                  onCheckedChange={(v) =>
                    setEditing({ ...editing, is_active: v ? 1 : 0 })
                  }
                />
                <span className="text-sm">פעיל</span>
              </label>

              <Separator />

              {/* Includes */}
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  מוצרים כלולים
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {editing.includes.map((slug) => {
                    const prod = products.find((p) => p.slug === slug);
                    return (
                      <Badge
                        key={slug}
                        variant="secondary"
                        className="gap-1 pe-1.5"
                      >
                        {prod?.name ?? slug}
                        <button
                          onClick={() => removeInclude(slug)}
                          className="ms-0.5 rounded hover:text-destructive transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    );
                  })}
                  {editing.includes.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      לא נבחרו מוצרים
                    </span>
                  )}
                </div>
                {availableProducts.length > 0 && (
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) addInclude(e.target.value);
                    }}
                  >
                    <option value="">הוסף מוצר...</option>
                    {availableProducts.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <Separator />

              {/* Meals */}
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  ארוחות
                </Label>
                <div className="flex flex-col gap-2">
                  {editing.meals.map((meal, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={meal}
                        onChange={(e) => updateMeal(idx, e.target.value)}
                        placeholder="שם ארוחה"
                        className="h-9"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMeal(idx)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" onClick={addMeal} className="self-start">
                  <Plus className="size-3.5" />
                  ארוחה
                </Button>
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
