// Language detection by file extension
const detectLanguage = (filePath) => {
  const ext = filePath.split(".").pop().toLowerCase();
  const langMap = {
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    kt: "kotlin",
    kts: "kotlin",
    go: "go",
    rs: "rust",
    rb: "ruby",
    php: "php",
    cs: "csharp",
    cpp: "cpp",
    c: "c",
    swift: "swift",
    scala: "scala",
    dart: "dart",
  };
  return langMap[ext] || "generic";
};

// Chunk JS/TS by top-level function and class declarations
const chunkByJSBoundaries = (
  lines,
  filePath,
  language,
  repo,
  maxChunkSize = 1500,
) => {
  const chunks = [];
  // Patterns that signal the start of a new logical unit
  const boundaryRe =
    /^(export\s+)?(default\s+)?(async\s+)?(function\s+\w+|class\s+\w+|const\s+\w+\s*=\s*(async\s+)?\(|const\s+\w+\s*=\s*async\s+\w+|module\.exports)/;

  let currentChunk = [];
  let currentLength = 0;

  const pushChunk = () => {
    if (currentChunk.length > 0) {
      chunks.push({
        filePath,
        content: currentChunk.join("\n"),
        language,
        repo,
      });
      currentChunk = [];
      currentLength = 0;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLength = line.length + 1;
    const isBoundary = boundaryRe.test(line.trim());

    // Start a new chunk at a boundary if current one has grown enough
    if (isBoundary && currentLength > maxChunkSize / 2) {
      pushChunk();
    }
    // Force split even in middle of code if chunk is too large
    if (currentLength + lineLength > maxChunkSize && currentChunk.length > 0) {
      pushChunk();
    }

    currentChunk.push(line);
    currentLength += lineLength;
  }
  pushChunk();
  return chunks;
};

// Chunk Python by def/class boundaries
const chunkByPythonBoundaries = (
  lines,
  filePath,
  language,
  repo,
  maxChunkSize = 1500,
) => {
  const chunks = [];
  const boundaryRe = /^(def |class |async def )/;

  let currentChunk = [];
  let currentLength = 0;

  const pushChunk = () => {
    if (currentChunk.length > 0) {
      chunks.push({
        filePath,
        content: currentChunk.join("\n"),
        language,
        repo,
      });
      currentChunk = [];
      currentLength = 0;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLength = line.length + 1;
    const isBoundary = boundaryRe.test(line);

    if (isBoundary && currentLength > maxChunkSize / 2) {
      pushChunk();
    }
    if (currentLength + lineLength > maxChunkSize && currentChunk.length > 0) {
      pushChunk();
    }

    currentChunk.push(line);
    currentLength += lineLength;
  }
  pushChunk();
  return chunks;
};

// Chunk Java/Kotlin by method/class boundaries
const chunkByJavaBoundaries = (
  lines,
  filePath,
  language,
  repo,
  maxChunkSize = 1500,
) => {
  const chunks = [];
  const boundaryRe =
    /^\s*(public|private|protected|static|final|abstract|override|fun |class |interface |@Override)/;

  let currentChunk = [];
  let currentLength = 0;

  const pushChunk = () => {
    if (currentChunk.length > 0) {
      chunks.push({
        filePath,
        content: currentChunk.join("\n"),
        language,
        repo,
      });
      currentChunk = [];
      currentLength = 0;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLength = line.length + 1;
    const isBoundary = boundaryRe.test(line);

    if (isBoundary && currentLength > maxChunkSize / 2) {
      pushChunk();
    }
    if (currentLength + lineLength > maxChunkSize && currentChunk.length > 0) {
      pushChunk();
    }

    currentChunk.push(line);
    currentLength += lineLength;
  }
  pushChunk();
  return chunks;
};

// Generic character-based chunker with overlap (for all other languages)
const chunkFile = (
  content,
  maxChunkSize = 1000,
  overlap = 200,
  filePath,
  language = "generic",
  repo = "",
) => {
  const chunks = [];
  const lines = content.split("\n");

  let currentChunk = [];
  let currentLength = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLength = line.length + 1;

    if (currentLength + lineLength > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        filePath,
        content: currentChunk.join("\n"),
        language,
        repo,
      });

      let overlapLength = 0;
      let overlapLines = [];
      for (let j = currentChunk.length - 1; j >= 0; j--) {
        const prevLineLength = currentChunk[j].length + 1;
        if (overlapLength + prevLineLength > overlap) break;
        overlapLines.unshift(currentChunk[j]);
        overlapLength += prevLineLength;
      }

      currentChunk = [...overlapLines, line];
      currentLength = overlapLength + lineLength;
    } else {
      currentChunk.push(line);
      currentLength += lineLength;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({ filePath, content: currentChunk.join("\n"), language, repo });
  }

  return chunks;
};

// Main dispatcher: picks the right chunker based on language
const chunkFileByLanguage = (content, filePath, repo) => {
  const language = detectLanguage(filePath);
  const lines = content.split("\n");

  switch (language) {
    case "javascript":
    case "typescript":
      return chunkByJSBoundaries(lines, filePath, language, repo);
    case "python":
      return chunkByPythonBoundaries(lines, filePath, language, repo);
    case "java":
    case "kotlin":
    case "scala":
      return chunkByJavaBoundaries(lines, filePath, language, repo);
    default:
      return chunkFile(content, 1000, 200, filePath, language, repo);
  }
};

const buildChunk = async (owner, repo, getRepoFiles, getFileContent) => {
  try {
    const files = await getRepoFiles(owner, repo);
    const allChunks = [];
    const repoId = `${owner}/${repo}`;

    for (const file of files) {
      const content = await getFileContent(owner, repo, file.path);
      const chunks = chunkFileByLanguage(content, file.path, repoId);
      allChunks.push(...chunks);
    }

    return allChunks;
  } catch (error) {
    console.log(error);
  }
};

export { buildChunk, chunkFile, chunkFileByLanguage, detectLanguage };
