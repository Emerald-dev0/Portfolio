import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";

type HugeiconsProps = ComponentProps<typeof HugeiconsIcon>;

/**
 * ICON, a thin wrapper over Hugeicons so every icon on the site shares one
 * size/stroke language. Icon glyphs come from @hugeicons/core-free-icons
 * (e.g. `import { ArrowRight01Icon } from "@hugeicons/core-free-icons"`).
 * To swap the set, change the imports at the call sites, nothing else.
 */
export function Icon({
  icon,
  size = 20,
  strokeWidth = 2,
  className = "",
}: {
  icon: HugeiconsProps["icon"];
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
