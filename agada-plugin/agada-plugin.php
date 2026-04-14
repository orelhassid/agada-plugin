<?php
/**
 * Plugin Name: Agada Plugin
 * Plugin URI:  https://www.agada-c.co.il/
 * Description: Core features for Agada Catering — a kosher meals ordering app for events.
 * Version:     1.0.0
 * Requires at least: 6.4
 * Requires PHP: 8.0
 * Author:      Litstudio
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: agada-plugin
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AGADA_VERSION',    '1.0.3' );
define( 'AGADA_PLUGIN_FILE', __FILE__ );
define( 'AGADA_PLUGIN_DIR',  plugin_dir_path( __FILE__ ) );
define( 'AGADA_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );

require_once AGADA_PLUGIN_DIR . 'includes/class-agada-plugin.php';

register_activation_hook( __FILE__, [ 'Agada\\Plugin', 'activate' ] );
register_deactivation_hook( __FILE__, [ 'Agada\\Plugin', 'deactivate' ] );

Agada\Plugin::get_instance()->init();
