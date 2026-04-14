<?php
declare( strict_types=1 );

namespace Agada;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Repository {

	public static function products_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'agada_products';
	}

	public static function packages_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'agada_packages';
	}

	public static function install_schema(): void {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset_collate = $wpdb->get_charset_collate();
		$products_table  = self::products_table();
		$packages_table  = self::packages_table();

		$products_sql = "CREATE TABLE {$products_table} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			slug VARCHAR(191) NOT NULL,
			name TEXT NOT NULL,
			image_url TEXT NULL,
			is_optional_extra TINYINT(1) DEFAULT 0,
			price_per_person TINYINT(1) DEFAULT 0,
			extra_cost DECIMAL(10,2) DEFAULT 0,
			is_predefined TINYINT(1) DEFAULT 0,
			is_active TINYINT(1) DEFAULT 1,
			position INT UNSIGNED DEFAULT 0,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY slug (slug)
		) {$charset_collate};";

		$packages_sql = "CREATE TABLE {$packages_table} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			slug VARCHAR(191) NOT NULL,
			name TEXT NOT NULL,
			includes_json LONGTEXT NULL,
			base_price_per_person DECIMAL(10,2) DEFAULT 0,
			image_url TEXT NULL,
			meals_json LONGTEXT NULL,
			is_active TINYINT(1) DEFAULT 1,
			position INT UNSIGNED DEFAULT 0,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY slug (slug)
		) {$charset_collate};";

		dbDelta( $products_sql );
		dbDelta( $packages_sql );
	}

	public static function seed_defaults_if_empty(): void {
		global $wpdb;

		$products_table = self::products_table();
		$packages_table = self::packages_table();

		$products_count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$products_table}" );
		$packages_count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$packages_table}" );
		$now            = current_time( 'mysql' );

		if ( 0 === $products_count ) {
			$index = 0;
			foreach ( Data::get_seed_items() as $slug => $item ) {
				$wpdb->insert(
					$products_table,
					[
						'slug'              => sanitize_key( (string) $slug ),
						'name'              => sanitize_text_field( (string) ( $item['name'] ?? '' ) ),
						'image_url'         => esc_url_raw( (string) ( $item['imageUrl'] ?? '' ) ),
						'is_optional_extra' => ! empty( $item['isOptionalExtra'] ) ? 1 : 0,
						'price_per_person'  => ! empty( $item['pricePerPerson'] ) ? 1 : 0,
						'extra_cost'        => isset( $item['extraCost'] ) ? (float) $item['extraCost'] : 0,
						'is_predefined'     => ! empty( $item['isPredefined'] ) ? 1 : 0,
						'is_active'         => 1,
						'position'          => $index,
						'created_at'        => $now,
						'updated_at'        => $now,
					],
					[ '%s', '%s', '%s', '%d', '%d', '%f', '%d', '%d', '%d', '%s', '%s' ]
				);
				$index++;
			}
		}

		if ( 0 === $packages_count ) {
			$index = 0;
			foreach ( Data::get_seed_packages() as $slug => $package ) {
				$wpdb->insert(
					$packages_table,
					[
						'slug'                  => sanitize_key( (string) $slug ),
						'name'                  => sanitize_text_field( (string) ( $package['name'] ?? '' ) ),
						'includes_json'         => wp_json_encode( $package['includes'] ?? [] ),
						'base_price_per_person' => isset( $package['basePricePerPerson'] ) ? (float) $package['basePricePerPerson'] : 0,
						'image_url'             => esc_url_raw( (string) ( $package['imageUrl'] ?? '' ) ),
						'meals_json'            => wp_json_encode( $package['meals'] ?? [] ),
						'is_active'             => 1,
						'position'              => $index,
						'created_at'            => $now,
						'updated_at'            => $now,
					],
					[ '%s', '%s', '%s', '%f', '%s', '%s', '%d', '%d', '%s', '%s' ]
				);
				$index++;
			}
		}
	}

	public static function get_products(): array {
		global $wpdb;
		$table = self::products_table();
		return $wpdb->get_results( "SELECT * FROM {$table} ORDER BY position ASC, id ASC", ARRAY_A ) ?: [];
	}

	public static function get_packages(): array {
		global $wpdb;
		$table = self::packages_table();
		return $wpdb->get_results( "SELECT * FROM {$table} ORDER BY position ASC, id ASC", ARRAY_A ) ?: [];
	}

	public static function get_products_map(): array {
		$map = [];
		foreach ( self::get_products() as $row ) {
			$slug = (string) $row['slug'];
			$map[ $slug ] = [
				'name' => (string) $row['name'],
			];
			if ( ! empty( $row['image_url'] ) ) {
				$map[ $slug ]['imageUrl'] = (string) $row['image_url'];
			}
			if ( (int) $row['is_optional_extra'] ) {
				$map[ $slug ]['isOptionalExtra'] = true;
			}
			if ( (int) $row['price_per_person'] ) {
				$map[ $slug ]['pricePerPerson'] = true;
			}
			if ( (float) $row['extra_cost'] > 0 ) {
				$map[ $slug ]['extraCost'] = (float) $row['extra_cost'];
			}
			if ( (int) $row['is_predefined'] ) {
				$map[ $slug ]['isPredefined'] = true;
			}
		}
		return $map;
	}

	public static function get_packages_map(): array {
		$map = [];
		foreach ( self::get_packages() as $row ) {
			$slug = (string) $row['slug'];
			$map[ $slug ] = [
				'name'               => (string) $row['name'],
				'includes'           => json_decode( (string) $row['includes_json'], true ) ?: [],
				'basePricePerPerson' => (float) $row['base_price_per_person'],
				'imageUrl'           => (string) $row['image_url'],
				'meals'              => json_decode( (string) $row['meals_json'], true ) ?: [],
			];
		}
		return $map;
	}
}
