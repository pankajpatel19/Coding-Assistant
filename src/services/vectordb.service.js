import { connect } from "vectordb";
import path from "path";

const DB_PATH = path.join(process.cwd(), ".lancedb");
const TABLE_NAME = "code_embeddings";
let db = null;
let table = null;

async function ConnectDB() {
  try {
    if (!db) {
      db = await connect(DB_PATH);
    }
    return db;
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
}
const saveChunks = async (chunks) => {
  try {
    const db = await ConnectDB();

    const record = chunks.map((chunk, idx) => ({
      id: `${idx}-${chunk.filePath}`,
      filePath: chunk.filePath,
      content: chunk.content,
      vector: chunk.embedding,
    }));
    const tableNames = await db.tableNames();

    if (!tableNames.includes(TABLE_NAME)) {
      table = await db.createTable(TABLE_NAME, record);
    } else {
      table = await db.openTable(TABLE_NAME);
      await table.add(record);
    }
  } catch (error) {
    console.error("Error saving chunks:", error);
    throw error;
  }
};

const searchChunks = async (embedding, k = 5) => {
  try {
    const db = await ConnectDB();

    if (!table) {
      const tableNames = await db.tableNames();
      if (!tableNames.includes(TABLE_NAME)) {
        throw new Error("index your repo first");
      }

      table = await db.openTable(TABLE_NAME);
    }
    const result = await table.search(embedding).limit(k).execute();

    return result.map((r) => ({
      filePath: r.filePath,
      content: r.content,
    }));
  } catch (error) {
    console.error("Error searching chunks:", error);
    throw error;
  }
};

const isIndexed = async (repoUrl) => {
  try {
    const db = await ConnectDB();
    const tableNames = await db.tableNames();
    return tableNames.includes(TABLE_NAME);
  } catch (error) {
    console.error("Error checking if indexed:", error);
    throw error;
  }
};

const clearTable = async () => {
  try {
    const db = await ConnectDB();
    const tableNames = await db.tableNames();
    if (tableNames.includes(TABLE_NAME)) {
      await db.dropTable(TABLE_NAME);
    }
    table = null;
  } catch (error) {
    console.error("Error clearing table:", error);
    throw error;
  }
};

export { isIndexed, searchChunks, saveChunks, clearTable };
