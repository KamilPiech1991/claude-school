export type Hours = 4 | 8;
export type CourseId = 'zero' | 'code' | 'cowork';

export interface Course {
  id: CourseId;
  no: string;
  name: string;
  short: string;
  lead: string;
  price: Record<Hours, number>;
  modules: [title: string, desc: string][];
  for: string[];
  out: string[];
  defaultHours: Hours;
}

export interface Session {
  id: string;
  course: CourseId;
  hours: Hours;
  day: string;
  mon: string;
  weekday: string;
  time: string;
  format: string;
  seats: number;
}

export const courses: Course[] = [
  {
    id: 'zero', no: '01', name: 'Claude od zera', defaultHours: 8,
    short: 'Pierwszy kontakt z Claude, po którym od razu oddajesz mu realną pracę: maile, raporty, dokumenty.',
    lead: 'Uczysz się na własnych plikach i zadaniach. Wychodzisz ze skonfigurowanym środowiskiem pracy i zestawem poleceń, których użyjesz w poniedziałek rano.',
    price: { 4: 690, 8: 1290 },
    modules: [
      ['Jak działa Claude i gdzie się myli', 'Modele, limity, halucynacje. Kiedy ufać, kiedy sprawdzać.'],
      ['Polecenia, które działają', 'Kontekst, rola, przykład, format. Jedna struktura na każde zadanie.'],
      ['Praca na Twoich plikach', 'PDF, arkusze, notatki ze spotkań. Streszczenia z odwołaniem do źródła.'],
      ['Projekty i stałe instrukcje', 'Claude, który zna Twoją pracę i nie wymaga tłumaczenia od nowa.'],
      ['Artefakty', 'Dokumenty, tabele i proste narzędzia budowane w rozmowie.'],
      ['Research i weryfikacja', 'Wyszukiwanie w sieci, porównywanie źródeł, sprawdzanie faktów.'],
      ['Bezpieczeństwo danych', 'Co wolno wkleić, czego nie. Zasady dla Ciebie i zespołu.'],
      ['Warsztat: Twój proces', 'Bierzesz jedno zadanie z pracy i przerabiasz je od A do Z.'],
    ],
    for: ['Korzystasz z AI okazjonalnie albo wcale', 'Chcesz przestać kopiować prompty z internetu', 'Firma wdraża Claude i potrzebujesz solidnych podstaw'],
    out: ['Zestaw sprawdzonych poleceń do Twoich zadań', 'Projekt z instrukcjami skonfigurowany pod Twoją pracę', 'Certyfikat ukończenia Claude School'],
  },
  {
    id: 'code', no: '02', name: 'Claude Code od podstaw', defaultHours: 8,
    short: 'Budujesz działające narzędzia i prototypy, opisując je po polsku. Bez etatu programisty.',
    lead: 'Zaczynasz od pustego terminala, kończysz z aplikacją opublikowaną w internecie. Po drodze uczysz się czytać zmiany, cofać błędy i prowadzić agenta krok po kroku.',
    price: { 4: 890, 8: 1590 },
    modules: [
      ['Terminal bez stresu', 'Instalacja, pierwsze komendy, jak czytać odpowiedzi agenta.'],
      ['Pierwsza aplikacja z opisu', 'Od pomysłu do działającego ekranu w 40 minut.'],
      ['Kontrola zmian', 'Czytanie diffów, cofanie, poprawianie błędów.'],
      ['Publikacja', 'Twoja aplikacja pod własnym adresem w internecie.'],
      ['Git i wersje', 'Historia projektu, którą rozumiesz i możesz cofnąć.'],
      ['Dane i API', 'Pliki, arkusze, zewnętrzne źródła, prosty dashboard.'],
      ['CLAUDE.md i automatyzacje', 'Stałe instrukcje, własne komendy, powtarzalne zadania.'],
      ['Warsztat: Twoje MVP', 'Budujesz narzędzie, którego naprawdę potrzebujesz.'],
    ],
    for: ['Masz pomysł na narzędzie, ale nie programujesz', 'Chcesz prototypować bez czekania na dział IT', 'Programujesz i chcesz sprawdzić pracę z agentem'],
    out: ['Działającą aplikację opublikowaną w sieci', 'Repozytorium z historią zmian, którą rozumiesz', 'Certyfikat ukończenia Claude School'],
  },
  {
    id: 'cowork', no: '03', name: 'Claude Cowork', defaultHours: 4,
    short: 'Oddajesz Claude całe zadania na komputerze: porządkowanie plików, zestawienia, raporty.',
    lead: 'Przestajesz pisać kolejne prompty. Uczysz się delegować zadanie tak, jak zrobiłbyś to z asystentem: cel, pliki, granice i kontrola wyniku.',
    price: { 4: 790, 8: 1390 },
    modules: [
      ['Agent a czat', 'Czym różni się delegowanie zadania od rozmowy.'],
      ['Jak zlecić zadanie', 'Cel, materiały, granice, kryteria odbioru.'],
      ['Pliki i foldery', 'Porządkowanie, zestawienia, raporty z wielu dokumentów.'],
      ['Kontrola wyniku', 'Jak sprawdzać i akceptować pracę agenta.'],
      ['Konektory', 'Poczta, kalendarz, dysk. Claude z dostępem do narzędzi.'],
      ['Zadania cykliczne', 'Raport w każdy poniedziałek bez Twojego udziału.'],
      ['Uprawnienia i bezpieczeństwo', 'Do czego dać dostęp, a do czego nigdy.'],
      ['Warsztat: tydzień dla agenta', 'Wybierasz trzy zadania i oddajesz je na stałe.'],
    ],
    for: ['Toniesz w powtarzalnych zadaniach na plikach i mailach', 'Chcesz delegować całe zadania, nie pojedyncze pytania', 'Odpowiadasz za wdrożenie AI w zespole'],
    out: ['Trzy zadania oddane agentowi na stałe', 'Zasady bezpieczeństwa gotowe dla zespołu', 'Certyfikat ukończenia Claude School'],
  },
];

