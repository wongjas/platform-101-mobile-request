import { Manifest } from "deno-slack-sdk/mod.ts";
import MobileDatastore from "./datastores/mobile_datastore.ts";
import { ReviewRequestDefinition } from "./functions/review_request_function.ts";
import { GetMobileDeviceDefinition } from "./functions/check_datastore_function.ts";

export default Manifest({
  name: "mobile-request-functions",
  description:
    "A set of functions to interact with an internal datastore of mobile devices.",
  icon: "assets/default_new_app_icon.png",
  workflows: [],
  outgoingDomains: [],
  datastores: [MobileDatastore],
  functions: [GetMobileDeviceDefinition, ReviewRequestDefinition],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
  ],
});
