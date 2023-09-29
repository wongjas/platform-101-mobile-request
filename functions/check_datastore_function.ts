import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import MobileDatastore from "../datastores/mobile_datastore.ts";

export const GetMobileDeviceDefinition = DefineFunction({
  callback_id: "check_datastore_function",
  title: "Check mobile database",
  description: "Check internal database for a user's mobile information.",
  source_file: "functions/check_datastore_function.ts",
  input_parameters: {
    properties: {
      user: {
        type: Schema.types.string,
        description: "User id of requestor.",
      },
    },
    required: ["user"],
  },
  output_parameters: {
    properties: {
      last_upgrade: {
        type: Schema.types.string,
        description: "The last time the user had a device upgrade.",
      },
      mobile_device: {
        type: Schema.types.string,
        description: "The user's current mobile device",
      },
    },
    required: ["mobile_device", "last_upgrade"],
  },
});

export default SlackFunction(
  GetMobileDeviceDefinition,
  async ({ inputs, client }) => {
    const queryResp = await client.apps.datastore.query<
      typeof MobileDatastore.definition
    >(
      {
        datastore: MobileDatastore.name,
        expression: "#user = :user",
        expression_attributes: { "#user": "user" },
        expression_values: { ":user": inputs.user },
      },
    );

    console.log("Datastore response", queryResp);

    if (!queryResp.ok) {
      console.error("Error pulling from database!", queryResp.error);
    }

    let mobile_device;
    let last_upgrade;

    // For demonstration purposes, you'll need to seed the database manually through the CLI.
    // This step displays "N/A" so that the workflow doesn't break.
    if (queryResp.items.length === 0) {
      mobile_device = "N/A";
      last_upgrade = "N/A";
    } else {
      const item = queryResp.items[0];

      mobile_device = item.mobile_device;
      last_upgrade = item.last_upgrade;
    }

    return {
      outputs: {
        mobile_device: mobile_device,
        last_upgrade: last_upgrade,
      },
    };
  },
);
