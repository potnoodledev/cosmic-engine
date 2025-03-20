import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommitList } from "@/components/commit-list";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Your Recent GitHub Commits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CommitList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}