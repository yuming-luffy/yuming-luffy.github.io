import { HtmlBasePlugin } from '@11ty/eleventy';

export default function (config) {
  config.addFilter('slugify', value => String(value).normalize('NFKC').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}_-]/gu, '') || 'untitled');
  config.addPlugin(HtmlBasePlugin);
  config.addPassthroughCopy({ public: '/' });
  config.addPreprocessor('drafts', '*', data => data.draft ? false : undefined);
  config.amendLibrary('md', md => {
    const original = md.renderer.rules.heading_open;
    md.renderer.rules.heading_open = (tokens, i, options, env, self) => {
      const title = tokens[i + 1].content;
      const slug = config.getFilter('slugify')(title);
      env.headingCounts ||= {};
      const n = env.headingCounts[slug] = (env.headingCounts[slug] || 0) + 1;
      tokens[i].attrSet('id', slug + (n > 1 ? `-${n}` : ''));
      return original ? original(tokens, i, options, env, self) : self.renderToken(tokens, i, options);
    };
  });
  config.addFilter('dateText', value => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(new Date(value)).replaceAll('/', '.'));
  config.addFilter('readTime', value => Math.max(1, Math.ceil(String(value).replace(/<[^>]+>/g, '').length / 400)));
  config.addFilter('toc', html => [...String(html).matchAll(/<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g)].map(m => ({ level: m[1], id: m[2], text: m[3].replace(/<[^>]+>/g, '') })));
  config.addFilter('byCategory', (posts, category) => posts.filter(p => p.data.category === category));
  config.addCollection('posts', api => api.getFilteredByGlob('src/posts/*.md').sort((a,b) => b.date-a.date));
  config.addCollection('topics', api => [...new Set(api.getFilteredByGlob('src/posts/*.md').flatMap(p => p.data.topics || []))]);
  config.addFilter('byTopic', (posts, topic) => posts.filter(p => (p.data.topics || []).includes(topic)));
  return { dir: { input: 'src', output: '_site' }, templateFormats: ['njk','md','11ty.js'], markdownTemplateEngine: false, htmlTemplateEngine: 'njk' };
}
