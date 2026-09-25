import type { CampaignTemplate } from '@narrator/shared';
import type { Db } from '../client';
import { BRINECROSS_TEMPLATE, createBrinecrossCampaign } from './demo';

interface TemplateDef extends CampaignTemplate {
  create: (db: Db, opts: { name: string; includeCharacter: boolean }) => Promise<string>;
}

/** Ready-made worlds a new campaign can start from. */
export const TEMPLATES: TemplateDef[] = [{ ...BRINECROSS_TEMPLATE, create: createBrinecrossCampaign }];
