module.exports = {
  title: 'vigonotion',
  tagline: 'my selfhosted setup',
  url: 'https://vigonotion.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'vigonotion', // Usually your GitHub org/user name.
  projectName: 'vigonotion', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'vigonotion',
      logo: {
        alt: 'vigonotion logo',
        src: 'img/logo.png',
      },
      links: [
        {to: 'blog', label: 'Blog', position: 'left'},
        {
          to: 'docs/doc1',
          activeBasePath: 'docs',
          label: 'My Setup',
          position: 'left',
        },
        {
          href: 'https://github.com/vigonotion',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
          ],
        },
        {
          title: 'Legal',
          items: [
            {
              label: 'Legal Disclosure',
              to: 'legal-disclosure'
            },
            {
              label: 'Privacy Policy',
              to: 'privacy-policy'
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/vigonotion',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/vigonotion',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Tom Schneider.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        blog: {
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Tom Schneider.`
          }
        }
      },
    ],
  ],
};

