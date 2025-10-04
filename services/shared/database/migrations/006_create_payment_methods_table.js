exports.up = function(knex) {
  return knex.schema.createTable('payment_methods', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('users.id').onDelete('CASCADE').notNullable();
    table.enum('type', ['card', 'wallet', 'bank_account', 'apple_pay', 'google_pay']).notNullable();
    table.string('provider', 50);
    table.string('provider_payment_method_id').notNullable();
    table.string('card_brand', 20);
    table.string('card_last4', 4);
    table.integer('card_exp_month');
    table.integer('card_exp_year');
    table.jsonb('billing_address');
    table.boolean('is_default').defaultTo(false);
    table.enum('status', ['active', 'expired', 'removed']).defaultTo('active');
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index(['user_id', 'is_default']);
    table.index('provider');
    table.index('status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payment_methods');
};
