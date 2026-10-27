/**
 * Atelier Invitaciones — contrato de contenido (schemaVersion 1)
 * --------------------------------------------------------------
 * Fuente única de esta invitación. El diseño (HTML/CSS) solo lee este objeto.
 * Así, el futuro administrador en Next.js puede guardar el mismo JSON y
 * pintar la plantilla "civil-editorial" sin rehacer la maquetación.
 *
 * Tipos de evento previstos: wedding, quince, baptism, babyshower, birthday.
 * Esta plantilla usa principals[] (quienes celebran), hosts[] (quien invita),
 * event, copy, gallery, rsvp, music y theme.
 *
 * Para recibir confirmaciones, llene rsvp.whatsappPhone
 * con código de país + número, sin + ni espacios.
 * Ejemplo México: "5213312345678"
 */
window.INVITATION = {
  schemaVersion: 1,
  meta: {
    id: "blanca-luis-2026",
    template: "civil-editorial",
    type: "wedding",
    variant: "civil",
    locale: "es-MX"
  },
  theme: {
    palette: {
      ink: "#14110e",
      "ink-soft": "#241e18",
      ivory: "#f4f1eb",
      paper: "#faf8f4",
      brass: "#9a7848",
      "brass-ink": "#4a3818",
      "brass-soft": "#e4d3b0",
      sage: "#5c6a57",
      "sage-deep": "#1c2822",
      burgundy: "#6e3342",
      white: "#fffdfb",
      line: "rgba(20, 17, 14, 0.16)"
    }
  },
  music: {
    src: "assets/Ed Sheeran - Thinking out Loud.flac",
    title: "Prueba 9",
    artist: "Luis LG",
    credit: ""
  },
  sections: {
    gate: true,
    hero: true,
    letter: true,
    calendar: true,
    place: true,
    gallery: false,
    rsvp: true
  },
  principals: [
    {
      role: "Novia",
      givenNames: "Luvia",
      familyNames: "Chandoqui Guillén",
      shortName: "Luvia"
    },
    {
      role: "Novio",
      givenNames: "Luis Alberto",
      familyNames: "López Gutiérrez",
      shortName: "Luis"
    }
  ],
  hosts: [
    {
      id: "bride-parents",
      label: "Padres de la novia",
      people: [
        { role: "Mamá", name: "", placeholder: "Nombre de la mamá" },
        { role: "Papá", name: "", placeholder: "Nombre del papá" }
      ]
    },
    {
      id: "groom-parents",
      label: "Padres del novio",
      people: [
        { role: "Mamá", name: "", placeholder: "Nombre de la mamá" },
        { role: "Papá", name: "", placeholder: "Nombre del papá" }
      ]
    }
  ],
  event: {
    kind: "Boda civil",
    dateISO: "2026-12-12T16:00:00-06:00",
    endISO: "2026-12-12T22:00:00-06:00",
    timeZone: "America/Mexico_City",
    timeLabel: "4:00 de la tarde",
    timeSpoken: "cuatro de la tarde",
    venueName: "Nuestra casa",
    mapsUrl: "https://maps.app.goo.gl/MhSYtuUjaXngtSzo7",
    address: {
      street: "Calle Eucalipto Sur",
      number: "509",
      neighborhood: "Colonia Patria Nueva",
      city: "",
      region: ""
    }
  },
  copy: {
    gateKicker: "Tienen el gusto de invitarle",
    invitationLead: "Con alegría, y con la bendición de nuestra familia.",
    invitationBridge: "se complacen en invitarle a la boda civil de sus hijos",
    invitationBody: [
      "Abriremos la puerta de casa para celebrar que decidimos seguir juntos.",
      "No habrá un gran salón. Habrá una tarde tranquila, la firma de nuestro matrimonio civil y una mesa compartida con las personas que han sido parte de esta historia.",
      "Si puede acompañarnos, no hay regalo que nos importe más que su presencia."
    ],
    invitationClose: "Les esperamos con el corazón abierto.",
    placeNote: "La ceremonia es civil y se celebrará en la intimidad de nuestra casa. Llegar unos minutos antes nos ayudará a comenzar en calma.",
    galleryTitle: "Una tarde de diciembre",
    galleryNote: "Flores, una firma y una mesa. Así imaginamos el día.",
    rsvpTitle: "¿Nos acompaña?",
    rsvpNote: "Su presencia es el mejor regalo. Cuéntenos, por favor, si podrá estar con nosotros.",
    footerLine: "Con cariño"
  },
  ui: {
    open: "Abrir invitación",
    silent: "Entrar en silencio",
    menu: "Menú",
    close: "Cerrar",
    musicPlay: "Reproducir música",
    musicPause: "Pausar música",
    attend: "Asistiré",
    decline: "No podré asistir",
    name: "Su nombre",
    guests: "Número de personas",
    message: "Unas palabras para los novios",
    submit: "Confirmar por WhatsApp",
    google: "Google Calendar",
    ics: "Descargar calendario",
    map: "Cómo llegar",
    scroll: "Continuar",
    days: "días",
    hours: "horas",
    minutes: "minutos",
    seconds: "segundos",
    today: "Hoy es el día",
    past: "Gracias por haber compartido este día",
    less: "Menos personas",
    more: "Más personas",
    required: "Este campo es necesario.",
    opened: "Se abrió WhatsApp con su confirmación.",
    blocked: "Si no se abrió WhatsApp, use el enlace de respaldo.",
    phoneMissing: "Falta el número de WhatsApp. Escríbalo en js/content.js, en rsvp.whatsappPhone, para que el mensaje llegue directo a la pareja."
  },
  gallery: [
    {
      src: "assets/photos/bouquet.jpg",
      alt: "Ramo con eucalipto, rosas blancas y durazno, y frutos rojos",
      caption: "Eucalipto"
    },
    {
      src: "assets/photos/rings.jpg",
      alt: "Dos argollas de oro sobre lino y follaje claro",
      caption: "Las argollas"
    },
    {
      src: "assets/photos/vows.jpg",
      alt: "Manos con anillos de matrimonio sobre un ramo de rosas y eucalipto",
      caption: "La promesa"
    },
    {
      src: "assets/photos/table.jpg",
      alt: "Mesa servida con copas, pan y un plato, en una comida íntima",
      caption: "La mesa"
    },
    {
      src: "assets/photos/hands.jpg",
      alt: "Dos manos tomadas, con un anillo, a la luz de la tarde",
      caption: "Juntos"
    },
    {
      src: "assets/photos/signature.jpg",
      alt: "Una mano firmando un documento sobre una mesa",
      caption: "La firma"
    }
  ],
  rsvp: {
    whatsappPhone: "529611496249",
    maxGuests: 8,
    messageTemplate: "Hola. Confirmo mi respuesta para la boda civil de {couple}.\n\nNombre: {name}\nAsistencia: {status}\nPersonas: {count}\nMensaje: {note}\n\n{when}\n{place}"
  }
};
