import { users, type User, type InsertUser, type Transcription, type InsertTranscription } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transcription methods
  getTranscription(id: string): Promise<Transcription | undefined>;
  createTranscription(transcription: Partial<InsertTranscription>): Promise<Transcription>;
  updateTranscription(id: string, data: Partial<Transcription>): Promise<Transcription>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transcriptions: Map<string, Transcription>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.transcriptions = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getTranscription(id: string): Promise<Transcription | undefined> {
    return this.transcriptions.get(id);
  }
  
  async createTranscription(data: Partial<InsertTranscription>): Promise<Transcription> {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const transcription: Transcription = {
      id,
      sourceUrl: data.sourceUrl || '',
      title: data.title || 'Untitled Transcription',
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.transcriptions.set(id, transcription);
    return transcription;
  }
  
  async updateTranscription(id: string, data: Partial<Transcription>): Promise<Transcription> {
    const transcription = await this.getTranscription(id);
    
    if (!transcription) {
      throw new Error(`Transcription with ID ${id} not found`);
    }
    
    const updatedTranscription: Transcription = {
      ...transcription,
      ...data,
      updatedAt: new Date()
    };
    
    this.transcriptions.set(id, updatedTranscription);
    return updatedTranscription;
  }
}

export const storage = new MemStorage();
