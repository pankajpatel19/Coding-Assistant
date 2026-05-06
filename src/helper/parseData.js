export const parseRepoUrl = (repoUrl) => {
  const url = new URL(repoUrl);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts.length < 2) {
    throw new Error("Invalid GitHub URL");
  }

  return {
    owner: parts[0],
    repo: parts[1],
  };
};
