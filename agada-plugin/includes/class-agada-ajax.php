<?php
declare( strict_types=1 );

namespace Agada;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ajax {

	public function register(): void {
		add_action( 'wp_ajax_submit_agada_order',        [ $this, 'handle_submit_order' ] );
		add_action( 'wp_ajax_nopriv_submit_agada_order', [ $this, 'handle_submit_order' ] );
	}

	public function handle_submit_order(): void {
		// 1. Verify nonce.
		if ( ! check_ajax_referer( 'agada_submit_order', 'security', false ) ) {
			wp_send_json_error( [ 'message' => 'Invalid security token.' ], 403 );
			return;
		}

		// 2. Decode JSON payload.
		$raw = isset( $_POST['order_data'] ) ? wp_unslash( (string) $_POST['order_data'] ) : '';
		if ( empty( $raw ) ) {
			wp_send_json_error( [ 'message' => 'Missing order data.' ], 400 );
			return;
		}

		$data = json_decode( $raw, true );
		if ( ! is_array( $data ) || json_last_error() !== JSON_ERROR_NONE ) {
			wp_send_json_error( [ 'message' => 'Invalid order data format.' ], 400 );
			return;
		}

		// 3. Sanitize all fields.
		$sanitized = $this->sanitize_order( $data );
		if ( is_wp_error( $sanitized ) ) {
			wp_send_json_error( [ 'message' => $sanitized->get_error_message() ], 422 );
			return;
		}

		// 4. Server-side minimum-portions check.
		$min_portions = (int) Settings::get( 'agada_default_min_portions', 30 );
		$special_dates = json_decode( (string) Settings::get( 'agada_special_dates', '[]' ), true ) ?: [];
		$event_date    = $sanitized['customer']['eventDate'] ?? '';
		foreach ( $special_dates as $sd ) {
			if ( isset( $sd['date'], $sd['minPortions'] ) && $sd['date'] === $event_date ) {
				$min_portions = (int) $sd['minPortions'];
				break;
			}
		}
		if ( $sanitized['summary']['peopleCount'] < $min_portions ) {
			wp_send_json_error( [
				'message' => sprintf( 'Minimum portions for this date is %d.', $min_portions ),
			], 422 );
			return;
		}

		// 5. Create the order CPT post.
		$title    = sanitize_text_field( $sanitized['customer']['name'] ) . ' – ' . sanitize_text_field( $sanitized['customer']['eventDate'] );
		$post_id  = wp_insert_post( [
			'post_title'  => $title,
			'post_type'   => Post_Type::CPT,
			'post_status' => 'publish',
		] );

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			wp_send_json_error( [ 'message' => 'Failed to save order.' ], 500 );
			return;
		}

		// 6. Save meta fields.
		$c = $sanitized['customer'];
		$s = $sanitized['summary'];

		update_post_meta( $post_id, Post_Type::META_CUSTOMER_NAME,    $c['name'] );
		update_post_meta( $post_id, Post_Type::META_CUSTOMER_PHONE,   $c['phone'] );
		update_post_meta( $post_id, Post_Type::META_CUSTOMER_ADDRESS, $c['address'] );
		update_post_meta( $post_id, Post_Type::META_EVENT_DATE,        $c['eventDate'] );
		update_post_meta( $post_id, Post_Type::META_CUSTOMER_NOTES,   $c['notes'] );
		update_post_meta( $post_id, Post_Type::META_WANTS_QUOTE,      $c['wantsQuote'] ? '1' : '0' );
		update_post_meta( $post_id, Post_Type::META_PACKAGE_ID,       $s['packageId'] );
		update_post_meta( $post_id, Post_Type::META_PACKAGE_NAME,     $s['packageName'] );
		update_post_meta( $post_id, Post_Type::META_PEOPLE_COUNT,     (int) $s['peopleCount'] );
		update_post_meta( $post_id, Post_Type::META_TOTAL_PRICE,      (float) $s['totalPrice'] );
		update_post_meta( $post_id, Post_Type::META_ITEMS,            wp_json_encode( $sanitized['items'] ?? [] ) );
		update_post_meta( $post_id, Post_Type::META_SELECTIONS,       wp_json_encode( $sanitized['selections'] ?? [] ) );
		update_post_meta( $post_id, Post_Type::META_WHATSAPP_SUMMARY, $sanitized['whatsappSummary'] );
		update_post_meta( $post_id, Post_Type::META_ORDER_STATUS,     'pending' );
		update_post_meta( $post_id, Post_Type::META_SUBMITTED_AT,     current_time( 'mysql' ) );

