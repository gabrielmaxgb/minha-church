export type GivingFundAudiencePartition = "public" | "members";

export function partitionGivingFundsByAudience<
  T extends { audience: GivingFundAudiencePartition },
>(funds: T[]): { publicFunds: T[]; memberFunds: T[] } {
  const publicFunds: T[] = [];
  const memberFunds: T[] = [];

  for (const fund of funds) {
    if (fund.audience === "public") {
      publicFunds.push(fund);
    } else {
      memberFunds.push(fund);
    }
  }

  return { publicFunds, memberFunds };
}
