<?php
declare( strict_types=1 );
if ( ! defined( 'ABSPATH' ) ) exit;

$whatsapp     = sanitize_text_field( (string) get_option( 'agada_whatsapp_number', '972552239120' ) );
$email        = sanitize_email( (string) get_option( 'agada_notification_email', get_option( 'admin_email' ) ) );
$min_portions = absint( get_option( 'agada_default_min_portions', 30 ) );
$notices      = (string) get_option( 'agada_notices', '[]' );
$special      = (string) get_option( 'agada_special_dates', '[]' );
?>
<div class="wrap agada-admin" dir="rtl">
	<h1>הגדרות אגדה</h1>
	<hr class="wp-header-end">

	<div class="agada-card" style="max-width:900px; margin-bottom:20px;">
		<h2>התחלה מהירה</h2>
		<p class="description">
			דף זה מרכז את כל ההגדרות הנדרשות להפעלת מערכת ההזמנות. לאחר שמירת ההגדרות, ניתן לפרסם את הטופס באתר באמצעות השורטקוד.
		</p>
		<ol style="margin: 0 20px 0 0; line-height: 1.8;">
			<li>הגדירו מספר WhatsApp לקבלת פניות וסיכומי הזמנה.</li>
			<li>הגדירו אימייל לקבלת התראות על הזמנות חדשות.</li>
			<li>עדכנו מינימום מנות כברירת מחדל ותאריכים מיוחדים לפי הצורך.</li>
			<li>שמרו את ההגדרות באמצעות הכפתור בתחתית הדף.</li>
		</ol>

		<h3 style="margin-top:20px;">שימוש (Usage)</h3>
		<p>כדי להציג את אפליקציית ההזמנה באתר, הוסיפו את השורטקוד הבא לעמוד או לפוסט:</p>
		<p>
			<code>[agada_order]</code>
		</p>
		<p class="description">
			לאחר פרסום העמוד, לקוחות ימלאו את הטופס והמערכת תשלח את פרטי ההזמנה ל-WhatsApp ולאימייל שהוגדרו.
		</p>
	</div>

	<form method="post" action="options.php">
		<?php settings_fields( 'agada_settings_group' ); ?>

		<div class="agada-card" style="max-width:700px;">
			<h2>הגדרות כלליות</h2>
			<table class="form-table">
				<tr>
					<th><label for="agada_whatsapp_number">מספר WhatsApp</label></th>
					<td>
						<input type="text" id="agada_whatsapp_number" name="agada_whatsapp_number"
							   value="<?php echo esc_attr( $whatsapp ); ?>" class="regular-text">
						<p class="description">לדוגמה: 972552239120 (קוד מדינה ללא +)</p>
					</td>
				</tr>
				<tr>
					<th><label for="agada_notification_email">מייל לקבלת הזמנות</label></th>
					<td>
						<input type="email" id="agada_notification_email" name="agada_notification_email"
							   value="<?php echo esc_attr( $email ); ?>" class="regular-text">
					</td>
				</tr>
				<tr>
					<th><label for="agada_default_min_portions">מינימום מנות (ברירת מחדל)</label></th>
					<td>
						<input type="number" id="agada_default_min_portions" name="agada_default_min_portions"
							   value="<?php echo esc_attr( $min_portions ); ?>" min="1" max="999" class="small-text">
					</td>
				</tr>
			</table>
		</div>

		<div class="agada-card" style="max-width:700px; margin-top:20px;">
			<h2>תאריכים מיוחדים (מינימום שונה)</h2>
			<p class="description">הוסיפו תאריכים שבהם המינימום שונה מהרגיל (לדוגמה: פורים).</p>
			<div id="agada-special-dates-list">
				<?php
				$dates = json_decode( $special, true ) ?: [];
				foreach ( $dates as $d ) :
					$date = esc_attr( $d['date'] ?? '' );
					$min  = esc_attr( $d['minPortions'] ?? '' );
				?>
				<div class="agada-repeater-row">
					<input type="date" name="agada_special_dates_date[]" value="<?php echo $date; ?>">
					<input type="number" name="agada_special_dates_min[]" value="<?php echo $min; ?>" placeholder="מינימום מנות" min="1">
					<button type="button" class="button agada-remove-row">הסר</button>
				</div>
				<?php endforeach; ?>
			</div>
			<button type="button" class="button agada-add-special-date" style="margin-top:10px;">+ הוסף תאריך</button>
			<input type="hidden" id="agada_special_dates" name="agada_special_dates" value="<?php echo esc_attr( $special ); ?>">
		</div>

		<div class="agada-card" style="max-width:700px; margin-top:20px;">
			<h2>הודעות / מודעות</h2>
			<p class="description">הודעות שיוצגו ללקוחות בתקופות מסוימות.</p>
			<div id="agada-notices-list">
				<?php
				$notice_items = json_decode( $notices, true ) ?: [];
				foreach ( $notice_items as $n ) :
					$text  = esc_attr( $n['text'] ?? '' );
					$start = esc_attr( $n['startDate'] ?? '' );
					$end   = esc_attr( $n['endDate'] ?? '' );
				?>
				<div class="agada-repeater-row agada-notice-row">
					<input type="text" name="agada_notices_text[]" value="<?php echo $text; ?>" placeholder="טקסט ההודעה" class="widefat">
					<div class="agada-date-range">
						<label>מ: <input type="date" name="agada_notices_start[]" value="<?php echo $start; ?>"></label>
						<label>עד: <input type="date" name="agada_notices_end[]" value="<?php echo $end; ?>"></label>
					</div>
					<button type="button" class="button agada-remove-row">הסר</button>
				</div>
				<?php endforeach; ?>
			</div>
			<button type="button" class="button agada-add-notice" style="margin-top:10px;">+ הוסף הודעה</button>
			<input type="hidden" id="agada_notices" name="agada_notices" value="<?php echo esc_attr( $notices ); ?>">
		</div>

		<?php submit_button( 'שמור הגדרות' ); ?>
	</form>
</div>
