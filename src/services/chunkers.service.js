const buildChunk = async (owner, repo, getRepoFiles, getFileContent) => {
  try {
    const files = await getRepoFiles(owner, repo);
    const allChunks = [];

    for (const file of files) {
      const content = await getFileContent(owner, repo, file.path);
      const chunks = chunkFile(content, 30, file.path);
      allChunks.push(...chunks);
    }

    return allChunks;
  } catch (error) {
    console.log(error);
  }
};

const chunkFile = (content, chunkSize = 30, filePath) => {
  const chunks = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunk = lines.slice(i, i + chunkSize);
    chunks.push({
      filePath,
      content: chunk.join("\n"),
    });
  }
  return chunks;
};

export { buildChunk, chunkFile };
