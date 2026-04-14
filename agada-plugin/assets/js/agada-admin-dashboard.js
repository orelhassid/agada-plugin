/* global agadaAdminDashboard, wp */
( function () {
	const { createElement: el, Fragment, useEffect, useMemo, useState } = wp.element;
	const apiFetch = wp.apiFetch;

	apiFetch.use( apiFetch.createNonceMiddleware( agadaAdminDashboard.restNonce ) );

	const TABS = [ 'products', 'packages', 'settings' ];

	function App() {
		const [ tab, setTab ] = useState( 'products' );
		const [ products, setProducts ] = useState( [] );
		const [ packages, setPackages ] = useState( [] );
		const [ settings, setSettings ] = useState( null );
		const [ selected, setSelected ] = useState( [] );
		const [ sidePanel, setSidePanel ] = useState( { open: false, type: '', record: null } );
		const [ search, setSearch ] = useState( '' );
		const [ message, setMessage ] = useState( '' );

		const loadAll = async () => {
			const [ pRes, pkgRes, sRes ] = await Promise.all( [
				apiFetch( { path: '/agada/v1/products' } ),
				apiFetch( { path: '/agada/v1/packages' } ),
				apiFetch( { path: '/agada/v1/settings' } ),
			] );
			setProducts( pRes.items || [] );
			setPackages( pkgRes.items || [] );
			setSettings( sRes || {} );
		};

		useEffect( () => {
			loadAll();
		}, [] );

		useEffect( () => {
			setSelected( [] );
		}, [ tab ] );

		const rows = useMemo( () => {
			const source = tab === 'products' ? products : packages;
			const q = search.trim().toLowerCase();
			if ( ! q ) {
				return source;
			}
			return source.filter( ( row ) => ( row.name || '' ).toLowerCase().includes( q ) || ( row.slug || '' ).toLowerCase().includes( q ) );
		}, [ tab, products, packages, search ] );

		const toggleSelect = ( id ) => {
			setSelected( ( prev ) => ( prev.includes( id ) ? prev.filter( ( x ) => x !== id ) : [ ...prev, id ] ) );
		};

		const bulkAction = async ( action ) => {
			if ( selected.length === 0 ) return;
			const path = tab === 'products' ? '/agada/v1/products/bulk' : '/agada/v1/packages/bulk';
			const response = await apiFetch( {
				path,
				method: 'POST',
				data: { action, ids: selected },
			} );
			if ( tab === 'products' ) setProducts( response.items || [] );
			if ( tab === 'packages' ) setPackages( response.items || [] );
			setSelected( [] );
			setMessage( 'Bulk action completed.' );
		};

		const saveRecord = async (payload) => {
			const path = sidePanel.type === 'products' ? '/agada/v1/products' : '/agada/v1/packages';
			const response = await apiFetch( { path, method: 'POST', data: payload } );
			if ( sidePanel.type === 'products' ) setProducts( response.items || [] );
			if ( sidePanel.type === 'packages' ) setPackages( response.items || [] );
			setSidePanel( { open: false, type: '', record: null } );
			setMessage( 'Saved successfully.' );
		};

		const saveSettings = async () => {
			await apiFetch( { path: '/agada/v1/settings', method: 'POST', data: settings } );
			setMessage( 'Settings saved.' );
		};

		return el(
			Fragment,
			null,
			el( 'h1', { className: 'agada-h1' }, 'Agada Admin Dashboard' ),
			el( 'p', { className: 'agada-subtitle' }, 'Manage products, packages and order app settings.' ),
			message ? el( 'div', { className: 'agada-toast' }, message ) : null,
			el(
				'div',
				{ className: 'agada-tabs' },
				TABS.map( ( t ) =>
					el(
						'button',
						{
							key: t,
							className: `agada-tab ${ tab === t ? 'active' : '' }`,
							onClick: () => setTab( t ),
						},
						t.charAt( 0 ).toUpperCase() + t.slice( 1 )
					)
				)
			),
			tab !== 'settings'
				? el(
					'div',
					{ className: 'agada-toolbar' },
					el( 'input', {
						className: 'agada-input',
						placeholder: 'Search by name or slug',
						value: search,
						onChange: ( e ) => setSearch( e.target.value ),
					} ),
					el(
						'button',
						{ className: 'button button-primary', onClick: () => setSidePanel( { open: true, type: tab, record: null } ) },
						`New ${ tab === 'products' ? 'Product' : 'Package' }`
					)
				)
				: null,
			tab !== 'settings' && selected.length > 0
				? el(
					'div',
					{ className: 'agada-bulk-bar' },
					el( 'span', null, `${ selected.length } selected` ),
					el( 'button', { className: 'button', onClick: () => bulkAction( 'activate' ) }, 'Activate' ),
					el( 'button', { className: 'button', onClick: () => bulkAction( 'deactivate' ) }, 'Deactivate' ),
					el( 'button', { className: 'button button-link-delete', onClick: () => bulkAction( 'delete' ) }, 'Delete' )
				)
				: null,
			tab === 'settings'
				? el( SettingsScreen, { settings, setSettings, saveSettings } )
				: el( DataTable, { rows, tab, selected, toggleSelect, setSidePanel } ),
			sidePanel.open
				? el( SidePanel, { sidePanel, onClose: () => setSidePanel( { open: false, type: '', record: null } ), onSave: saveRecord } )
				: null
		);
	}

	function DataTable( { rows, tab, selected, toggleSelect, setSidePanel } ) {
		return el(
			'table',
			{ className: 'widefat striped agada-table' },
			el(
				'thead',
				null,
				el(
					'tr',
					null,
					el( 'th', null, '' ),
					el( 'th', null, 'Name' ),
					el( 'th', null, 'Slug' ),
					el( 'th', null, 'Status' ),
					el( 'th', null, 'Actions' )
				)
			),
			el(
				'tbody',
				null,
				rows.map( ( row ) =>
					el(
						'tr',
						{ key: row.id },
						el( 'td', null, el( 'input', { type: 'checkbox', checked: selected.includes( row.id ), onChange: () => toggleSelect( row.id ) } ) ),
						el( 'td', null, row.name ),
						el( 'td', null, row.slug ),
						el( 'td', null, Number( row.is_active ) ? 'Active' : 'Inactive' ),
						el(
							'td',
							null,
							el(
								'button',
								{ className: 'button button-small', onClick: () => setSidePanel( { open: true, type: tab, record: row } ) },
								'Edit'
							)
						)
					)
				)
			)
		);
	}

	function SidePanel( { sidePanel, onClose, onSave } ) {
		const [ form, setForm ] = useState( sidePanel.record || {} );

		const update = ( key, value ) => setForm( ( prev ) => ( { ...prev, [ key ]: value } ) );

		return el(
			'div',
			{ className: 'agada-sidepanel-wrap' },
			el( 'div', { className: 'agada-sidepanel-overlay', onClick: onClose } ),
			el(
				'aside',
				{ className: 'agada-sidepanel' },
				el( 'h3', null, `${ form.id ? 'Edit' : 'Create' } ${ sidePanel.type === 'products' ? 'Product' : 'Package' }` ),
				el( 'label', null, 'Name' ),
				el( 'input', { className: 'agada-input', value: form.name || '', onChange: ( e ) => update( 'name', e.target.value ) } ),
				el( 'label', null, 'Slug' ),
				el( 'input', { className: 'agada-input', value: form.slug || '', onChange: ( e ) => update( 'slug', e.target.value ) } ),
				el( 'label', null, 'Image URL' ),
				el( 'input', { className: 'agada-input', value: form.image_url || '', onChange: ( e ) => update( 'image_url', e.target.value ) } ),
				sidePanel.type === 'products'
					? el(
						Fragment,
						null,
						el( 'label', null, 'Extra cost' ),
						el( 'input', { className: 'agada-input', type: 'number', value: form.extra_cost || 0, onChange: ( e ) => update( 'extra_cost', Number( e.target.value ) ) } ),
						el( 'label', { className: 'agada-checkbox' }, el( 'input', { type: 'checkbox', checked: !! form.is_optional_extra, onChange: ( e ) => update( 'is_optional_extra', e.target.checked ) } ), 'Optional extra' ),
						el( 'label', { className: 'agada-checkbox' }, el( 'input', { type: 'checkbox', checked: !! form.price_per_person, onChange: ( e ) => update( 'price_per_person', e.target.checked ) } ), 'Price per person' )
					)
					: el(
						Fragment,
						null,
						el( 'label', null, 'Base price per person' ),
						el( 'input', { className: 'agada-input', type: 'number', value: form.base_price_per_person || 0, onChange: ( e ) => update( 'base_price_per_person', Number( e.target.value ) ) } ),
						el( 'label', null, 'Includes (one per line)' ),
						el( 'textarea', { className: 'agada-input', rows: 4, value: Array.isArray( form.includes ) ? form.includes.join( '\n' ) : '', onChange: ( e ) => update( 'includes', e.target.value.split( '\n' ).map( ( x ) => x.trim() ).filter( Boolean ) ) } )
					),
				el(
					'div',
					{ className: 'agada-sidepanel-actions' },
					el( 'button', { className: 'button', onClick: onClose }, 'Cancel' ),
					el( 'button', { className: 'button button-primary', onClick: () => onSave( form ) }, 'Save' )
				)
			)
		);
	}

	function SettingsScreen( { settings, setSettings, saveSettings } ) {
		if ( ! settings ) {
			return el( 'p', null, 'Loading settings...' );
		}
		const update = ( key, value ) => setSettings( ( prev ) => ( { ...prev, [ key ]: value } ) );
		return el(
			'div',
			{ className: 'agada-settings-grid' },
			el( 'label', null, 'WhatsApp Number' ),
			el( 'input', { className: 'agada-input', value: settings.whatsapp_number || '', onChange: ( e ) => update( 'whatsapp_number', e.target.value ) } ),
			el( 'label', null, 'Notification Email' ),
			el( 'input', { className: 'agada-input', value: settings.notification_email || '', onChange: ( e ) => update( 'notification_email', e.target.value ) } ),
			el( 'label', null, 'Default Minimum Portions' ),
			el( 'input', { className: 'agada-input', type: 'number', value: settings.default_min_portions || 30, onChange: ( e ) => update( 'default_min_portions', Number( e.target.value ) ) } ),
			el( 'button', { className: 'button button-primary', onClick: saveSettings }, 'Save settings' )
		);
	}

	const root = document.getElementById( 'agada-admin-dashboard-root' );
	if ( root ) {
		wp.element.render( el( App ), root );
	}
}() );
