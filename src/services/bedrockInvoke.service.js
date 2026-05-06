import { client } from "../config/aws.js";
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const modelId = "us.amazon.nova-micro-v1:0";

async function invokeBedrock(history) {
  const messages = history.map((item) => {
    if (item.role === "user") {
      return {
        role: "user",
        content: [
          {
            text: `Here is relevant code from the codebase:\n${item.context}\n\nQuestion: ${item.question}`,
          },
        ],
      };
    }
    return {
      role: "assistant",
      content: [
        {
          text:
            typeof item.answer === "object"
              ? JSON.stringify(item.answer)
              : item.answer,
        },
      ],
    };
  });

  const payload = {
    messages,
    system: [
      {
        text: `You are an expert AI software engineer. 
You help developers understand codebases by answering questions based on the provided code context.
If the answer is not in the context, say 'I cannot find the answer in the provided code.' Do not guess.
If the user asks a follow-up question, use the previous conversation and context to formulate your answer.`,
      },
    ],
    inferenceConfig: {
      maxTokens: 2000,
      temperature: 0.2,
    },
    toolConfig: {
      toolChoice: {
        tool: { name: "CodeAnswer" },
      },
      tools: [
        {
          toolSpec: {
            name: "CodeAnswer",
            description:
              "Returns the structured answer for the user's codebase question",
            inputSchema: {
              json: {
                type: "object",
                properties: {
                  answer: {
                    type: "string",
                    description:
                      "The detailed explanation/answer to the user's question in Markdown format",
                  },
                  files_referenced: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "List of file paths from the context that were used to formulate the answer",
                  },
                },
                required: ["answer", "files_referenced"],
              },
            },
          },
        },
      ],
    },
  };

  const command = new InvokeModelCommand({
    modelId: modelId,
    accept: "application/json",
    contentType: "application/json",
    body: JSON.stringify(payload),
  });

  try {
    const res = await client.send(command);
    const result = JSON.parse(Buffer.from(res.body).toString("utf-8"));

    // Extracting the structured JSON output from the tool use
    return result.output.message.content[0].toolUse.input;
  } catch (error) {
    console.error("Bedrock Invoke Error:", error);
    throw error;
  }
}

export { invokeBedrock };
