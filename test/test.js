'use strict';

/**/
const PDF = require('../lib/pdf');
//<page> </page>
const Invoice = new PDF( require('fs').readFileSync( __dirname + '/test.html', 'utf8' ), { dictionaries: 
[
    {
        "invoice"               : { "sk": "Faktúra", "cs": "Faktura", "en": "Invoice", "pl": "Faktura", "hu": "Számla", "de": "Rechnung", "nl": "Factuur", "bg": "фактура", "da": "Faktura", "et": "Arve", "el": "Τιμολόγιο", "es": "Factura", "fr": "Facturer", "hr": "Dostavnica", "it": "Fattura", "lv": "Rēķins", "lt": "Sąskaita faktūra", "mt": "Fattura", "pt": "Fatura", "ro": "Factura fiscala", "sl": "Račun", "fi": "Lasku", "sv": "Faktura" },

        "seller"                : { "sk": "Dodávateľ", "cs": "Dodavatel", "en": "Supplier", "pl": "Dostawca", "hu": "Támogató", "de": "Anbieter", "nl": "Leverancier", "bg": "Доставчик", "da": "Leverandør", "et": "Tarnija", "el": "Προμηθευτής", "es": "Proveedor", "fr": "Le fournisseur", "hr": "Dobavljač", "it": "Fornitore", "lv": "Piegādātājs", "lt": "Tiekėjas", "mt": "Fornitur", "pt": "Fornecedor", "ro": "Furnizor", "sl": "dobavitelj", "fi": "Toimittaja", "sv": "Leverantör" },
        "buyer"                 : { "sk": "Odberateľ", "cs": "Odběratel", "en": "Customer", "pl": "Klient", "hu": "Vevő", "de": "Kunde", "nl": "Klant", "bg": "Клиент", "da": "Kunde", "et": "Klient", "el": "Πελάτης", "es": "Cliente", "fr": "Client", "hr": "kupac", "it": "Cliente", "lv": "Klients", "lt": "Klientas", "mt": "Klijent", "pt": "Cliente", "ro": "Client", "sl": "Stranka", "fi": "Asiakas", "sv": "Kund" },

        "crn"                   : { "sk": "IČO", "cs": "IČO", "pl": "NS", "hu": "ID", "de": "ICH WÜRDE", "nl": "ID kaart", "bg": "документ за самоличност", "da": "ID", "et": "ID", "en": "IČO", "el": "ταυτότητα", "es": "IDENTIFICACIÓN", "fr": "identifiant", "hr": "iskaznica", "it": "ID", "lv": "ID", "lt": "ID", "mt": "ID", "pt": "EU IRIA", "ro": "ID", "sl": "ID", "fi": "ID", "sv": "ID" },
        "tax"                   : { "sk": "DIČ", "cs": "DIČ", "pl": "Numer VAT", "hu": "Adószám", "de": "Umsatzsteuer-Identifikationsnummer", "nl": "btw-nummer", "bg": "номер по ДДС", "da": "momsnummer", "et": "käibemaksukohustuslase number", "en": "VAT number", "el": "ΑΦΜ", "es": "Número de valor agregado", "fr": "numéro de TVA", "hr": "PDV broj", "it": "Partita IVA", "lv": "PVN numurs", "lt": "PVM numeris", "mt": "numru tal-VAT", "pt": "Número de IVA", "ro": "TVA", "sl": "Davčna številka", "fi": "ALV-numero", "sv": "Momsregistreringsnummer" },
        "vat"                   : { "sk": "IČ DPH", "cs": "IČ DPH", "pl": "faktura VAT", "hu": "áfa", "de": "MwSt.", "nl": "VAT", "bg": "ДДС", "da": "moms", "et": "käibemaks", "en": "VAT", "el": "ΔΕΞΑΜΕΝΗ", "es": "IVA", "fr": "T.V.A.", "hr": "PDV", "it": "I.V.A.", "lv": "PVN", "lt": "PVM", "mt": "VAT", "pt": "CUBA", "ro": "TVA", "sl": "DDV", "fi": "arvonlisävero", "sv": "MOMS" },

        "issue-date"            : { "sk": "Dátum vystavenia", "cs": "Datum vystavení", "pl": "Data wydania", "hu": "Kiadás dátuma", "de": "Ausgabedatum", "nl": "Uitgavedatum", "bg": "Дата на издаване", "da": "Udstedelsesdato", "et": "Väljastamise kuupäev", "en": "Date of issue", "el": "Ημερομηνία έκδοσης", "es": "Fecha de emisión", "fr": "Date d'émission", "hr": "Datum izdavanja", "it": "Data di rilascio", "lv": "Izdošanas datums", "lt": "Išdavimo data", "mt": "Data tal-ħruġ", "pt": "Data de emissão", "ro": "Data emiterii", "sl": "Datum izdaje", "fi": "Myöntämispäivä", "sv": "Utgivningsdatum" },
        "due-date"              : { "sk": "Dátum splatnosti", "cs": "Datum splatnosti", "pl": "Termin płatności", "hu": "Esedékesség", "de": "Geburtstermin", "nl": "Opleveringsdatum", "bg": "Краен срок", "da": "Afleveringsdato", "et": "Tähtaeg", "en": "Due date", "el": "Ημερομηνία λήξης", "es": "Fecha de vencimiento", "fr": "Date d'échéance", "hr": "Datum dospijeća", "it": "Scadenza", "lv": "Gala termiņš", "lt": "Terminas", "mt": "Data dovuta", "pt": "Data de Vencimento", "ro": "Data scadenței", "sl": "Rok", "fi": "Eräpäivä", "sv": "Förfallodatum" },
        "delivery-date"         : { "nl": "Bezorgdatum", "bg": "Дата на доставка", "cs": "Datum dodání", "da": "Leveringsdato", "et": "Tarnetähtaeg", "fr": "La date de livraison", "el": "Ημερομηνία παράδοσης", "hr": "Datum dostave", "en": "Delivery date", "lt": "Pristatymo data", "lv": "Piegādes datums", "de": "Lieferdatum", "hu": "Kiszállítási dátum", "pl": "Data dostarczenia", "pt": "Data de entrega", "ro": "Data de livrare", "sl": "Datum dostave", "es": "Fecha de entrega", "sk": "Dátum dodania", "sv": "Leveransdatum", "it": "Data di consegna", "fi": "Toimituspäivä" },

        "account-number"        : { "sk": "Číslo účtu", "cs": "Číslo účtu", "en": "Account number", "pl": "Numer konta", "hu": "Számlaszám", "de": "Kontonummer", "nl": "Rekeningnummer", "bg": "Номер на сметка", "da": "Kontonummer", "et": "Konto number", "el": "Αριθμός λογαριασμού", "es": "Número de cuenta", "fr": "Numéro de compte", "hr": "Broj računa", "it": "Numero di conto", "lv": "Konta numurs", "lt": "Paskyros numeris", "mt": "Numru tal-kont", "pt": "Número de conta", "ro": "Numar de cont", "sl": "Številka računa", "fi": "Tilinumero", "sv": "Kontonummer" },
        "iban"                  : { "sk": "IBAN", "cs": "IBAN", "en": "IBAN", "pl": "IBAN", "hu": "IBAN", "de": "IBAN", "nl": "IBAN", "bg": "IBAN", "da": "IBAN", "et": "IBAN", "el": "IBAN", "es": "IBAN", "fr": "IBAN", "hr": "IBAN", "it": "IBAN", "lv": "IBAN", "lt": "IBAN", "mt": "IBAN", "pt": "IBAN", "ro": "IBAN", "sl": "IBAN", "fi": "IBAN", "sv": "IBAN" },
        "bic-swift"             : { "sk": "BIC/SWIFT", "cs": "BIC/SWIFT", "en": "BIC/SWIFT", "pl": "BIC/SWIFT", "hu": "BIC/SWIFT", "de": "BIC/SWIFT", "nl": "BIC/SWIFT", "bg": "BIC/SWIFT", "da": "BIC/SWIFT", "et": "BIC/SWIFT", "el": "BIC/SWIFT", "es": "BIC/SWIFT", "fr": "BIC/SWIFT", "hr": "BIC/SWIFT", "it": "BIC/SWIFT", "lv": "BIC/SWIFT", "lt": "BIC/SWIFT", "mt": "BIC/SWIFT", "pt": "BIC/SWIFT", "ro": "BIC/SWIFT", "sl": "BIC/SWIFT", "fi": "BIC/SWIFT", "sv": "BIC/SWIFT" },
        "variable-symbol"       : { "nl": "Variabel symbool", "bg": "Променлив символ", "cs": "Variabilní symbol", "da": "Variabelt symbol", "et": "Muutuv sümbol", "fr": "Symbole variable", "el": "Μεταβλητό σύμβολο", "hr": "Simbol varijable", "en": "Variable symbol", "lt": "Kintamasis simbolis", "lv": "Mainīgais simbols", "de": "Variables Symbol", "hu": "Változó szimbólum", "pl": "Symbol zmienny", "pt": "Símbolo variável", "ro": "Simbol variabil", "sl": "Simbol spremenljivke", "es": "Símbolo variable", "sv": "Variabel symbol", "sk": "Variabilný symbol", "it": "Simbolo variabile", "fi": "Muuttuva symboli" },

        "item-name"             : { "sk": "Názov položky", "cs": "Název položky", "en": "Item name", "pl": "Nazwa przedmiotu", "hu": "Termék név", "de": "Artikelname", "nl": "Itemnaam", "bg": "Име на предмета", "da": "Tingens navn", "et": "Asja nimi", "el": "Ονομα προϊόντος", "es": "Nombre del árticulo", "fr": "Nom de l'article", "hr": "Ime proizvoda", "it": "Nome dell'oggetto", "lv": "Priekšmeta nosaukums", "lt": "Daikto pavadinimas", "mt": "Isem tal-oġġett", "pt": "Nome do item", "ro": "Numele articolului", "sl": "Ime predmeta", "fi": "Tuotteen nimi", "sv": "Föremålsnamn" },
        "item-code"             : { "nl": "Code", "bg": "код", "cs": "Kód", "da": "Kode", "et": "Kood", "fr": "Code", "el": "Κώδικας", "hr": "Kodirati", "en": "Code", "lt": "Kodas", "lv": "Kods", "de": "Code", "hu": "Kód", "pl": "Kod", "pt": "Código", "ro": "Cod", "sl": "Koda", "es": "Código", "sv": "Koda", "sk": "Kód", "it": "Codice", "fi": "Koodi" },
        "item-quantity"         : { "nl": "Aantal stuks", "bg": "количество", "cs": "Množství", "da": "Antal", "et": "Kogus", "fr": "Quantité", "el": "Ποσότητα", "hr": "Količina", "en": "Quantity", "lt": "Kiekis", "lv": "Daudzums", "de": "Menge", "hu": "Mennyiség", "pl": "Ilość", "pt": "Quantidade", "ro": "Cantitate", "sk": "Množstvo", "sl": "Količina", "es": "Cantidad", "sv": "Kvantitet", "it": "Quantità", "fi": "Määrä" },
        "item-piece-price"      : { "nl": "Prijs per stuk", "bg": "Цена за бройка", "cs": "Cena za kus", "da": "Pris pr stk", "et": "Hind tüki kohta", "fr": "Prix par pièce", "el": "Τιμή ανά τεμάχιο", "hr": "Cijena po komadu", "en": "Price per piece", "lt": "Kaina už vienetą", "lv": "Cena par gabalu", "de": "Preis pro Stück", "hu": "Ár darabonként", "pl": "Cena za sztukę", "pt": "Preço por peça", "ro": "Pret pe bucata", "sl": "Cena za kos", "sk": "Cena za kus", "es": "Precio por pieza", "sv": "Pris per styck", "it": "Prezzo al pezzo", "fi": "Hinta per kappale" },
        "amount-to-be-paid"     : { "nl": "Het te betalen bedrag", "bg": "Сума за плащане", "cs": "Částka k úhradě", "da": "Beløb, der skal betales", "et": "Tasumisele kuuluv summa", "fr": "Montant à payer", "el": "Ποσο που πρεπει να πληρωθει", "hr": "Iznos za plaćanje", "en": "Amount to be paid", "lt": "Suma, kurią reikia sumokėti", "lv": "Summa, kas jāmaksā", "de": "Zu zahlender Betrag", "hu": "Fizetendő összeg", "pl": "Suma do zapłaty", "pt": "Montante a ser pago", "sk": "Čiastka k úhrade", "ro": "Suma de plată", "sl": "Znesek za plačilo", "es": "El monto a pagar", "sv": "Summa att betala", "it": "Somma da pagare", "fi": "Maksettava summa" },

        "basis"                 : { "nl": "De basis", "bg": "Основата", "cs": "Základ", "da": "Grundlaget", "et": "Alus", "fr": "La base", "el": "Η βάση", "hr": "Osnova", "en": "The basis", "lt": "Pagrindas", "lv": "Pamats", "de": "Die Basis", "hu": "Az alap", "pl": "Podstawy", "pt": "A base", "ro": "Baza", "sl": "Osnova", "es": "La base", "sv": "Grunden", "sk": "Základ", "it": "La base", "fi": "Perusta" },
        "vat"                   : { "sk": "DPH", "cs": "DPH", "en": "VAT", "pl": "VAT", "hu": "ÁFA", "de": "MwSt.", "nl": "BTW", "bg": "ДДС", "da": "moms", "et": "km", "el": "ΦΠΑ", "es": "IVA", "fr": "TVA", "hr": "PDV", "it": "IVA", "lv": "PVN", "lt": "PVM", "mt": "VAT", "pt": "IVA", "ro": "TVA", "sl": "DDV", "fi": "ALV", "sv": "Moms" },
        "total"                 : { "nl": "In totaal", "bg": "Накратко", "cs": "Celkem", "da": "Ialt", "et": "Kokkuvõtteks", "fr": "En somme", "el": "Εν ολίγοις", "hr": "Ukupno", "en": "In sum", "lt": "Trumpai tariant", "lv": "Īsumā", "de": "In Summe", "hu": "Összegezve", "pl": "W sumie", "pt": "Em suma", "ro": "In suma", "sk": "Celkom", "sl": "Skratka", "es": "En suma", "sv": "Kortfattat", "it": "Insomma", "fi": "Yhteensä" },
        "total-with-vat"        : { "nl": "Totaal met btw", "bg": "Общо с ДДС", "cs": "Celkem s DPH", "da": "Samlet med moms", "et": "Kokku koos käibemaksuga", "fr": "Total avec TVA", "el": "Σύνολο με ΦΠΑ", "hr": "Ukupno s PDV-om", "en": "Total with VAT", "lt": "Iš viso su PVM", "lv": "Kopā ar PVN", "de": "Gesamt mit MwSt", "hu": "Összesen áfával", "pl": "Razem z VAT", "pt": "Total com IVA", "ro": "Total cu TVA", "sl": "Skupaj z DDV", "sk": "Celkom s DPH", "es": "Total con IVA", "sv": "Totalt med moms", "it": "Totale con IVA", "fi": "Yhteensä arvonlisäverollinen" },
        "vat-breakdown"         : { "nl": "BTW-specificatie vermeld in", "bg": "Разбивката по ДДС е посочена в", "cs": "Rozpis DPH uvedený v měně", "da": "Momsfordeling angivet i", "et": "aastal märgitud käibemaksu jaotus", "fr": "Répartition de la TVA indiquée dans", "el": "Η ανάλυση του ΦΠΑ αναφέρεται στο", "hr": "Raspored PDV-a naveden u", "en": "VAT breakdown stated in", "lt": "PVM paskirstymas nurodytas", "lv": "punktā norādītais PVN sadalījums", "de": "Umsatzsteueraufschlüsselung gem", "hu": "pontban feltüntetett áfa részletezés", "pl": "Podział podatku VAT podany w", "pt": "Repartição do IVA indicada em", "ro": "Defalcarea TVA menționată în", "sl": "Razčlenitev DDV je navedena v", "es": "desglose del IVA indicado en", "sk": "Rozpis DPH uvedený v", "sv": "Momsfördelning som anges i", "it": "Ripartizione IVA indicata in", "fi": "ALV:n erittely kohdassa" },

        "payment-method"        : { "sk": "Spôsob platby", "cs": "Způsob platby", "en": "Payment method", "pl": "Metoda płatności", "hu": "Fizetési mód", "de": "Bezahlverfahren", "nl": "Betalingswijze", "bg": "Начин на плащане", "da": "Betalingsmetode", "et": "Makseviis", "el": "Μέθοδος πληρωμής", "es": "Método de pago", "fr": "Mode de paiement", "hr": "Način plaćanja", "it": "Metodo di pagamento", "lv": "Apmaksas veids", "lt": "Mokėjimo būdas", "mt": "Metodu ta 'pagament", "pt": "Forma de pagamento", "ro": "Modalitate de plată", "sl": "Način plačila", "fi": "Maksutapa", "sv": "Betalningsmetod" },
        "payment-wire"          : { "sk": "Bankový prevod", "cs": "Bankovní převod", "pl": "Przelew bankowy", "hu": "Banki átutalás", "de": "Banküberweisung", "nl": "Bankoverschrijving", "bg": "Банков превод", "da": "Bankoverførsel", "et": "Pangaülekanne", "en": "Bank transfer", "el": "Τραπεζική κατάθεση", "es": "Transferencia bancaria", "fr": "Virement bancaire", "hr": "Bankovni prijenos", "it": "Bonifico bancario", "lv": "Bankas pārskaitījums", "lt": "Bankinis pavedimas", "mt": "Trasferiment bankarju", "pt": "Transferência bancária", "ro": "Transfer bancar", "sl": "Bančno nakazilo", "fi": "Pankkisiirto", "sv": "Banköverföring" },
        "payment-cod"           : { "sk": "Dobierka", "cs": "Dobírka", "pl": "Płatność gotówką przy odbiorze", "hu": "Utánvétes fizetés", "de": "Barzahlung bei Lieferung", "nl": "Rembours", "bg": "Наложен платеж", "da": "Kontant ved levering", "et": "Sularaha kättesaamisel", "en": "Cash on delivery", "el": "Με αντικαταβολή", "es": "Contra reembolso", "fr": "Paiement à la livraison", "hr": "Pouzećem", "it": "Pagamento alla consegna", "lv": "Ar pēcmaksu", "lt": "Mokėti pristatymo metu", "mt": "Flus mal-kunsinna", "pt": "Pagamento na entrega", "ro": "Plata la livrare", "sl": "Gotovino po povzetju", "fi": "Postiennakko", "sv": "Postförskott" },
        "payment-card"          : { "nl": "Kaart", "bg": "карта", "cs": "Kartou", "da": "Kort", "et": "Kaart", "fr": "Carte", "el": "Κάρτα", "hr": "Kartica", "en": "Card", "lt": "Kort", "lv": "Kart", "de": "Karte", "hu": "Kártya", "pl": "Karta", "pt": "Cartão", "ro": "Card", "sl": "Kartica", "es": "Tarjeta", "sv": "Kort", "it": "Carta", "fi": "Kortti" },

        "page"                  : { "nl": "Bladzijde", "bg": "Страница", "cs": "Strana", "da": "Side", "et": "Lehekülg", "fr": "Page", "el": "Σελίδα", "hr": "Stranica", "en": "Page", "lt": "Puslapis", "lv": "Lappuse", "de": "Buchseite", "hu": "oldal", "pl": "Strona", "pt": "Página", "ro": "Pagină", "sl": "stran", "es": "Página", "sv": "Sida", "it": "Pagina", "fi": "Sivu" },
        "country" :
        {
            "BE": {"sk":"Belgicko","cs":"Belgie","pl":"Belgia","hu":"Belgium","de":"Belgien","nl":"België","bg":"Белгия","da":"Belgien","et":"Belgia","en":"Belgium","el":"Βέλγιο","es":"Bélgica","fr":"la Belgique","hr":"Belgija","it":"Belgio","lv":"Beļģija","lt":"Belgija","mt":"Il-Belġju","pt":"Bélgica","ro":"Belgia","sl":"Belgija","fi":"Belgia","sv":"Belgien"},
            "BG": {"sk":"Bulharsko","cs":"Bulharsko","pl":"Bułgaria","hu":"Bulgária","de":"Bulgarien","nl":"Bulgarije","bg":"България","da":"Bulgarien","et":"Bulgaaria","en":"Bulgaria","el":"Βουλγαρία","es":"Bulgaria","fr":"Bulgarie","hr":"Bugarska","it":"Bulgaria","lv":"Bulgārija","lt":"Bulgarija","mt":"Bulgarija","pt":"Bulgária","ro":"Bulgaria","sl":"Bolgarija","fi":"Bulgaria","sv":"Bulgarien"},
            "CZ": {"sk":"Česko","cs":"Česko","pl":"Czechy","hu":"Csehország","de":"Tschechien","nl":"Tsjechië","bg":"Чехия","da":"Tjekkiet","et":"Tšehhi","en":"Czechia","el":"Τσεχία","es":"Chequia","fr":"Tchéquie","hr":"Češka","it":"Cechia","lv":"Čehija","lt":"Čekija","mt":"Ċekja","pt":"Czechia","ro":"Cehia","sl":"Češka","fi":"Tšekki","sv":"Tjeckien"},
            "DK": {"sk":"Dánsko","cs":"Dánsko","pl":"Dania","hu":"Dánia","de":"Dänemark","nl":"Denemarken","bg":"Дания","da":"Danmark","et":"Taani","en":"Denmark","el":"Δανία","es":"Dinamarca","fr":"Danemark","hr":"Danska","it":"Danimarca","lv":"Dānija","lt":"Danija","mt":"Id-Danimarka","pt":"Dinamarca","ro":"Danemarca","sl":"Danska","fi":"Tanska","sv":"Danmark"},
            "EE": {"sk":"Estónsko","cs":"Estonsko","pl":"Estonia","hu":"Észtország","de":"Estland","nl":"Estland","bg":"Естония","da":"Estland","et":"Eesti","en":"Estonia","el":"Εσθονία","es":"Estonia","fr":"Estonie","hr":"Estonija","it":"Estonia","lv":"Igaunija","lt":"Estija","mt":"L-Estonja","pt":"Estônia","ro":"Estonia","sl":"Estonija","fi":"Viro","sv":"Estland"},
            "FR": {"sk":"Francúzsko","cs":"Francie","pl":"Francja","hu":"Franciaország","de":"Frankreich","nl":"Frankrijk","bg":"Франция","da":"Frankrig","et":"Prantsusmaa","en":"France","el":"Γαλλία","es":"Francia","fr":"La France","hr":"Francuska","it":"Francia","lv":"Francija","lt":"Prancūzija","mt":"Franza","pt":"França","ro":"Franţa","sl":"Francija","fi":"Ranska","sv":"Frankrike"},
            "GR": {"sk":"Grécko","cs":"Řecko","pl":"Grecja","hu":"Görögország","de":"Griechenland","nl":"Griekenland","bg":"Гърция","da":"Grækenland","et":"Kreeka","en":"Greece","el":"Ελλάδα","es":"Grecia","fr":"Grèce","hr":"Grčka","it":"Grecia","lv":"Grieķija","lt":"Graikija","mt":"Il-Greċja","pt":"Grécia","ro":"Grecia","sl":"Grčija","fi":"Kreikka","sv":"Grekland"},
            "NL": {"sk":"Holandsko","cs":"Nizozemsko","pl":"Holandia","hu":"Hollandia","de":"Niederlande","nl":"Nederland","bg":"Холандия","da":"Holland","et":"Holland","en":"Netherlands","el":"Ολλανδία","es":"Países Bajos","fr":"Pays-Bas","hr":"Nizozemska","it":"Olanda","lv":"Nīderlande","lt":"Nyderlandai","mt":"Olanda","pt":"Holanda","ro":"Olanda","sl":"Nizozemska","fi":"Alankomaat","sv":"Nederländerna"},
            "HR": {"sk":"Chorvátsko","cs":"Chorvatsko","pl":"Chorwacja","hu":"Horvátország","de":"Kroatien","nl":"Kroatië","bg":"Хърватия","da":"Kroatien","et":"Horvaatia","en":"Croatia","el":"Κροατία","es":"Croacia","fr":"Croatie","hr":"Hrvatska","it":"Croazia","lv":"Horvātija","lt":"Kroatija","mt":"Il-Kroazja","pt":"Croácia","ro":"Croaţia","sl":"Hrvaška","fi":"Kroatia","sv":"Kroatien"},
            "IE": {"sk":"Írsko","cs":"Irsko","pl":"Irlandia","hu":"Írország","de":"Irland","nl":"Ierland","bg":"Ирландия","da":"Irland","et":"Iirimaa","en":"Ireland","el":"Ιρλανδία","es":"Irlanda","fr":"Irlande","hr":"Irska","it":"Irlanda","lv":"Īrija","lt":"Airija","mt":"L-Irlanda","pt":"Irlanda","ro":"Irlanda","sl":"Irska","fi":"Irlanti","sv":"Irland"},
            "LT": {"sk":"Litva","cs":"Litva","pl":"Litwa","hu":"Litvánia","de":"Litauen","nl":"Litouwen","bg":"Литва","da":"Litauen","et":"Leedu","en":"Lithuania","el":"Λιθουανία","es":"Lituania","fr":"Lituanie","hr":"Litva","it":"Lituania","lv":"Lietuva","lt":"Lietuva","mt":"Il-Litwanja","pt":"Lituânia","ro":"Lituania","sl":"Litva","fi":"Liettua","sv":"Litauen"},
            "LV": {"sk":"Lotyšsko","cs":"Lotyšsko","pl":"Łotwa","hu":"Lettország","de":"Lettland","nl":"Letland","bg":"Латвия","da":"Letland","et":"Läti","en":"Latvia","el":"Λετονία","es":"Letonia","fr":"Lettonie","hr":"Latvija","it":"Lettonia","lv":"Latvija","lt":"Latvija","mt":"Il-Latvja","pt":"Letônia","ro":"Letonia","sl":"Latvija","fi":"Latvia","sv":"Lettland"},
            "LU": {"sk":"Luxembursko","cs":"Lucembursko","pl":"Luksemburg","hu":"Luxemburg","de":"Luxemburg","nl":"Luxemburg","bg":"Люксембург","da":"Luxembourg","et":"Luksemburg","en":"Luxembourg","el":"Λουξεμβούργο","es":"Luxemburgo","fr":"Luxembourg","hr":"Luksemburg","it":"Lussemburgo","lv":"Luksemburga","lt":"Liuksemburgas","mt":"Il-Lussemburgu","pt":"Luxemburgo","ro":"Luxemburg","sl":"Luksemburg","fi":"Luxemburg","sv":"Luxemburg"},
            "HU": {"sk":"Maďarsko","cs":"Maďarsko","pl":"Węgry","hu":"Magyarország","de":"Ungarn","nl":"Hongarije","bg":"Унгария","da":"Ungarn","et":"Ungari","en":"Hungary","el":"Ουγγαρία","es":"Hungría","fr":"Hongrie","hr":"Mađarska","it":"Ungheria","lv":"Ungārija","lt":"Vengrija","mt":"L-Ungerija","pt":"Hungria","ro":"Ungaria","sl":"Madžarska","fi":"Unkari","sv":"Ungern"},
            "DE": {"sk":"Nemecko","cs":"Německo","pl":"Niemcy","hu":"Németország","de":"Deutschland","nl":"Duitsland","bg":"Германия","da":"Tyskland","et":"Saksamaa","en":"Germany","el":"Γερμανία","es":"Alemania","fr":"Allemagne","hr":"Njemačka","it":"Germania","lv":"Vācija","lt":"Vokietija","mt":"Il-Ġermanja","pt":"Alemanha","ro":"Germania","sl":"Nemčija","fi":"Saksa","sv":"Tyskland"},
            "PL": {"sk":"Poľsko","cs":"Polsko","pl":"Polska","hu":"Lengyelország","de":"Polen","nl":"Polen","bg":"Полша","da":"Polen","et":"Poola","en":"Poland","el":"Πολωνία","es":"Polonia","fr":"Pologne","hr":"Poljska","it":"Polonia","lv":"Polija","lt":"Lenkija","mt":"Il-Polonja","pt":"Polônia","ro":"Polonia","sl":"Poljska","fi":"Puola","sv":"Polen"},
            "PT": {"sk":"Portugalsko","cs":"Portugalsko","pl":"Portugalia","hu":"Portugália","de":"Portugal","nl":"Portugal","bg":"Португалия","da":"Portugal","et":"Portugal","en":"Portugal","el":"Πορτογαλία","es":"Portugal","fr":"le Portugal","hr":"Portugal","it":"Portogallo","lv":"Portugāle","lt":"Portugalija","mt":"Portugall","pt":"Portugal","ro":"Portugalia","sl":"Portugalska","fi":"Portugali","sv":"Portugal"},
            "AT": {"sk":"Rakúsko","cs":"Rakousko","pl":"Austria","hu":"Ausztria","de":"Österreich","nl":"Oostenrijk","bg":"Австрия","da":"Østrig","et":"Austria","en":"Austria","el":"Αυστρία","es":"Austria","fr":"L'Autrichee","hr":"Austrija","it":"Austria","lv":"Austrija","lt":"Austrija","mt":"L-Awstrija","pt":"Áustria","ro":"Austria","sl":"Avstrija","fi":"Itävalta","sv":"Österrike"},
            "RO": {"sk":"Rumunsko","cs":"Rumunsko","pl":"Rumunia","hu":"Románia","de":"Rumänien","nl":"Roemenië","bg":"Румъния","da":"Rumænien","et":"Rumeenia","en":"Romania","el":"Ρουμανία","es":"Rumania","fr":"Roumanie","hr":"Rumunjska","it":"Romania","lv":"Rumānija","lt":"Rumunija","mt":"Ir-Rumanija","pt":"Romênia","ro":"România","sl":"Romunija","fi":"Romania","sv":"Rumänien"},
            "SK": {"sk":"Slovensko","cs":"Slovensko","pl":"Słowacja","hu":"Szlovákia","de":"Slowakei","nl":"Slowakije","bg":"Словакия","da":"Slovakiet","et":"Slovakkia","en":"Slovakia","el":"Σλοβακία","es":"Eslovaquia","fr":"Slovaquie","hr":"Slovačka","it":"Slovacchia","lv":"Slovākija","lt":"Slovakija","mt":"Is-Slovakkja","pt":"Eslováquia","ro":"Slovacia","sl":"Slovaška","fi":"Slovakia","sv":"Slovakien"},
            "SI": {"sk":"Slovinsko","cs":"slovinsko","pl":"Słowenia","hu":"Szlovénia","de":"Slowenien","nl":"Slovenië","bg":"Словения","da":"Slovenien","et":"Sloveenia","en":"Slovenia","el":"Σλοβενία","es":"Eslovenia","fr":"Slovénie","hr":"Slovenija","it":"Slovenia","lv":"Slovēnija","lt":"Slovėnija","mt":"Is-Slovenja","pt":"Eslovênia","ro":"Slovenia","sl":"Slovenija","fi":"Slovenia","sv":"Slovenien"},
            "ES": {"sk":"Španielsko","cs":"Španělsko","pl":"Hiszpania","hu":"Spanyolország","de":"Spanien","nl":"Spanje","bg":"Испания","da":"Spanien","et":"Hispaania","en":"Spain","el":"Ισπανία","es":"España","fr":"Espagne","hr":"Španjolska","it":"Spagna","lv":"Spānija","lt":"Ispanija","mt":"Spanja","pt":"Espanha","ro":"Spania","sl":"Španija","fi":"Espanja","sv":"Spanien"},
            "SE": {"sk":"Švédsko","cs":"švédsko","pl":"Szwecja","hu":"Svédország","de":"Schweden","nl":"Zweden","bg":"Швеция","da":"Sverige","et":"Rootsi","en":"Sweden","el":"Σουηδία","es":"Suecia","fr":"Suède","hr":"Švedska","it":"Svezia","lv":"Zviedrija","lt":"Švedija","mt":"L-Iżvezja","pt":"Suécia","ro":"Suedia","sl":"Švedska","fi":"Ruotsi","sv":"Sverige"},
            "IT": {"sk":"Taliansko","cs":"Itálie","pl":"Włochy","hu":"Olaszország","de":"Italien","nl":"Italië","bg":"Италия","da":"Italien","et":"Itaalia","en":"Italy","el":"Ιταλία","es":"Italia","fr":"Italie","hr":"Italija","it":"Italia","lv":"Itālija","lt":"Italija","mt":"L-Italja","pt":"Itália","ro":"Italia","sl":"Italija","fi":"Italia","sv":"Italien"},
            "FI": {"sk":"Fínsko","cs":"Finsko","pl":"Finlandia","hu":"Finnország","de":"Finnland","nl":"Finland","bg":"Финландия","da":"Finland","et":"Soome","en":"Finland","el":"Φινλανδία","es":"Finlandia","fr":"Finlande","hr":"Finska","it":"Finlandia","lv":"Somija","lt":"Suomija","mt":"L-Finlandja","pt":"Finlândia","ro":"Finlanda","sl":"Finska","fi":"Suomi","sv":"Finland"},
            "EU": {"sk":"Európa","cs":"Evropa","pl":"Europa","hu":"Európa","de":"Europa","nl":"Europa","bg":"Европа","da":"Europa","et":"Euroopa","en":"Europe","el":"Ευρώπη","es":"Europa","fr":"L'Europe","hr":"Europa","it":"Europa","lv":"Eiropā","lt":"Europa","mt":"Ewropa","pt":"Europa","ro":"Europa","sl":"Evrope","fi":"Euroopassa","sv":"Europa"}
        }
    }
]});