		// 7. Send email notification.
		Email::send_notification( $post_id, $sanitized );

		wp_send_json_success( [ 'message' => 'Order saved.', 'order_id' => $post_id ] );
	}

	/**
	 * Sanitizes all incoming order fields.
	 *
	 * @return array|\WP_Error
	 */
	private function sanitize_order( array $data ): array|\WP_Error {
		$customer = $data['customer'] ?? [];
		$summary  = $data['summary'] ?? [];

		$name = sanitize_text_field( $customer['name'] ?? '' );
		$phone = sanitize_text_field( $customer['phone'] ?? '' );
		if ( empty( $name ) || empty( $phone ) ) {
			return new \WP_Error( 'missing_fields', 'Name and phone are required.' );
		}

		$event_date = sanitize_text_field( $customer['eventDate'] ?? '' );
		if ( $event_date && ! \DateTime::createFromFormat( 'Y-m-d', $event_date ) ) {
			return new \WP_Error( 'invalid_date', 'Invalid event date format.' );
		}

		$people_count = absint( $summary['peopleCount'] ?? 0 );
		$total_price  = abs( (float) ( $summary['totalPrice'] ?? 0 ) );

		// Sanitize items array.
		$raw_items = is_array( $data['items'] ?? null ) ? $data['items'] : [];
		$items     = array_map( function ( $item ) {
			if ( ! is_array( $item ) ) {
				return [];
			}
			return [
				'itemId'       => sanitize_key( $item['itemId'] ?? '' ),
				'itemName'     => sanitize_text_field( $item['itemName'] ?? '' ),
				'mealName'     => sanitize_text_field( $item['mealName'] ?? '' ),
				'categoryName' => sanitize_text_field( $item['categoryName'] ?? '' ),
				'isExtra'      => ! empty( $item['isExtra'] ),
				'isPredefined' => ! empty( $item['isPredefined'] ),
				'quantity'     => absint( $item['quantity'] ?? 1 ),
				'pricePerUnit' => abs( (float) ( $item['pricePerUnit'] ?? 0 ) ),
			];
		}, $raw_items );
		$items = array_filter( $items, fn( $i ) => ! empty( $i['itemId'] ) );

		$selections = [];
		if ( isset( $data['selections'] ) && is_array( $data['selections'] ) ) {
			$selections['shabbatMorningChoice'] = sanitize_key( $data['selections']['shabbatMorningChoice'] ?? '' );
		}

		return [
			'customer' => [
				'name'       => $name,
				'phone'      => $phone,
				'address'    => sanitize_text_field( $customer['address'] ?? '' ),
				'eventDate'  => $event_date,
				'notes'      => sanitize_textarea_field( $customer['notes'] ?? '' ),
				'wantsQuote' => ! empty( $customer['wantsQuote'] ),
			],
			'summary' => [
				'packageId'   => sanitize_key( $summary['packageId'] ?? '' ),
				'packageName' => sanitize_text_field( $summary['packageName'] ?? '' ),
				'peopleCount' => $people_count,
				'totalPrice'  => $total_price,
				'createdDate' => sanitize_text_field( $summary['createdDate'] ?? '' ),
			],
			'selections'      => $selections,
			'items'           => array_values( $items ),
			'whatsappSummary' => sanitize_textarea_field( $data['whatsappSummary'] ?? '' ),
		];
	}
}
