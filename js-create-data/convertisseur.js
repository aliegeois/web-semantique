const fs = require('fs'),
	  papaparse = require('papaparse');

onload = () => {
	let data = fs.readFileSync('file.csv').toString();

	let animes_raw = papaparse.parse(data, {
		delimiter: ','
	}).data;

	let prefixes = {
		'schema': 'http://schema.org/',
		'xsd': 'http://www.w3.org/2001/XMLSchema#',
		'void': 'http://rdfs.org/ns/void#',
		' ': '#'
	};
	let labels = [],
		animes = [];

	for(let i = 0; i < animes_raw[0].length; i++)
		labels[i] = animes_raw[0][i].toLowerCase();

	for(let i = 1; i < animes_raw.length; i++) {
		let anime = {};
		for(let j = 0; j < labels.length; j++) {
			if(animes_raw[i][j] == undefined)
				animes_raw[i][j] = '';
			switch(labels[j]) {
				case 'producer':
				case 'licensor':
				case 'studio':
				case 'genre':
					anime[labels[j]] = animes_raw[i][j].split(',');
					break;
				case 'aired':
					anime[labels[j]] = (str => {
						if(!str)
							return {from: '', to: ''};
						let rtn = {},
							[from, to] = str.slice(1, -1).split(','),
							el1 = from.split(':')[1].trim(),
							el2 = to.split(':')[1].trim();
						
						rtn.from = el1 == 'None' ? '' : el1.slice(1, -1);
						rtn.to = el2 == 'None' ? '' : el2.slice(1, -1);
					
						return rtn;
					})(animes_raw[i][j])
					break;
				default:
					anime[labels[j]] = animes_raw[i][j];
			}
		}
		animes.push(anime);
	}

	let ttl_document = '';
	for(let [short, long] of Object.entries(prefixes))
		ttl_document += `@prefix ${short}: <${long}> .\n`;
	prefixes.anime = 'https://myanimelist.net/anime/';
	ttl_document += '\n\n';

	for(let anime of animes) {
		let ttl_element = `<${prefixes.anime}${anime.anime_id}>\n`;

		if(anime.type == 'Movie')
			ttl_element += `\ta schema:Movie ;\n`;
		else
			ttl_element += `\ta schema:TVSeries ;\n`;
		ttl_element += '\ta http://dbpedia.org/page/Anime ;\n';
		if(anime.title_english != "")
			ttl_element += `\tschema:name "${anime.title_english.replace(/"/g, '\\"')}"@en ;\n`;
		ttl_element += `\tschema:name "${anime.title_japanese.replace(/"/g, '\\"')}"@jp ;\n`;
		if(anime.image_url != '')
			ttl_element += `\tschema:thumbnailUrl "${anime.image_url}" ;\n`;
		if(anime.episodes > 0)
			ttl_element += `\tschema:numberOfEpisodes "${anime.episodes}"^^xsd:integer ;\n`;
		if(anime.rating != 'None')
			ttl_element += `\tschema:contentRating "${anime.rating.split(' - ')[0]}" ;\n`;
		ttl_element += `\tschema:aggregateRating [\n`;
		ttl_element += `\t\tschema:ratingValue "${anime.score}"^^xsd:decimal ;\n`;
		ttl_element += `\t\tschema:ratingCount "${anime.scored_by}"^^xsd:integer\n`;
		ttl_element += `\t] ;\n`;
		for(let producer of anime.producer)
			if(producer != '')
				ttl_element += `\tschema:producer "${producer.trim()}" ;\n`;
		for(let genre of anime.genre)
			if(genre != '')
				ttl_element += `\tschema:genre "${genre.trim()}" ;\n`;
		for(let studio of anime.studio)
			if(studio != '')
				ttl_element += `\tschema:productionCompany "${studio.trim()}" ;\n`;
		ttl_element += `\tschema:startDate "${anime.aired.from}" ;\n`;
		if(anime.aired.to != 'None')
			ttl_element += `\tschema:endDate "${anime.aired.to}" ;\n`;
		ttl_element += `\tschema:name "${anime.title.replace(/"/g, '\\"')}" .`;

		ttl_document += ttl_element + '\n\n';
	}

	fs.writeFile('D:/Arthur/Documents/nwjs/csv to rdf/app/animes.ttl', ttl_document, err => {
		if(err)
			throw err;
		console.log('done');
	});

	let input = document.createElement('input');
	input.setAttribute('type', 'file');
	input.setAttribute('nwsaveas', '');
}