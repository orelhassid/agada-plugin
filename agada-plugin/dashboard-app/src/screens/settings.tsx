import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/use-data";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, X, Save } from "lucide-react";
import type { Settings, Notice, SpecialDate } from "@/types";

export function SettingsScreen() {
  const { settings, loading, save } = useSettings();
  const [form, setForm] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  if (loading || !form) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <div>
          <Skeleton className="h-8 w-40 mb-1.5" />
          <Skeleton className="h-4 w-64" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);
      toast.success("ההגדרות נשמרו");
    } catch {
      toast.error("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const addNotice = () => {
    setForm({ ...form, notices: [...form.notices, { text: "", type: "info" }] });
  };

  const updateNotice = (idx: number, data: Partial<Notice>) => {
    const next = [...form.notices];
    next[idx] = { ...next[idx], ...data };
    setForm({ ...form, notices: next });
  };

  const removeNotice = (idx: number) => {
    setForm({ ...form, notices: form.notices.filter((_, i) => i !== idx) });
  };

  const addSpecialDate = () => {
    setForm({
      ...form,
      special_dates: [
        ...form.special_dates,
        { date: "", min_portions: form.default_min_portions, label: "" },
      ],
    });
  };

  const updateSpecialDate = (idx: number, data: Partial<SpecialDate>) => {
    const next = [...form.special_dates];
    next[idx] = { ...next[idx], ...data };
    setForm({ ...form, special_dates: next });
  };

  const removeSpecialDate = (idx: number) => {
    setForm({
      ...form,
      special_dates: form.special_dates.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">הגדרות</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          הגדרות כלליות עבור מערכת אגדה
        </p>
      </div>

      {/* General */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">כללי</CardTitle>
          <CardDescription>הגדרות בסיסיות לניהול הזמנות</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">מספר WhatsApp</Label>
            <Input
              value={form.whatsapp_number}
              onChange={(e) =>
                setForm({ ...form, whatsapp_number: e.target.value })
              }
              dir="ltr"
              placeholder="972..."
              className="max-w-56"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">אימייל לקבלת התראות</Label>
            <Input
              type="email"
              value={form.notification_email}
              onChange={(e) =>
                setForm({ ...form, notification_email: e.target.value })
              }
              dir="ltr"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">מינימום מנות (ברירת מחדל)</Label>
            <Input
              type="number"
              min={1}
              value={form.default_min_portions}
              onChange={(e) =>
                setForm({
                  ...form,
                  default_min_portions: Number(e.target.value),
                })
              }
              dir="ltr"
              className="max-w-28"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notices */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">הודעות</CardTitle>
          <CardDescription>הודעות שיוצגו ללקוחות בטופס ההזמנה</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {form.notices.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">
              אין הודעות מוגדרות
            </p>
          )}
          {form.notices.map((n, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                value={n.text}
                onChange={(e) => updateNotice(idx, { text: e.target.value })}
                placeholder="טקסט ההודעה"
                className="flex-1 h-9"
              />
              <Button
                size="icon"
                variant="ghost"
                className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeNotice(idx)}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={addNotice}
            className="self-start"
          >
            <Plus className="size-3.5" />
            הודעה חדשה
          </Button>
        </CardContent>
      </Card>

      {/* Special dates */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">תאריכים מיוחדים</CardTitle>
          <CardDescription>
            תאריכים עם מינימום מנות שונה מהברירת המחדל
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {form.special_dates.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">
              אין תאריכים מיוחדים מוגדרים
            </p>
          )}
          {form.special_dates.map((sd, idx) => (
            <div
              key={idx}
              className="flex gap-2 items-center rounded-md border border-border/50 bg-muted/20 px-3 py-2.5"
            >
              <Input
                type="date"
                value={sd.date}
                onChange={(e) =>
                  updateSpecialDate(idx, { date: e.target.value })
                }
                dir="ltr"
                className="w-36 h-8 text-sm"
              />
              <Input
                value={sd.label ?? ""}
                onChange={(e) =>
                  updateSpecialDate(idx, { label: e.target.value })
                }
                placeholder="תווית"
                className="flex-1 h-8 text-sm"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  מנות:
                </span>
                <Input
                  type="number"
                  min={1}
                  value={sd.min_portions}
                  onChange={(e) =>
                    updateSpecialDate(idx, {
                      min_portions: Number(e.target.value),
                    })
                  }
                  dir="ltr"
                  className="w-20 h-8 text-sm"
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeSpecialDate(idx)}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={addSpecialDate}
            className="self-start"
          >
            <Plus className="size-3.5" />
            תאריך מיוחד
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="size-4" />
          {saving ? "שומר..." : "שמור הגדרות"}
        </Button>
        <span className="text-xs text-muted-foreground">
          שינויים יכנסו לתוקף מיד
        </span>
      </div>
    </div>
  );
}
