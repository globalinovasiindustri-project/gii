import { db } from "@/lib/db/db";
import { appConfig } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { SettingsSchema } from "@/lib/validations/settings.validation";

export const appConfigService = {
  async getConfig() {
    const [config] = await db.select().from(appConfig).limit(1);
    return config;
  },

  async upsertConfig(data: SettingsSchema) {
    const existing = await this.getConfig();

    const configData = {
      heroImages: JSON.stringify(data.heroImages),
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      socialInstagram: data.socialInstagram || null,
      socialTiktok: data.socialTiktok || null,
      socialWhatsapp: data.socialWhatsapp || null,
      shippingOriginAddress: data.shippingOriginAddress,
      shippingOriginCity: data.shippingOriginCity,
      shippingOriginProvince: data.shippingOriginProvince,
      shippingOriginPostalCode: data.shippingOriginPostalCode,
      taxEnabled: data.taxEnabled,
      taxPercentage: data.taxPercentage,
      pendingOrderTimeLimitHours: data.pendingOrderTimeLimitHours,
      updatedAt: new Date(),
    };

    if (existing) {
      const [updated] = await db
        .update(appConfig)
        .set(configData)
        .where(eq(appConfig.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(appConfig).values(configData).returning();
    return created;
  },
};
