const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const themeButton = $('.theme-toggle');
function describeTheme() { themeButton?.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'); }
describeTheme();
themeButton?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('grand-line-theme', theme); } catch {}
  describeTheme();
});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } });
  }, { threshold: .08 });
  $$('.reveal').forEach(el => observer.observe(el));
}
$$('[data-mood]').forEach(frame => {
  frame.setAttribute('aria-pressed','false');
  frame.addEventListener('click', () => {
    $$('#main [data-mood]').forEach(f => f.setAttribute('aria-pressed', String(f === frame)));
    $('#mood').textContent = frame.dataset.mood;
  });
});

$('.copy-link')?.addEventListener('click', async () => {
  const status = $('.copy-status');
  try { await navigator.clipboard.writeText(location.href.split('#')[0]); status.textContent = '链接已复制'; }
  catch { status.textContent = '请从浏览器地址栏复制链接'; }
});

const lightbox = $('.lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  $$('.lightbox-link').forEach(link => link.addEventListener('click', e => {
    e.preventDefault();
    const img = $('img', lightbox);
    img.src = link.href; img.alt = $('img', link).alt;
    $('p',lightbox).textContent = link.closest('figure').querySelector('figcaption').textContent;
    lightbox.showModal();
  }));
  $('.lightbox-close',lightbox).addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', e => { if(e.target === lightbox) lightbox.close(); });
}

const searchForm = $('#search-form');
if (searchForm) {
  const input = $('#search-input'), status = $('.search-status'), results = $('#search-results');
  let indexPromise, timer, revision = 0;
  const getIndex = () => indexPromise ||= fetch('/search-index.json').then(r => { if(!r.ok) throw Error(r.status); return r.json(); }).catch(e => { indexPromise = undefined; throw e; });
  async function search() {
    const ownRevision = ++revision, query = input.value.trim();
    const url = new URL(location.href);
    query ? url.searchParams.set('q',query) : url.searchParams.delete('q');
    history.replaceState(null,'',url);
    results.replaceChildren();
    if (!query) { status.textContent = '输入关键词开始搜索。'; return; }
    status.textContent = '正在寻找相关日志…';
    try {
      const items = await getIndex();
      if (ownRevision !== revision) return;
      const words = query.toLocaleLowerCase().split(/\s+/);
      const matches = items.filter(item => words.every(word => [item.title,item.description,item.category,...item.topics,item.content].join(' ').toLocaleLowerCase().includes(word)));
      status.textContent = matches.length ? `找到 ${matches.length} 篇相关日志` : '这次没有找到。试试更短的词，或者按分类浏览日志。';
      for (const item of matches) {
        const article = document.createElement('article'); article.className = 'search-result';
        const meta = document.createElement('p'); meta.className = 'post-meta'; meta.textContent = item.category + (item.sample ? ' · 内容样例' : '');
        const heading = document.createElement('h2'), link = document.createElement('a'); link.href = item.url; link.textContent = item.title; heading.append(link);
        const excerpt = document.createElement('p'); excerpt.textContent = item.description;
        article.append(meta,heading,excerpt); results.append(article);
      }
    } catch { if(ownRevision === revision) status.textContent = '搜索索引未能加载，请稍后再点一次搜索，或从航海日志按分类浏览。'; }
  }
  searchForm.addEventListener('submit', e => { e.preventDefault(); clearTimeout(timer); search(); });
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search,180); });
  input.value = new URLSearchParams(location.search).get('q') || '';
  if(input.value) search();
}

const commentSection = $('[data-comments]');
if (commentSection) {
  const {repo,slug,issue:issueNumber} = commentSection.dataset;
  const status = $('.comment-status',commentSection), list = $('.comment-list',commentSection), link = $('[data-comment-link]',commentSection), retry = $('.retry-comments',commentSection);
  const endpoint = `https://api.github.com/repos/${repo}`;
  async function api(url) { const r = await fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(12000) }); if(!r.ok) throw Error(r.status); return r.json(); }
  function addMessage(user, body, created, url) {
    const item = document.createElement('article'); item.className = 'comment-item';
    const header = document.createElement('header'), author = document.createElement('a'); author.textContent = user?.login || 'GitHub 用户'; author.href = url;
    const time = document.createElement('time'); time.dateTime = created; time.textContent = new Date(created).toLocaleDateString('zh-CN');
    header.append(author,time); const text = document.createElement('p'); text.textContent = body || '（无文字内容）'; item.append(header,text); list.append(item);
  }
  async function loadComments() {
    retry.hidden = true; status.textContent = '正在读取留言…'; list.replaceChildren();
    try {
      let issue;
      if (/^[1-9]\d*$/.test(issueNumber || '')) {
        issue = await api(`${endpoint}/issues/${issueNumber}`);
      } else {
        const data = await api(`https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${repo} is:issue in:title "[留言] ${slug}"`)}&per_page=100`);
        issue = data.items.filter(i => i.title === `[留言] ${slug}`).sort((a,b) => a.number-b.number)[0];
      }
      if (!issue) { status.textContent = '还没有留言。到 GitHub 开启这篇日志的第一段讨论吧。'; return; }
      link.href = issue.html_url;
      if(issue.body && !issue.body.startsWith('<!-- blog-comment-thread -->')) addMessage(issue.user,issue.body,issue.created_at,issue.html_url);
      const comments = await api(`${endpoint}/issues/${issue.number}/comments?per_page=100`);
      comments.forEach(c => addMessage(c.user,c.body,c.created_at,c.html_url));
      status.textContent = comments.length ? (comments.length === 100 ? '已显示前 100 条留言，完整讨论请前往 GitHub。' : `共 ${comments.length} 条回复。登录 GitHub 即可参与。`) : '还没有回复，来聊聊你的想法吧。';
    } catch { status.textContent = '暂时无法读取 GitHub 留言。你仍可点击下方入口查看或回复；也可以稍后重试。'; retry.hidden = false; }
  }
  retry.addEventListener('click',loadComments);
  if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { if(entries.some(e => e.isIntersecting)) { observer.disconnect(); loadComments(); } },{rootMargin:'200px'}); observer.observe(commentSection); } else loadComments();
}
