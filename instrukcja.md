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