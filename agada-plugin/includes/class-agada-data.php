<?php
declare( strict_types=1 );

namespace Agada;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Static app data: items, categories, packages.
 * Edit this file to update the menu or pricing.
 */
class Data {

	public static function get_app_data(): array {
		return [
			'items'      => self::get_runtime_items(),
			'categories' => self::get_categories(),
			'packages'   => self::get_runtime_packages(),
		];
	}

	public static function get_seed_items(): array {
		return self::get_items();
	}

	public static function get_seed_packages(): array {
		return self::get_packages();
	}

	private static function get_runtime_items(): array {
		if ( class_exists( '\Agada\Repository' ) ) {
			$items = Repository::get_products_map();
			if ( ! empty( $items ) ) {
				return $items;
			}
		}

		return self::get_items();
	}

	private static function get_runtime_packages(): array {
		if ( class_exists( '\Agada\Repository' ) ) {
			$packages = Repository::get_packages_map();
			if ( ! empty( $packages ) ) {
				return $packages;
			}
		}

		return self::get_packages();
	}

	private static function get_items(): array {
		return [
			'item_salad_matbucha'          => [ 'name' => 'מטבוחה' ],
			'item_salad_fried_eggplant'    => [ 'name' => 'חציל מטוגן בוינגרט' ],
			'item_salad_eggplant_mayo'     => [ 'name' => 'חציל במיונז' ],
			'item_salad_zaalouk'           => [ 'name' => 'חציל ז׳עלוק - קלוי' ],
			'item_salad_baladi_eggplant'   => [ 'name' => 'חציל בלאדי-חציל קלוי בטחינה' ],
			'item_salad_moroccan_beet'     => [ 'name' => 'סלק מרוקאי' ],
			'item_salad_tripoli_carrot'    => [ 'name' => 'גזר טריפוליטאי' ],
			'item_salad_green_salad'       => [ 'name' => 'סלט ירוק – בתוספת פיצוחים חמוציות ורוטב סילאן' ],
			'item_salad_spicy_pepper'      => [ 'name' => 'פלפל חריף-מתובל בשום' ],
			'item_salad_hummus'            => [ 'name' => 'חומוס ישראלי' ],
			'item_salad_tahini'            => [ 'name' => 'טחינה' ],
			'item_salad_arabic_salad'      => [ 'name' => 'סלט ערבי-קוביות עגבניות בירק שום ופלפל חריף' ],
			'item_salad_israeli_salad'     => [ 'name' => 'סלט ירקות ישראלי' ],
			'item_salad_lettuce_cherry'    => [ 'name' => 'חסה עם שרי', 'imageUrl' => 'https://www.agada-c.co.il/wp-content/uploads/2025/09/cabbage.png' ],
			'item_salad_white_cabbage'     => [ 'name' => 'כרוב לבן- בירק חמוציות ובוטנים' ],
			'item_salad_pickles'           => [ 'name' => 'חמוצי הבית' ],
			'item_salad_olives'            => [ 'name' => 'זיתים מבוקעים גדולים' ],
			'item_salad_cucumber_dill'     => [ 'name' => 'טבעות מלפפון בשמיר' ],
			'item_salad_coleslaw'          => [ 'name' => 'כרוב וגזר במיונז (קולסלו)' ],
			'item_salad_red_cabbage_mayo'  => [ 'name' => 'כרוב אדום במיונז' ],
			'item_salad_red_cabbage_cranberry' => [ 'name' => 'כרוב אדום וחמוציות' ],
			'item_salad_mexican_corn'      => [ 'name' => 'תירס מקסיקני' ],
			'item_salad_beans'             => [ 'name' => 'פולים-מתובלים בכמון' ],
			'item_salad_potato_mayo'       => [ 'name' => 'סלט מיונז-קוביות תפו"א' ],
			'item_salad_tabbouleh'         => [ 'name' => 'טאבולה' ],

			// First courses
			'item_fc_musht_mizrahi'        => [ 'name' => 'פילה מושט מזרחי - ברוטב עגבניות, פלפל שום וגרגרי חומוס.' ],
			'item_fc_musht_fried'          => [ 'name' => 'פילה מושט מטוגן – מוגש לצד רוטב צ׳רמלה פיקנטי ופלחי לימון.' ],
			'item_fc_sole_fried'           => [ 'name' => 'סול מטוגן – מוגש לצד רוטב צ׳רמלה.' ],
			'item_fc_salmon_mizrahi'       => [ 'name' => 'סלומון מזרחי – פילה סלומון טרי ברוטב עשיר של כוסברה פלפלים שום וחומוס מבושל.' ],
			'item_fc_salmon_herbs'         => [ 'name' => 'סלומון בעשבי תיבול – פילה סלומון עסיסי בעשבי תיבול טריים, שום וחרדל.' ],
			'item_fc_princess_moroccan'    => [ 'name' => 'דג נסיכה מזרחי בסגנון מרוקאי' ],
			'item_fc_borekas_potato'       => [ 'name' => 'בורקס תפו"א- ברוטב פטריות' ],
			'item_fc_chef_pastry'          => [ 'name' => 'מאפה השף' ],
			'item_fc_tortilla_beef'        => [ 'name' => 'טורטיה מקסיקנית - במילוי בשר עגל – מומלץ!.' ],
			'item_fc_tortilla_veg'         => [ 'name' => 'טורטיה מקסיקנית במילוי ירקות – מנה טבעונית.' ],
			'item_fc_meat_roll'            => [ 'name' => 'רול בשר עבודת יד' ],

			// Main courses (regular)
			'item_mc_chicken_grill'        => [ 'name' => 'גריל עוף – כרעיים צלויות' ],
			'item_mc_chicken_half'         => [ 'name' => 'חצאי כרעיים' ],
			'item_mc_pargit_steak'         => [ 'name' => 'סטייק פרגית ארוך על האש' ],
			'item_mc_schnitzel'            => [ 'name' => 'שניצל וינאי – שניצל עוף פריך וזהוב מתובל בפרורי לחם ושומשום' ],
			'item_mc_schnitzel_half'       => [ 'name' => 'חצאי שניצל' ],
			'item_mc_beef_roast'           => [ 'name' => 'צלי כתף ארגנטינאי טרי' ],
			'item_mc_tongue'               => [ 'name' => 'לשון ברוטב' ],
			'item_mc_asado'                => [ 'name' => 'אסאדו – נתחי אסאדו ארגנטינאי בבישול איטי' ],
			'item_mc_kebab'                => [ 'name' => 'קבב אגדה – שיפודי קבב בעבודת יד עסיסיים על האש – מומלץ!.' ],
			'item_mc_chicken_skewer'       => [ 'name' => 'שיפודי עוף על האש' ],
			'item_mc_chicken_breast'       => [ 'name' => 'חזה עוף' ],

			// Main courses (Shabbat)
			'item_mc_shabbat_chicken_grill'   => [ 'name' => 'גריל עוף – כרעיים צלויות' ],
			'item_mc_shabbat_chicken_half'    => [ 'name' => 'חצאי כרעיים' ],
			'item_mc_shabbat_pargit_steak'    => [ 'name' => 'סטייק פרגית ארוך על האש' ],
			'item_mc_shabbat_schnitzel'       => [ 'name' => 'שניצל וינאי – שניצל עוף פריך וזהוב מתובל בפרורי לחם ושומשום' ],
			'item_mc_shabbat_schnitzel_half'  => [ 'name' => 'חצאי שניצל' ],
			'item_mc_shabbat_tongue'          => [ 'name' => 'לשון ברוטב' ],
			'item_mc_shabbat_kebab'           => [ 'name' => 'קבב אגדה – שיפודי קבב בעבודת יד עסיסיים על האש – מומלץ!.' ],
			'item_mc_shabbat_chicken_skewer'  => [ 'name' => 'שיפודי עוף על האש' ],
			'item_mc_shabbat_chicken_breast'  => [ 'name' => 'חזה עוף' ],

			// Side dishes
			'item_side_rice_almonds'       => [ 'name' => 'אורז לבן עם שקדים וצימוקים' ],
			'item_side_baby_potato'        => [ 'name' => 'תפו"א בייבי בעשבי תיבול ורוזמרין' ],
			'item_side_olives_mushrooms'   => [ 'name' => 'זיתים עם פטריות בסגנון מרוקאי' ],
			'item_side_artichoke'          => [ 'name' => 'ארטישוק ברוטב, פטריות שלמות ובצל' ],
			'item_side_peas_carrot'        => [ 'name' => 'אפונה וגזר' ],
			'item_side_stir_fry_veg'       => [ 'name' => 'ירקות מוקפצים – פלפלים, פטריות שלמות, גזר, קישוא מוקפץ ברוטב עם שומשום.' ],
			'item_side_spicy_beans'        => [ 'name' => 'שעועית ברוטב פיקנטי' ],
			'item_side_green_beans'        => [ 'name' => 'שעועית ירוקה מוקפצת – עם טריאקי ושומשום' ],
			'item_side_couscous'           => [ 'name' => 'קוסקוס מרוקאי' ],
			'item_side_couscous_veg'       => [ 'name' => 'לקט ירקות מבושלים לקוסקוס' ],

			// Breads
			'item_bread_challah_roll'      => [ 'name' => 'לחמניה עגולה קלועה' ],
			'item_bread_mezonot_roll'      => [ 'name' => 'לחמניה מזונות' ],
			'item_bread_parana'            => [ 'name' => 'לחם בית (פרנה)' ],

			// Third meal fish
			'item_fish3_musht_mizrahi'     => [ 'name' => 'פילה מושט מזרחי - ברוטב עגבניות, פלפל שום וגרגרי חומוס.' ],
			'item_fish3_musht_fried'       => [ 'name' => 'פילה מושט מטוגן – מוגש לצד רוטב צ׳רמלה פיקנטי ופלחי לימון.' ],

			// Shabbat special
			'item_shabbat_cholent'         => [ 'name' => 'חבילת חמין עשיר', 'isPredefined' => true ],

			// Paid extras
			'item_extra_khorest_sabzi'     => [ 'name' => 'חורשט סבזי', 'isOptionalExtra' => true, 'pricePerPerson' => true, 'extraCost' => 8 ],
			'item_extra_gondi'             => [ 'name' => 'גונדי', 'isOptionalExtra' => true, 'pricePerPerson' => true, 'extraCost' => 10 ],
			'item_extra_fish_patties'      => [ 'name' => '50 קציצות דגים סלומון ברוטב מזרחי עבודת יד - מומלץ!', 'isOptionalExtra' => true, 'extraCost' => 250 ],
			'item_extra_cigars'            => [ 'name' => 'סיגרים גסטרונום ענק', 'isOptionalExtra' => true, 'extraCost' => 150 ],
			'item_extra_pastels'           => [ 'name' => 'פסטלים גסטרונום ענק', 'isOptionalExtra' => true, 'extraCost' => 150 ],
			'item_extra_kubbeh'            => [ 'name' => 'קובה בורגול גסטרונום ענק', 'isOptionalExtra' => true, 'extraCost' => 150 ],
			'item_extra_head_meat'         => [ 'name' => 'בשר ראש בסגנון מזרחי גסטרונום ענק', 'isOptionalExtra' => true, 'extraCost' => 450 ],
			'item_extra_chips'             => [ 'name' => 'צ׳יפס גסטרונום ענק', 'isOptionalExtra' => true, 'extraCost' => 150 ],
			'item_extra_schnitzelonim'     => [ 'name' => 'שניצלונים גסטרונום ענק', 'isOptionalExtra' => true, 'extraCost' => 250 ],
			'item_extra_desserts'          => [ 'name' => 'פלטת מיקס קינוחים', 'isOptionalExtra' => true, 'extraCost' => 180 ],
		];
	}

