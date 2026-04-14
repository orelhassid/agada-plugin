<?php
declare( strict_types=1 );
if ( ! defined( 'ABSPATH' ) ) exit;

use Agada\Admin;

$filter_status = isset( $_GET['status'] ) ? sanitize_key( $_GET['status'] ) : 'all';
$orders        = Admin::get_orders( [ 'status' => $filter_status ] );

$status_labels = [ 'all' => 'הכל', 'pending' => 'ממתין', 'confirmed' => 'אושר', 'cancelled' => 'בוטל' ];
?>
<div class="wrap agada-admin" dir="rtl">
	<h1 class="wp-heading-inline">הזמנות אגדה</h1>
	<hr class="wp-header-end">

	<ul class="subsubsub">
		<?php foreach ( $status_labels as $slug => $label ) :
			$url   = admin_url( 'admin.php?page=agada-orders&status=' . $slug );
			$class = ( $slug === $filter_status ) ? 'current' : '';
		?>
		<li><a href="<?php echo esc_url( $url ); ?>" class="<?php echo esc_attr( $class ); ?>"><?php echo esc_html( $label ); ?></a> |</li>
		<?php endforeach; ?>
	</ul>

	<?php if ( empty( $orders ) ) : ?>
		<p>לא נמצאו הזמנות.</p>
	<?php else : ?>
	<table class="wp-list-table widefat fixed striped agada-orders-table">
		<thead>
			<tr>
				<th style="width:50px">#</th>
				<th>שם לקוח</th>
				<th>טלפון</th>
				<th>חבילה</th>
				<th>מנות</th>
				<th>תאריך אירוע</th>
				<th>סה"כ</th>
				<th>סטטוס</th>
				<th>נשלח ב</th>
				<th>פעולות</th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ( $orders as $order ) :
				$view_url = admin_url( 'admin.php?page=agada-orders&action=view&order_id=' . $order['id'] );
			?>
			<tr>
				<td><?php echo esc_html( $order['id'] ); ?></td>
				<td><strong><?php echo esc_html( $order['name'] ); ?></strong></td>
				<td><a href="tel:<?php echo esc_attr( $order['phone'] ); ?>"><?php echo esc_html( $order['phone'] ); ?></a></td>
				<td><?php echo esc_html( $order['package_name'] ); ?></td>
				<td><?php echo esc_html( $order['people_count'] ); ?></td>
				<td><?php echo esc_html( $order['event_date'] ); ?></td>
				<td><?php echo esc_html( number_format( $order['total_price'] ) ); ?> ₪</td>
				<td>
					<span class="agada-status-badge <?php echo esc_attr( Admin::status_class( $order['status'] ) ); ?>">
						<?php echo esc_html( Admin::status_label( $order['status'] ) ); ?>
					</span>
				</td>
				<td><?php echo esc_html( $order['submitted_at'] ); ?></td>
				<td><a href="<?php echo esc_url( $view_url ); ?>">צפה</a></td>
			</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
	<?php endif; ?>
</div>
