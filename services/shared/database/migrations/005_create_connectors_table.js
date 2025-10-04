exports.up = function(knex) {
  return knex.schema.createTable('connectors', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('station_id').references('stations.id').onDelete('CASCADE').notNullable();
    table.integer('connector_number').notNullable();
    table.enum('connector_type', ['Type1', 'Type2', 'CCS', 'CHAdeMO', 'TeslaSupercharger']).notNullable();
    table.decimal('power_kw', 6, 2).notNullable();
    table.enum('status', ['available', 'occupied', 'reserved', 'out_of_service']).defaultTo('available');
    table.decimal('pricing_per_kwh', 6, 4);
    table.decimal('pricing_per_minute', 6, 4);
    table.timestamp('last_status_update').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    // Constraints
    table.unique(['station_id', 'connector_number']);
    
    // Indexes
    table.index('station_id');
    table.index('status');
    table.index('connector_type');
    table.index(['station_id', 'connector_number']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('connectors');
};
