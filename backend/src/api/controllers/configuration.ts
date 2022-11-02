import * as Configuration from "../../init/configuration";
import { TypesterResponse } from "../../utils/typester-response";
import { CONFIGURATION_FORM_SCHEMA } from "../../constants/base-configuration";

export async function getConfiguration(
  _req: Typester.Request
): Promise<TypesterResponse> {
  const currentConfiguration = await Configuration.getLiveConfiguration();
  return new MonkeyResponse("Configuration retrieved", currentConfiguration);
}

export async function getSchema(
  _req: Typester.Request
): Promise<TypesterResponse> {
  return new TypesterResponse(
    "Configuration schema retrieved",
    CONFIGURATION_FORM_SCHEMA
  );
}

export async function updateConfiguration(
  req: Typester.Request
): Promise<TypesterResponse> {
  const { configuration } = req.body;
  const success = await Configuration.patchConfiguration(configuration);

  if (!success) {
    return new TypesterResponse("Configuration update failed", {}, 500);
  }

  return new TypesterResponse("Configuration updated");
}
