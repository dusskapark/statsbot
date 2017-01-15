doctype html
html
	include ./includes/head.jade
	body
		include ./includes/header.jade
		div.container
			div.section<!-- sections -->
				.row
          span.card-title= title
          p= json


	include ./includes/footer.jade