	private static function get_categories(): array {
		return [
			'cat_salads_8' => [
				'name'           => 'סלטים',
				'emoji'          => '🥗',
				'selectionLimit' => 8,
				'itemIds'        => [
					'item_salad_matbucha', 'item_salad_fried_eggplant', 'item_salad_eggplant_mayo',
					'item_salad_zaalouk', 'item_salad_baladi_eggplant', 'item_salad_moroccan_beet',
					'item_salad_tripoli_carrot', 'item_salad_green_salad', 'item_salad_spicy_pepper',
					'item_salad_hummus', 'item_salad_tahini', 'item_salad_arabic_salad',
					'item_salad_israeli_salad', 'item_salad_lettuce_cherry', 'item_salad_white_cabbage',
					'item_salad_pickles', 'item_salad_olives', 'item_salad_cucumber_dill',
					'item_salad_coleslaw', 'item_salad_red_cabbage_mayo', 'item_salad_red_cabbage_cranberry',
					'item_salad_mexican_corn', 'item_salad_beans', 'item_salad_potato_mayo', 'item_salad_tabbouleh',
				],
			],
			'cat_first_courses_2' => [
				'name'           => 'מנות ראשונות',
				'emoji'          => '🐟',
				'selectionLimit' => 2,
				'itemIds'        => [
					'item_fc_musht_mizrahi', 'item_fc_musht_fried', 'item_fc_sole_fried',
					'item_fc_salmon_mizrahi', 'item_fc_salmon_herbs', 'item_fc_princess_moroccan',
					'item_fc_borekas_potato', 'item_fc_chef_pastry', 'item_fc_tortilla_beef',
					'item_fc_tortilla_veg', 'item_fc_meat_roll',
				],
			],
			'cat_main_courses_3' => [
				'name'           => 'מנות עיקריות',
				'emoji'          => '🍖',
				'selectionLimit' => 3,
				'itemIds'        => [
					'item_mc_chicken_grill', 'item_mc_chicken_half', 'item_mc_pargit_steak',
					'item_mc_schnitzel', 'item_mc_schnitzel_half', 'item_mc_beef_roast',
					'item_mc_tongue', 'item_mc_asado', 'item_mc_kebab',
					'item_mc_chicken_skewer', 'item_mc_chicken_breast',
				],
			],
			'cat_main_courses_shabbat_3' => [
				'name'           => 'מנות עיקריות (שבת בבוקר)',
				'emoji'          => '🍖',
				'selectionLimit' => 3,
				'itemIds'        => [
					'item_mc_shabbat_chicken_grill', 'item_mc_shabbat_chicken_half', 'item_mc_shabbat_pargit_steak',
					'item_mc_shabbat_schnitzel', 'item_mc_shabbat_schnitzel_half', 'item_mc_shabbat_tongue',
					'item_mc_shabbat_kebab', 'item_mc_shabbat_chicken_skewer', 'item_mc_shabbat_chicken_breast',
				],
			],
			'cat_sides_3' => [
				'name'           => 'תוספות חמות',
				'emoji'          => '🍚',
				'selectionLimit' => 3,
				'itemIds'        => [
					'item_side_rice_almonds', 'item_side_baby_potato', 'item_side_olives_mushrooms',
					'item_side_artichoke', 'item_side_peas_carrot', 'item_side_stir_fry_veg',
					'item_side_spicy_beans', 'item_side_green_beans', 'item_side_couscous', 'item_side_couscous_veg',
				],
			],
			'cat_breads_2' => [
				'name'           => 'לחמניות ופרנות',
				'emoji'          => '🥖',
				'selectionLimit' => 2,
				'itemIds'        => [ 'item_bread_challah_roll', 'item_bread_mezonot_roll', 'item_bread_parana' ],
			],
			'cat_third_meal_fish_1' => [
				'name'           => 'דגים לסעודה שלישית',
				'emoji'          => '🐠',
				'selectionLimit' => 1,
				'itemIds'        => [ 'item_fish3_musht_mizrahi', 'item_fish3_musht_fried' ],
			],
			'cat_extras' => [
				'name'   => 'תוספות ופינוקים',
				'emoji'  => '✨',
				'groups' => [
					[
						'name'    => 'תוספות מיוחדות',
						'emoji'   => '⭐',
						'itemIds' => [ 'item_extra_khorest_sabzi', 'item_extra_gondi' ],
					],
					[
						'name'    => 'פלטות פינוק',
						'emoji'   => '🍽️',
						'itemIds' => [
							'item_extra_fish_patties', 'item_extra_cigars', 'item_extra_pastels',
							'item_extra_kubbeh', 'item_extra_head_meat', 'item_extra_chips', 'item_extra_schnitzelonim',
						],
					],
					[
						'name'    => 'מנה אחרונה',
						'emoji'   => '🍰',
						'itemIds' => [ 'item_extra_desserts' ],
					],
					[
						'name'      => 'ניהול אירוע',
						'emoji'     => '🤵',
						'isSpecial' => true,
						'id'        => 'event-management',
					],
				],
			],
		];
	}

