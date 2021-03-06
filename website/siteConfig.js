/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.
const docSections = require("./sidebars.json").docs;
const firstDoc = Object.values(docSections)[0][0];

const siteConfig = {
  title: 'HashML',
  tagline: 'A lightweight XML-like markup language',
  url: 'https://hashml.github.io',
  baseUrl: '/hashml/',

  // Used for publishing and more
  projectName: 'hashml',
  organizationName: 'hashml',

  docSections,
  firstDoc,

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    {doc: firstDoc, label: 'Docs'},
    {doc: 'api/index', label: 'API'},
    {href: 'https://github.com/hashml/hashml', label: 'GitHub'},
  ],

  /* path to images for header/footer */
  headerIcon: 'img/favicon.ico',
  footerIcon: 'img/favicon.ico',
  favicon: 'img/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#1f517c',
    secondaryColor: '#153856',
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `MIT License, Copyright © ${new Date().getFullYear()} HashML`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'atom-one-dark',
    hljs: function(hljs) {
      hljs.registerLanguage('hashml', (hljs) => ({
        contains: [
          {
            className: 'name',
            begin: /#[a-zA-Z]+/,
            relevance: 10,
            starts: {
              contains: [
                { className: 'string', begin: /\[/, end: /\]/ }
              ]
            }
          },
        ]
      }));
      hljs.configure({tabReplace: '<span class="indent">\t</span>'});
    }
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/undraw_online.svg',
  twitterImage: 'img/undraw_tweetstorm.svg',

  // For sites with a sizable amount of content, set collapsible to true.
  // Expand/collapse the links and subcategories under categories.
  // docsSideNavCollapsible: true,

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/hashml/hashml',
};

module.exports = siteConfig;
