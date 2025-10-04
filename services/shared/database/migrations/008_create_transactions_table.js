exports.up = function(knex) {
  return knex.schema.createTable('transactions', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('users.id').notNullable();
    table.enum('type', ['charge', 'refund', 'authorization', 'capture', 'fees']).notNullable();
    table.uuid('session_id').references('charging_sessions.id');
    table.uuid('reservation_id');
    table.decimal('amount', 10, 2).

notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']).notNullable();
    table.uuid('payment_method_id').references('payment_methods.id');
    table.string('provider', 50);
    table.string('provider_transaction_id', 255);
    table.string('authorization_code', 255);
    table.text('description');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('status');
    table.index('created_at');
    table.index(['user_id', 'created_at']);
    table.index('session_id');
    table.index('provider_transaction_id');
    table.index('amount');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transactions');
};
