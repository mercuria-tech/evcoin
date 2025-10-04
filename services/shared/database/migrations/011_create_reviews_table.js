exports.up = function(knex) {
  return knex.schema.createTable('reviews', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('users.id').notNullable();
    table.uuid('station_id').references('stations.id').notNullable();
    table.uuid('session_id').references('charging_sessions.id');
    table.integer('rating').notNullable();
    table.text('comment');
    table.specificType('image_urls', 'TEXT[]').defaultTo('{}');
    table.timestamps(true, true);
    
    // Constraints
    table.check('rating >= 1 AND rating <= 5', 'rating_check');
    table.unique(['user_id', 'station_id', 'session_Id']); // One review per user per station per session
    
    // Indexes
    table.index('station_id');
    table.index(['station_id', 'rating']);
    table.index('rating');
    table.index('session_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('reviews');
};
