<?php
declare( strict_types=1 );

namespace Agada;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Settings {

	public function register(): void {
		add_action( 'admin_init', [ $this, 'register_settings' ] );
	}

	public function register_settings(): void {
		register_setting( 'agada_settings_group', 'agada_whatsapp_number', [
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
			'default'           => '972552239120',
		] );

		register_setting( 'agada_settings_group', 'agada_notification_email', [
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_email',
			'default'           => get_option( 'admin_email' ),
		] );

		register_setting( 'agada_settings_group', 'agada_default_min_portions', [
			'type'              => 'integer',
			'sanitize_callback' => 'absint',
			'default'           => 30,
		] );

		register_setting( 'agada_settings_group', 'agada_notices', [
			'type'              => 'string',
			'sanitize_callback' => [ $this, 'sanitize_json' ],
			'default'           => '[]',
		] );

		register_setting( 'agada_settings_group', 'agada_special_dates', [
			'type'              => 'string',
			'sanitize_callback' => [ $this, 'sanitize_json' ],
			'default'           => '[]',
		] );
	}

	public function sanitize_json( string $value ): string {
		$decoded = json_decode( $value, true );
		if ( json_last_error() !== JSON_ERROR_NONE || ! is_array( $decoded ) ) {
			return '[]';
		}
		return wp_json_encode( $decoded );
	}

	/**
	 * Returns the config object for the front-end JS.
	 */
	public static function get_config(): array {
		return [
			'orderMinimums' => [
				'defaultMinPortions' => (int) get_option( 'agada_default_min_portions', 30 ),
				'specialDates'       => json_decode( (string) get_option( 'agada_special_dates', '[]' ), true ) ?: [],
			],
			'notices'       => json_decode( (string) get_option( 'agada_notices', '[]' ), true ) ?: [],
			'whatsappNumber' => sanitize_text_field( (string) get_option( 'agada_whatsapp_number', '972552239120' ) ),
		];
	}

	public static function get( string $key, mixed $default = '' ): mixed {
		return get_option( $key, $default );
	}
}
