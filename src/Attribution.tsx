import { FC } from "react";

export const Attribution: FC = () => (
  <div className="mt-auto px-0 pt-6 pb-4 text-xs opacity-60">
    Copyright © 2025 Alden Laslett - Available for use free of charge without
    warranty under{" "}
    <a
      href="https://github.com/alden12/player-pack-generator/blob/master/LICENSE"
      target="_blank"
      rel="noreferrer"
    >
      MIT License
    </a>
    . <span className="version">v{__APP_VERSION__}</span>
  </div>
);
