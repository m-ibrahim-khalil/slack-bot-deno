import { Manifest } from "deno-slack-sdk/mod.ts";
import { def as configure } from "./functions/configure.ts";
import { def as detectLang } from "./functions/detect_lang.ts";
import { def as translate } from "./functions/translate.ts";
import configurator from "./workflows/configurator.ts";
import reacjilator from "./workflows/reacjilator.ts";

/**
 * DeepL Translator app translates Slack messages in channels.
 * During the open beta period, only public channels are supported.
 * To run this app, DeepL API account is required.
 * Refer to https://www.deepl.com/en/docs-api for DeepL API details.
 */

export default Manifest({
  name: "message-translator-bot",
  description: "A Slack app translates Slack messages",
  icon: "assets/default_new_app_icon.png",
  functions: [
    detectLang,
    translate,
    configure,
  ],
  workflows: [
    reacjilator,
    configurator,
  ],

  features: {
    appHome: {
      messagesTabEnabled: true,
      messagesTabReadOnlyEnabled: true,
      homeTabEnabled: true,
    },
    botUser: {
      displayName: "Message Translator",
      alwaysOnline: true,
    },
  },

  botScopes: [
    "commands",
    "chat:write",
    "chat:write.customize",
    "chat:write.public",

    "channels:history",
    "channels:join",
    "channels:read",

    "groups:history",
    "groups:read",
    "groups:write",

    "triggers:read",
    "triggers:write",

    "mpim:history",
    "mpim:read",
    "mpim:write",

    "im:history",
    "im:read",
    "im:write",
  ],
});
