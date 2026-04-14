<?php
declare( strict_types=1 );

namespace Agada;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Type {

	const CPT = 'agada_order';

	// Meta key constants.
	const META_CUSTOMER_NAME    = '_agada_customer_name';
	const META_CUSTOMER_PHONE   = '_agada_customer_phone';
	const META_CUSTOMER_ADDRESS = '_agada_customer_address';
	const META_EVENT_DATE       = '_agada_customer_event_date';
	const META_CUSTOMER_NOTES   = '_agada_customer_notes';
	const META_WANTS_QUOTE      = '_agada_customer_wants_quote';
	const META_PACKAGE_ID       = '_agada_package_id';
	const META_PACKAGE_NAME     = '_agada_package_name';
	const META_PEOPLE_COUNT     = '_agada_people_count';
	const META_TOTAL_PRICE      = '_agada_total_price';
	const META_ITEMS            = '_agada_items';
	const META_SELECTIONS       = '_agada_selections';
	const META_WHATSAPP_SUMMARY = '_agada_whatsapp_summary';
	const META_ORDER_STATUS     = '_agada_order_status';
	const META_SUBMITTED_AT     = '_agada_submitted_at';

	public function register(): void {
		add_action( 'init', [ $this, 'register_cpt' ] );
	}

	public function register_cpt(): void {
		register_post_type( self::CPT, [
			'labels'          => [
				'name'               => 'הזמנות',
				'singular_name'      => 'הזמנה',
				'menu_name'          => 'הזמנות אגדה',
				'all_items'          => 'כל ההזמנות',
				'view_item'          => 'צפה בהזמנה',
				'search_items'       => 'חפש הזמנות',
				'not_found'          => 'לא נמצאו הזמנות.',
				'not_found_in_trash' => 'לא נמצאו הזמנות בסל המחזור.',
			],
			'public'          => false,
			'show_ui'         => false,
			'show_in_menu'    => false,
			'capability_type' => 'post',
			'supports'        => [ 'title' ],
			'has_archive'     => false,
		] );
	}
}
