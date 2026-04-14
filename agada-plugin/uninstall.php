<?php
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Remove all plugin options.
$options = [
	'agada_whatsapp_number',
	'agada_notification_email',
	'agada_default_min_portions',
	'agada_notices',
	'agada_special_dates',
];
foreach ( $options as $option ) {
	delete_option( $option );
}

// Remove all saved orders.
$orders = get_posts( [
	'post_type'      => 'agada_order',
	'posts_per_page' => -1,
	'post_status'    => 'any',
	'fields'         => 'ids',
] );
foreach ( $orders as $order_id ) {
	wp_delete_post( (int) $order_id, true );
}
