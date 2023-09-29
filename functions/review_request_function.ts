import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const APPROVE_ID = "approve_request";
export const DENY_ID = "deny_request";

export const ReviewRequestDefinition = DefineFunction({
  callback_id: "review_request_function",
  title: "Review a mobile request",
  description:
    "Sends a message to the admin within a thread to approve or deny a request",
  source_file: "functions/review_request_function.ts",
  input_parameters: {
    properties: {
      manager: {
        type: Schema.slack.types.user_id,
        description: "The user's manager",
      },
      requester: {
        type: Schema.slack.types.user_id,
        description: "The requesting user",
      },
      last_upgrade: {
        type: Schema.types.string,
        description: "The date of the last upgrade of a user's mobile device",
      },
      mobile_device: {
        type: Schema.types.string,
        description: "The mobile device of the user",
      },
    },
    required: ["manager", "requester", "mobile_device", "last_upgrade"],
  },
  output_parameters: {
    properties: {
      approval_message: {
        type: Schema.types.string,
        description: "Approval message",
      },
    },
    required: ["approval_message"],
  },
});

export default SlackFunction(
  ReviewRequestDefinition,
  async ({ inputs, client }) => {
    const blocks = [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text":
          `<@${inputs.requester}> is requesting a new ${inputs.mobile_device}, their last upgrade was ${inputs.last_upgrade}`,
      },
    }, {
      "type": "actions",
      "block_id": "approve-deny-buttons",
      "elements": [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Approve",
          },
          action_id: APPROVE_ID,
          style: "primary",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Deny",
          },
          action_id: DENY_ID,
          style: "danger",
        },
      ],
    }];

    const postResponse = await client.chat.postMessage({
      blocks: blocks,
      channel: inputs.manager,
    });

    if (!postResponse.ok) {
      console.log("Error pulling from database!", postResponse.error);
    }

    return { completed: false };
  },
).addBlockActionsHandler(
  [APPROVE_ID, DENY_ID],
  async function ({ action, body, client }) {
    console.log("Incoming action handler invocation", action);

    const approved = action.action_id === APPROVE_ID;

    let approval_message;

    if (approved) {
      approval_message =
        ":white_check_mark: Your request was approved! You'll be sent a new device soon.";
    } else {
      approval_message = ":x: I'm afraid that your request was denied.";
    }

    // (OPTIONAL) Update the manager's message to remove the buttons and reflect the approval state.
    const msgUpdate = await client.chat.update({
      channel: body.container.channel_id,
      ts: body.container.message_ts,
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text":
              `<@${body.function_data.inputs.requester}> is requesting a new ${body.function_data.inputs.mobile_device}, their last upgrade was ${body.function_data.inputs.last_upgrade}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `${
                approved
                  ? " :white_check_mark: You approved the request."
                  : ":x: You denied the request."
              }`,
            },
          ],
        },
      ],
    });

    if (!msgUpdate.ok) {
      console.log("Error during manager chat.update!", msgUpdate.error);
    }

    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs: { approval_message: approval_message },
    });
  },
);
