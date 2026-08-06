import { db } from "../client";

export type DbExecutor = typeof db;

export class BaseRepository {
  constructor(protected readonly executor: DbExecutor = db) {}
}
