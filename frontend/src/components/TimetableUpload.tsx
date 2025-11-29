import { useState, useRef } from "react";
import { Upload, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseTimetableImage, validateTimetableFile, ParsedTimetable } from "@/lib/timetableParser";
import { toast } from "sonner";

interface TimetableUploadProps {
  onUploadComplete: (data: ParsedTimetable) => void;
  onCancel?: () => void;
}

export function TimetableUpload({ onUploadComplete, onCancel }: TimetableUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const validation = validateTimetableFile(file);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploadedFile(file);
    setUploading(true);

    try {
      const parsedData = await parseTimetableImage(file);
      toast.success("Timetable parsed successfully!");
      onUploadComplete(parsedData);
    } catch (error) {
      toast.error("Failed to parse timetable. Please try again.");
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-6">
      <div
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center space-y-4 transition-all
          ${dragActive ? "border-primary bg-primary/5" : "border-muted"}
          ${!uploading && !uploadedFile ? "hover:border-primary cursor-pointer" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!uploading && !uploadedFile ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/jpg,application/pdf"
          onChange={handleChange}
          disabled={uploading || !!uploadedFile}
        />

        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          {uploading ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : uploadedFile ? (
            <Check className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </div>

        <div>
          {uploading ? (
            <>
              <p className="font-medium mb-1">Processing timetable...</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </>
          ) : uploadedFile ? (
            <>
              <p className="font-medium mb-1">Timetable uploaded successfully!</p>
              <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
            </>
          ) : (
            <>
              <p className="font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">PNG, JPG or PDF (max. 10MB)</p>
            </>
          )}
        </div>

        {!uploading && !uploadedFile && (
          <Button type="button" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
            Select File
          </Button>
        )}

        {uploadedFile && !uploading && onCancel && (
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedFile(null);
                onCancel();
              }}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
