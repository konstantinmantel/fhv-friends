# FHV Friends

Eine studentische Web-App für die FHV in Dornbirn.

[App öffnen](https://konstantinmantel.github.io/fhv-friends/) · [Öffentliches Repository](https://github.com/konstantinmantel/fhv-friends)

## Testprofile und Wrapper

Unter **Profil → Testprofil wechseln** gibt es vier bearbeitbare Demo-Profile.
Name, Studiengang, Beschreibung, Interessen und Profilfoto lassen sich selbst
setzen. Beiträge können eigene Fotos bekommen. Zusagen und Merklisten sind je
Profil getrennt; Beiträge und berechtigte Chats teilen sich die Testprofile im
Browser dieses Geräts. Es sind **keine vier echten Supabase-Login-Konten** und
keine geräteübergreifenden Accounts. Bestehende lokale Demo-Eingaben werden
übernommen.

Fotos werden vor dem Speichern verkleinert. Erlaubt sind JPG, PNG und WebP bis
8 MB. Für den kleinen Testbetrieb werden komprimierte Rasterdaten gespeichert;
die vorbereiteten Datenbankfelder bleiben durch RLS auf bestätigte FHV-Konten
beschränkt. Bei einer größeren Einführung kann dies auf Supabase Storage
umgestellt werden. Für bereits installierte Datenbanken gibt es die additive
Migration `supabase/migrations/002_photos.sql`. Neue Projekte verwenden direkt
`supabase/schema.sql`.

Für Android enthält `android/` einen nativen URL-Wrapper mit App-Icon,
Zurück-Navigation und System-Fotoauswahl. Der Workflow **Android URL wrapper**
baut eine Test-APK. [Build und Download](https://github.com/konstantinmantel/fhv-friends/actions/workflows/android.yml).
Die App lädt die veröffentlichte HTTPS-Adresse; Website-Änderungen erscheinen
auch im Wrapper. Das APK wurde noch nicht auf einem physischen Android-Gerät
getestet. Kalenderexport benötigt dort derzeit den normalen Browser.

Auf iPhone/iPad genügt **Safari → Teilen → Zum Home-Bildschirm**. Diese PWA-
Installation öffnet die App ohne Browserleiste.

## Was gebaut ist

- **Home / Feed:** ÖH-Pins, Kategorien, Suche, Likes, Merkliste und Kommentare.
- **Trade / Help:** Tauschen, Verschenken, Essen teilen und Hilfe/Nachhilfe; separate Campus-Spots.
- **Activities:** Entdecken, Einladungen und eigene Pläne, Zusagen mit Platzlimit, Gruppenchat und Kalenderexport.
- **Profile:** Name, Studiengang, Bio, Interessen, eigene Beiträge und gespeicherte Beiträge.
- Zentraler **Plus-Button:** Beiträge erstellen, bearbeiten, löschen und Entwürfe auf dem Gerät speichern.
- Direktnachrichten und aktivitätsbezogene Gruppenchats. Im Livebetrieb Aktualisierung alle 8 Sekunden im offenen Chat; Feed-Aktualisierung alle 30 Sekunden.
- ÖH-Veröffentlichungen und Pins mit geschützten serverseitigen Rollen.
- Installierbare PWA: Manifest, App-Icons, Homescreen und Offline-App-Hülle.
- Deutsch, responsive, Tastaturbedienung, Fokusbegrenzung in Dialogen und reduzierte Animationen bei entsprechender Systemeinstellung.
- **Keine KI, keine Werbetracker und keine kostenpflichtigen Abhängigkeiten.**

## Ehrlicher Status

Die interaktive Demo ist unter https://konstantinmantel.github.io/fhv-friends/ veröffentlicht. Die Supabase-Anbindung und das Datenbankschema sind vorbereitet, aber **noch nicht mit einem echten Supabase-Projekt verbunden oder gegen eine laufende Datenbank getestet**. Demo-Inhalte und -Nachrichten bleiben auf dem jeweiligen Gerät. Es werden keine echten Personen benachrichtigt.

Das öffentliche Repository ist unter [konstantinmantel/fhv-friends](https://github.com/konstantinmantel/fhv-friends) verfügbar. Die Web-App ist über GitHub Pages veröffentlicht. Supabase ist der vorgesehene gemeinsame Datenspeicher; bis zur Konfiguration läuft die App als klar gekennzeichnete Demo.

Tests und Produktionsbuild sind auch in GitHub Actions erfolgreich. Der veröffentlichte Stand wurde im Browser auf Desktop und bei 390 px Breite geprüft; Zusagen und das Erstellen eines Nachhilfe-Beitrags wurden in der lokalen Demo erfolgreich getestet.

Die Supabase-Organisation **FHV Friends** wurde im **Free-Tarif** angelegt. Das Projektformular ist für **Frankfurt** mit aktivierter RLS-Voreinstellung vorbereitet. Zum Erstellen des eigentlichen Datenbankprojekts fehlt noch das vom Verantwortlichen selbst zu setzende Datenbankpasswort.

## Sofort ansehen

`FHV-Friends.html` ist eine eigenständige HTML-Demo mit eingebetteten Styles, Illustrationen und JavaScript. Herunterladen und per Doppelklick im Browser öffnen. Die Installation als PWA braucht die gehostete HTTPS-Version; sie funktioniert nicht aus einer lokalen Datei.

Die normale Projektversion besteht aus `index.html`, `src/` und `public/`. Sie benötigt **keine npm-Pakete**. Ein aktuelles Node.js (20+) genügt:

```sh
npm test
npm run check
npm run build
npm run dev
```

Die Vorschau läuft dann auf `http://127.0.0.1:4173`. `node scripts/serve.mjs dist` zeigt den Produktionsbuild.

`node scripts/standalone.mjs` aktualisiert die eigenständige Demo.

## Kostenloser Livebetrieb

### 1. Gemeinsame Verantwortung

Ein öffentliches Repository ist öffentlich lesbar und kopierbar. Hosting und Datenbank benötigen trotzdem Konten und Verantwortliche. Für die langfristige Übergabe eignet sich eine **gemeinsame GitHub-Organisation** mit mindestens zwei Verantwortlichen. Die MIT-Lizenz erlaubt Weiterentwicklung und Forks. Das Projekt wird keiner einzelnen Person als alleinige Eigentümerin zugeordnet.

### 2. GitHub Pages

1. Ein **öffentliches** Repository `fhv-friends` erstellen, idealerweise in eurer Organisation.
2. Alle Projektdateien hochladen bzw. mit Git pushen. `dist/` bleibt ignoriert.
3. Unter **Settings → Pages → Build and deployment** die Quelle **GitHub Actions** auswählen.
4. Der enthaltene Workflow `.github/workflows/pages.yml` prüft, baut und veröffentlicht die App.
5. Die Unterordner-URL von GitHub Pages funktioniert, weil alle App-Dateien relative Pfade verwenden.

GitHub Pages ist für öffentliche Repositories im kostenlosen Tarif nutzbar. Keine eigene Domain kaufen; die bereitgestellte `github.io`-Adresse genügt.

### 3. Supabase

1. Ein Supabase-Projekt im **Free-Tarif** in einer EU-Region anlegen. Kein Upgrade aktivieren.
2. `supabase/schema.sql` in einem **neuen, leeren Projekt** im SQL Editor ausführen.
3. **Authentication → Sign In / Providers → Email:** E-Mail und Passwort aktivieren, **Confirm email einschalten**. Anonyme Anmeldungen deaktiviert lassen.
4. Unter **Authentication → URL Configuration** die Live-URL als Site URL und Redirect URL eintragen (bei GitHub Pages einschließlich Repository-Pfad).
5. Projekt-URL und **publishable key / anon key** aus den API-Einstellungen kopieren. Niemals einen `service_role`- oder Secret-Key verwenden.
6. Unter GitHub **Settings → Secrets and variables → Actions → Variables** zwei öffentliche Variablen eintragen:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
7. Den Workflow erneut ausführen. Alternativ diese öffentlichen Werte in `public/config.js` eintragen und neu bauen.

Die kostenlose Supabase-Stufe hat Nutzungsgrenzen und kann inaktive Projekte pausieren. Die Architektur verursacht keine automatischen kostenpflichtigen Upgrades; dazu darf kein bezahlter Plan aktiviert werden. **Kostenlos heißt nicht unbegrenzt.**

### 4. Bestätigungsmails

**Die Standard-E-Mail-Funktion von Supabase reicht für einen echten Campus-Start nicht:** Sie sendet nur an Projekt-Teammitglieder und ist stark begrenzt. Bestätigungsmails an beliebige FHV-Studierende benötigen **einen eingerichteten SMTP-Anbieter bzw. Send-Email-Hook**.

Für 0 € kommen ein von der FHV bereitgestellter Mailversand oder ein geeigneter kostenloser SMTP-Tarif mit verifiziertem Absender infrage. Vor Aktivierung die tatsächlichen Freikontingente und Absenderanforderungen prüfen. Ohne eingerichteten Versand bleibt die Live-Registrierung ein offener Einrichtungsschritt. Die Mailprüfung darf dafür **nicht abgeschaltet** werden.

Als Alternative ist später eine Anmeldung über den FHV-Microsoft-Tenant möglich. Diese ist in dieser Version noch nicht implementiert und braucht eine freigegebene App-Registrierung.

### 5. ÖH-Rechte

Studierende können sich nicht selbst zu ÖH-Konten machen. Rollen liegen im privaten Schema, außerhalb der Client-API. Nach Mailbestätigung kann ein Verantwortlicher ein bekanntes Konto im SQL Editor freischalten. Die Beispielanweisung steht am Ende von `supabase/schema.sql`.

Kein Konto bekommt allein wegen einer bestimmten Zeichenfolge in der Mailadresse ÖH-Rechte. Auch öffentlich sichtbarer Code gewährt keine Datenbankrechte.

## Datenmodell und Schutz

| Tabelle | Zweck | Sichtbarkeit |
| --- | --- | --- |
| `profiles` | Öffentliche Campus-Profile ohne Mailadresse | Bestätigte FHV-Mitglieder |
| `posts` | Aktivitäten, Trade, Food, Help und Campusleben | Bestätigte FHV-Mitglieder |
| `participants` | Zusagen und Teilnehmende | Bestätigte FHV-Mitglieder |
| `bookmarks` | Persönliche Merkliste | Nur die jeweilige Person |
| `likes`, `comments` | Reaktionen und Diskussion | Bestätigte FHV-Mitglieder |
| `invitations` | Persönliche Einladungen | Absender und Empfänger |
| `conversations`, `messages` | Direkt- und Gruppenchats | Nur berechtigte Mitglieder |
| `reports` | Meldungen | Melder und Administration |
| `private.user_roles` | ÖH/Admin-Freischaltung | Nur administrative Datenbankzugriffe |

RLS ist für alle App-Tabellen aktiviert. Der Zugriff prüft im Backend eine **bestätigte** Adresse mit exakt `students.fhv.at` oder `fhv.at`. Eine Auth-Triggerfunktion blockiert externe Domains auch bei direktem API-Zugriff. Die Anzeige in der Oberfläche allein ist keine Zugriffskontrolle.

Zusagen laufen über eine Transaktion mit Zeilensperre, sodass gleichzeitige Anmeldungen das Platzlimit nicht umgehen können. Gruppenchat-Rechte werden dynamisch anhand der Teilnahme oder Gastgeberrolle geprüft. Direktchat-Mitglieder können nicht über die Client-API geändert werden.

Sitzungen werden über Supabase Access-/Refresh-Tokens verwaltet. In dieser statischen PWA liegen Sitzungstokens im Browser-Speicher. Keine Tokens oder persönlichen Nutzerdaten in Git speichern. Alle Texte aus Beiträgen und Chats werden beim Rendern maskiert.

Vor einem echten Campus-Rollout noch erforderlich: Live-Datenbanktests mit mindestens zwei studentischen Testkonten und einem ÖH-Konto, Mailzustellung, Moderationszuständigkeit, Impressum/Datenschutz und die Abstimmung zur Nutzung des FHV-Logos. Die App erhebt keinen Anspruch auf offizielle Trägerschaft der Hochschule.

## Projektstruktur

- `src/app.js` — Ansichten und Interaktionen
- `src/core.js` — Filter, Mailprüfung, Beitragsvalidierung und Kalenderexport
- `src/api.js` — Supabase Auth und REST-Anbindung, ohne zusätzliche SDK-Abhängigkeit
- `src/data.js` — ausdrücklich fiktive Demo-Inhalte
- `src/icons.js` — schlichte Icons
- `src/styles.css` — responsive Oberfläche
- `supabase/schema.sql` — Schema, RLS, Rollen, Trigger und RPCs
- `public/` — PWA, Icons und öffentliche Konfiguration
- `tests/` — automatische Prüfungen von Logik, Ansichten und API-Verträgen
- `.github/workflows/pages.yml` — Test, Build und kostenlose Pages-Veröffentlichung

## Quellen zur Einrichtung

- [Supabase Preise und Grenzen](https://supabase.com/pricing)
- [Supabase Bestätigungsmails und SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)

## Lizenz und Bildmarke

Code und selbst erstellte Icons: MIT, siehe `LICENSE`. Die FHV-Bildmarke wurde aus der offiziellen FHV-Webseite übernommen und ist davon ausgenommen. FHV Friends ist ein studentischer Prototyp und kein offizieller Hochschuldienst.
