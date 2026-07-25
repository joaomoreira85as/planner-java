import { manualPublisher } from "./manual";
import { instagramGraphPublisher } from "./instagram-graph";
import type { Publisher } from "./types";

export type { Publisher, PublishResult } from "./types";

export const PUBLISHERS: Publisher[] = [manualPublisher, instagramGraphPublisher];

/** Publisher ativo: Graph API quando configurada; caso contrário, fluxo manual. */
export function getPublisher(): Publisher {
  return instagramGraphPublisher.isConfigured()
    ? instagramGraphPublisher
    : manualPublisher;
}
