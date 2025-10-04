exports.up = function(knex) {
  return knex.schema.createTable('notifications', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('users.id').notNullable();
    table.enum('type', [
      'charging_started',
      'charging_completed', 
      'charging_failed',
      'reservation_reminder',
      'reservation_confirmed',
      'reservation_cancelled',
      'payment_successful',
      'payment_failed',
      'system_announcement',
      'promotional'
    ]).notNullable();
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.jsonb('data').defaultTo('{}');
    table.boolean('read').defaultTo(false);
    table.timestamp('sent_at').defaultTo(knex.fn.now());
    table.timestamp('read_at');
    
    // Indexes
    table.index('user_id');
    table.index('read');
    table.index(['user_id', 'read']);
    table.index('type');
    table.index('sent_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('notifications');
};