const rawSessions: [string, CourseId, Hours, string, string, string, string, string, number][] = [
  ['s1', 'zero', 8, '10', 'paź', 'sobota', '9:00–17:00', 'Warszawa · sala', 3],
  ['s2', 'code', 8, '17', 'paź', 'sobota', '9:00–17:00', 'Warszawa · sala', 4],
  ['s3', 'cowork', 4, '21', 'paź', 'wtorek', '17:00–21:00', 'Online na żywo', 9],
  ['s4', 'zero', 4, '23', 'paź', 'czwartek', '17:00–21:00', 'Online na żywo', 7],
  ['s5', 'code', 4, '28', 'paź', 'wtorek', '17:00–21:00', 'Online na żywo', 6],
  ['s6', 'cowork', 8, '7', 'lis', 'sobota', '9:00–17:00', 'Warszawa · sala', 8],
  ['s7', 'zero', 8, '14', 'lis', 'sobota', '9:00–17:00', 'Warszawa · sala', 10],
  ['s8', 'code', 8, '21', 'lis', 'sobota', '9:00–17:00', 'Warszawa · sala', 11],
  ['s9', 'zero', 4, '2', 'gru', 'wtorek', '17:00–21:00', 'Online na żywo', 12],
  ['s10', 'cowork', 4, '4', 'gru', 'czwartek', '17:00–21:00', 'Online na żywo', 12],
];

export const sessions: Session[] = rawSessions.map(([id, course, hours, day, mon, weekday, time, format, seats]) => ({
  id, course, hours, day, mon, weekday, time, format, seats,
}));

export const trainers = [
  { name: 'Imię Nazwisko', role: 'Claude od zera · Cowork', bio: 'Wdraża Claude w działach sprzedaży i HR. Prowadzi szkolenia od 2023 roku.' },
  { name: 'Imię Nazwisko', role: 'Claude Code', bio: 'Product engineer. Buduje wewnętrzne narzędzia z Claude Code dla zespołów nietechnicznych.' },
  { name: 'Imię Nazwisko', role: 'Szkolenia dla firm', bio: 'Projektuje programy zamknięte pod procesy klienta. Wcześniej konsultant ds. automatyzacji.' },
];

export const quotes = [
  { text: 'Pierwszy raport kwartalny po kursie zrobiłam w godzinę. Wcześniej zajmował mi dwa dni.', who: 'Imię N.', role: 'Analityczka, branża FMCG' },
  { text: 'Nie umiem programować, a mam działające narzędzie do wycen. Zespół używa go codziennie.', who: 'Imię N.', role: 'Właściciel firmy remontowej' },
  { text: 'Szkolenie zamknięte ułożone pod nasze procesy. Po miesiącu Claude robi za nas trzy raporty.', who: 'Imię N.', role: 'Dyrektorka operacyjna' },
];

export const faqs = [
  ['Czy muszę znać AI albo programowanie?', 'Nie. Każdy kurs zaczyna od podstaw. Do Claude Code wystarczy, że umiesz obsługiwać komputer.'],
  ['Czy potrzebuję płatnego konta Claude?', 'Na czas kursu dajemy dostęp. Po kursie doradzimy, który plan ma sens w Twojej pracy.'],
  ['Czym różni się wersja 4 h od 8 h?', 'Wersja 4 h to cztery moduły podstaw. Wersja 8 h dodaje cztery moduły zaawansowane i warsztat na Twoim własnym procesie.'],
  ['Czy wystawiacie fakturę?', 'Tak, fakturę VAT na firmę lub osobę prywatną. Możliwe finansowanie z KFS.'],
] as const;

export const zl = (n: number) => n.toLocaleString('pl-PL') + ' zł';
export const courseById = (id: CourseId) => courses.find((c) => c.id === id)!;
export const seatsLabel = (n: number) => (n <= 4 ? `Zostały ${n} miejsca` : `Wolne miejsca: ${n}`);
export const seatsShort = (n: number) => (n <= 4 ? `${n} miejsca` : `${n} wolnych`);
export const nextSession = (id: CourseId, h: Hours) =>
  sessions.find((s) => s.course === id && s.hours === h) ?? sessions.find((s) => s.course === id);
