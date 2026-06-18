import {
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
} from "../constants/operatingHours";

import type {
  OperatingHourRow,
} from "../types/operatingHours";

export function completeOperatingHours(
  operatingHours: OperatingHourRow[],
): OperatingHourRow[] {
  return Array.from(
    { length: 7 },
    (_, dayOfWeek) => {
      const matched =
        operatingHours.find(
          (item) =>
            item.dayOfWeek === dayOfWeek,
        );

      if (matched) {
        return {
          dayOfWeek: matched.dayOfWeek,
          openTime: matched.openTime,
          closeTime: matched.closeTime,
          isClosed: matched.isClosed,
        };
      }

      return {
        dayOfWeek,
        openTime: DEFAULT_OPEN_TIME,
        closeTime: DEFAULT_CLOSE_TIME,
        isClosed: false,
      };
    },
  );
}
