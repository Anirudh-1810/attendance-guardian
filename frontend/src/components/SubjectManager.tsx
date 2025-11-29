import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Edit, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Subject {
  id: number;
  name: string;
  code: string;
  teacher: string;
  totalClasses: number;
  attendedClasses: number;
  requiredPercentage: number;
}

interface SubjectManagerProps {
  subjects: Subject[];
  onUpdate: (subjects: Subject[]) => void;
}

export function SubjectManager({ subjects, onUpdate }: SubjectManagerProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Subject>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    teacher: "",
    requiredPercentage: 75,
  });

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditForm(subject);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const updatedSubjects = subjects.map((s) =>
      s.id === editingId ? { ...s, ...editForm } : s
    );
    onUpdate(updatedSubjects);
    setEditingId(null);
    setEditForm({});
    toast.success("Subject updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    const subject = subjects.find((s) => s.id === deleteId);
    const updatedSubjects = subjects.filter((s) => s.id !== deleteId);
    onUpdate(updatedSubjects);
    setDeleteId(null);
    toast.success(`${subject?.name} removed successfully`);
  };

  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.code || !newSubject.teacher) {
      toast.error("Please fill in all fields");
      return;
    }

    const subject: Subject = {
      id: Date.now(),
      ...newSubject,
      totalClasses: 0,
      attendedClasses: 0,
    };

    onUpdate([...subjects, subject]);
    setNewSubject({ name: "", code: "", teacher: "", requiredPercentage: 75 });
    setIsAdding(false);
    toast.success("Subject added successfully");
  };

  return (
    <div className="space-y-4">
      {/* Add New Subject */}
      {isAdding ? (
        <Card className="p-4 space-y-3 border-primary">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Add New Subject</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject Name *</Label>
              <Input
                placeholder="Data Structures"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject Code *</Label>
              <Input
                placeholder="CS201"
                value={newSubject.code}
                onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Teacher *</Label>
              <Input
                placeholder="Dr. Smith"
                value={newSubject.teacher}
                onChange={(e) => setNewSubject({ ...newSubject, teacher: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Required %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newSubject.requiredPercentage}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, requiredPercentage: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
          <Button onClick={handleAddSubject} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Subject
        </Button>
      )}

      {/* Subject List */}
      {subjects.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {subjects.map((subject) => (
            <Card key={subject.id} className="p-4">
              {editingId === subject.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Subject Name</Label>
                      <Input
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject Code</Label>
                      <Input
                        value={editForm.code || ""}
                        onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Teacher</Label>
                      <Input
                        value={editForm.teacher || ""}
                        onChange={(e) => setEditForm({ ...editForm, teacher: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Required %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.requiredPercentage || 75}
                        onChange={(e) =>
                          setEditForm({ ...editForm, requiredPercentage: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} size="sm" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" size="sm" className="flex-1">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {subject.code} • {subject.teacher}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {subject.attendedClasses}/{subject.totalClasses} classes attended •{" "}
                      {subject.totalClasses > 0
                        ? Math.round((subject.attendedClasses / subject.totalClasses) * 100)
                        : 0}
                      % attendance
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(subject)}
                      className="hover:bg-primary/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(subject.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No subjects added yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Click "Add New Subject" to get started.
          </p>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{subjects.find((s) => s.id === deleteId)?.name}" and all
              its attendance data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
