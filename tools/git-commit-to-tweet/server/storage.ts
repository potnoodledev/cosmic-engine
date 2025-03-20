import { commits, type Commit, type InsertCommit } from "@shared/schema";

export interface IStorage {
  getAllCommits(): Promise<Commit[]>;
  saveCommits(commits: InsertCommit[]): Promise<void>;
  clearAllCommits(): Promise<void>;
}

export class MemStorage implements IStorage {
  private commits: Map<string, Commit>;

  constructor() {
    this.commits = new Map();
  }

  async getAllCommits(): Promise<Commit[]> {
    return Array.from(this.commits.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async saveCommits(newCommits: InsertCommit[]): Promise<void> {
    for (const commit of newCommits) {
      this.commits.set(commit.id, commit as Commit);
    }
  }

  async clearAllCommits(): Promise<void> {
    this.commits.clear();
  }
}

export const storage = new MemStorage();