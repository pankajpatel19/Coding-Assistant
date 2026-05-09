const buildChunk = async (owner, repo, getRepoFiles, getFileContent) => {
  try {
    const files = await getRepoFiles(owner, repo);
    const allChunks = [];

    for (const file of files) {
      const content = await getFileContent(owner, repo, file.path);
      const chunks = chunkFile(content, 1000, 200, file.path);
      allChunks.push(...chunks);
    }

    return allChunks;
  } catch (error) {
    console.log(error);
  }
};

const chunkFile = (content, maxChunkSize = 1000, overlap = 200, filePath) => {
  const chunks = [];
  const lines = content.split("\n");

  let currentChunk = [];
  let currentLength = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLength = line.length + 1; // +1 for the newline character

    if (currentLength + lineLength > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        filePath,
        content: currentChunk.join("\n"),
      });

      let overlapLength = 0;
      let overlapLines = [];
      for (let j = currentChunk.length - 1; j >= 0; j--) {
        const prevLineLength = currentChunk[j].length + 1;
        if (overlapLength + prevLineLength > overlap) {
          break;
        }
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
    chunks.push({
      filePath,
      content: currentChunk.join("\n"),
    });
  }

  return chunks;
};

export { buildChunk, chunkFile };
