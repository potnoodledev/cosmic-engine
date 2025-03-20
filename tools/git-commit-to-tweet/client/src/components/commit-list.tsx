import { useQuery, useMutation } from "@tanstack/react-query";
import type { Commit } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, GitCommit, ExternalLink, Twitter, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { TweetPreviewDialog } from "./tweet-preview-dialog";

export function CommitList() {
  const { toast } = useToast();
  const [previewData, setPreviewData] = useState<{
    isOpen: boolean;
    text: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    text: "",
    onConfirm: () => {},
  });

  const {
    data: commits,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery<Commit[]>({
    queryKey: ["commits"],
    queryFn: async () => {
      const res = await fetch("/api/commits", {
        credentials: "include"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    }
  });

  const tweetMutation = useMutation({
    mutationFn: async (commit: Commit) => {
      const res = await fetch("/api/tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: commit.message,
          repository: commit.repository,
          url: commit.url
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tweet posted successfully!",
        description: "Your commit has been shared on Twitter."
      });
      setPreviewData(prev => ({ ...prev, isOpen: false }));
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to post tweet",
        description: error.message
      });
    }
  });

  const aiTweetMutation = useMutation({
    mutationFn: async (commit: Commit) => {
      const res = await fetch("/api/tweet/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: commit.message,
          repository: commit.repository,
          author: commit.author
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Tweet posted successfully!",
        description: `Tweet posted: "${data.generatedText}"`
      });
      setPreviewData(prev => ({ ...prev, isOpen: false }));
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to generate AI tweet",
        description: error.message
      });
    }
  });

  const handleTweet = (commit: Commit) => {
    const tweetText = `${commit.message}\n\nFrom ${commit.repository}\n${commit.url}`;
    setPreviewData({
      isOpen: true,
      text: tweetText,
      onConfirm: () => tweetMutation.mutate(commit)
    });
  };

  const handleAITweet = async (commit: Commit) => {
    try {
      // First, get the AI-generated tweet preview
      const res = await fetch("/api/tweet/ai?preview=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: commit.message,
          repository: commit.repository,
          author: commit.author
        })
      });

      if (!res.ok) {
        throw new Error("Failed to generate tweet");
      }

      const data = await res.json();

      // Show preview dialog with the generated text
      setPreviewData({
        isOpen: true,
        text: data.generatedText,
        onConfirm: () => aiTweetMutation.mutate(commit) // Only post after confirmation
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to generate tweet",
        description: error.message
      });
    }
  };

  useEffect(() => {
    if (isError) {
      toast({
        variant: "destructive",
        title: "Error fetching commits",
        description: (error as Error).message
      });
    }
  }, [isError, error, toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {commits?.map((commit) => (
          <div key={commit.sha} className="flex items-start gap-4 p-4 rounded-lg border">
            <GitCommit className="h-5 w-5 mt-1 text-muted-foreground" />

            <div className="flex-1 space-y-1">
              <div className="font-medium text-sm text-muted-foreground mb-1">
                {commit.repository}
              </div>
              <p className="font-medium break-words">{commit.message}</p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{commit.author}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(commit.timestamp))} ago</span>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTweet(commit)}
                    disabled={tweetMutation.isPending}
                  >
                    <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAITweet(commit)}
                    disabled={aiTweetMutation.isPending}
                    title="Generate AI Tweet"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </Button>
                  <a
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TweetPreviewDialog
        isOpen={previewData.isOpen}
        onClose={() => setPreviewData(prev => ({ ...prev, isOpen: false }))}
        onConfirm={previewData.onConfirm}
        tweetText={previewData.text}
        isLoading={tweetMutation.isPending || aiTweetMutation.isPending}
      />
    </div>
  );
}