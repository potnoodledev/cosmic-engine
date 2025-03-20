import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { repoSchema, type Repo } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RepoSelectorProps {
  onRepoSelect: (repo: Repo) => void;
}

export function RepoSelector({ onRepoSelect }: RepoSelectorProps) {
  const form = useForm<Repo>({
    resolver: zodResolver(repoSchema),
    defaultValues: {
      owner: "",
      name: ""
    }
  });

  function onSubmit(data: Repo) {
    onRepoSelect(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 items-end">
        <FormField
          control={form.control}
          name="owner"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Repository Owner</FormLabel>
              <FormControl>
                <Input placeholder="e.g. facebook" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Repository Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. react" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          View Commits
        </Button>
      </form>
    </Form>
  );
}
