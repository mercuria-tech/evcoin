exports.up = function(knex) {
  return knex.schema.createTable('reservations', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('users.id').notNullable();
    table.uuid('station_id').references('stations.id').notNullable();
    table.uuid('connector_id').references('connectors.id').notNullable();
    table.uuid('vehicle_id').references('vehicles.id');
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time').notNullable();
    table.enum('status', ['confirmed', 'checked_in', 'completed', 'cancelled', 'no_show']).notNullable();
    table.decimal('reservation_fee', 10, 2);
    table.decimal('no_show_fee', 10, 2);
    table.integer('grace_period_minutes').defaultTo(15);
    table.timestamp('check_in_time');
    table.timestamp('cancelled_at');
    table.text('cancellation_reason');
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('station_id');
    table.index('connector_id');
    table.index('start_time');
    table.index('status');
    table.index(['station_id', 'start_time']);
    table.index(['connector_id', 'start_time']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('reservations');
};
