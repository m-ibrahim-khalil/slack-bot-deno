import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";
import { isDebugMode } from "./internals/debug_mode.ts";

export const def = DefineFunction({
  callback_id: "translate",
  title: "Post the translation of given message as a reply in its thread",
  source_file: "functions/translate.ts",
  input_parameters: {
    properties: {
      channelId: { type: Schema.types.string },
      messageTs: { type: Schema.types.string },
      lang: { type: Schema.types.string },
    },
    required: ["channelId", "messageTs"],
  },
  output_parameters: {
    properties: { ts: { type: Schema.types.string } },
    required: [],
  },
});

export default SlackFunction(def, async ({ inputs, client, env }) => {
  const debugMode = isDebugMode(env);
  console.log(`translate inputs: ${JSON.stringify(inputs)}`);
  if (debugMode) {
    console.log(`translate inputs: ${JSON.stringify(inputs)}`);
  }
  const emptyOutputs = { outputs: {} };
  if (inputs.lang === undefined) {
    // no language specified by the reaction
    console.log("Skipped as no lang detected");
    return emptyOutputs; // this is not an error
  }
  // Fetch the target message to translate
  const translationTargetResponse = await client.conversations.replies({
    channel: inputs.channelId,
    ts: inputs.messageTs,
    limit: 1,
    inclusive: true,
  });
  if (debugMode) {
    console.log(
      `Find the target: ${JSON.stringify(translationTargetResponse)}`,
    );
  }

  if (translationTargetResponse.error) {
    // If you see this log message, perhaps you need to invite this app to the channel
    const error =
      `Failed to fetch the message due to ${translationTargetResponse.error}. Perhaps, you need to invite this app's bot user to the channel.`;
    console.log(error);
    return { error };
  }

  if (translationTargetResponse.messages.length == 0) {
    console.log("No message found");
    return emptyOutputs; // this is not an error
  }
  const translationTarget = translationTargetResponse.messages[0];
  const translationTargetThreadTs = translationTarget.thread_ts;
  const translatedText = "This is a test translation: " +
    inputs.lang.toUpperCase() + "--> " + translationTarget.text;

  const result = await sayInThread(
    client,
    inputs.channelId,
    translationTargetThreadTs ?? inputs.messageTs,
    translatedText,
  );
  // send a dm to the user who posted the original message
  if (translationTarget.user) {
    await client.chat.postMessage({
      channel: translationTarget.user,
      text:
        `This is a test translation: ${inputs.lang.toUpperCase()}--> ${translationTarget.text}`,
    });
  }

  return { outputs: { ts: result.ts } };
});

// ---------------------------
// Internal functions
// ---------------------------

async function sayInThread(
  client: SlackAPIClient,
  channelId: string,
  threadTs: string,
  text: string,
) {
  return await client.chat.postMessage({
    channel: channelId,
    text,
    thread_ts: threadTs,
  });
}
