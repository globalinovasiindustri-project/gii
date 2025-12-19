"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, X } from "lucide-react";

interface AdminNotesSectionProps {
  notes: string | null;
  onSave: (notes: string) => void;
  isSaving: boolean;
}

export function AdminNotesSection({
  notes,
  onSave,
  isSaving,
}: AdminNotesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes || "");

  const hasChanges = editedNotes !== (notes || "");

  const handleSave = () => {
    onSave(editedNotes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedNotes(notes || "");
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditedNotes(notes || "");
    setIsEditing(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Catatan Admin</h3>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartEdit}
            className="h-7 px-2 text-xs"
          >
            <Pencil className="mr-1 h-3 w-3" />
            {notes ? "Edit" : "Tambah"}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="admin-notes" className="sr-only">
              Catatan Admin
            </Label>
            <Textarea
              id="admin-notes"
              placeholder="Tambahkan catatan internal untuk order ini..."
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              size="sm"
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : notes ? (
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-sm whitespace-pre-wrap">{notes}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Belum ada catatan admin
        </p>
      )}
    </div>
  );
}
