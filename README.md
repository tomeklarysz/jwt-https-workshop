ZADANIE 1 – Testowanie podatności BOLA
===============================================

1\. Uruchomienie środowiska crAPI
---------------------------------

1.  Uruchom Docker Desktop
    
2.  Sklonuj repozytorium:
```
git clone https://github.com/OWASP/crAPI.git --config core.autocrlf=input
```
    
3.  Przejdź do katalogu:
```
cd crAPI/deploy/docker
```
    
4. Uruchom środowisko:
```  
docker compose up -d
```  

### Adresy lokalne po uruchomieniu

*   Aplikacja crAPI: http://localhost:8888
    
*   Skrzynka MailHog: http://localhost:8025
    

2\. Przygotowanie narzędzi
--------------------------

1.  Pobierz Burp Suite Community Edition:

    https://portswigger.net/burp/communitydownload


2.  Uruchom Burp Suite, a następnie otwórz w nim wbudowaną przeglądarkę:

    -  W Burp Suite przejdź do `Proxy` → `Open Browser`
    

3\. Rejestracja użytkownika i konfiguracja konta
------------------------------------------------

1.  W przeglądarce Burpa otwórz aplikację crAPI.
    
2.  Utwórz nowe konto i zaloguj się.
    
3.  W MailHog znajdź wiadomość e-mail z danymi pojazdu i wykorzystaj je do dodania samochodu.
    
4.  W aplikacji kliknij Refresh Location
    

4\. Analiza przechwyconego żądania
----------------------------------

1.  W Burp Suite przejdź do Proxy → HTTP history.
    
2.  Znajdź żądanie odpowiedzialne za pobieranie lokalizacji pojazdu.
    
3.  Przeanalizuj:
    
    *   sekcję Request (wysyłane dane),
        
    *   sekcję Response (odpowiedź serwera).
        

Zlokalizuj pole carId w obu sekcjach.

5\. Przeniesienie żądania do Repeater
-------------------------------------

1.  Kliknij to żądanie prawym przyciskiem myszy.
    
2.  Wybierz Send to Repeater.
    
3.  Przejdź do zakładki Repeater i otwórz tam wysłane żądanie.
    

6\. Test modyfikacji identyfikatora pojazdu
-------------------------------------------

1.  Zmień vehicleId na losową wartość.
    
2.  Wyślij żądanie.
    
3.  Zwróć uwagę, jak reaguje serwer.
    

Mimo że identyfikator pojazdu jest długi i trudny do odgadnięcia, nie zapewnia to bezpieczeństwa, jeśli API nie weryfikuje dostępu użytkownika.

7\. Poszukiwanie identyfikatora pojazdu innego użytkownika
----------------------------------------------------------

1.  Poruszaj się po różnych zakładkach aplikacji crAPI.
    
2.  W HTTP history obserwuj wysyłane zapytania i zwracane odpowiedzi.
    
3.  Poszukaj miejsc, w których serwer zwraca identyfikatory pojazdów innych użytkowników
    
4.  Zanotuj znalezione vehicleId.
    

8\. Test podatności BOLA
------------------------

1.  Wróć do zakładki Repeater.
    
2.  Wstaw znaleziony identyfikator innego użytkownika w miejsce vehicleId.
    
3.  Wyślij żądanie i przeanalizuj odpowiedź.
    

### Co powinno zrobić bezpieczne API?

Zwrócić błąd:

*   400 (Bad Request),
    
*   401 (Unauthorized),
    
*   403 (Forbidden).
    

Błąd powinien wskazywać brak uprawnień do pobrania danych zasobu.

### Co robi crAPI?

Sprawdź:

*   czy API zwraca dane pojazdu innego użytkownika,
    
*   jakie konkretne dane są ujawniane,
    
*   czy dane można uznać za wrażliwe?
    

Jeśli API zwraca dane mimo zmiany identyfikatora, oznacza to podatność typu BOLA.


