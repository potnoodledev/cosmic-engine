import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TweetPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tweetText: string;
  isLoading: boolean;
}

export function TweetPreviewDialog({
  isOpen,
  onClose,
  onConfirm,
  tweetText,
  isLoading
}: TweetPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preview Tweet</DialogTitle>
          <DialogDescription>
            Review your tweet before posting
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 p-4 rounded-lg border bg-muted/50">
          <p className="whitespace-pre-wrap">{tweetText}</p>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Posting..." : "Post Tweet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
