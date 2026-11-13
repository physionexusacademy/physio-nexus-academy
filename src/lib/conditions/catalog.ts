import catalogJson from "./generated/catalog.json";
import type { CatalogItem } from "./types";

/** The small catalogue (names, summaries, first lines). Full guides are static JSON in /conditions-data/. */
export const conditionCatalog = catalogJson as CatalogItem[];

export const getCondition = (slug: string) => conditionCatalog.find((c) => c.slug === slug);

export const conditionUrl = (slug: string) => `https://physionexusacademy.com/conditions/${slug}`;
