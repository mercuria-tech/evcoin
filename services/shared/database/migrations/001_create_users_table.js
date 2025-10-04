exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('phone').unique();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.boolean('email_verified').defaultTo(false);
    table.boolean('phone_verified').defaultTo(false);
    table.enum('status', ['active', 'suspended', 'deleted']).defaultTo('active');
    table.jsonb('preferences').defaultTo('{}');
    table.timestamps(true, true);
    table.timestamp('last_login_at');
    
    // Indexes
    table.index('email');
    table.index('phone');
    table.index('status');
    table.index(['email_verified', 'status']);
  });
});

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
