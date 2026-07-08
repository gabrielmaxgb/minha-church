export interface MinistryNeedsFunctionsNotification {
  ministryId: string;
  ministryName: string;
}

export interface MinistryCatalogUpdateNotification {
  ministryId: string;
  ministryName: string;
  updatedAt: string;
}

export interface MyMinistryNotifications {
  needsFunctions: MinistryNeedsFunctionsNotification[];
  catalogUpdates: MinistryCatalogUpdateNotification[];
  summary: {
    needsFunctionsCount: number;
    catalogUpdatesCount: number;
    totalCount: number;
  };
}
