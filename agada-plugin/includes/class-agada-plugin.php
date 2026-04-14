<?php
declare( strict_types=1 );

namespace Agada;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Plugin {

	private static ?self $instance = null;

	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function init(): void {
		$this->load_dependencies();

		( new Post_Type() )->register();
		( new Settings() )->register();
		( new Shortcode() )->register();
		( new Ajax() )->register();
		( new Rest() )->register();

		if ( is_admin() ) {
			( new Admin() )->register();
		}

		// Remove Elementor frontend output on the agada-dashboard page before
		// any enqueue hooks fire so the app's shadcn styles are conflict-free.
		add_action( 'wp', [ $this, 'maybe_disable_elementor_on_dashboard' ] );
	}

	/**
	 * On the agada-dashboard page, strip all Elementor frontend assets and
	 * inline-CSS output so they cannot override shadcn/Tailwind component styles.
	 */
	public function maybe_disable_elementor_on_dashboard(): void {
		if ( ! is_page( 'agada-dashboard' ) ) {
			return;
		}

		// Remove Elementor frontend enqueue callbacks (try common priorities).
		if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->frontend ) ) {
			$frontend  = \Elementor\Plugin::$instance->frontend;
			$callbacks = [ 'enqueue_scripts', 'enqueue_styles' ];

			foreach ( $callbacks as $cb ) {
				foreach ( [ 9, 10, 20, 999 ] as $priority ) {
					remove_action( 'wp_enqueue_scripts', [ $frontend, $cb ], $priority );
				}
			}

			// Remove Elementor inline-CSS and font output from wp_head / wp_footer.
			foreach ( [ 8, 9, 10 ] as $priority ) {
				remove_action( 'wp_head', [ $frontend, 'print_head_css' ], $priority );
			}
			remove_action( 'wp_footer', [ $frontend, 'print_fonts_links' ], 20 );
			remove_action( 'wp_footer', [ $frontend, 'print_late_styles' ], 21 );
		}

		// Safety net: dequeue any elementor-* handles that may have already been
		// registered before this hook ran (runs at PHP_INT_MAX to be last).
		add_action( 'wp_enqueue_scripts', static function (): void {
			global $wp_styles, $wp_scripts;

			foreach ( array_keys( $wp_styles->registered ?? [] ) as $handle ) {
				if ( str_starts_with( (string) $handle, 'elementor' ) ) {
					wp_dequeue_style( $handle );
					wp_deregister_style( $handle );
				}
			}

			foreach ( array_keys( $wp_scripts->registered ?? [] ) as $handle ) {
				if ( str_starts_with( (string) $handle, 'elementor' ) ) {
					wp_dequeue_script( $handle );
					wp_deregister_script( $handle );
				}
			}
		}, PHP_INT_MAX );
	}

	private function load_dependencies(): void {
		$dir = AGADA_PLUGIN_DIR . 'includes/';
		require_once $dir . 'class-agada-data.php';
		require_once $dir . 'class-agada-repository.php';
		require_once $dir . 'class-agada-settings.php';
		require_once $dir . 'class-agada-post-type.php';
		require_once $dir . 'class-agada-email.php';
		require_once $dir . 'class-agada-ajax.php';
		require_once $dir . 'class-agada-rest.php';
		require_once $dir . 'class-agada-shortcode.php';
		require_once $dir . 'class-agada-admin.php';
	}

	public static function activate(): void {
		require_once AGADA_PLUGIN_DIR . 'includes/class-agada-data.php';
		require_once AGADA_PLUGIN_DIR . 'includes/class-agada-repository.php';
		Repository::install_schema();
		Repository::seed_defaults_if_empty();

		( new Post_Type() )->register_cpt();
		flush_rewrite_rules();
	}

	public static function deactivate(): void {
		flush_rewrite_rules();
	}
}