const invoice = 
{
    "type": "invoice",
    "_id": "12100000004",
    "issued": new Date(),
    "due": new Date(),
    "reference": "21000003",
    "price": 95.7,
    "color" : '#204F95', //#204F95
    "currency": "EUR",
    "seller": {
        "name": "LUCULLUS s.r.o.",
        "address": "Pribinova 4",
        "zip": "811 09",
        "city": "Bratislava",
        "country": "SK",
        "crn": "50169971",
        "tax": "2120204361",
        "vat": "SK2120204361",
        "shipping": {
            "name": "LUCULLUS s.r.o.",
            "address": "Pribinova 4",
            "zip": "811 09",
            "city": "Bratislava",
            "country": "SK"
        },
        "banks": [{
            "country": "SK",
            "account": "4321454853/0200",
            "iban": "SK3502000000004321454853",
            "swift": "SUBASKBX"
        }]
    },
    "buyer": {
        "name": "Robert Hozza",
        "address": "Uherová 15",
        "zip": "05801",
        "city": "Poprad",
        "country": "SK",
        "shipping": {
            "name": "Robert Hozza",
            "address": "Uherová 15",
            "zip": "05801",
            "city": "Poprad",
            "country": "SK"
        }
    },
    "items": [{
        "uid": "3493",
        "name": "Umelý Ficus Retusa Bonsai 50 cm",    
        "physical": true,
        "quantity": 3,
        "price": 7.9,
        "discount": 0,
        "vat": 0.2
    }, {
        "uid": "3893",
        "name": "Umelá rastlina Marginata v kvetináči z prírodného materiálu",
        "physical": true,
        "quantity": 4,
        "price": 9.6,
        "discount": 0,
        "vat": 0.2
    }, {
        "uid": "4899",
        "name": "Umelá guľa z machu 16 cm",    
        "physical": true,
        "quantity": 3,
        "price": 11.2,
        "discount": 0,
        "vat": 0.2
    }],
    vat: true,
    account: { _id: 'SK1231231231', prefix: '0000', number: '231232131', suffix: '2312321', swift: 'SUBASK' },
    qr: undefined,
    payment: { type: 'cod' },
    note: 'spolocnost zapisana v registri',
    logo: __dirname + '/logo-3.png',
    _id: 1,
}

