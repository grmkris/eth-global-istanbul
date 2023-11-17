import { AnyTable, eq } from "drizzle-orm";
import { z, ZodObject } from "zod";

import type { db } from "./db/db";
import { publicProcedure, router } from "./trpc";

/**
 * ColumnConfig object that can be applied to each key in the schema.
 */
type ColumnConfig<TSchema extends z.ZodObject<any>> = {
  relation?: string;
};

/**
 * Utility type to extract keys from a zod schema
 */
type ExtractKeys<T> = T extends z.ZodObject<infer U> ? keyof U : never;

/**
 * TableConfig object describing the table columns.
 */
export type RouterConfig<TSchema extends z.ZodObject<any>> = {
  [K in ExtractKeys<TSchema>]?: ColumnConfig<TSchema>;
};

type RouterFactoryParams<
  TSelectSchema extends ZodObject<any>,
  TInsertSchema extends ZodObject<any>,
  TUpdateSchema extends ZodObject<any>,
> = {
  id: string;
  table: AnyTable & { id: any };
  selectSchema: TSelectSchema;
  updateSchema: TUpdateSchema;
  insertSchema: TInsertSchema;
  config?: RouterConfig<TSelectSchema>;
  db: db;
};

/**
 * Idea from https://dev.to/nicklucas/trpc-patterns-router-factories-and-polymorphism-30b0
 * @param params
 */
export function createRouterFactory<
  TSelectSchema extends z.ZodObject<any>,
  TInsertSchema extends z.ZodObject<any>,
  TUpdateSchema extends z.ZodObject<any>,
>(params: RouterFactoryParams<TSelectSchema, TInsertSchema, TUpdateSchema>) {
  const { selectSchema, insertSchema, table, db, updateSchema } = params;
  return router({
    list: publicProcedure
      .input(z.void())
      .output(selectSchema.array())
      .query(async () => {
        const relatonExist = Object.keys(params.config ?? {}).find(
          (key) => params.config?.[key].relation,
        );
        if (!!relatonExist) {
          const items = await db.query[
            table[Symbol.for("drizzle:BaseName")]
          ].findMany({
            with: {
              [relatonExist]: true,
            },
          });
          return selectSchema.array().parse(items);
        } else {
          const items =
            await db.query[table[Symbol.for("drizzle:BaseName")]].findMany();
          return selectSchema.array().parse(items);
        }
      }),
    create: publicProcedure
      .input(insertSchema)
      .output(selectSchema)
      .mutation(async ({ input }) => {
        const item = await db
          .insert(table)
          .values({ ...input, id: crypto.randomUUID() })
          .returning()
          .execute();
        return selectSchema.parse(item[0]);
      }),
    get: publicProcedure
      .input(z.union([z.string(), z.number()]))
      .output(selectSchema)
      .query(async ({ input }) => {
        const item = await db.query[
          table[Symbol.for("drizzle:BaseName")]
        ]?.findMany({
          where: eq(table.id, input),
        });

        return selectSchema.parse(item[0]);
      }),
    update: publicProcedure
      .input(updateSchema)
      .output(selectSchema)
      .mutation(async ({ input }) => {
        if (!input.id) throw new Error("id is required");
        const item = await db
          .update(table)
          .set(input)
          .where(eq(table.id, input.id))
          .returning()
          .execute();
        return selectSchema.parse(item[0]);
      }),
    delete: publicProcedure
      .input(z.union([z.string(), z.number()]))
      .output(z.void())
      .mutation(async ({ input }) => {
        return await db.delete(table).where(eq(table.id, input)).execute();
      }),
  });
}