	private static function get_packages(): array {
		return [
			'pkg_fish' => [
				'name'               => 'אגדת הדגים',
				'includes'           => [
					'8 סוגי סלטים לבחירה',
					'2 מנות ראשונות',
					'3 תוספות חמות',
					'לחמניות ופרנות עבודת יד',
				],
				'basePricePerPerson' => 48,
				'imageUrl'           => 'https://www.agada-c.co.il/wp-content/uploads/2025/08/freepik__the-style-is-candid-image-photography-with-natural__2426.png',
				'meals'              => [
					[
						'name'        => 'הארוחה העיקרית',
						'categoryIds' => [ 'cat_salads_8', 'cat_first_courses_2', 'cat_sides_3', 'cat_breads_2' ],
					],
				],
			],
			'pkg_meat' => [
				'name'               => 'אגדת הבשרים',
				'includes'           => [
					'8 סוגי סלטים לבחירה',
					'3 מנות עיקריות',
					'3 תוספות חמות',
					'לחמניות ופרנות עבודת יד',
				],
				'basePricePerPerson' => 55,
				'imageUrl'           => 'https://www.agada-c.co.il/wp-content/uploads/2025/08/אגדת-הבשרים-תמונה-ראשית.png',
				'meals'              => [
					[
						'name'        => 'הארוחה העיקרית',
						'categoryIds' => [ 'cat_salads_8', 'cat_main_courses_3', 'cat_sides_3', 'cat_breads_2' ],
					],
				],
			],
			'pkg_perfect' => [
				'name'               => 'האגדה המושלמת',
				'includes'           => [
					'8 סוגי סלטים לבחירה',
					'2 מנות ראשונות',
					'3 מנות עיקריות',
					'3 תוספות חמות',
					'לחמניות ופרנות עבודת יד',
				],
				'basePricePerPerson' => 70,
				'imageUrl'           => 'https://www.agada-c.co.il/wp-content/uploads/2025/08/freepik__enhance__10857-scaled.png',
				'meals'              => [
					[
						'name'        => 'הארוחה העיקרית',
						'categoryIds' => [ 'cat_salads_8', 'cat_first_courses_2', 'cat_main_courses_3', 'cat_sides_3', 'cat_breads_2' ],
					],
				],
			],
			'pkg_shabbat' => [
				'name'               => 'אגדת השבת',
				'includes'           => [
					'8 סוגי סלטים לבחירה',
					'כולל 3 סעודות מלאות',
					'3 תוספות חמות',
					'לחמניות ופרנות עבודת יד',
				],
				'basePricePerPerson' => 140,
				'imageUrl'           => 'https://www.agada-c.co.il/wp-content/uploads/2025/08/freepik__the-style-is-candid-image-photography-with-natural__2425.png',
				'meals'              => [
					[
						'name'        => 'סלטים (נבחרים פעם אחת לכל הסעודות)',
						'categoryIds' => [ 'cat_salads_8' ],
					],
					[
						'name'        => 'סעודה ראשונה',
						'categoryIds' => [ 'cat_first_courses_2', 'cat_main_courses_3', 'cat_sides_3', 'cat_breads_2' ],
					],
					[
						'name'      => 'סעודת שבת בבוקר',
						'hasChoice' => true,
						'options'   => [
							[
								'id'           => 'cholent',
								'name'         => 'חבילת חמין עשיר',
								'description'  => 'חמין בקר עשיר עם תפו"א, חיטה, שעועית וביצים.',
								'itemIdsToAdd' => [ 'item_shabbat_cholent' ],
								'categoryIds'  => [],
							],
							[
								'id'           => 'mains_and_sides',
								'name'         => 'מנות עיקריות ותוספות',
								'description'  => 'בחירה מתוך מגוון מנות עיקריות ותוספות חמות.',
								'itemIdsToAdd' => [],
								'categoryIds'  => [ 'cat_main_courses_shabbat_3', 'cat_sides_3' ],
							],
						],
					],
					[
						'name'        => 'סעודה שלישית',
						'categoryIds' => [ 'cat_third_meal_fish_1' ],
					],
				],
			],
		];
	}
}
