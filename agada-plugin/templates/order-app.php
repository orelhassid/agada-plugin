<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div id="agada-order-app">

	<!-- Main Application Header -->
	<header class="p-4 shadow-md z-50 flex" style="background-color: var(--color-surface)" id="agada-order-app-header">
		<div class="container mx-auto flex justify-between items-center max-w-7xl">
			<div class="flex items-center gap-3">
				<a href="https://www.agada-c.co.il/" class="flex items-center gap-3">
					<img src="https://www.agada-c.co.il/wp-content/uploads/2022/05/Untitled-2-1.png"
						 alt="לוגו קייטרינג אגדה" class="!h-12" />
					<h1 class="text-2xl font-bold" style="color: var(--color-text-strong)">קייטרינג אגדה</h1>
				</a>
			</div>
			<div class="p-2">
				<button id="theme-toggle" class="!p-0 rounded-full !w-10 !h-10 flex items-center justify-center"
						style="background-color: var(--color-border)">
					<svg id="Moon" width="24" height="24" viewBox="0 0 24 24" fill="none"
						 class="h-5 w-5 hidden dark:flex" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd"
							  d="M21.325 12.3462C21.205 12.2422 21.043 12.2002 20.888 12.2362C18.201 12.8342 15.188 11.5442 13.598 9.96117C11.955 8.31317 11.216 5.56117 11.76 3.11217C11.794 2.95717 11.753 2.79517 11.649 2.67517C11.544 2.55517 11.392 2.49417 11.231 2.50517C8.18998 2.75417 5.43298 4.46717 3.85498 7.08917C2.23598 9.78017 2.06298 13.0832 3.38198 16.1522C4.22898 18.1132 5.83498 19.7282 7.78698 20.5812C9.17498 21.1932 10.612 21.4972 12.022 21.4972C13.728 21.4972 15.394 21.0522 16.878 20.1662C19.525 18.5872 21.251 15.8202 21.495 12.7632C21.508 12.6052 21.445 12.4502 21.325 12.3462Z"
							  fill="currentColor"></path>
					</svg>
					<svg id="Sun" width="24" height="24" viewBox="0 0 24 24" fill="none"
						 class="h-5 w-5 flex dark:hidden" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd"
							  d="M6.57607 7.14051C6.72206 7.28651 6.91506 7.35951 7.10606 7.35951C7.29906 7.35951 7.49007 7.28651 7.63706 7.14051C7.93007 6.84651 7.93007 6.37151 7.63706 6.07851L6.66606 5.10951C6.37306 4.81651 5.89806 4.81751 5.60506 5.10951C5.31206 5.40351 5.31206 5.87751 5.60506 6.17051L6.57607 7.14051Z"
							  fill="currentColor"></path>
						<path fill-rule="evenodd" clip-rule="evenodd"
							  d="M12.5 5.12C12.914 5.12 13.25 4.784 13.25 4.37V3C13.25 2.586 12.914 2.25 12.5 2.25C12.086 2.25 11.75 2.586 11.75 3V4.37C11.75 4.784 12.086 5.12 12.5 5.12Z"
							  fill="currentColor"></path>
						<path fill-rule="evenodd" clip-rule="evenodd"
							  d="M5.622 11.9999C5.622 11.5859 5.286 11.2499 4.872 11.2499H3.5C3.086 11.2499 2.75 11.5859 2.75 11.9999C2.75 12.4139 3.086 12.7499 3.5 12.7499H4.872C5.286 12.7499 5.622 12.4139 5.622 11.9999Z"
							  fill="currentColor"></path>
						<path fill-rule="evenodd" clip-rule="evenodd"
							  d="M17.8935 7.35976C18.0845 7.35976 18.2775 7.28676 18.4235 7.14076L19.3945 6.17076C19.6875 5.87776 19.6875 5.40276 19.3945 5.10976C19.1015 4.81776 18.6265 4.81676 18.3335 5.10976L17.3635 6.07876C17.0705 6.37176 17.0705 6.84676 17.3635 7.13976C17.5095 7.28676 17.7015 7.35976 17.8935 7.35976Z"
							  fill="currentColor"></path>
						<path fill-rule="evenodd" clip-rule="evenodd"
							  d="M18.4238 16.8593C18.1298 16.5673 17.6548 16.5673 17.3628 16.8593C17.0698 17.1533 17.0698 17.6283 17.3628 17.9213L18.3338 18.8903C18.4808 19.0363 18.6728 19.1093 18.8638 19.1093C19.0568 19.1093 19.2478 19.0363 19.3948 18.8903C19.6878 18.5963 19.6878 18.1223 19.3948 17.8293L18.4238 16.8593Z"
							  fill="currentColor"></path>
						<path fill-rule="evenodd" clip-rule="evenodd"
							  d="M6.57607 16.8593L5.60506 17.8293C5.31206 18.1223 5.31206 18.5963 5.60506 18.8903C5.75206 19.0363 5.94306 19.1093 6.13607 19.1093C6.32706 19.1093 6.51906 19.0363 6.66606 18.8903L7.63706 17.9213C7.93007 17.6283 7.93007 17.1533 7.63706 16.8593C7.34507 16.5673 6.87007 16.5673 6.57607 16.8593Z"
							  fill="currentColor"></path>
						<path fill-rule="evenodd" clip-rule="evenodd"
							  d="M21.5 11.2499H20.128C19.714 11.2499 19.378 11.5859 19.378 11.9999C19.378 12.4139 19.714 12.7499 20.128 12.7499H21.5C21.914 12.7499 22.25 12.4139 22.25 11.9999C22.25 11.5859 21.914 11.2499 21.5 11.2499Z"
							  fill="currentColor"></path>
						<path fill-rule="evenodd" clip-rule="evenodd"
							  d="M12.5 18.8798C12.086 18.8798 11.75 19.2158 11.75 19.6298V20.9998C11.75 21.4138 12.086 21.7498 12.5 21.7498C12.914 21.7498 13.25 21.4138 13.25 20.9998V19.6298C13.25 19.2158 12.914 18.8798 12.5 18.8798Z"
							  fill="currentColor"></path>
						<path fill-rule="evenodd" clip-rule="evenodd"
							  d="M12.5 7.29968C9.91099 7.29968 7.80499 9.40768 7.80499 11.9997C7.80499 14.5917 9.91099 16.6997 12.5 16.6997C15.09 16.6997 17.196 14.5917 17.196 11.9997C17.196 9.40768 15.09 7.29968 12.5 7.29968Z"
							  fill="currentColor"></path>
					</svg>
				</button>
			</div>
		</div>
	</header>

	<!-- Sticky Navigation Bar -->
	<nav id="sticky-nav" class="sticky-nav hidden flex">
		<div class="container mx-auto max-w-7xl px-4">
			<div id="nav-links-container" class="flex items-center overflow-x-auto"></div>
		</div>
	</nav>

	<!-- Main Application Container -->
	<div class="container mx-auto p-4 lg:p-8 max-w-7xl">
		<div id="main-grid" class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8 mb-20 md:m-0">
			<main class="lg:col-span-2">

				<!-- Screen 1: Order Form -->
				<section id="screen-order-form" class="screen active flex flex-col gap-4"></section>

				<!-- Screen 2: Checkout -->
				<section id="screen-checkout" class="screen">
					<form id="checkout-form" class="p-6 space-y-5 card">
						<div id="checkout-error" class="hidden p-3 text-center text-sm rounded-lg"
							 style="background-color: rgba(239, 68, 68, 0.1); color: var(--color-danger);">
							אירעה שגיאה. אנא נסה שוב.
						</div>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
							<div>
								<label for="fullName" class="block text-base font-semibold mb-2"
									   style="color: var(--color-text-strong);">שם מלא</label>
								<input type="text" id="fullName" required
									   class="w-full !p-3 !rounded-lg !border !bg-transparent transition focus:ring-2 focus:ring-offset-1 focus:outline-none"
									   style="border-color: var(--color-border-light);" />
							</div>
							<div>
								<label for="phone" class="block text-base font-semibold mb-2"
									   style="color: var(--color-text-strong);">טלפון</label>
								<input type="tel" id="phone" required
									   class="w-full !p-3 !rounded-lg !border !bg-transparent transition focus:ring-2 focus:ring-offset-1 focus:outline-none"
									   style="border-color: var(--color-border-light);" />
							</div>
						</div>
						<div>
							<label for="address" class="block text-base font-semibold mb-2"
								   style="color: var(--color-text-strong);">כתובת האירוע</label>
							<input type="text" id="address" required
								   class="w-full !p-3 !rounded-lg !border !bg-transparent transition focus:ring-2 focus:ring-offset-1 focus:outline-none"
								   style="border-color: var(--color-border-light);" />
						</div>
						<div>
							<label class="block text-base font-semibold mb-3"
								   style="color: var(--color-text-strong);">תאריך האירוע</label>
							<div id="date-options-container" class="flex flex-wrap gap-2 mb-3"></div>
							<input type="date" id="eventDate"
								   class="w-full !p-3 !rounded-lg !border !bg-transparent transition focus:ring-2 focus:ring-offset-1 focus:outline-none"
								   style="border-color: var(--color-border-light);" />
						</div>
						<div>
							<label for="notes" class="block text-base font-semibold mb-2"
								   style="color: var(--color-text-strong);">הערות נוספות</label>
							<textarea id="notes" rows="4"
									  class="w-full !p-3 !rounded-lg !border !bg-transparent transition focus:ring-2 focus:ring-offset-1 focus:outline-none"
									  style="border-color: var(--color-border-light);"></textarea>
						</div>
					</form>
				</section>

				<!-- Screen 3: Summary -->
				<section id="screen-summary" class="screen text-center">
					<div class="p-8 card">
						<div id="summary-icon-success">
							<svg class="mx-auto h-16 w-16" style="color: var(--color-primary);" fill="none"
								 viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div id="summary-icon-error" class="hidden">
							<svg class="mx-auto h-16 w-16" style="color: var(--color-danger);" fill="none"
								 viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h2 id="summary-title" class="text-2xl font-semibold mt-4"
							style="color: var(--color-text-strong);">ההזמנה מוכנה לשליחה!</h2>
						<p id="summary-subtitle" class="mt-2 mb-6" style="color: var(--color-text-muted);">
							שלח לנו את סיכום ההזמנה ב-WhatsApp ונחזור אליך בהקדם לאישור סופי.
						</p>
						<div class="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
							<button id="copy-summary-btn"
									class="w-full sm:w-auto text-white font-bold py-3 px-6 rounded-lg btn-primary flex items-center justify-center gap-2">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path fill-rule="evenodd" clip-rule="evenodd"
										  d="M15.5654 6.68609C15.709 6.68609 15.8254 6.56969 15.8254 6.42609C15.8254 4.07609 14.3154 2.49609 12.0554 2.49609H6.28537C4.02537 2.49609 2.50537 4.07609 2.50537 6.42609V11.8661C2.50537 14.2261 4.02537 15.8061 6.28537 15.8061H6.37537C6.54106 15.8061 6.67537 15.6718 6.67537 15.5061V12.1261C6.67537 8.97609 8.89537 6.68609 11.9454 6.68609H15.5654Z"
										  fill="currentColor"></path>
									<path fill-rule="evenodd" clip-rule="evenodd"
										  d="M17.7215 8.18579H11.9485C9.69148 8.18579 8.17548 9.76979 8.17548 12.1258V17.5648C8.17548 19.9208 9.69148 21.5048 11.9485 21.5048H17.7205C19.9775 21.5048 21.4945 19.9208 21.4945 17.5648V12.1258C21.4945 9.76979 19.9785 8.18579 17.7215 8.18579Z"
										  fill="currentColor"></path>
								</svg>
								<span>העתק סיכום</span>
							</button>
							<a id="whatsapp-share-btn" href="#" target="_blank"
							   class="w-full sm:w-auto text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 btn-whatsapp">
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.687-1.475L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.078 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
								</svg>
								<span>שלח לנו ב-WhatsApp</span>
							</a>
						</div>
						<button id="new-order-btn"
								class="w-full sm:w-auto text-center mt-4 py-2 rounded-lg btn-secondary">
							התחל הזמנה חדשה
						</button>
						<div class="mt-6 p-4 rounded-lg text-right text-sm"
							 style="background-color: var(--color-background)">
							<p id="friendly-summary" class="whitespace-pre-wrap break-words"
							   style="text-align: right"></p>
						</div>
					</div>
				</section>
			</main>

			<!-- Side Cart (Desktop) -->
			<aside id="side-cart" class="lg:col-span-1">
				<div class="sticky top-0 md:top-16">
					<div id="side-cart-content" class="p-6 card"></div>
				</div>
			</aside>
		</div>
	</div>

	<!-- Mobile Summary Trigger -->
	<div id="mobile-summary-trigger" class="lg:hidden fixed bottom-0 left-0 right-0 p-4"
		 style="background: var(--color-surface); border-top: 1px solid var(--color-border); transform: translateY(100%); transition: transform 0.3s ease-in-out;">
		<button
			class="w-full font-bold py-3 px-4 rounded-lg text-lg flex justify-between items-center btn-primary">
			<span>🛒 הצג סיכום הזמנה</span>
			<span id="mobile-summary-price">0 ₪</span>
		</button>
	</div>

	<!-- Mobile Summary Modal -->
	<div id="mobile-summary-modal"
		 class="fixed inset-0 bg-black bg-opacity-60 z-[60] opacity-0 mobile-summary-modal"
		 style="display:none;">
		<div class="absolute inset-0" id="mobile-summary-overlay"></div>
		<div id="mobile-summary-panel"
			 class="absolute bottom-0 left-0 right-0 rounded-t-2xl transform translate-y-full mobile-summary-panel">
			<div class="p-2 absolute top-2 left-2 z-10">
				<button id="mobile-summary-close-btn"
						class="h-8 w-8 !p-0 rounded-full flex items-center justify-center mobile-modal-close-btn">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							  d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			<div id="mobile-summary-content-container" class="p-4 pt-8 max-h-[70vh] overflow-y-auto"></div>
		</div>
	</div>

	<!-- Resume Order Modal -->
	<div id="resume-order-modal"
		 class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 hidden">
		<div class="p-8 text-center max-w-sm card">
			<h3 class="text-xl font-bold mb-4" style="color: var(--color-text-strong)">הזמנה בתהליך</h3>
			<p class="mb-6">נראה שהתחלת הזמנה ולא סיימת אותה. האם תרצה להמשיך מהיכן שהפסקת?</p>
			<div class="flex justify-center gap-4">
				<button id="resume-yes-btn" class="font-bold py-2 px-6 rounded-lg btn-primary">כן, המשך</button>
				<button id="resume-no-btn" class="font-bold py-2 px-6 rounded-lg btn-secondary"
						style="background-color: var(--color-border)">לא, התחל חדש</button>
			</div>
		</div>
	</div>

</div><!-- #agada-order-app -->
