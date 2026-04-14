<?php
declare( strict_types=1 );

namespace Agada;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Rest {

	public function register(): void {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function register_routes(): void {
		register_rest_route(
			'agada/v1',
			'/products',
			[
				[
					'methods'             => 'GET',
					'callback'            => [ $this, 'list_products' ],
					'permission_callback' => [ $this, 'can_manage' ],
				],
				[
					'methods'             => 'POST',
					'callback'            => [ $this, 'upsert_product' ],
					'permission_callback' => [ $this, 'can_manage' ],
				],
			]
		);

		register_rest_route(
			'agada/v1',
			'/products/bulk',
			[
				[
					'methods'             => 'POST',
					'callback'            => [ $this, 'bulk_products' ],
					'permission_callback' => [ $this, 'can_manage' ],
				],
			]
		);

		register_rest_route(
			'agada/v1',
			'/packages',
			[
				[
					'methods'             => 'GET',
					'callback'            => [ $this, 'list_packages' ],
					'permission_callback' => [ $this, 'can_manage' ],
				],
				[
					'methods'             => 'POST',
					'callback'            => [ $this, 'upsert_package' ],
					'permission_callback' => [ $this, 'can_manage' ],
				],
			]
		);

		register_rest_route(
			'agada/v1',
			'/packages/bulk',
			[
				[
					'methods'             => 'POST',
					'callback'            => [ $this, 'bulk_packages' ],
					'permission_callback' => [ $this, 'can_manage' ],
				],
			]
		);

		register_rest_route(
			'agada/v1',
			'/settings',
			[
				[
					'methods'             => 'GET',
					'callback'            => [ $this, 'get_settings' ],
					'permission_callback' => [ $this, 'can_manage' ],
				],
				[
					'methods'             => 'POST',
					'callback'            => [ $this, 'update_settings' ],
					'permission_callback' => [ $this, 'can_manage' ],
				],
			]
		);
	}

	public function can_manage(): bool {
		return current_user_can( 'manage_options' );
	}

	public function list_products(): \WP_REST_Response {
		return rest_ensure_response( [ 'items' => Repository::get_products() ] );
	}

	public function list_packages(): \WP_REST_Response {
		return rest_ensure_response( [ 'items' => Repository::get_packages() ] );
	}

	public function upsert_product( \WP_REST_Request $request ): \WP_REST_Response {
		global $wpdb;
		$data  = $request->get_json_params();
		$table = Repository::products_table();
		$now   = current_time( 'mysql' );

		$payload = [
			'slug'              => sanitize_key( (string) ( $data['slug'] ?? '' ) ),
			'name'              => sanitize_text_field( (string) ( $data['name'] ?? '' ) ),
			'image_url'         => esc_url_raw( (string) ( $data['image_url'] ?? '' ) ),
			'is_optional_extra' => ! empty( $data['is_optional_extra'] ) ? 1 : 0,
			'price_per_person'  => ! empty( $data['price_per_person'] ) ? 1 : 0,
			'extra_cost'        => (float) ( $data['extra_cost'] ?? 0 ),
			'is_predefined'     => ! empty( $data['is_predefined'] ) ? 1 : 0,
			'is_active'         => ! empty( $data['is_active'] ) ? 1 : 0,
			'position'          => absint( $data['position'] ?? 0 ),
			'updated_at'        => $now,
		];

		if ( empty( $payload['slug'] ) || empty( $payload['name'] ) ) {
			return new \WP_REST_Response( [ 'message' => 'Missing product name/slug.' ], 422 );
		}

		$id = absint( $data['id'] ?? 0 );
		if ( $id > 0 ) {
			$wpdb->update( $table, $payload, [ 'id' => $id ] );
		} else {
			$payload['created_at'] = $now;
			$wpdb->insert( $table, $payload );
		}

		return rest_ensure_response( [ 'items' => Repository::get_products() ] );
	}

	public function upsert_package( \WP_REST_Request $request ): \WP_REST_Response {
		global $wpdb;
		$data  = $request->get_json_params();
		$table = Repository::packages_table();
		$now   = current_time( 'mysql' );

		$payload = [
			'slug'                  => sanitize_key( (string) ( $data['slug'] ?? '' ) ),
			'name'                  => sanitize_text_field( (string) ( $data['name'] ?? '' ) ),
			'includes_json'         => wp_json_encode( $data['includes'] ?? [] ),
			'base_price_per_person' => (float) ( $data['base_price_per_person'] ?? 0 ),
			'image_url'             => esc_url_raw( (string) ( $data['image_url'] ?? '' ) ),
			'meals_json'            => wp_json_encode( $data['meals'] ?? [] ),
			'is_active'             => ! empty( $data['is_active'] ) ? 1 : 0,
			'position'              => absint( $data['position'] ?? 0 ),
			'updated_at'            => $now,
		];

		if ( empty( $payload['slug'] ) || empty( $payload['name'] ) ) {
			return new \WP_REST_Response( [ 'message' => 'Missing package name/slug.' ], 422 );
		}

		$id = absint( $data['id'] ?? 0 );
		if ( $id > 0 ) {
			$wpdb->update( $table, $payload, [ 'id' => $id ] );
		} else {
			$payload['created_at'] = $now;
			$wpdb->insert( $table, $payload );
		}

		return rest_ensure_response( [ 'items' => Repository::get_packages() ] );
	}

	public function bulk_products( \WP_REST_Request $request ): \WP_REST_Response {
		global $wpdb;
		$data   = $request->get_json_params();
		$action = sanitize_key( (string) ( $data['action'] ?? '' ) );
		$ids    = array_map( 'absint', (array) ( $data['ids'] ?? [] ) );
		$ids    = array_values( array_filter( $ids ) );

		if ( empty( $ids ) ) {
			return new \WP_REST_Response( [ 'message' => 'No rows selected.' ], 422 );
		}

		$table = Repository::products_table();
		$in    = implode( ',', $ids );

		if ( 'delete' === $action ) {
			$wpdb->query( "DELETE FROM {$table} WHERE id IN ({$in})" );
		} elseif ( in_array( $action, [ 'activate', 'deactivate' ], true ) ) {
			$flag = 'activate' === $action ? 1 : 0;
			$wpdb->query( $wpdb->prepare( "UPDATE {$table} SET is_active = %d WHERE id IN ({$in})", $flag ) );
		}

		return rest_ensure_response( [ 'items' => Repository::get_products() ] );
	}

	public function bulk_packages( \WP_REST_Request $request ): \WP_REST_Response {
		global $wpdb;
		$data   = $request->get_json_params();
		$action = sanitize_key( (string) ( $data['action'] ?? '' ) );
		$ids    = array_map( 'absint', (array) ( $data['ids'] ?? [] ) );
		$ids    = array_values( array_filter( $ids ) );

		if ( empty( $ids ) ) {
			return new \WP_REST_Response( [ 'message' => 'No rows selected.' ], 422 );
		}

		$table = Repository::packages_table();
		$in    = implode( ',', $ids );

		if ( 'delete' === $action ) {
			$wpdb->query( "DELETE FROM {$table} WHERE id IN ({$in})" );
		} elseif ( in_array( $action, [ 'activate', 'deactivate' ], true ) ) {
			$flag = 'activate' === $action ? 1 : 0;
			$wpdb->query( $wpdb->prepare( "UPDATE {$table} SET is_active = %d WHERE id IN ({$in})", $flag ) );
		}

		return rest_ensure_response( [ 'items' => Repository::get_packages() ] );
	}

	public function get_settings(): \WP_REST_Response {
		return rest_ensure_response(
			[
				'whatsapp_number'      => (string) get_option( 'agada_whatsapp_number', '972552239120' ),
				'notification_email'   => (string) get_option( 'agada_notification_email', get_option( 'admin_email' ) ),
				'default_min_portions' => (int) get_option( 'agada_default_min_portions', 30 ),
				'notices'              => json_decode( (string) get_option( 'agada_notices', '[]' ), true ) ?: [],
				'special_dates'        => json_decode( (string) get_option( 'agada_special_dates', '[]' ), true ) ?: [],
			]
		);
	}

	public function update_settings( \WP_REST_Request $request ): \WP_REST_Response {
		$data = $request->get_json_params();

		update_option( 'agada_whatsapp_number', sanitize_text_field( (string) ( $data['whatsapp_number'] ?? '' ) ) );
		update_option( 'agada_notification_email', sanitize_email( (string) ( $data['notification_email'] ?? '' ) ) );
		update_option( 'agada_default_min_portions', absint( $data['default_min_portions'] ?? 30 ) );
		update_option( 'agada_notices', wp_json_encode( (array) ( $data['notices'] ?? [] ) ) );
		update_option( 'agada_special_dates', wp_json_encode( (array) ( $data['special_dates'] ?? [] ) ) );

		return $this->get_settings();
	}
}
