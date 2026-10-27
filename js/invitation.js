(function () {
  const data = window.INVITATION;
  if (!data) return;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  applyPalette(data.theme.palette);
  applyCopy();
  renderHosts();
  renderGallery();
  setupDate();
  setupPlace();
  setupMusic();
  setupGate();
  setupNav();
  setupRsvp();
  setupLightbox();
  setupPreview();
  document.title = `${coupleTitle()} · ${data.event.kind}`;
  const description = $("meta[name='description']");
  if (description) {
    description.content = `${coupleTitle()}. ${whenLine()}. ${placeLine()}.`;
  }

  function applyPalette(palette) {
    Object.entries(palette).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }

  function getPath(path) {
    return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), data);
  }

  function applyCopy() {
    $$("[data-bind]").forEach((node) => {
      const value = getPath(node.dataset.bind);
      if (typeof value === "string") node.textContent = value;
    });

    const prose = $("#invitation-body");
    prose.replaceChildren();
    data.copy.invitationBody.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      prose.appendChild(p);
    });

    Object.entries(data.sections).forEach(([key, enabled]) => {
      if (enabled !== false) return;
      const section = document.querySelector(`[data-section="${key}"]`);
      if (section) section.hidden = true;
      $$(`[data-nav="${key}"]`).forEach((node) => {
        node.hidden = true;
      });
    });
  }

  function renderHosts() {
    const root = $("#hosts");
    root.replaceChildren();
    data.hosts.forEach((group, index) => {
      if (index > 0) {
        const join = document.createElement("p");
        join.className = "host-join";
        join.textContent = "y";
        root.appendChild(join);
      }
      const block = document.createElement("div");
      block.className = "host-group";
      const label = document.createElement("p");
      label.className = "host-label";
      label.textContent = group.label;
      block.appendChild(label);
      group.people.forEach((person) => {
        const line = document.createElement("p");
        const name = (person.name || "").trim();
        line.className = name ? "host-name" : "host-name is-placeholder";
        line.textContent = name || person.placeholder;
        block.appendChild(line);
      });
      root.appendChild(block);
    });
  }

  function renderGallery() {
    const grid = $("#gallery-grid");
    grid.replaceChildren();
    data.gallery.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "shot";
      button.dataset.reveal = "clip";
      button.style.setProperty("--d", `${index * 70}ms`);
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt;
      img.loading = "lazy";
      img.decoding = "async";
      const caption = document.createElement("span");
      caption.className = "shot-caption";
      caption.textContent = item.caption;
      button.append(img, caption);
      button.addEventListener("click", () => openLightbox(item));
      grid.appendChild(button);
    });
  }

  function coupleTitle() {
    const [a, b] = data.principals;
    return `${a.shortName} y ${b.shortName}`;
  }

  function fullNames() {
    return data.principals
      .map((person) => `${person.givenNames} ${person.familyNames}`)
      .join(" y ");
  }

  function eventDate() {
    return new Date(data.event.dateISO);
  }

  function dateParts(date) {
    const parts = new Intl.DateTimeFormat(data.meta.locale, {
      timeZone: data.event.timeZone,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).formatToParts(date);
    const bag = {};
    parts.forEach((part) => {
      if (part.type !== "literal") bag[part.type] = part.value;
    });
    return bag;
  }

  function capitalize(value) {
    if (!value) return "";
    return value.charAt(0).toLocaleUpperCase(data.meta.locale) + value.slice(1);
  }

  function whenLine() {
    const parts = dateParts(eventDate());
    return `${capitalize(parts.weekday)} ${parts.day} de ${parts.month} de ${parts.year}, a las ${data.event.timeSpoken}`;
  }

  function placeLine() {
    const address = data.event.address;
    return [address.street, address.number, address.neighborhood, address.city, address.region]
      .filter(Boolean)
      .join(", ");
  }

  function setupDate() {
    const parts = dateParts(eventDate());
    $("#weekday").textContent = capitalize(parts.weekday);
    $("#day-number").textContent = parts.day;
    $("#month-year").textContent = `${capitalize(parts.month)} ${parts.year}`;
    $("#when-line").textContent = whenLine();
    $("#gate-date").textContent = `${parts.day} de ${parts.month} de ${parts.year}`;
    $("#hero-meta").textContent = `${capitalize(parts.weekday)} ${parts.day} de ${parts.month} de ${parts.year} · ${data.event.timeLabel}`;
    $("#hero-place").textContent = placeLine();
    $("#footer-when").textContent = `${capitalize(parts.weekday)} ${parts.day} de ${parts.month} de ${parts.year}`;
    $("#footer-place").textContent = placeLine();
    const lockup = `${data.principals[0].shortName} & ${data.principals[1].shortName}`;
    $("#brand-name").textContent = lockup;
    $("#footer-names").textContent = lockup;
    startCountdown();
    const google = $("#google-cal");
    const ics = $("#ics-cal");
    google.href = googleCalendarUrl();
    ics.addEventListener("click", (event) => {
      event.preventDefault();
      downloadIcs();
    });
  }

  function startCountdown() {
    const units = {
      days: $("#count-days"),
      hours: $("#count-hours"),
      minutes: $("#count-minutes"),
      seconds: $("#count-seconds")
    };
    const target = eventDate().getTime();
    let timer = 0;

    const tick = () => {
      const diff = target - Date.now();
      const countdown = $(".countdown");
      const note = $("#today-note");
      if (diff <= 0) {
        countdown.hidden = true;
        note.hidden = false;
        note.textContent = diff > -6 * 60 * 60 * 1000 ? data.ui.today : data.ui.past;
        return;
      }
      const next = {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      };
      Object.entries(next).forEach(([key, value]) => {
        const text = key === "days" ? String(value) : String(value).padStart(2, "0");
        if (units[key].textContent !== text) {
          units[key].textContent = text;
          units[key].classList.remove("is-tick");
          void units[key].offsetWidth;
          units[key].classList.add("is-tick");
        }
      });
    };

    const run = () => {
      clearInterval(timer);
      tick();
      timer = setInterval(tick, 1000);
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearInterval(timer);
      else run();
    });
    run();
  }

  function stamp(iso) {
    return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function calendarDetails() {
    return {
      title: `${data.event.kind} de ${coupleTitle()}`,
      details: `${fullNames()}. ${data.copy.invitationClose}`,
      location: placeLine()
    };
  }

  function googleCalendarUrl() {
    const info = calendarDetails();
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: info.title,
      dates: `${stamp(data.event.dateISO)}/${stamp(data.event.endISO)}`,
      details: info.details,
      location: info.location
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function downloadIcs() {
    const info = calendarDetails();
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Atelier Invitaciones//ES",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `DTSTART:${stamp(data.event.dateISO)}`,
      `DTEND:${stamp(data.event.endISO)}`,
      `SUMMARY:${escapeIcs(info.title)}`,
      `LOCATION:${escapeIcs(info.location)}`,
      `DESCRIPTION:${escapeIcs(info.details)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "blanca-y-luis-12-diciembre-2026.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  function escapeIcs(value) {
    return value.replace(/[,;\\]/g, "\\$&").replace(/\n/g, "\\n");
  }

  function setupPlace() {
    const address = data.event.address;
    $("#street").textContent = address.street;
    $("#number").textContent = address.number;
    const extra = [address.neighborhood, address.city, address.region].filter(Boolean);
    $("#neighborhood").textContent = extra.join(" · ");
    const query = [address.street, address.number, address.neighborhood, address.city, address.region]
      .filter(Boolean)
      .join(", ");
    $("#map-link").href = data.event.mapsUrl
      || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function setupMusic() {
    const button = $("#music-toggle");
    const audio = $("#music");
    const piano = new SoftPiano();
    let fileMode = Boolean(data.music.src);
    let wantsSound = false;
    let playToken = 0;

    if (fileMode) audio.src = data.music.src;
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.8;

    const paint = () => {
      button.classList.toggle("is-on", wantsSound);
      button.setAttribute("aria-pressed", String(wantsSound));
      button.setAttribute("aria-label", wantsSound ? data.ui.musicPause : data.ui.musicPlay);
    };

    async function play() {
      wantsSound = true;
      const token = ++playToken;
      paint();
      if (fileMode) {
        try {
          await audio.play();
          if (token !== playToken || !wantsSound) {
            audio.pause();
            return;
          }
          paint();
          return;
        } catch (error) {
          if (token !== playToken || !wantsSound || error.name === "AbortError") return;
          fileMode = false;
        }
      }
      if (token !== playToken || !wantsSound) return;
      await piano.start();
      if (token !== playToken || !wantsSound) {
        piano.stop();
        return;
      }
      paint();
    }

    function pause() {
      wantsSound = false;
      playToken += 1;
      audio.pause();
      piano.stop();
      paint();
    }

    button.addEventListener("click", () => {
      if (wantsSound) pause();
      else play();
    });

    audio.addEventListener("playing", () => {
      if (!wantsSound) audio.pause();
    });

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: data.music.title || "Música",
        artist: data.music.artist || ""
      });
      const setHandler = (action, handler) => {
        try { navigator.mediaSession.setActionHandler(action, handler); } catch (error) { /* acción no disponible */ }
      };
      setHandler("play", () => { play(); });
      setHandler("pause", () => { pause(); });
    }

    window.invitationMusic = { play, pause, paint };
    paint();
  }

  function setupGate() {
    const gate = $("#gate");
    if (data.sections.gate === false) {
      gate.hidden = true;
      document.body.classList.add("is-open");
      initReveals();
      return;
    }

    let opened = false;
    const open = (withMusic) => {
      if (opened) return;
      opened = true;
      gate.classList.add("is-leaving");
      if (withMusic) window.invitationMusic.play();
      window.setTimeout(finish, 900);
    };

    const finish = () => {
      gate.hidden = true;
      document.body.classList.add("is-open");
      initReveals();
      const hero = $("#portada");
      if (hero) hero.focus({ preventScroll: true });
    };

    $("#open-music").addEventListener("click", () => open(true));
    $("#open-silent").addEventListener("click", () => open(false));
  }

  function initReveals() {
    const nodes = $$("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach((node) => observer.observe(node));
  }

  function setupNav() {
    const toggle = $("#menu-toggle");
    const menu = $("#menu");
    const close = () => {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const willOpen = menu.hidden;
      menu.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
    $$("#menu a").forEach((link) => link.addEventListener("click", close));
    $("#menu-close").addEventListener("click", close);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) close();
    });

    const progress = $(".progress");
    const nav = $(".nav");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      progress.style.transform = `scaleX(${ratio})`;
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const links = $$(".nav-links a, #menu a");
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const current = link.getAttribute("href") === `#${entry.target.id}`;
            if (current) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((section) => spy.observe(section));

    const dock = $("#dock");
    const rsvp = $("#confirmar");
    const hero = $("#portada");
    if (dock && rsvp && hero) {
      let heroVisible = true;
      let rsvpVisible = false;
      const paintDock = () => dock.classList.toggle("is-hidden", heroVisible || rsvpVisible);
      new IntersectionObserver((entries) => {
        heroVisible = entries[0].isIntersecting;
        paintDock();
      }, { threshold: 0.22 }).observe(hero);
      new IntersectionObserver((entries) => {
        rsvpVisible = entries[0].isIntersecting;
        paintDock();
      }, { threshold: 0.16 }).observe(rsvp);
      paintDock();
    }
  }

  function setupRsvp() {
    const form = $("#rsvp-form");
    const countNode = $("#guest-count");
    const guestsWrap = $("#guests-field");
    const error = $("#form-error");
    const status = $("#form-status");
    const phoneNote = $("#phone-note");
    const fallback = $("#whatsapp-fallback");
    let count = 1;
    const max = data.rsvp.maxGuests;

    const phone = (data.rsvp.whatsappPhone || "").replace(/\D/g, "");
    phoneNote.hidden = phone.length >= 10;

    const paintCount = () => {
      countNode.textContent = String(count);
    };

    $("#guest-less").addEventListener("click", () => {
      count = Math.max(1, count - 1);
      paintCount();
    });
    $("#guest-more").addEventListener("click", () => {
      count = Math.min(max, count + 1);
      paintCount();
    });

    const syncGuests = () => {
      const declined = form.elements.status.value === "no";
      guestsWrap.hidden = declined;
    };
    form.elements.status.forEach((input) => input.addEventListener("change", syncGuests));

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      error.textContent = "";
      status.textContent = "";
      fallback.hidden = true;
      const name = form.elements.name.value.trim();
      const attendance = form.elements.status.value;
      const note = form.elements.note.value.trim();
      if (!name) {
        error.textContent = data.ui.required;
        form.elements.name.focus();
        return;
      }
      if (!attendance) {
        error.textContent = data.ui.required;
        return;
      }
      const attending = attendance === "yes";
      const message = data.rsvp.messageTemplate
        .replaceAll("{couple}", coupleTitle())
        .replaceAll("{name}", name)
        .replaceAll("{status}", attending ? data.ui.attend : data.ui.decline)
        .replaceAll("{count}", attending ? String(count) : "0")
        .replaceAll("{note}", note || "—")
        .replaceAll("{when}", whenLine())
        .replaceAll("{place}", placeLine());
      const url = phone.length >= 10
        ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`;
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (opened) status.textContent = data.ui.opened;
      else {
        status.textContent = data.ui.blocked;
        fallback.href = url;
        fallback.hidden = false;
      }
    });
  }

  function setupLightbox() {
    const dialog = $("#lightbox");
    const image = $("#lightbox-image");
    const caption = $("#lightbox-caption");
    $("#lightbox-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    window.openLightbox = (item) => {
      image.src = item.src;
      image.alt = item.alt;
      caption.textContent = item.caption;
      dialog.showModal();
    };
  }

  function setupPreview() {
    const storageKey = "blanca-luis-estilo";
    const palettes = {
      eucalipto: {
        label: "Eucalipto",
        palette: {
          ink: "#14110e",
          "ink-soft": "#241e18",
          ivory: "#f4f1eb",
          paper: "#faf8f4",
          white: "#fffdfb",
          brass: "#9a7848",
          "brass-ink": "#4a3818",
          "brass-soft": "#e4d3b0",
          sage: "#5c6a57",
          "sage-deep": "#1c2822",
          burgundy: "#6e3342",
          line: "rgba(20, 17, 14, 0.16)"
        }
      },
      burdeos: {
        label: "Burdeos",
        palette: {
          ink: "#1c1214",
          "ink-soft": "#3a2428",
          ivory: "#f8f3ef",
          paper: "#fbf6f3",
          white: "#fffaf8",
          brass: "#b08958",
          "brass-ink": "#5c4324",
          "brass-soft": "#edd9c4",
          sage: "#6e4450",
          "sage-deep": "#3c1c24",
          burgundy: "#8a3d4e",
          line: "rgba(28, 18, 20, 0.16)"
        }
      },
      tinta: {
        label: "Tinta",
        palette: {
          ink: "#121212",
          "ink-soft": "#2a2a2a",
          ivory: "#f6f4f1",
          paper: "#fbfaf8",
          white: "#ffffff",
          brass: "#b08d57",
          "brass-ink": "#5a4524",
          "brass-soft": "#e6d7bc",
          sage: "#3a3a3a",
          "sage-deep": "#141414",
          burgundy: "#8c3a3a",
          line: "rgba(18, 18, 18, 0.16)"
        }
      },
      terracota: {
        label: "Terracota",
        palette: {
          ink: "#1c1410",
          "ink-soft": "#3a2a22",
          ivory: "#fbf6f1",
          paper: "#fff9f5",
          white: "#fffaf6",
          brass: "#c4a574",
          "brass-ink": "#6a4a28",
          "brass-soft": "#f0dcc4",
          sage: "#a56a52",
          "sage-deep": "#6a3a2c",
          burgundy: "#8d3e32",
          line: "rgba(28, 20, 16, 0.16)"
        }
      },
      noche: {
        label: "Noche",
        palette: {
          ink: "#141820",
          "ink-soft": "#2a3340",
          ivory: "#f4f3f0",
          paper: "#faf9f7",
          white: "#fbfbfa",
          brass: "#c2a36a",
          "brass-ink": "#5c4a28",
          "brass-soft": "#e7d7b8",
          sage: "#4d5c73",
          "sage-deep": "#1a2433",
          burgundy: "#7a3e4a",
          line: "rgba(20, 24, 32, 0.16)"
        }
      },
      olivo: {
        label: "Olivo",
        palette: {
          ink: "#16160f",
          "ink-soft": "#2c2c1c",
          ivory: "#f6f4ec",
          paper: "#fbfaf4",
          white: "#fcfbf6",
          brass: "#b89a4e",
          "brass-ink": "#5a4818",
          "brass-soft": "#ead9a4",
          sage: "#6d7648",
          "sage-deep": "#2c331c",
          burgundy: "#7a4030",
          line: "rgba(22, 22, 15, 0.16)"
        }
      },
      rosa: {
        label: "Rosa seco",
        palette: {
          ink: "#1c1416",
          "ink-soft": "#3a2a2e",
          ivory: "#fbf6f5",
          paper: "#fffaf9",
          white: "#fffaf9",
          brass: "#b08a62",
          "brass-ink": "#5c4030",
          "brass-soft": "#f0d8cc",
          sage: "#8d6a70",
          "sage-deep": "#4a3034",
          burgundy: "#8e4458",
          line: "rgba(28, 20, 22, 0.16)"
        }
      },
      cobre: {
        label: "Cobre",
        palette: {
          ink: "#161412",
          "ink-soft": "#2e2926",
          ivory: "#f7f4f0",
          paper: "#fbf8f5",
          white: "#fffdfb",
          brass: "#b8734a",
          "brass-ink": "#6a3e24",
          "brass-soft": "#f0d2bc",
          sage: "#5c534c",
          "sage-deep": "#242220",
          burgundy: "#7a3a32",
          line: "rgba(22, 20, 18, 0.16)"
        }
      }
    };
    const fonts = {
      bodoni: {
        label: "Bodoni",
        display: '"Bodoni Moda", Palatino, Georgia, serif',
        sans: 'Outfit, "Segoe UI", sans-serif'
      },
      fraunces: {
        label: "Fraunces",
        display: "Fraunces, Georgia, serif",
        sans: 'Outfit, "Segoe UI", sans-serif'
      },
      cormorant: {
        label: "Cormorant",
        display: '"Cormorant Garamond", Georgia, serif',
        sans: 'Outfit, "Segoe UI", sans-serif'
      },
      baskerville: {
        label: "Baskerville",
        display: '"Libre Baskerville", Georgia, serif',
        sans: 'Outfit, "Segoe UI", sans-serif'
      }
    };

    let saved = { palette: "eucalipto", font: "bodoni" };
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "");
      if (stored && palettes[stored.palette] && fonts[stored.font]) saved = stored;
    } catch (error) {
      saved = { palette: "eucalipto", font: "bodoni" };
    }

    const applyChoice = () => {
      applyPalette(palettes[saved.palette].palette);
      document.documentElement.style.setProperty("--display", fonts[saved.font].display);
      document.documentElement.style.setProperty("--sans", fonts[saved.font].sans);
      $$("#palette-options button").forEach((button) => {
        button.classList.toggle("is-selected", button.dataset.id === saved.palette);
      });
      $$("#font-options button").forEach((button) => {
        button.classList.toggle("is-selected", button.dataset.id === saved.font);
      });
      localStorage.setItem(storageKey, JSON.stringify(saved));
    };

    const mount = (root, group, key) => {
      Object.entries(group).forEach(([id, item]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = key === "palette" ? "style-chip style-chip-color" : "style-chip";
        button.dataset.id = id;
        button.textContent = item.label;
        if (item.palette) {
          button.style.setProperty("--swatch", item.palette["sage-deep"]);
          button.style.setProperty("--swatch-2", item.palette.ivory);
        }
        button.addEventListener("click", () => {
          saved[key] = id;
          applyChoice();
        });
        root.appendChild(button);
      });
    };

    mount($("#palette-options"), palettes, "palette");
    mount($("#font-options"), fonts, "font");
    applyChoice();

    const toggle = $("#style-lab-toggle");
    const panel = $("#style-lab-panel");
    toggle.addEventListener("click", () => {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  }

  function SoftPiano() {
    this.context = null;
    this.master = null;
    this.timer = 0;
    this.step = 0;
    this.playing = false;
    this.pattern = [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
      [196.0, 246.94, 293.66, 392.0]
    ];
  }

  SoftPiano.prototype.build = function () {
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = 0.09;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1500;
    const delay = context.createDelay();
    delay.delayTime.value = 0.38;
    const feedback = context.createGain();
    feedback.gain.value = 0.2;
    const wet = context.createGain();
    wet.gain.value = 0.28;
    master.connect(filter);
    filter.connect(context.destination);
    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(context.destination);
    this.context = context;
    this.master = master;
  };

  SoftPiano.prototype.tone = function (frequency, when) {
    const context = this.context;
    const oscillator = context.createOscillator();
    const overtone = context.createOscillator();
    const gain = context.createGain();
    const overtoneGain = context.createGain();
    oscillator.type = "sine";
    overtone.type = "triangle";
    oscillator.frequency.value = frequency;
    overtone.frequency.value = frequency * 2;
    overtoneGain.gain.value = 0.07;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.2, when + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 3.1);
    oscillator.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(this.master);
    oscillator.start(when);
    overtone.start(when);
    oscillator.stop(when + 3.2);
    overtone.stop(when + 3.2);
  };

  SoftPiano.prototype.loop = function () {
    if (!this.playing) return;
    const chord = this.pattern[this.step % this.pattern.length];
    const now = this.context.currentTime + 0.05;
    chord.forEach((frequency, index) => this.tone(frequency, now + index * 0.22));
    this.step += 1;
    this.timer = window.setTimeout(() => this.loop(), 4600);
  };

  SoftPiano.prototype.start = async function () {
    if (!this.context) this.build();
    if (this.context.state !== "running") await this.context.resume();
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setValueAtTime(0.09, this.context.currentTime);
    if (this.playing) return;
    this.playing = true;
    this.loop();
  };

  SoftPiano.prototype.stop = function () {
    this.playing = false;
    window.clearTimeout(this.timer);
    if (!this.context) return;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(0, now);
    if (this.context.state === "running") this.context.suspend();
  };
})();
