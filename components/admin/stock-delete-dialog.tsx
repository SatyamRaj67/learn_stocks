"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface StockDeleteDialogProps {
  stock: Stock | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (stock: Stock, forceDelete: boolean) => void;
  isDeleting: boolean;
  hasRelatedData?: boolean;
}

export function StockDeleteDialog({
  stock,
  open,
  onClose,
  onConfirm,
  isDeleting,
  hasRelatedData = false,
}: StockDeleteDialogProps) {
  const [confirmation, setConfirmation] = useState("");

  const handleClose = () => {
    setConfirmation("");
    onClose();
  };

  const handleConfirm = () => {
    if (!stock) return;

    if (confirmation === stock.symbol) {
      // Always force delete when this dialog is shown
      onConfirm(stock, true);
    } else {
      toast.error("Symbol doesn't match. Deletion cancelled.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle
              size={18}
              className="text-red-600"
            />
            Force Delete Required
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-bold">{stock?.name}</span> and all associated
            data.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Warning about related data */}
          <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
            <p className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle
                size={16}
                className="mt-0.5 flex-shrink-0"
              />
              <span>
                This stock has related positions or transactions.
                <strong className="block mt-1">
                  Force deletion will permanently remove all related data.
                </strong>
              </span>
            </p>
          </div>

          <p className="mb-2 text-sm font-medium">
            To confirm, type{" "}
            <span className="font-semibold">{stock?.symbol}</span> below:
          </p>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={stock?.symbol}
            className="mt-1"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleConfirm}
            disabled={confirmation !== stock?.symbol || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2
                  size={14}
                  className="mr-1 animate-spin"
                />
                Deleting...
              </>
            ) : (
              "Force Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