ZADANIE 2 - RATE LIMITING
===============================================

1. Używająć wszystkich narzędzi z poprzedniego zadania, postaraj się spowodać Layer 7 DoS, z użyciem zakładki 'Contact Mechanic'

--------------------------------------------

Dla chętnych, lista wszystkich challengy związanych z crAPI:
https://owasp.org/crAPI/docs/challenges.html


CZĘŚĆ 2. JWT & HTTPS
===============================================


## Setup

- Uruchom docker desktop

- Sklonuj repozytorium:

```
git clone https://github.com/tomeklarysz/jwt-https-workshop
cd jwt-https-workshops
```

- Uruchom kontener:

```
docker build -t jwt-lab . 
docker run -p 3000:3000 jwt-lab
```

- W zadaniach przyda się narzędzie curl, na windowsie być może będzie konieczność wpisywania curl.exe i używania znaku `\` przy dołączaniu nagłówków.

## Zadanie 1. Wyciek Danych

#### 1. Wykonanie żądania logowania

Wykonaj żądanie POST na <http://localhost:3000/api/login>

Payload: `'{\"username\":\"twoj-username\", \"password\":\"twoje-haslo\"}'`

W udanej odpowiedzi otrzymasz token JWT.
<details>
    <summary>Podpowiedź</summary>
    
    Aby wybrać metodę zapytania, użyj -X (np. -X POST)
    Aby dodać nagłówek, użyj -H
    Aby dodać payload, użyj -d
    przykladowy payload: 
    '{\"username\":\"student\", \"password\":\"password\"}'

</details>

<details>
    <summary>Odpowiedź</summary>
    
    curl.exe -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{\"username\":\"student\", \"password\":\"password\"}'

</details>

#### 2. Dekodowanie tokenu

Zdekoduj token aby zobaczyć co się kryję w jego nagłówku. Możesz użyć narzędzia <https://token.dev/> lub wykonać zapytanie POST na <http://localhost:3000/hacker/decode>

Jakie pola widać w Header? Czy są to dane poufne?

<details>
    <summary>Odpowiedź</summary>

    curl.exe -X POST http://localhost:3000/hacker/decode -H "Content-Type: application/json" -d '{\"token\":\"WKLEJ_TOKEN_TUTAJ\"}'
</details>

#### 3. Naprawa kodu

Otwórz `server.js`, zmień kod tak, aby do częścii payloadu tokenu nie trafiały wrażliwe dane 

<details>
    <summary>Odpowiedź</summary>

    const payload = { 
        id: user.id, 
        username: user.username, 
        role: user.role 
        // Brak pola creditCard!
    };

</details>

#### 4. Restart serwera

Ctrl+C a następnie
```
docker build --no-cache -t jwt-workshop .
docker run -p 3000:3000 jwt-lab
```
#### 5. Weryfikacja

Powtórz krok 1. i 2. Karta kredytowa powinna zniknąć z nagłówka.


## Zadanie 2.: None Algorithm Attack

#### 1. Próba wejścia na admina swoim tokenem

Wykonaj zapytanie na <http://localhost:3000/api/admin> z użyciem swojego tokena

<details>
    <summary>Podpowiedź</summary>

Dodaj nagłówek: -H
    "Authorization: Bearer <TWOJ_TOKEN_JWT>"

</details>

<details>
    <summary>Odpowiedź</summary>

    curl.exe -H "Authorization: Bearer TOKEN_JWT" http://localhost:3000/api/admin

</details>

#### 2. Forge

Spróbuj zdobyć uprawnienia admina, użyj <http://localhost:3000/hacker/forge> do wygenerowania tokenu o podanym przez ciebie payloadzie.

<details>
    <summary>Podpowiedź</summary>

W payloadzie znajduje się pole "role" 

</details>

<details>
    <summary>Odpowiedź</summary>

    curl.exe -X POST http://localhost:3000/hacker/forge -H "Content-Type: application/json" -d '{\"username\":\"hacker\", \"role\":\"admin\"}'

</details>

#### 3. Użyj wygenerowanego tokenu

Podobnie jak w kroku 1. wykonaj zapytanie na <http://localhost:3000/api/admin> ale z użyciem nowo wygenerowanego tokena

<details>
    <summary>Odpowiedź</summary>

    curl.exe -H "Authorization: Bearer FORGED_TOKEN" http://localhost:3000/api/admin

</details>

#### 4. Naprawa kodu

Edytuj `server.js` tak, aby wymagał od tokena podpisu.

<details>
    <summary>Podpowiedź</summary>

    usuń odpowiedni blok `if`

</details>


#### 5. Restart serwera

Ctrl+C a następnie
```
docker build --no-cache -t jwt-workshop .
docker run -p 3000:3000 jwt-lab
```

#### 6. Weryfikacja

Po restarcie ze zmianami, użycie sfałszowanego tokena powinno zwrócić Forbidden, ponieważ oczekujemy podpisu.


## Zadanie 3. Secure Cookies

#### 1. Ustawienie ciasteczka
Wykonaj zapytanie POST na <http://localhost:3000/api/cookie-login> i przeanalizuj nagłówki

<details>
    <summary>Podpowiedź</summary>

Użyj flagi -i (include headers) aby widzieć nagłówki odpowiedzi

</details>

<details>
    <summary>Odpowiedź</summary>

    curl.exe -i -X POST http://localhost:3000/api/cookie-login

</details>

#### 2. Zabezpieczenie

Zmodyfikuj `server.js` tak, aby ciasteczko nie mogło zostać wysłane przez HTTP, a także żeby nie było widoczne dla Javascriptu. 

<details>
    <summary>Podpowiedź</summary>

Dodaj flagi `Secure` i `HttpOnly`

</details>

<details>
    <summary>Odpowiedź</summary>

    // TODO #3
    res.cookie('session_id', 'tajna-sesja-123', { 
        maxAge: 900000,
        secure: true,
        httpOnly: true
    });
</details>


#### 3. Restart serwera

Ctrl+C a następnie
```
docker build --no-cache -t jwt-workshop .
docker run -p 3000:3000 jwt-lab
```

#### 4. Weryfikacja

Powtórz krok 1. i 2. Co się zmieniło i jak to wpływa na bezpieczeństwo?

UWAGA: curl pokazuje dokładnie to, co zwrócił serwer. Gdybyśmy używali przeglądarki, weszli na stronę po HTTP której serwer zwróciłby taki nagłówek, przeglądarka by go zignorowała, ponieważ flaga `Secure` wymaga połączenia HTTPS.


## Zadanie 4. HSTS (HTTP Strict Transport Security)

#### 1. Analiza nagłówków

Wykonaj zapytanie <http://localhost:3000/api/cookie-login> na i sprawdź nagłówki

<details>
    <summary>Odpowiedź</summary>

    curl.exe -i http://localhost:3000/api/cookie-login
</details>


#### 2. Czy tylko HTTPS?

Czy wśród nagłówków jest ten, który informuje przeglądarkę o komunikacji tylko przez HTTPS?

<details>
    <summary>Podpowiedź</summary>

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security
</details>


#### 3. Dodanie nagłówka

Zmodyfikuj `server.js` tak, aby pozwalać tylko na połączenia HTTPS

<details>
    <summary>Podpowiedź</summary>

Użyj `res.SetHeader`
</details>

<details>
    <summary>Odpowiedź</summary>
    
    // TODO #4
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
</details>

#### 4. Restart serwera

Ctrl+C a następnie
```
docker build --no-cache -t jwt-workshop .
docker run -p 3000:3000 jwt-lab
```

#### 5. Weryfikacja

Powtórz krok 1. i zobacz, czy jest dodany nagłówek `Strict-Transport-Security`