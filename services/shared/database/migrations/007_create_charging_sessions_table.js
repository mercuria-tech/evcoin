exports.up = function(knex) {
  return knex.schema.createTable('charging_sessions', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('users.id').notNullable();
    table.uuid('vehicle_id').references('vehicles.id');
    table.uuid('station_id').references('stations.id').notNullable();
    table.uuid('connector_id').references('connectors.id').notNullable();
    table.enum('status', ['starting', 'charging', 'completed', 'failed', 'cancelled']).notNullable();
    table.enum('styled_method', ['qr_code', 'rfid', 'app']);
    table.timestamp('started_at').notNullable();
    table.timestamp('ended_at');
    table.integer('duration_seconds');
    table.decimal('energy_delivered_kwh', 8, 3);
    table.decimal('max_power_kw', 6, 2);
    table.decimal('avg_power_kw', 6, 2);
    table.decimal('cost_amount', 10, 2);
    table.string('cost_currency', 3).defaultTo('USD');
    table.uuid('payment_method_id').references('payment_methods.id');
    table.uuid('transaction_id');
    table.string('error_code', 50);
    table.text('error_message');
    table.jsonb('charging_curve').defaultTo('[]');
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('station_id');
    table.index('connector_id');
    table.index('status');
    table.index('started_at');
    table.index(['user_id', 'started_at']);
    table.index(['station_id', 'started_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('charging_sessions');
};
