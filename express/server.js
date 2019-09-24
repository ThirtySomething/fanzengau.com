
'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const siteInclude = require('site-include');

const pathInclude = '/public/include/';
const pathMyBlog = '/myblog/content/';

const router = express.Router();

router.get('/', (req, res) => {
	res.redirect('/.netlify/functions/server/index');
});

router.get('/myblog', myblogCallback);

router.get('/index', indexCallback);

router.get('/myblog/content/:topic/:blogTitle/:blogFileName',  blogContentCallback);


function getHostName(req) {
	let hostName = req.hostname;
	if (hostName != "localhost") {
		hostName = "epicbeaver.netlify.com";
	}
	return hostName;
}
async function getSiteMainFrame(req) {
	let hostName = getHostName(req);
	console.log(hostName);
	let siteHeader = await siteInclude.getInclude(hostName, pathInclude, 'site_header.html');
	let mainFrameHeader = await siteInclude.getInclude(hostName, pathInclude, 'main_frame_header.html');
	let mainFrameContent = await siteInclude.getInclude(hostName, pathInclude, 'main_frame_content.html');
	let myBlogIndex = await siteInclude.getInclude(hostName, pathInclude, 'my_blog_index.html');
	let sidePanels = await siteInclude.getInclude(hostName, pathInclude, 'side_panels.html')
	let siteFooter = await siteInclude.getInclude(hostName, pathInclude, 'site_footer.html')
	return {
		'siteHeader': siteHeader,
		'mainFrameHeader': mainFrameHeader,
		'mainFrameContent': mainFrameContent,
		'myBlogIndex': myBlogIndex,
		'sidePanels': sidePanels,
		'siteFooter': siteFooter
	}
}


async function blogContentCallback(req, res) {
	console.log('in blogContentCallback');
	let hostName = getHostName(req);
	console.log(hostName);
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	let pathBlogHTML = path.join(pathMyBlog, req.params['topic'], req.params['blogTitle']);
	let blogFileName = req.params['blogFileName'];
	// console.log('retrieving: ' + path.join(pathBlogHTML, blogFileName));
	let mf = await getSiteMainFrame(req);
	let blogContent = await siteInclude.getInclude(hostName, pathBlogHTML, blogFileName);
	// console.log('blogContent is: ' + blogContent);
	let pageString = mf.siteHeader + mf.mainFrameHeader + mf.mainFrameContent + mf.sidePanels + 
		'<div class="column_uneven_2_6_3_center">' + blogContent + mf.siteFooter;
	res.write(pageString);
	res.end();

}

async function myblogCallback(req, res) {
	console.log('in myblogCallback');
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	let mf = await getSiteMainFrame(req);

	let pageString = mf.siteHeader + mf.mainFrameHeader + mf.mainFrameContent + mf.sidePanels + 
		'<div class="column_uneven_2_6_3_center">' + '<div class="section">'
		 + mf.myBlogIndex + '</div>' + mf.siteFooter;
	res.write(pageString);
	res.end();
}


async function indexCallback(req, res) {
	console.log('in indexCallback');
	let hostName = getHostName(req);
	console.log(hostName);
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	let mf = await getSiteMainFrame(req);
	let portfolio = await siteInclude.getInclude(hostName, pathInclude, 'portfolio.html');

	let pageString = mf.siteHeader + mf.mainFrameHeader + mf.mainFrameContent + mf.sidePanels + 
		'<div class="column_uneven_2_6_3_center">' + portfolio + mf.siteFooter;
	res.write(pageString);
	res.end();
}

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);
app.use('/.netlify/functions/server/public/include/', express.static(__dirname + '/../public/include/'));
app.use('/public/include/', express.static(__dirname + '/../public/include/'));

app.use('/myblog/content/', express.static(__dirname + '/../myblog/content/'));

app.use('/public/resource/', express.static(__dirname + '/../public/resource/'));
app.use('/public/css/', express.static(__dirname + '/../public/css/'));
app.use('/public/vendor/', express.static(__dirname + '/../public/vendor/'));
app.use('/public/scripts/', express.static(__dirname + '/../public/scripts/'));

console.log("__dirname + '/../public/include/ = " + __dirname + '/../public/include/');
app.use(function(req, res, next) {
	const msg = 'Route: '+ req.url + ' Not found after matching with all app.use and router.use clauses in server.js';
	console.log(msg);
	return res.status(404).send({
		message: msg
	});
});

module.exports = app;
module.exports.handler = serverless(app);