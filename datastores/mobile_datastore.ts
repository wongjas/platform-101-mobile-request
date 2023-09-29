import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/**
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/automation/datastores
 */
const MobileDatastore = DefineDatastore({
  name: "MobileDevices",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    user: {
      type: Schema.types.string,
    },
    mobile_device: {
      type: Schema.types.string,
    },
    last_upgrade: {
      type: Schema.types.string,
    },
  },
});

export default MobileDatastore;
