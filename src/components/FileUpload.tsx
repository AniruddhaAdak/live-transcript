import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
}

const FileUpload = ({ onFileSelected }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "audio/mpeg") {
      onFileSelected(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload an MP3 file.",
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "audio/mpeg") {
      onFileSelected(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload an MP3 file.",
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 sm:p-12
          transition-all duration-300 animate-scale-in
          ${isDragging ? 'border-primary bg-primary/10' : 'border-primary/20'}
          hover:border-primary hover:bg-primary/5
          bg-white/50 backdrop-blur-sm
          dark:bg-gray-800/50 dark:border-primary/30
          min-h-[200px] sm:min-h-[250px] flex items-center justify-center
          mx-auto
        `}
      >
        <input
          type="file"
          accept="audio/mpeg"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-4 text-primary/80 text-center">
          <Upload className="w-8 h-8 sm:w-12 sm:h-12 animate-bounce" />
          <p className="text-base sm:text-lg font-['Poppins'] px-4">
            Drag and drop an MP3 file or click to browse
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;