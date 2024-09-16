function pageReport() {
	const { body } = document;

	function getUrl( path ) {
		return [
			window.location.protocol + '//' + window.location.host,
		].concat( path.split( '/' ).filter( part => part.length ) ).join('/');	
	}
	
	function getRestUrl( object_type, object_id ) {
		return getUrl( `wp-json/wp/v2/${object_type}/${object_id}` );
	}
	
	function getPostEditUrl( post_id ) {
		return getUrl( `wp-admin/post.php?post=${post_id}&action=edit` );
	}
	
	function getTermEditUrl( term_id ) {
		return getUrl( `wp-admin/term.php?tag_ID=${term_id}` );
	}
	
	function getUserEditUrl( user_id ) {
		return getUrl( `wp-admin/user-edit.php?user_id=${user_id}` );
	}
	
	if ( body ) {
		const meta = {
			meta_generator: document.querySelector('meta[name="generator"]')?.content,
			url_admin: getUrl('wp-admin'),
			is_home: body.classList.contains('home'),
			is_blog: body.classList.contains('blog'),
			is_archive: body.classList.contains('archive'),
			is_tag: body.classList.contains('tag'),
			is_search: body.classList.contains('search'),
			is_404: body.classList.contains('error404'),
			is_attachment: body.classList.contains('attachment'),
			is_author: body.classList.contains('author'),
			is_logged_in: body.classList.contains('logged-in'),
			is_multisite: body.classList.contains('multisite'),
			is_admin: body.classList.contains('wp-admin'),
			is_category: body.className.includes('category-'),
			category: body.className.match(/category-(\w+)/)?.pop(),
			category_id: body.className.match(/category-(\d+)/)?.pop(),
			tag: body.className.match(/tag-(\w+)/)?.pop(),
			is_page: body.className.includes('page-id-'),
			is_single: body.className.includes('post-id-'),
			post_id: body.className.match(/(page-id|postid)-(\d+)/)?.pop(),
			page_template: body.className.match(/page-template-(\w+)/)?.pop(),
			post_format: body.className.match(/single-format-(\w+)/)?.pop(),
			post_type: body.className.match(/single-(\w+)/)?.pop(),
			author_id: body.className.match(/author-(\d+)/)?.pop(),
			author: body.className.match(/author-(\w+)/)?.pop(),
		};
	
		if ( meta.post_id ) {
			meta.url_edit = getPostEditUrl( meta.post_id );
			meta.url_rest_api = getRestUrl( 'posts', meta.post_id );
		}
	
		if ( meta.category_id ) {
			meta.url_edit = getTermEditUrl( meta.category_id );
			meta.url_rest_api = getRestUrl( 'categories', meta.category_id );
		}
	
		return meta;
	}
	
	return {
		notice: 'No body element found for the page!'
	};
}

function setAttributes(attributes) {
	const content = [];
	
	const flags = Object.entries(attributes).map(([key, value]) => {
		if (key.indexOf('is_') === 0 && value) {
			return `<li>✅ ${key}</li>`;
		}
		
		return null;
	});

	content.push( `<ul class="stats__flags">${flags.join('')}</ul>` );

	const links = Object.entries(attributes).map(([key, value]) => {
		if (key.indexOf('url_') === 0) {
			return `<li><a href="${value}" target="_blank">🔗 ${key.replace('url_', '')}</a></li>`;
		}
		
		return null;
	});

	content.push( `<ul class="stats__links">${links.join('')}</ul>` );

	const props = Object.entries(attributes).map(([key, value]) => {
		if ( 'string' === typeof value && key.indexOf('url_') !== 0 ) {
			return `<dt>${key}</dt><dd>${value}</dd>`;
		}
		
		return null;
	});

	content.push( `<dl class="stats__props">${props.join('')}</dl>` );

	document.getElementById('stats').innerHTML = content.join('');
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
	chrome.scripting.executeScript({
		target: { tabId: tabs[0].id },
		func: pageReport
	}).then(response => {
		const { result } = response.pop();
		setAttributes( result );
	});
});

