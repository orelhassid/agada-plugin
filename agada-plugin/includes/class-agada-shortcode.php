<?php
declare( strict_types=1 );

namespace Agada;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Shortcode {

	public function register(): void {
		add_shortcode( 'agada_order', [ $this, 'render' ] );
		add_shortcode( 'agada_admin_dashboard', [ $this, 'render_admin_dashboard' ] );
	}

	public function render(): string {
		$this->enqueue_assets();
		ob_start();
		include AGADA_PLUGIN_DIR . 'templates/order-app.php';
		return ob_get_clean();
	}

	public function render_admin_dashboard(): string {
		if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
			return '<div class="agada-admin-dashboard-access-denied">You do not have permission to view this dashboard.</div>';
		}

		$this->enqueue_admin_dashboard_assets();
		ob_start();
		include AGADA_PLUGIN_DIR . 'templates/admin-dashboard.php';
		return ob_get_clean();
	}

	private function enqueue_assets(): void {
		// Tailwind CDN — must load in <head> so it scans the DOM correctly.
		wp_enqueue_script( 'tailwindcss', 'https://cdn.tailwindcss.com', [], null, false );
		wp_add_inline_script(
			'tailwindcss',
			"tailwind.config = { darkMode: ['selector', '#agada-order-app.dark'] };",
			'after'
		);

		// Google Fonts.
		wp_enqueue_style(
			'agada-fonts',
			'https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&display=swap',
			[],
			null
		);

		// App stylesheet.
		wp_enqueue_style(
			'agada-order-app',
			AGADA_PLUGIN_URL . 'assets/css/agada-order-app.css',
			[ 'agada-fonts' ],
			AGADA_VERSION
		);

		// App script (footer).
		wp_enqueue_script(
			'agada-order-app',
			AGADA_PLUGIN_URL . 'assets/js/agada-order-app.js',
			[],
			AGADA_VERSION,
			true
		);

		// Build full app data from PHP and pass to JS before the script runs.
		$app_data = array_merge(
			Data::get_app_data(),
			[ 'config' => Settings::get_config() ]
		);

		wp_add_inline_script(
			'agada-order-app',
			'const agadaAppData = ' . wp_json_encode( $app_data ) . ';',
			'before'
		);

		// AJAX object (nonce + url).
		wp_add_inline_script(
			'agada-order-app',
			'const agada_ajax_obj = ' . wp_json_encode( [
				'ajax_url' => admin_url( 'admin-ajax.php' ),
				'nonce'    => wp_create_nonce( 'agada_submit_order' ),
			] ) . ';',
			'before'
		);
	}

	private function enqueue_admin_dashboard_assets(): void {
		$base = AGADA_PLUGIN_URL . 'assets/dashboard/';

		wp_enqueue_style(
			'agada-admin-dashboard',
			$base . 'dashboard.css',
			[],
			AGADA_VERSION
		);

		wp_enqueue_script(
			'agada-admin-dashboard',
			$base . 'dashboard.js',
			[],
			AGADA_VERSION,
			true
		);

		wp_add_inline_script(
			'agada-admin-dashboard',
			'window.agadaAdminDashboard = ' . wp_json_encode(
				[
					'restUrl'    => esc_url_raw( rest_url( 'agada/v1/' ) ),
					'restNonce'  => wp_create_nonce( 'wp_rest' ),
					'categories' => Data::get_app_data()['categories'] ?? [],
				]
			) . ';',
			'before'
		);
	}
}
