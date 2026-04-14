<?php
declare( strict_types=1 );
if ( ! defined( 'ABSPATH' ) ) exit;

use Agada\Admin;
use Agada\Post_Type;

$order_id = absint( $_GET['order_id'] ?? 0 );
$post     = get_post( $order_id );

if ( ! $post || Post_Type::CPT !== $post->post_type ) {
	echo '<div class="wrap"><p>ההזמנה לא נמצאה.</p></div>';
	return;
}

$orders = Admin::get_orders();
$order  = null;
foreach ( $orders as $o ) {
	if ( (int) $o['id'] === $order_id ) {
		$order = $o;
		break;
	}
}
if ( ! $order ) {
	echo '<div class="wrap"><p>ההזמנה לא נמצאה.</p></div>';
	return;
}

$list_url = admin_url( 'admin.php?page=agada-orders' );
$updated  = ! empty( $_GET['updated'] );

// Group items by meal and category.
$items_by_meal = [];
$extras        = [];
foreach ( $order['items'] as $item ) {
	if ( ! empty( $item['isExtra'] ) ) {
		$extras[] = $item;
	} elseif ( empty( $item['isPredefined'] ) ) {
		$meal = $item['mealName'] ?? 'כללי';
		$cat  = $item['categoryName'] ?? '';
		$items_by_meal[ $meal ][ $cat ][] = $item['itemName'];
	}
}
?>
<div class="wrap agada-admin agada-order-single" dir="rtl">
	<h1>
		<a href="<?php echo esc_url( $list_url ); ?>" class="page-title-action">← חזרה לרשימה</a>
		הזמנה #<?php echo esc_html( $order_id ); ?> – <?php echo esc_html( $order['name'] ); ?>
	</h1>
	<hr class="wp-header-end">

	<?php if ( $updated ) : ?>
	<div class="notice notice-success is-dismissible"><p>הסטטוס עודכן בהצלחה.</p></div>
	<?php endif; ?>

	<div class="agada-order-grid">
		<!-- Customer info -->
		<div class="agada-card">
			<h2>פרטי הלקוח</h2>
			<table class="agada-detail-table">
				<tr><th>שם מלא</th><td><?php echo esc_html( $order['name'] ); ?></td></tr>
				<tr><th>טלפון</th><td><a href="tel:<?php echo esc_attr( $order['phone'] ); ?>"><?php echo esc_html( $order['phone'] ); ?></a></td></tr>
				<tr><th>כתובת</th><td><?php echo esc_html( $order['address'] ); ?></td></tr>
				<tr><th>תאריך אירוע</th><td><?php echo esc_html( $order['event_date'] ); ?></td></tr>
				<?php if ( $order['notes'] ) : ?>
				<tr><th>הערות</th><td><?php echo nl2br( esc_html( $order['notes'] ) ); ?></td></tr>
				<?php endif; ?>
				<tr><th>ניהול אירוע</th><td><?php echo $order['wants_quote'] ? 'כן – מבקש הצעת מחיר' : 'לא'; ?></td></tr>
				<tr><th>נשלח ב</th><td><?php echo esc_html( $order['submitted_at'] ); ?></td></tr>
			</table>
		</div>

		<!-- Order summary -->
		<div class="agada-card">
			<h2>פרטי ההזמנה</h2>
			<table class="agada-detail-table">
				<tr><th>חבילה</th><td><?php echo esc_html( $order['package_name'] ); ?></td></tr>
				<tr><th>כמות מנות</th><td><?php echo esc_html( $order['people_count'] ); ?></td></tr>
				<tr><th>סה"כ</th><td class="agada-total"><?php echo esc_html( number_format( $order['total_price'] ) ); ?> ₪</td></tr>
			</table>

			<h3>עדכון סטטוס</h3>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<?php wp_nonce_field( 'agada_update_status' ); ?>
				<input type="hidden" name="action" value="agada_update_order_status">
				<input type="hidden" name="order_id" value="<?php echo esc_attr( $order_id ); ?>">
				<select name="order_status">
					<option value="pending"   <?php selected( $order['status'], 'pending' ); ?>>ממתין</option>
					<option value="confirmed" <?php selected( $order['status'], 'confirmed' ); ?>>אושר</option>
					<option value="cancelled" <?php selected( $order['status'], 'cancelled' ); ?>>בוטל</option>
				</select>
				<?php submit_button( 'עדכן סטטוס', 'small', 'submit', false ); ?>
			</form>
		</div>
	</div>

	<!-- Selected items -->
	<?php if ( ! empty( $items_by_meal ) ) : ?>
	<div class="agada-card agada-card-wide">
		<h2>פירוט הבחירות</h2>
		<?php foreach ( $items_by_meal as $meal_name => $categories ) : ?>
		<h3><?php echo esc_html( $meal_name ); ?></h3>
		<?php foreach ( $categories as $cat_name => $item_names ) : ?>
			<h4><?php echo esc_html( $cat_name ); ?></h4>
			<ul>
				<?php foreach ( $item_names as $item_name ) : ?>
				<li><?php echo esc_html( $item_name ); ?></li>
				<?php endforeach; ?>
			</ul>
		<?php endforeach; ?>
		<?php endforeach; ?>
	</div>
	<?php endif; ?>

	<!-- Extras -->
	<?php if ( ! empty( $extras ) ) : ?>
	<div class="agada-card agada-card-wide">
		<h2>תוספות בתשלום</h2>
		<ul>
			<?php foreach ( $extras as $extra ) : ?>
			<li>
				<?php echo esc_html( $extra['itemName'] ); ?>
				<?php if ( ! empty( $extra['pricePerPerson'] ) ) : ?>
					– <?php echo esc_html( $extra['pricePerUnit'] ); ?> ₪ לאדם
				<?php else : ?>
					x<?php echo esc_html( $extra['quantity'] ); ?> (<?php echo esc_html( $extra['pricePerUnit'] * $extra['quantity'] ); ?> ₪)
				<?php endif; ?>
			</li>
			<?php endforeach; ?>
		</ul>
	</div>
	<?php endif; ?>

	<!-- WhatsApp summary -->
	<?php if ( $order['whatsapp'] ) : ?>
	<div class="agada-card agada-card-wide">
		<h2>סיכום WhatsApp</h2>
		<pre class="agada-whatsapp-summary"><?php echo esc_html( $order['whatsapp'] ); ?></pre>
		<a href="https://wa.me/<?php echo esc_attr( \Agada\Settings::get( 'agada_whatsapp_number', '972552239120' ) ); ?>?text=<?php echo rawurlencode( $order['whatsapp'] ); ?>"
		   target="_blank" class="button button-primary">פתח ב-WhatsApp</a>
	</div>
	<?php endif; ?>
</div>
