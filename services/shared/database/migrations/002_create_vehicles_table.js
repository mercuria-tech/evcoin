exports.up = function(knex) {
  return knex.schema.createTable('vehicles', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('users.id').onDelete('CASCADE').notNullable();
    table.string('make').notNullable();
    table.string('model').notNullable();
    table.integer('year').notNullable();
    table.string('vin', 17);
    table.decimal('battery_capacity_kwh', 5, 2);
    table.specificType('connector_types', 'TEXT[]');
    table.boolean('is_default').defaultTo(false);
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index(['user_id', 'is_default']);
    table.index(['make', 'model']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('vehicles');
};
