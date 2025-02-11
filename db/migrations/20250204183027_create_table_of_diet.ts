import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary();
    table.string("name");
    table.string("description");
    table.dateTime("created_at");
    table.dateTime("updated_at");
    table.enum("in_diet", ["yes", "no"]).notNullable();
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