Invoice.render( invoice, { locale: 'sk', scope: 
{
    format: 
    {
        round : ( number, precision ) =>
        {
            return Math.round( number * Math.pow( 10, precision )) /  Math.pow( 10, precision );
        },

        price : ( number, options ) =>
        {
            let price = number.toLocaleString( options?.locale, { style: 'currency', currency: options?.currency, ...( options?.precision !== undefined ? { minimumFractionDigits: options?.precision, maximumFractionDigits: options?.precision } : undefined ) });

            if( options?.style )
            {
                price = price.replace(/(-?[0-9\s.,]+)/, '<span style="' + options?.style +  '">$1</span>' );
            }

            return price;
        },

        number : ( number, options ) =>
        {
            number = number.toLocaleString( options?.locale, { ...( options?.precision !== undefined ? { minimumFractionDigits: options.precision, maximumFractionDigits: options.precision } : undefined ) });

            if( options?.style )
            {
                number = '<span style="' + options?.style +  '">' + number + '</span>';
            }

            return number;
        },

        date: ( date, options ) =>
        {
            return new Date( date ).toLocaleDateString( options?.locale, { year: 'numeric', month: 'numeric', day: 'numeric' });
        }
    }
}
}, __dirname + '/invoice.pdf' );

/**/

/** /
const Style = require('../lib/style');

let style = new Style({ fontWeight: 'bold', background: 'red' });

console.log( style );
console.log( style.inherit() );

style.apply( 'border: 1px solid silver; font-size: 10px' );
/**/