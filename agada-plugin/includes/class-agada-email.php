<?php
declare( strict_types=1 );

namespace Agada;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Email {

	public static function send_notification( int $order_id, array $order_data ): bool {
		$to      = sanitize_email( (string) Settings::get( 'agada_notification_email', get_option( 'admin_email' ) ) );
		$name    = esc_html( $order_data['customer']['name'] ?? '' );
		$subject = sprintf( 'הזמנה חדשה #%d – %s', $order_id, $name );

		$body = self::build_email_body( $order_id, $order_data );

		$headers = [ 'Content-Type: text/html; charset=UTF-8' ];

		return wp_mail( $to, $subject, $body, $headers );
	}

	private static function build_email_body( int $order_id, array $order_data ): string {
		$customer   = $order_data['customer'] ?? [];
		$summary    = $order_data['summary'] ?? [];
		$whatsapp   = esc_html( $order_data['whatsappSummary'] ?? '' );
		$admin_url  = admin_url( 'admin.php?page=agada-orders&action=view&order_id=' . $order_id );

		$name       = esc_html( $customer['name'] ?? '' );
		$phone      = esc_html( $customer['phone'] ?? '' );
		$address    = esc_html( $customer['address'] ?? '' );
		$event_date = esc_html( $customer['eventDate'] ?? '' );
		$notes      = esc_html( $customer['notes'] ?? '' );
		$wants_q    = ! empty( $customer['wantsQuote'] ) ? 'כן' : 'לא';
		$pkg_name   = esc_html( $summary['packageName'] ?? '' );
		$portions   = (int) ( $summary['peopleCount'] ?? 0 );
		$total      = number_format( (float) ( $summary['totalPrice'] ?? 0 ) );

		ob_start();
		?>
		<!DOCTYPE html>
		<html lang="he" dir="rtl">
		<head><meta charset="UTF-8"></head>
		<body style="font-family: Arial, sans-serif; direction: rtl; background: #f8f9fa; padding: 20px;">
		<div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
			<div style="background: linear-gradient(120deg, #56ab2f, #a8e063); padding: 24px; color: #fff;">
				<h1 style="margin: 0; font-size: 22px;">🎉 הזמנה חדשה #<?php echo $order_id; ?></h1>
				<p style="margin: 4px 0 0; opacity: .9;">קייטרינג אגדה – מערכת הזמנות</p>
			</div>
			<div style="padding: 24px;">
				<h2 style="color: #333; border-bottom: 2px solid #56ab2f; padding-bottom: 8px;">פרטי הלקוח</h2>
				<table style="width:100%; border-collapse: collapse;">
					<tr><td style="padding:6px 0; color:#666; width:120px;">שם מלא</td><td style="font-weight:bold;"><?php echo $name; ?></td></tr>
					<tr><td style="padding:6px 0; color:#666;">טלפון</td><td><?php echo $phone; ?></td></tr>
					<tr><td style="padding:6px 0; color:#666;">כתובת</td><td><?php echo $address; ?></td></tr>
					<tr><td style="padding:6px 0; color:#666;">תאריך אירוע</td><td><?php echo $event_date; ?></td></tr>
					<?php if ( $notes ) : ?>
					<tr><td style="padding:6px 0; color:#666;">הערות</td><td><?php echo $notes; ?></td></tr>
					<?php endif; ?>
					<tr><td style="padding:6px 0; color:#666;">ניהול אירוע</td><td><?php echo $wants_q; ?></td></tr>
				</table>

				<h2 style="color: #333; border-bottom: 2px solid #56ab2f; padding-bottom: 8px; margin-top: 24px;">פרטי ההזמנה</h2>
				<table style="width:100%; border-collapse: collapse;">
					<tr><td style="padding:6px 0; color:#666; width:120px;">חבילה</td><td style="font-weight:bold;"><?php echo $pkg_name; ?></td></tr>
					<tr><td style="padding:6px 0; color:#666;">כמות מנות</td><td><?php echo $portions; ?></td></tr>
					<tr>
						<td style="padding:6px 0; color:#666;">סה"כ</td>
						<td style="font-size:18px; font-weight:bold; color:#56ab2f;"><?php echo $total; ?> ₪</td>
					</tr>
				</table>

				<?php if ( $whatsapp ) : ?>
				<h2 style="color: #333; border-bottom: 2px solid #56ab2f; padding-bottom: 8px; margin-top: 24px;">סיכום מלא</h2>
				<pre style="background:#f0f9eb; padding:16px; border-radius:8px; white-space:pre-wrap; font-family:Arial,sans-serif; font-size:13px; color:#333;"><?php echo $whatsapp; ?></pre>
				<?php endif; ?>

				<div style="margin-top:24px; text-align:center;">
					<a href="<?php echo esc_url( $admin_url ); ?>" style="background:#56ab2f; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">צפה בהזמנה בממשק הניהול</a>
				</div>
			</div>
		</div>
		</body>
		</html>
		<?php
		return ob_get_clean();
	}
}
