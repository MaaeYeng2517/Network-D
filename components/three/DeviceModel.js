"use client";

import RouterModel from "./models/RouterModel";
import SwitchModel from "./models/SwitchModel";
import HubModel from "./models/HubModel";
import RackServerModel from "./models/RackServerModel";
import TowerServerModel from "./models/TowerServerModel";
import WifiRouterModel from "./models/WifiRouterModel";
import { BoxModel, LaptopModel, CloudModel } from "./models/OtherDeviceModel";

const ARCHETYPES = {
  box: BoxModel,
  switch: SwitchModel,
  router: RouterModel,
  server: RackServerModel,
  tower: TowerServerModel,
  laptop: LaptopModel,
  ap: WifiRouterModel,
  cloud: CloudModel,
  hub: HubModel,
};

export default function DeviceModel(props) {
  const { device, exploded, registerPort, onPortClick, devColor, devScale } = props;
  const Comp = ARCHETYPES[device.archetype] || BoxModel;
  return (
    <group scale={devScale}>
      <Comp {...props} exploded={exploded} registerPort={registerPort} onPortClick={onPortClick} devColor={devColor} />
    </group>
  );
}

export { RouterModel, SwitchModel, HubModel, RackServerModel, TowerServerModel, WifiRouterModel, BoxModel, LaptopModel, CloudModel };
