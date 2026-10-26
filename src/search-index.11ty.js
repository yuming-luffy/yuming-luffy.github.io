export default class {
  data() { return { permalink: '/search-index.json', eleventyExcludeFromCollections: true }; }
  render({ collections }) {
    return JSON.stringify(collections.posts.map(p => ({ title: p.data.title, url: p.url, description: p.data.description, category: p.data.category, topics: p.data.topics, sample: !!p.data.sample, content: p.templateContent.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim() })));
  }
}
