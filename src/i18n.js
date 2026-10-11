// Georgian / English UI strings. Use t("nav.home") in views.
const dict = {
  ka: {
    nav: { home: "მთავარი", products: "პროდუქტები", about: "ჩვენ შესახებ", contact: "კონტაქტი", handin: "ჩააბარე ბატარეა", order: "გამოწერა", impact: "გავლენა" },
    common: {
      from: "დან", gel: "₾", priceOnRequest: "ფასი მოთხოვნით", orderNow: "გამოწერა", details: "დეტალურად",
      send: "გაგზავნა", required: "სავალდებულო", optional: "არასავალდებულო", back: "უკან", save: "შენახვა",
      cancel: "გაუქმება", delete: "წაშლა", edit: "რედაქტირება", yes: "კი", no: "არა", all: "ყველა",
      search: "ძებნა", light: "ნათელი", dark: "მუქი", theme: "თემა", language: "ენა", menu: "მენიუ",
      cells: "ელემენტი", pcs: "ცალი", none: "—", close: "დახურვა",
    },
    hero: {
      badge: "ცირკულარული ეკონომიკა • სენაკი",
      ctaProducts: "პროდუქტების ნახვა", ctaHandin: "ჩააბარე ბატარეა",
    },
    stats: {
      title: "ჩვენი გავლენა რიცხვებში", subtitle: "ცოცხალი მონაცემები — ყოველი ახალი პარტია ავტომატურად აისახება",
      received: "მიღებული ელემენტები", revived: "გაცოცხლებული ელემენტები", kwh: "kWh მეორე სიცოცხლეში",
      kg: "კგ ნარჩენი გადარჩა ნაგავსაყრელს", co2: "ტ CO₂ თავიდან აცილებული", recycled: "ლეგალურ გადამუშავებაზე",
      used: "გამოყენებული პროდუქტებში", bySource: "საიდან მოდის ბატარეები", byGrade: "კლასების განაწილება",
      byMonth: "მიღება თვეების მიხედვით", byChemistry: "ქიმიის მიხედვით",
    },
    how: {
      title: "როგორ მუშაობს", subtitle: "ბატარეა სრულ წრეს გადის — ნაგავსაყრელამდე არასოდეს",
      s1: "შეგროვება", s1d: "სერვისები, ფლოტები, მგვ ორგანიზაციები და შენ",
      s3: "დახარისხება A–D", s3d: "თითოეული უჯრედი თავის როლს იღებს",
      s4: "მეორე სიცოცხლე", s4d: "მზის სადგური, პორტატული სადგური, ხელსაწყოს ბატარეა",
      s5: "ლეგალური გადამუშავება", s5d: "D კლასი — მგვ ჯაჭვში, არა ნაგავსაყრელზე",
    },
    products: { title: "პროდუქტები", subtitle: "ყოველი პროდუქტი შემოწმებული, დაჯგუფებული და მეორე სიცოცხლეში დაბრუნებული ელემენტებისგანაა აწყობილი.", preorder: "ვამზადებთ შეკვეთით — მზადდება და გეწოდებათ ან თავად მიიღებთ", cellsInside: "ელემენტი შიგნით", specs: "მახასიათებლები", empty: "პროდუქტები მალე დაემატება." },
    env: {
      title: "რატომ არის ეს მნიშვნელოვანი", subtitle: "ლითიუმის ბატარეა ერთ-ერთი ყველაზე სახიფათო ნარჩენია",
      toxTitle: "ტოქსიკური ლითონები", toxText: "კობალტი (IARC 2A) და ნიკელის ნაერთები (IARC ჯგუფი 1) კანცეროგენულია, მანგანუმი — ნეიროტოქსიკური. ნაგავსაყრელზე ისინი ნიადაგსა და წყალში იჟონება.",
      fireTitle: "ხანძრის საფრთხე", fireText: "დაზიანებული ბატარეა „თერმულ გაქცევაში“ გადადის და ფტორწყალბადს (HF) გამოყოფს. დიდ ბრიტანეთში 2023 წელს ნარჩენებში ბატარეებმა 1 200-ზე მეტი ხანძარი გამოიწვია.",
      co2Title: "წარმოების კვალი", co2Text: "1 kWh ახალი ბატარეის წარმოება ~60–150 კგ CO₂-ს გამოყოფს. ყოველი გაცოცხლებული kWh ამ ემისიას ზოგავს.",
    },
    handinCta: { title: "გაქვს ძველი ბატარეა?", text: "სკუტერის, ლეპტოპის, ხელსაწყოს ან ელექტრომობილის — ჩააბარე ჩვენ. ვარგისს მეორე სიცოცხლეს მივცემთ, დანარჩენს ლეგალურად გადავამუშავებთ.", button: "ჩააბარე ბატარეა" },
    about: {
      title: "ჩვენ შესახებ", lead: "ENCORE ცირკულარული ეკონომიკის სტარტაპია: სახიფათო ნარჩენს ენერგიის სანდო წყაროდ ვაქცევთ.",
      missionTitle: "ჩვენი მიზანი",
      mission: "ელექტრომობილებიდან, სკუტერებიდან და სხვა მოწყობილობებიდან ამოღებული ლითიუმის ბატარეები ხშირად ჯერ კიდევ 70–80% ტევადობით იყრება და ნაგავსაყრელზე ან შავ ბაზარზე ხვდება. ჩვენი მიზანია, არცერთი ვარგისი უჯრედი არ დაიკარგოს და არცერთი სახიფათო ელემენტი არ მოხვდეს გარემოში.",
      impactTitle: "დადებითი გავლენა ეკოლოგიაზე",
      impact1: "ნაკლები სახიფათო ნარჩენი ნაგავსაყრელზე და შავ ბაზარზე", impact2: "ნაკლები ხანძარი და ტოქსიკური დაბინძურება",
      impact3: "ნაკლები ახალი მოპოვება — ლითიუმი, კობალტი, ნიკელი", impact4: "ნაკლები CO₂ — ახალი ბატარეის წარმოება აღარ არის საჭირო",
      techTitle: "ტექნოლოგია: პრობლემიდან პროდუქტამდე",
      tech1t: "სწრაფი AI დიაგნოსტიკა", tech1: "პულსური ტესტით ვზომავთ ძაბვის რეაქციას, შიდა წინაღობას და ტემპერატურას; ML მოდელი SoH-ს წუთებში აფასებს და არა საათებში.",
      tech2t: "დახარისხება A–D", tech2: "A — ხელსაწყოების და სკუტერების ბატარეები; A/B — მზის ენერგიის სადგურები; C — მცირე მოწყობილობები; D — ლეგალური გადამუშავება.",
      tech3t: "დაჯგუფება და აწყობა", tech3: "ერთ პროდუქტში მხოლოდ ერთი ქიმიის, მსგავსი ტევადობისა და წინაღობის უჯრედები ერთიანდება — ხარისხიანი BMS-ით და spot welding-ით.",
      gradesTitle: "დახარისხების სისტემა",
    },
    contact: {
      title: "კონტაქტი და ბატარეის ჩაბარება", subtitle: "მოგვწერე, ან დაგვიტოვე ინფორმაცია ბატარეის ჩასაბარებლად — დაგიკავშირდებით.",
      tabHandin: "ჩააბარე ბატარეა", tabContact: "მოგვწერე",
      name: "სახელი და გვარი", phone: "ტელეფონი", email: "ელ-ფოსტა", city: "ქალაქი", source: "რისი ბატარეაა", qty: "დაახლოებითი რაოდენობა", message: "შეტყობინება",
      qtyPh: "მაგ. 2 სკუტერის ბატარეა, 10 ლეპტოპის ბატარეა", sent: "მადლობა! შეტყობინება მიღებულია — მალე დაგიკავშირდებით.",
      info: "საკონტაქტო ინფორმაცია", address: "მისამართი", hours: "სამუშაო საათები", safety: "უსაფრთხოება: გაბერილი ან დაზიანებული ბატარეა არ დამუხტოთ და არ გადაყაროთ — მოათავსეთ არაწვად ზედაპირზე და დაგვიკავშირდით.",
    },
    order: {
      title: "გამოწერა", subtitle: "ვამზადებთ შეკვეთით: აირჩიე პროდუქტი, დაგვიტოვე კონტაქტი და დაგიკავშირდებით ფასისა და ვადის დასაზუსტებლად.",
      product: "პროდუქტი", quantity: "რაოდენობა", delivery: "მიღების ფორმა", pickup: "თავად წავიღებ", deliver: "მიწოდება", note: "დამატებითი ინფორმაცია",
      sent: "შეკვეთა მიღებულია! მალე დაგიკავშირდებით დეტალების დასაზუსტებლად.", choose: "აირჩიე პროდუქტი",
    },
    footer: { tagline: "მეორე სიცოცხლე — სუფთა ხვალინდელი დღისთვის.", links: "ბმულები", follow: "გამოგვყევი", rights: "ყველა უფლება დაცულია.", hackathon: "GITA Circular Economy Hackathon • სენაკი 2026" },
    fields: {
      chemistry: "ქიმია", form: "ფორმა", capacity: "ტევადობა", source: "რისი ელემენტი იყო", quantity: "რაოდენობა", unitPrice: "ერთეულის ფასი",
      soh: "SoH (ჯანმრთელობა)", grade: "კლასი", voltage: "ძაბვა", ir: "შიდა წინაღობა", weight: "წონა (1 ცალი)", notes: "შენიშვნა", photo: "ფოტო",
      receivedAt: "მიღების თარიღი", used: "გამოყენებული პროდუქტებში", code: "კოდი",
    },
    source: { ev: "ელექტრომობილი", hybrid: "ჰიბრიდი", scooter: "ელ. სკუტერი", ebike: "ელ. ველოსიპედი", laptop: "ლეპტოპი", tool: "ელ. ხელსაწყო", vape: "ვეიპი", phone: "ტელეფონი", other: "სხვა" },
    form: { "18650": "18650 (ცილინდრული)", "21700": "21700 (ცილინდრული)", "26650": "26650 (ცილინდრული)", pouch: "Pouch (ბრტყელი)", prismatic: "პრიზმული", module: "მოდული", other: "სხვა" },
    chem: { other: "სხვა" },
    grade: { A: "A — ხელსაწყოები, სკუტერები, სადგურები", B: "B — მზის ენერგიის სადგური", C: "C — მცირე მოწყობილობები", D: "D — ლეგალური გადამუშავება" },
    gradeShort: { A: "SoH > 80%", B: "SoH 70–80%", C: "SoH 60–70%", D: "SoH < 60%" },
    errors: { notFound: "გვერდი ვერ მოიძებნა", notFoundText: "ეს გვერდი არ არსებობს ან გადატანილია.", generic: "რაღაც შეცდომა მოხდა. სცადე თავიდან.", form: "გთხოვ შეავსე სავალდებულო ველები." },
  },
  en: {
    nav: { home: "Home", products: "Products", about: "About us", contact: "Contact", handin: "Hand in a battery", order: "Order", impact: "Impact" },
    common: {
      from: "from", gel: "₾", priceOnRequest: "Price on request", orderNow: "Order", details: "Details",
      send: "Send", required: "required", optional: "optional", back: "Back", save: "Save",
      cancel: "Cancel", delete: "Delete", edit: "Edit", yes: "Yes", no: "No", all: "All",
      search: "Search", light: "Light", dark: "Dark", theme: "Theme", language: "Language", menu: "Menu",
      cells: "cells", pcs: "pcs", none: "—", close: "Close",
    },
    hero: { badge: "Circular economy • Senaki, Georgia", ctaProducts: "See products", ctaHandin: "Hand in a battery" },
    stats: {
      title: "Our impact in numbers", subtitle: "Live data — every new batch is reflected automatically",
      received: "Cells received", revived: "Cells revived", kwh: "kWh given a second life",
      kg: "kg of waste kept out of landfill", co2: "t CO₂ avoided", recycled: "Sent to legal recycling",
      used: "Used in products", bySource: "Where the batteries come from", byGrade: "Grade distribution",
      byMonth: "Intake by month", byChemistry: "By chemistry",
    },
    how: {
      title: "How it works", subtitle: "Every battery goes full circle — never to landfill",
      s1: "Collect", s1d: "Service centres, fleets, EPR organisations and you",
      s3: "Grade A–D", s3d: "Every cell gets the right job",
      s4: "Second life", s4d: "Solar storage, portable stations, power tool batteries",
      s5: "Legal recycling", s5d: "Grade D goes to the EPR chain, never to landfill",
    },
    products: { title: "Products", subtitle: "Every product is built from tested, matched cells brought back to a second life.", preorder: "Made to order — we build it, then deliver or you pick it up", cellsInside: "cells inside", specs: "Specifications", empty: "Products coming soon." },
    env: {
      title: "Why it matters", subtitle: "A lithium battery is one of the most hazardous kinds of waste",
      toxTitle: "Toxic metals", toxText: "Cobalt (IARC 2A) and nickel compounds (IARC Group 1) are carcinogenic, manganese is neurotoxic. In landfill they leach into soil and water.",
      fireTitle: "Fire hazard", fireText: "A damaged battery goes into thermal runaway and releases hydrogen fluoride (HF). In the UK, batteries caused over 1,200 fires in the waste system in 2023.",
      co2Title: "Manufacturing footprint", co2Text: "Making 1 kWh of new battery emits ~60–150 kg CO₂. Every revived kWh saves that.",
    },
    handinCta: { title: "Got an old battery?", text: "From a scooter, laptop, power tool or EV — hand it in. We give usable cells a second life and recycle the rest legally.", button: "Hand in a battery" },
    about: {
      title: "About us", lead: "ENCORE is a circular-economy startup turning hazardous waste into a reliable energy source.",
      missionTitle: "Our mission",
      mission: "Lithium batteries from EVs, scooters and other devices are often discarded with 70–80% of their capacity left, ending up in landfill or on the black market. Our goal is that no usable cell is wasted and no hazardous cell ends up in the environment.",
      impactTitle: "Positive environmental impact",
      impact1: "Less hazardous waste in landfill and on the black market", impact2: "Fewer fires and less toxic pollution",
      impact3: "Less new mining — lithium, cobalt, nickel", impact4: "Less CO₂ — no new battery needs to be made",
      techTitle: "Technology: from problem to product",
      tech1t: "Fast AI diagnostics", tech1: "A pulse test measures voltage response, internal resistance and temperature; an ML model estimates SoH in minutes, not hours.",
      tech2t: "Grading A–D", tech2: "A — power tool and scooter batteries; A/B — solar storage stations; C — small devices; D — legal recycling.",
      tech3t: "Matching and assembly", tech3: "Each product combines cells of one chemistry with similar capacity and resistance — with a quality BMS and spot welding.",
      gradesTitle: "Grading system",
    },
    contact: {
      title: "Contact & battery hand-in", subtitle: "Write to us, or leave your details to hand in a battery — we'll get back to you.",
      tabHandin: "Hand in a battery", tabContact: "Write to us",
      name: "Full name", phone: "Phone", email: "Email", city: "City", source: "Battery from", qty: "Approximate quantity", message: "Message",
      qtyPh: "e.g. 2 scooter batteries, 10 laptop batteries", sent: "Thank you! Your message was received — we'll be in touch soon.",
      info: "Contact details", address: "Address", hours: "Working hours", safety: "Safety: do not charge or throw away a swollen or damaged battery — place it on a non-flammable surface and contact us.",
    },
    order: {
      title: "Order", subtitle: "We build to order: choose a product, leave your contact and we'll confirm price and lead time.",
      product: "Product", quantity: "Quantity", delivery: "How to receive", pickup: "I'll pick it up", deliver: "Delivery", note: "Additional information",
      sent: "Order received! We'll contact you shortly to confirm the details.", choose: "Choose a product",
    },
    footer: { tagline: "Second life for a cleaner tomorrow.", links: "Links", follow: "Follow us", rights: "All rights reserved.", hackathon: "GITA Circular Economy Hackathon • Senaki 2026" },
    fields: {
      chemistry: "Chemistry", form: "Form factor", capacity: "Capacity", source: "Came from", quantity: "Quantity", unitPrice: "Unit price",
      soh: "SoH (health)", grade: "Grade", voltage: "Voltage", ir: "Internal resistance", weight: "Weight (per unit)", notes: "Notes", photo: "Photo",
      receivedAt: "Received on", used: "Used in products", code: "Code",
    },
    source: { ev: "Electric vehicle", hybrid: "Hybrid", scooter: "E-scooter", ebike: "E-bike", laptop: "Laptop", tool: "Power tool", vape: "Vape", phone: "Phone", other: "Other" },
    form: { "18650": "18650 (cylindrical)", "21700": "21700 (cylindrical)", "26650": "26650 (cylindrical)", pouch: "Pouch", prismatic: "Prismatic", module: "Module", other: "Other" },
    chem: { other: "Other" },
    grade: { A: "A — tools, scooters, stations", B: "B — solar storage station", C: "C — small devices", D: "D — legal recycling" },
    gradeShort: { A: "SoH > 80%", B: "SoH 70–80%", C: "SoH 60–70%", D: "SoH < 60%" },
    errors: { notFound: "Page not found", notFoundText: "This page doesn't exist or has moved.", generic: "Something went wrong. Please try again.", form: "Please fill in the required fields." },
  },
};

function translator(lang) {
  const table = dict[lang] || dict.ka;
  return function t(key) {
    const val = key.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), table);
    if (val !== undefined) return val;
    const fallback = key.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), dict.ka);
    return fallback !== undefined ? fallback : key;
  };
}

module.exports = { translator, LANGS: ["ka", "en"] };
