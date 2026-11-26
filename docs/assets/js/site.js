(() => {
  "use strict";

  const body = document.body;
  const repo = body.dataset.repo;
  const installerName = body.dataset.installer;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function repoUrl(path) {
    return `https://github.com/${repo}/${path}`;
  }

  function linkRepo() {
    const download = `${repoUrl("releases/latest/download")}/${installerName}`;
    document.querySelectorAll("[data-download]").forEach((link) => { link.href = download; });
    document.querySelectorAll("[data-repo-link]").forEach((link) => {
      link.href = repoUrl(link.dataset.repoLink);
    });
  }

  function noteOperatingSystem() {
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    if (!/mac/i.test(platform)) return;
    const note = document.querySelector("[data-os-note]");
    if (note) note.textContent = "You're on a Mac. A macOS build comes later; for now there is a Windows installer.";
  }

  function highlightNavigation() {
    const links = new Map();
    document.querySelectorAll(".nav__links a").forEach((link) => {
      links.set(link.getAttribute("href").slice(1), link);
    });
    const sections = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    if (!("IntersectionObserver" in window) || sections.length === 0) return;
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      const current = sections.find((section) => visible.has(section.id));
      links.forEach((link, id) => {
        if (current && id === current.id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((section) => observer.observe(section));
  }

  function mountTeaser() {
    const id = body.dataset.youtubeId;
    const teaser = document.querySelector("[data-teaser]");
    if (!id || !teaser) return;
    const button = document.createElement("button");
    button.className = "teaser__play";
    button.type = "button";
    button.setAttribute("aria-label", "Play the tour video (YouTube)");
    button.style.backgroundImage = `url("https://i.ytimg.com/vi/${encodeURIComponent(id)}/maxresdefault.jpg")`;
    button.innerHTML = '<span>▶ Play tour video</span>';
    button.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      frame.title = "PhaseTransition tour video";
      frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      frame.allowFullscreen = true;
      teaser.replaceChildren(frame);
    });
    teaser.replaceChildren(button);
    const download = teaser.dataset.videoDownload;
    const links = document.querySelector("[data-teaser-links]");
    if (download && links) {
      links.querySelector("[data-teaser-download]").href = download;
      links.hidden = false;
    }
  }

  function mountClips() {
    const figures = [...document.querySelectorAll("figure.media")].filter((figure) => figure.dataset.video);
    if (figures.length === 0) return;
    const load = (figure) => {
      const video = document.createElement("video");
      video.src = figure.dataset.video;
      if (figure.dataset.poster) video.poster = figure.dataset.poster;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      if (reducedMotion) video.controls = true;
      else video.autoplay = true;
      video.setAttribute("aria-label", figure.querySelector(".placeholder__label")?.textContent || "Feature clip");
      figure.replaceChildren(video);
      return video;
    };
    if (!("IntersectionObserver" in window)) {
      figures.forEach(load);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const figure = entry.target;
        let video = figure.querySelector("video");
        if (entry.isIntersecting && !video) video = load(figure);
        if (!video || reducedMotion) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    }, { rootMargin: "200px 0px" });
    figures.forEach((figure) => observer.observe(figure));
  }

  function formatSize(bytes) {
    return bytes >= 2 ** 30 ? `${(bytes / 2 ** 30).toFixed(2)} GB` : `${Math.round(bytes / 2 ** 20)} MB`;
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" });
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderNotes(markdown, container) {
    let list = null;
    markdown.split(/\r?\n/).forEach((raw) => {
      const line = raw.trim();
      if (!line) { list = null; return; }
      const item = line.match(/^[-*]\s+(.*)$/);
      if (item) {
        if (!list) { list = element("ul", "list"); container.append(list); }
        list.append(element("li", "", item[1].replace(/\*\*|`/g, "")));
        return;
      }
      list = null;
      if (/^#/.test(line)) return;
      container.append(element("p", "", line.replace(/\*\*|`/g, "")));
    });
  }

  function showLatest(release) {
    const version = release.tag_name.replace(/^v/, "");
    const asset = release.assets.find((a) => a.name === installerName)
      || release.assets.find((a) => /_x64-setup\.exe$/.test(a.name));
    const set = (selector, text) => {
      const node = document.querySelector(selector);
      if (node && text) node.textContent = text;
    };
    set("[data-release-version]", `Version ${version}`);
    set("[data-release-date]", formatDate(release.published_at));
    if (asset) {
      set("[data-release-size]", formatSize(asset.size));
      if (asset.digest && asset.digest.startsWith("sha256:")) set("[data-release-sha]", asset.digest.slice(7));
    }
  }

  function showReleases(releases) {
    const container = document.querySelector("[data-releases]");
    if (!container) return;
    const cards = releases.slice(0, 3).map((release, index) => {
      const card = element("article", "release card");
      const head = element("header", "release__head");
      head.append(element("h3", "", release.tag_name.replace(/^v/, "")));
      const label = index === 0 ? "Latest" : "";
      head.append(element("span", "release__tag", [label, formatDate(release.published_at)].filter(Boolean).join(" · ")));
      card.append(head);
      renderNotes(release.body || "", card);
      return card;
    });
    if (cards.length) container.replaceChildren(...cards);
  }

  async function loadReleases() {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=20`, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!response.ok) return;
      const releases = (await response.json())
        .filter((release) => !release.draft && /^v\d/.test(release.tag_name));
      const stable = releases.filter((release) => !release.prerelease);
      if (stable.length) showLatest(stable[0]);
      showReleases(stable);
    } catch (error) {
      // The static content stays when the API is unreachable or rate-limited.
    }
  }

  linkRepo();
  noteOperatingSystem();
  highlightNavigation();
  mountTeaser();
  mountClips();
  loadReleases();
})();
