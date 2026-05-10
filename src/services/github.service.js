import { octokit } from "../config/octokit.js";

async function getFileContent(owner, repo, path) {
  const { data } = await octokit.repos.getContent({ owner, repo, path });
  const decodedFile = Buffer.from(data.content, "base64").toString("utf-8");
  return decodedFile;
}

async function getRepoFiles(owner, repo) {
  try {
    const { data } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: "HEAD",
      recursive: 1,
    });

    const codeExt = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".html",
      ".css",
      ".json",
      ".xml",
      ".yml",
      ".yaml",
      ".md",
      ".sh",
      ".ps1",
      ".bat",
      ".cmd",
      ".go",
      ".rb",
      ".php",
      ".rs",
      ".swift",
      ".kt",
      ".kts",
      ".dart",
      ".lua",
      ".pl",
      ".pm",
      ".r",
      ".scala",
      ".hs",
      ".clj",
      ".ex",
      ".exs",
    ];

    const excludeFiles = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"];

    const excludeDirs = [
      "node_modules",
      "dist",
      "build",
      "coverage",
      ".git",
      ".next",
      "out",
      "target",
      "__pycache__",
      ".cache",
      ".parcel-cache",
      "vendor",
      "bin",
      "obj",
    ];

    const maxFileSize = 120 * 1024;

    const files = data.tree.filter((file) => {
      if (file.type !== "blob") return false;
      if (file.size && file.size > maxFileSize) return false;
      if (excludeFiles.some((ex) => file.path.endsWith(ex))) return false;
      if (excludeDirs.some((dir) => file.path.split("/").includes(dir)))
        return false;

      return codeExt.some((ext) => file.path.endsWith(ext));
    });

    return files;
  } catch (error) {
    console.log(error.status);
    console.log(error);
  }
}

export { getRepoFiles, getFileContent };
