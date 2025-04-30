
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { exportUserData, importUserData, getExportFilename, downloadJson } from "@/utils/dataExport";
import { Download, Upload } from "lucide-react";

interface DataImportExportProps {
  onDataUpdated?: () => void;
}

export const DataImportExport = ({ onDataUpdated }: DataImportExportProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!user) return;
    
    const jsonData = exportUserData(user.id);
    const filename = getExportFilename();
    downloadJson(jsonData, filename);
    
    toast({
      title: t("exportSuccessful"),
      description: t("dataExportedToFile"),
    });
    
    setIsDialogOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importUserData(user.id, content);
      
      if (success) {
        toast({
          title: t("importSuccessful"),
          description: t("dataImportedSuccessfully"),
        });
        
        // Call the callback to refresh data if provided
        if (onDataUpdated) {
          onDataUpdated();
        }
      } else {
        toast({
          title: t("importFailed"),
          description: t("invalidFileFormat"),
          variant: "destructive",
        });
      }
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setIsDialogOpen(false);
    };
    
    reader.onerror = () => {
      toast({
        title: t("importFailed"),
        description: t("errorReadingFile"),
        variant: "destructive",
      });
    };
    
    reader.readAsText(file);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="gap-1"
        onClick={() => setIsDialogOpen(true)}
      >
        <Download className="h-4 w-4" />
        {t("importExport")}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dataImportExport")}</DialogTitle>
            <DialogDescription>
              {t("exportImportDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <Button 
              onClick={handleExport} 
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t("exportData")}
            </Button>
            
            <Button 
              onClick={handleImportClick} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {t("importData")}
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              {t("closeDialog")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
