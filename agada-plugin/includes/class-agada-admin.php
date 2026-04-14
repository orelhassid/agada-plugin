<?php
declare( strict_types=1 );

namespace Agada;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin {

	public function register(): void {
		add_action( 'admin_menu', [ $this, 'add_menu_pages' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_action( 'admin_post_agada_update_order_status', [ $this, 'handle_status_update' ] );
		add_filter( 'plugin_action_links_' . plugin_basename( AGADA_PLUGIN_FILE ), [ $this, 'add_plugin_action_links' ] );
	}

	public function add_menu_pages(): void {
		add_menu_page(
			'הזמנות אגדה',
			'הזמנות אגדה',
			'manage_options',
			'agada-orders',
			[ $this, 'render_orders_page' ],
			'dashicons-food',
			30
		);

		add_submenu_page(
			'agada-orders',
			'הזמנות',
			'הזמנות',
			'manage_options',
			'agada-orders',
			[ $this, 'render_orders_page' ]
		);

		add_submenu_page(
			'agada-orders',
			'הגדרות',
			'הגדרות',
			'manage_options',
			'agada-settings',
			[ $this, 'render_settings_page' ]
		);

		add_options_page(
			'Agada Settings',
			'Agada Settings',
			'manage_options',
			'agada-settings',
			[ $this, 'render_settings_page' ]
		);
	}

	public function enqueue_assets( string $hook ): void {
		if ( ! str_contains( $hook, 'agada' ) ) {
			return;
		}
		wp_enqueue_style(
			'agada-admin',
			AGADA_PLUGIN_URL . 'assets/css/agada-admin.css',
			[],
			AGADA_VERSION
		);
		wp_enqueue_script(
			'agada-admin',
			AGADA_PLUGIN_URL . 'assets/js/agada-admin.js',
			[],
			AGADA_VERSION,
			true
		);
	}

	public function render_orders_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'אין לך הרשאה לצפות בדף זה.' );
		}

		$action   = isset( $_GET['action'] ) ? sanitize_key( $_GET['action'] ) : 'list';
		$order_id = isset( $_GET['order_id'] ) ? absint( $_GET['order_id'] ) : 0;

		if ( 'view' === $action && $order_id ) {
			include AGADA_PLUGIN_DIR . 'admin/views/order-single.php';
		} else {
			include AGADA_PLUGIN_DIR . 'admin/views/orders-list.php';
		}
	}

	public function render_settings_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'אין לך הרשאה לצפות בדף זה.' );
		}
		include AGADA_PLUGIN_DIR . 'admin/views/settings-page.php';
	}

	public function add_plugin_action_links( array $links ): array {
		$settings_link = sprintf(
			'<a href="%s">%s</a>',
			esc_url( admin_url( 'admin.php?page=agada-settings' ) ),
			esc_html__( 'View Settings', 'agada-plugin' )
		);

		array_unshift( $links, $settings_link );

		return $links;
	}

	public function handle_status_update(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Unauthorized.' );
		}
		check_admin_referer( 'agada_update_status' );

		$order_id  = absint( $_POST['order_id'] ?? 0 );
		$new_status = sanitize_key( $_POST['order_status'] ?? '' );
		$valid      = [ 'pending', 'confirmed', 'cancelled' ];

		if ( $order_id && in_array( $new_status, $valid, true ) ) {
			$post = get_post( $order_id );
			if ( $post && Post_Type::CPT === $post->post_type ) {
				update_post_meta( $order_id, Post_Type::META_ORDER_STATUS, $new_status );
			}
		}

		wp_redirect( admin_url( 'admin.php?page=agada-orders&action=view&order_id=' . $order_id . '&updated=1' ) );
		exit;
	}

	// -------------------------------------------------------------------------
	// Static helpers used by view templates.
	// -------------------------------------------------------------------------

	public static function get_orders( array $args = [] ): array {
		$defaults = [
			'post_type'      => Post_Type::CPT,
			'post_status'    => 'publish',
			'posts_per_page' => 50,
			'orderby'        => 'date',
			'order'          => 'DESC',
			'meta_query'     => [],
		];

		if ( ! empty( $args['status'] ) && 'all' !== $args['status'] ) {
			$defaults['meta_query'][] = [
				'key'   => Post_Type::META_ORDER_STATUS,
				'value' => sanitize_key( $args['status'] ),
			];
		}

		$query = new \WP_Query( $defaults );
		$orders = [];

		foreach ( $query->posts as $post ) {
			$id = $post->ID;
			$orders[] = [
				'id'           => $id,
				'name'         => get_post_meta( $id, Post_Type::META_CUSTOMER_NAME,    true ),
				'phone'        => get_post_meta( $id, Post_Type::META_CUSTOMER_PHONE,   true ),
				'address'      => get_post_meta( $id, Post_Type::META_CUSTOMER_ADDRESS, true ),
				'event_date'   => get_post_meta( $id, Post_Type::META_EVENT_DATE,        true ),
				'notes'        => get_post_meta( $id, Post_Type::META_CUSTOMER_NOTES,   true ),
				'wants_quote'  => get_post_meta( $id, Post_Type::META_WANTS_QUOTE,      true ),
				'package_id'   => get_post_meta( $id, Post_Type::META_PACKAGE_ID,       true ),
				'package_name' => get_post_meta( $id, Post_Type::META_PACKAGE_NAME,     true ),
				'people_count' => (int) get_post_meta( $id, Post_Type::META_PEOPLE_COUNT, true ),
				'total_price'  => (float) get_post_meta( $id, Post_Type::META_TOTAL_PRICE, true ),
				'items'        => json_decode( (string) get_post_meta( $id, Post_Type::META_ITEMS, true ), true ) ?: [],
				'selections'   => json_decode( (string) get_post_meta( $id, Post_Type::META_SELECTIONS, true ), true ) ?: [],
				'whatsapp'     => get_post_meta( $id, Post_Type::META_WHATSAPP_SUMMARY, true ),
				'status'       => get_post_meta( $id, Post_Type::META_ORDER_STATUS,     true ) ?: 'pending',
				'submitted_at' => get_post_meta( $id, Post_Type::META_SUBMITTED_AT,     true ),
			];
		}

		return $orders;
	}

	public static function status_label( string $status ): string {
		return match ( $status ) {
			'confirmed'  => 'אושר',
			'cancelled'  => 'בוטל',
			default      => 'ממתין',
		};
	}

	public static function status_class( string $status ): string {
		return match ( $status ) {
			'confirmed'  => 'agada-status-confirmed',
			'cancelled'  => 'agada-status-cancelled',
			default      => 'agada-status-pending',
		};
	}
}
