import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("summary", (table) => {
    table.integer("total_meals").defaultTo(0);
    table.integer("total_meals_in_diet").defaultTo(0);
    table.integer("total_meals_out_of_diet").defaultTo(0);
    table.integer("streak").defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("summary");
}
