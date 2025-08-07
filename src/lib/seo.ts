export function setPageSEO(title: string, description?: string) {
  if (title) document.title = title;

  const ensureMeta = (name: string) => {
    let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    return tag;
  };

  if (description) {
    const desc = ensureMeta("description");
    desc.setAttribute("content", description);
    const og = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
    if (og) og.setAttribute("content", description);
  }

  const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
  if (ogTitle) ogTitle.setAttribute("content", title);
}
