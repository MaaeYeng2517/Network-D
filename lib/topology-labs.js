// Map device types to related practical labs (by lab number in PRACTICALS).
import { PRACTICALS } from "./course/meta";

export const DEVICE_LABS = {
  pc: [1, 2, 3, 6, 10, 14],
  laptop: [1, 3, 10, 14],
  server: [1, 9, 11, 15],
  switch: [1, 4, 5, 13, 15],
  router: [1, 5, 13, 15],
  hub: [1, 3],
  ap: [1, 4, 15],
  firewall: [5, 13, 15],
  modem: [1, 15],
  cloud: [1, 5, 7, 15],
};

export function labsForDevice(type) {
  const nums = DEVICE_LABS[type] || [];
  return nums
    .map((n) => PRACTICALS.find((p) => p.n === n))
    .filter(Boolean);
}